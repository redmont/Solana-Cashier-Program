resource "aws_ecr_repository" "core_cr" {
  name = "${var.prefix}-core-cr-${var.environment}"
}

data "aws_iam_policy_document" "core_task_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "core_task_role" {
  name               = "${var.prefix}-core-task-role-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.core_task_role.json
}

# Allow DynamoDB access
resource "aws_iam_policy" "core_policy" {
  name = "${var.prefix}-core-policy-${var.environment}"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "dynamodb:DescribeTable",
          "dynamodb:BatchGetItem",
          "dynamodb:BatchWriteItem",
          "dynamodb:DeleteItem",
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:UpdateItem"
        ],
        Resource = [var.core_table_arn, "${var.core_table_arn}/index/*", var.query_store_table_arn, "${var.query_store_table_arn}/index/*", var.oracle_indexer_table_arn, "${var.oracle_indexer_table_arn}/index/*"]
      },
      {
        Effect = "Allow",
        Action = [
          "s3:GetObject",
          "s3:PutObject"
        ],
        Resource = [var.media_library_bucket_arn, "${var.media_library_bucket_arn}/*"]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "core_policy" {
  role       = aws_iam_role.core_task_role.name
  policy_arn = aws_iam_policy.core_policy.arn
}

resource "aws_iam_role_policy_attachment" "dev_dynamodb_policy" {
  count      = var.environment == "prod" ? 1 : 0
  role       = aws_iam_role.core_task_role.name
  policy_arn = "arn:aws:iam::767397714894:policy/DynamoDB-FullAccess-Policy-in-DevAccount"
}

locals {
  core_container_definition = {
    name   = "core"
    cpu    = 512
    memory = 1024
    portMappings = [
      {
        name          = "game-server-websocket",
        containerPort = 8080,
        protocol      = "tcp"
      }
    ],
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.log_group.name
        "awslogs-region"        = "ap-southeast-1"
        "awslogs-stream-prefix" = "core"
      }
    },
    environment = [
      {
        name = "NATS_URI", value = join(",", [
          "nats://nats-n1-c1.${var.prefix}.${var.environment}.local:4222",
          "nats://nats-n2-c1.${var.prefix}.${var.environment}.local:4222",
          "nats://nats-n3-c1.${var.prefix}.${var.environment}.local:4222"
        ])
      },
      {
        name = "BROKER_REDIS_HOST", value = var.redis_host
      },
      {
        name = "BROKER_REDIS_PORT", value = var.redis_port
      },
      {
        name = "TABLE_NAME", value = var.core_table_name
      },
      {
        name = "QUERY_STORE_TABLE_NAME", value = var.query_store_table_name
      },
      {
        name = "GAME_SERVER_WS_PORT", value = "8080"
      },
      {
        name = "PRICE_DATA_TABLE_NAME", value = var.oracle_indexer_table_arn #value = var.oracle_indexer_table_name
      },
      {
        name = "MEDIA_LIBRARY_BUCKET_NAME", value = var.media_library_bucket_name
      },
      {
        name = "MEDIA_URI", value = "https://${var.public_assets_hostname}"
      },
      {
        name = "USE_MOCK_GAME_SERVER", value = "false"
      },
      # {
      #  name = "USE_MOCK_GAME_SERVER", value = var.environment == "dev" ? "true" : "false"
      # },
      {
        name = "DYNAMIC_PUBLIC_KEY", value = var.dynamic_public_key
      },
      {
        name = "PUBNUB_PUBLISH_KEY", value = var.pubnub_publish_key
      },
      {
        name = "PUBNUB_SUBSCRIBE_KEY", value = var.pubnub_subscribe_key
      },
      {
        name = "PUBNUB_SECRET_KEY", value = var.pubnub_secret_key
      },
      {
        name = "PUBNUB_USER_ID", value = "system"
      },
      {
        name = "RED5_STREAM_MANAGER_HOSTNAME", value = var.environment == "prod" ? "r5stream.prod.brawl3rs.ai" : "r5stream.dev.brawl3rs.ai"
      },
      {
        name = "ZEALY_XP_CONVERSION_RATE", value = "1"
      },
      {
        name = "WITHDRAWAL_SIGNER_KMS_KEY_ID", value = var.withdrawal_signer_kms_key_id
      }
    ]
  }

  core_ecr_image = "${aws_ecr_repository.core_cr.repository_url}:${var.core_image_tag}"

  core_local_container_overrides = {
    image   = "node:21"
    command = ["node", "/prod/server/dist/main.js"]
    mountPoints = [
      {
        sourceVolume  = "local_volume"
        containerPath = "/prod/server"
        readOnly      = false
      }
    ],
    volumes = var.environment == "local" ? [{
      name = "local_volume"
      host = {
        sourcePath = "${var.root_dir}/apps/core/dist"
      }
    }] : []
  }
}

resource "aws_lb_target_group" "game_server_lb_tg" {
  name        = "${var.prefix}-game-server-lb-tg-${var.environment}"
  port        = 8080
  protocol    = "TCP"
  target_type = "ip"
  vpc_id      = var.vpc_id
  health_check {
    protocol = "TCP"
  }
}

resource "aws_acm_certificate" "game_server_lb_cert" {
  domain_name       = "game-server.${var.environment}.brawlers.bltzr.gg"
  validation_method = "DNS"
}

resource "aws_lb_listener" "game_server_lb_listener" {
  load_balancer_arn = var.lb_arn
  port              = 8080
  protocol          = var.environment == "local" ? "HTTP" : "TLS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = aws_acm_certificate.game_server_lb_cert.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.game_server_lb_tg.arn
  }
}

resource "aws_ecs_task_definition" "core_task_definition" {
  family                   = "${var.prefix}-core-${var.environment}"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 512
  memory                   = 1024
  task_role_arn            = aws_iam_role.core_task_role.arn
  execution_role_arn       = aws_iam_role.ecs_tasks_execution_role.arn

  container_definitions = jsonencode([
    merge(
      local.core_container_definition,
      {
        image       = var.environment == "local" ? local.core_local_container_overrides.image : local.core_ecr_image,
        command     = var.environment == "local" ? local.core_local_container_overrides.command : null,
        mountPoints = var.environment == "local" ? local.core_local_container_overrides.mountPoints : null,
        volumes     = var.environment == "local" ? local.core_local_container_overrides.volumes : null,
      }
    ),
  ])

  dynamic "volume" {
    for_each = var.environment == "local" ? [1] : []
    content {
      name      = "local_volume"
      host_path = "${var.root_dir}/apps/core/dist"
    }
  }
}

resource "aws_ecs_service" "core_service" {
  name            = "${var.prefix}-core-svc-${var.environment}"
  cluster         = aws_ecs_cluster.cluster.id
  task_definition = aws_ecs_task_definition.core_task_definition.arn
  desired_count   = 1

  load_balancer {
    target_group_arn = aws_lb_target_group.game_server_lb_tg.arn
    container_name   = "core"
    container_port   = 8080
  }

  network_configuration {
    subnets         = var.vpc_private_subnets
    security_groups = [aws_security_group.task_sg.id]
  }

  capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 1
  }

  service_connect_configuration {
    enabled   = true
    namespace = var.service_discovery_namespace_arn
    service {
      discovery_name = "core"
      port_name      = "game-server-websocket"
      client_alias {
        port = 8080
      }
    }
  }
}
