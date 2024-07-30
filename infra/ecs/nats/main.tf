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

resource "aws_ecs_task_definition" "nats_task_definition" {
  for_each = { for id in var.node_ids : id => id }

  family                   = "${var.prefix}-nats-${each.key}-${var.environment}"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 512
  memory                   = 1024
  task_role_arn            = aws_iam_role.nats_task_role.arn
  execution_role_arn       = var.ecs_tasks_execution_role_arn

  container_definitions = jsonencode([
    {
      name  = "nats"
      image = "nats:2.10.14-alpine",
      command = [
        "-js",
        "--server_name", each.key,
        "--cluster_name", "${var.prefix}-nats-${var.environment}",
        "--cluster", "nats://0.0.0.0:6222",
        "--routes", join(",", [for id in var.node_ids : "nats://nats-${id}-monitor.${var.prefix}.${var.environment}.local:6222" if id != each.key])
      ]
      cpu    = 256
      memory = 512
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
          "awslogs-group"         = var.cloudwatch_log_group_name
          "awslogs-region"        = "ap-southeast-1"
          "awslogs-stream-prefix" = "nats"
        }
      }
      environment = [
        {
          name  = "NATS_SERVER_NAME"
          value = each.key
        },
        {
          name  = "NATS_CLUSTER_ROUTES"
          value = join(",", [for id in var.node_ids : "nats://nats-${id}-monitor.${var.prefix}.${var.environment}.local:6222" if id != each.key])
        }
      ]
    }
  ])
}

resource "aws_ecs_service" "nats_service" {
  for_each        = { for id in var.node_ids : id => id }
  name            = "${var.prefix}-nats-${each.key}-${var.environment}"
  cluster         = var.ecs_cluster_id
  task_definition = aws_ecs_task_definition.nats_task_definition[each.key].arn
  desired_count   = 1

  network_configuration {
    subnets         = var.vpc_private_subnets
    security_groups = [var.task_sg_id]
  }

  capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 1
  }

  service_connect_configuration {
    enabled   = true
    namespace = var.service_discovery_namespace_arn

    service {
      discovery_name = "nats-${each.key}"
      port_name      = "nats-client"
      client_alias {
        port = 4222
      }
    }

    service {
      discovery_name = "nats-${each.key}-monitor"
      port_name      = "nats-monitor"
      client_alias {
        port = 6222
      }
    }

    service {
      discovery_name = "nats-${each.key}-cluster"
      port_name      = "nats-cluster"
      client_alias {
        port = 8222
      }
    }
  }
}
