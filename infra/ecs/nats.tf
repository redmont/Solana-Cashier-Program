data "aws_iam_policy_document" "nats_task_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "nats_task_role" {
  name               = "${var.prefix}-nats-task-role-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.nats_task_role.json
}

# resource "aws_iam_policy" "nats_policy" {
#   name = "${var.prefix}-nats-policy-${var.environment}"
#   policy = jsonencode({
#     Version = "2012-10-17",
#     Statement = [
#       {
#         Effect = "Allow",
#         Action = [
#           "s3:GetObject",
#           "s3:PutObject"
#         ],
#         Resource = [var.media_library_bucket_arn, "${var.media_library_bucket_arn}/*"]
#       }
#     ]
#   })
# }

# resource "aws_iam_role_policy_attachment" "core_policy" {
#   role       = aws_iam_role.core_task_role.name
#   policy_arn = aws_iam_policy.core_policy.arn
# }

# resource "aws_iam_role_policy_attachment" "dev_dynamodb_policy" {
#   count      = var.environment == "prod" ? 1 : 0
#   role       = aws_iam_role.core_task_role.name
#   policy_arn = "arn:aws:iam::767397714894:policy/DynamoDB-FullAccess-Policy-in-DevAccount"
# }


resource "aws_ecs_task_definition" "nats_task_definition" {
  family                   = "${var.prefix}-nats-${var.environment}"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 512
  memory                   = 1024
  task_role_arn            = aws_iam_role.nats_task_role.arn
  execution_role_arn       = aws_iam_role.ecs_tasks_execution_role.arn

  container_definitions = jsonencode([
    {
      name    = "nats"
      image   = "nats:2.10.14-alpine",
      command = ["-js", "--server_name", "n1-c1"]
      cpu     = 256
      memory  = 512
      portMappings = [
        {
          containerPort = 4222
          protocol      = "tcp"
          name          = "nats-client"
        },
        {
          containerPort = 6222
          protocol      = "tcp"
          name          = "nats-monitor"
        },
        {
          containerPort = 8222
          protocol      = "tcp"
          name          = "nats-cluster"
        },
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.log_group.name
          "awslogs-region"        = "ap-southeast-1"
          "awslogs-stream-prefix" = "nats"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "nats_service" {
  name            = "${var.prefix}-nats-svc-${var.environment}"
  cluster         = aws_ecs_cluster.cluster.id
  task_definition = aws_ecs_task_definition.nats_task_definition.arn
  desired_count   = 1

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
      discovery_name = "nats"
      port_name      = "nats-client"
      client_alias {
        port = 4222
      }
    }
  }
}
