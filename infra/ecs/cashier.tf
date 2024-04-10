resource "aws_ecr_repository" "cashier_cr" {
  name = "${var.prefix}-cashier-cr-${var.environment}"
}

data "aws_iam_policy_document" "cashier_task_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "cashier_task_role" {
  name               = "${var.prefix}-cashier-task-role-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.cashier_task_role.json
}

# Allow DynamoDB access
resource "aws_iam_policy" "cashier_policy" {
  name = "${var.prefix}-cashier-policy-${var.environment}"
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
        Resource = [var.cashier_events_table_arn, var.cashier_read_model_table_arn]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "cashier_policy" {
  role       = aws_iam_role.cashier_task_role.name
  policy_arn = aws_iam_policy.cashier_policy.arn
}

locals {
  cashier_container_definition = {
    name   = "cashier"
    cpu    = 256
    memory = 512
    portMappings = [
      #   {
      #     name          = "websocket"
      #     containerPort = 3333
      #     protocol      = "tcp"
      #   }
    ],
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.log_group.name
        "awslogs-region"        = "ap-southeast-1"
        "awslogs-stream-prefix" = "cashier"
      }
    },
    environment = [
      {
        name = "REDIS_HOST", value = var.redis_host
      },
      {
        name = "REDIS_PORT", value = var.redis_port
      },
      {
        name = "EVENTS_TABLE_NAME", value = var.cashier_events_table_name
      },
      {
        name = "READ_MODEL_TABLE_NAME", value = var.cashier_read_model_table_name
      }
    ]
  }

  cashier_ecr_image = aws_ecr_repository.cashier_cr.repository_url

  cashier_local_container_overrides = {
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
        sourcePath = "${var.root_dir}/apps/cashier/dist"
      }
    }] : []
  }
}

resource "aws_ecs_task_definition" "cashier_task_definition" {
  family                   = "${var.prefix}-cashier-${var.environment}"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 256
  memory                   = 512
  task_role_arn            = aws_iam_role.cashier_task_role.arn
  execution_role_arn       = aws_iam_role.ecs_tasks_execution_role.arn

  container_definitions = jsonencode([
    merge(
      local.cashier_container_definition,
      {
        image       = var.environment == "local" ? local.cashier_local_container_overrides.image : local.cashier_ecr_image,
        command     = var.environment == "local" ? local.cashier_local_container_overrides.command : null,
        mountPoints = var.environment == "local" ? local.cashier_local_container_overrides.mountPoints : null,
        volumes     = var.environment == "local" ? local.cashier_local_container_overrides.volumes : null
      }
    )
  ])

  dynamic "volume" {
    for_each = var.environment == "local" ? [1] : []
    content {
      name      = "local_volume"
      host_path = "${var.root_dir}/apps/cashier/dist"
    }
  }
}

resource "aws_ecs_service" "cashier_service" {
  name            = "${var.prefix}-cashier-svc-${var.environment}"
  cluster         = aws_ecs_cluster.cluster.id
  task_definition = aws_ecs_task_definition.cashier_task_definition.arn
  desired_count   = 1

  network_configuration {
    subnets         = var.vpc_private_subnets
    security_groups = [aws_security_group.task_sg.id]
  }

  capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 1
  }
}
