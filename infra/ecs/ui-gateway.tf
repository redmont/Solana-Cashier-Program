resource "aws_ecr_repository" "ui_gateway_cr" {
  name = "${var.prefix}-ui-gateway-cr-${var.environment}"
}

data "aws_iam_policy_document" "ui_gateway_task_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ui_gateway_task_role" {
  name               = "${var.prefix}-ui-gateway-task-role-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.ui_gateway_task_role.json
}

# Allow DynamoDB access
resource "aws_iam_policy" "ui_gateway_policy" {
  name = "${var.prefix}-ui-gateway-policy-${var.environment}"
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
        Resource = [var.ui_gateway_table_arn, "${var.ui_gateway_table_arn}/index/*", var.query_store_table_arn, "${var.query_store_table_arn}/index/*", var.cashier_read_model_table_arn, "${var.cashier_read_model_table_arn}/index/*"]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ui_gateway_policy" {
  role       = aws_iam_role.ui_gateway_task_role.name
  policy_arn = aws_iam_policy.ui_gateway_policy.arn
}

locals {
  ui_gateway_container_definition = {
    name   = "ui-gateway"
    cpu    = 256
    memory = 512
    portMappings = [
      {
        name          = "websocket"
        containerPort = 3333
        protocol      = "tcp"
      }
    ],
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.log_group.name
        "awslogs-region"        = "ap-southeast-1"
        "awslogs-stream-prefix" = "ui-gateway"
      }
    },
    environment = [
      {
        name = "NATS_URI", value = "nats://nats.${var.prefix}.${var.environment}.local:4222"
      },
      {
        name = "REDIS_HOST", value = var.redis_host
      },
      {
        name = "REDIS_PORT", value = var.redis_port
      },
      {
        name = "TABLE_NAME", value = var.ui_gateway_table_name
      },
      {
        name = "QUERY_STORE_TABLE_NAME", value = var.query_store_table_name
      },
      {
        name = "USE_TEST_AUTH_SERVICE", value = "true"
      },
      {
        name = "CASHIER_READ_MODEL_TABLE_NAME", value = var.cashier_read_model_table_name
      },
      {
        name = "MEDIA_URI", value = "https://${var.public_assets_hostname}"
      },
      {
        name = "DYNAMIC_PUBLIC_KEY", value = var.dynamic_public_key
      },
      {
        name = "MILLICAST_API_SECRET", value = var.millicast_api_secret
      },
      {
        name = "MILLICAST_STREAM_NAME", value = var.millicast_stream_name
      },
      {
        name = "MILLICAST_PARENT_SUBSCRIBE_TOKEN", value = var.millicast_parent_subscribe_token
      },
      {
        name = "MILLICAST_PARENT_SUBSCRIBE_TOKEN_ID", value = var.millicast_parent_subscribe_token_id
      },
      {
        name = "MILLICAST_ALLOWED_ORIGINS", value = var.millicast_allowed_origins
      },
      {
        name = "CORS_ORIGINS", value = join(",", var.cors_origins)
      }
    ]
  }

  ui_gateway_ecr_image = aws_ecr_repository.ui_gateway_cr.repository_url

  ui_gateway_local_container_overrides = {
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
        sourcePath = "${var.root_dir}/apps/ui-gateway/dist"
      }
    }] : []
  }
}

resource "aws_ecs_task_definition" "ui_gateway_task_definition" {
  family                   = "${var.prefix}-ui-gateway-${var.environment}"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 256
  memory                   = 512
  task_role_arn            = aws_iam_role.ui_gateway_task_role.arn
  execution_role_arn       = aws_iam_role.ecs_tasks_execution_role.arn

  container_definitions = jsonencode([
    merge(
      local.ui_gateway_container_definition,
      {
        image       = var.environment == "local" ? local.ui_gateway_local_container_overrides.image : local.ui_gateway_ecr_image,
        command     = var.environment == "local" ? local.ui_gateway_local_container_overrides.command : null,
        mountPoints = var.environment == "local" ? local.ui_gateway_local_container_overrides.mountPoints : null,
        volumes     = var.environment == "local" ? local.ui_gateway_local_container_overrides.volumes : null,
      }
    )
  ])

  dynamic "volume" {
    for_each = var.environment == "local" ? [1] : []
    content {
      name      = "local_volume"
      host_path = "${var.root_dir}/apps/ui-gateway/dist"
    }
  }
}

resource "aws_lb_target_group" "lb_tg" {
  name        = "${var.prefix}-lb-tg-${var.environment}"
  port        = 3333
  protocol    = "TCP"
  target_type = "ip"
  vpc_id      = var.vpc_id
  health_check {
    protocol          = "TCP"
    interval          = 10
    healthy_threshold = 2
  }
}

resource "aws_acm_certificate" "lb_cert" {
  domain_name       = "ui-gateway.${var.environment}.brawlers.bltzr.gg"
  validation_method = "DNS"
}

resource "aws_lb_listener" "lb_listener" {
  load_balancer_arn = var.lb_arn
  port              = "3333"
  protocol          = var.environment == "local" ? "HTTP" : "TLS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = aws_acm_certificate.lb_cert.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.lb_tg.arn
  }
}

resource "aws_ecs_service" "ui_gateway_service" {
  name            = "${var.prefix}-ui-gateway-svc-${var.environment}"
  cluster         = aws_ecs_cluster.cluster.id
  task_definition = aws_ecs_task_definition.ui_gateway_task_definition.arn
  desired_count   = 1

  load_balancer {
    target_group_arn = aws_lb_target_group.lb_tg.arn
    container_name   = "ui-gateway"
    container_port   = 3333
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
      discovery_name = "ui-gateway"
      port_name      = "websocket"
      client_alias {
        port = 3333
      }
    }
    log_configuration {
      log_driver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.log_group.name
        "awslogs-region"        = "ap-southeast-1"
        "awslogs-stream-prefix" = "ui-gateway-serviceconnect"
      }
    }
  }

  # service_registries {
  #   registry_arn = aws_service_discovery_service.ui_gateway_service.arn
  # }


}

# resource "aws_service_discovery_service" "ui_gateway_service" {
#   name = "ui-gateway"
#   dns_config {
#     namespace_id = var.service_discovery_namespace_id
#     dns_records {
#       ttl  = 10
#       type = "A"
#     }
#   }
# }
