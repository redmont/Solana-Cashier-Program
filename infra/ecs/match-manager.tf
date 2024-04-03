resource "aws_ecr_repository" "match_manager_cr" {
  name = "${var.prefix}-match-manager-cr-${var.environment}"
}

locals {
  match_manager_container_definition = {
    name   = "match-manager"
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
        "awslogs-stream-prefix" = "match-manager"
      }
    },
    environment = [
      {
        name = "REDIS_HOST", value = var.redis_host
      },
      {
        name = "REDIS_PORT", value = var.redis_port
      }
    ]
  }

  match_manager_ecr_image = aws_ecr_repository.match_manager_cr.repository_url

  match_manager_local_container_overrides = {
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
        sourcePath = "${var.root_dir}/apps/match-manager/dist"
      }
    }] : []
  }
}

resource "aws_ecs_task_definition" "match_manager_task_definition" {
  family                   = "${var.prefix}-match-manager-${var.environment}"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.ecs_tasks_execution_role.arn

  container_definitions = jsonencode([
    merge(
      local.match_manager_container_definition,
      {
        image       = var.environment == "local" ? local.match_manager_local_container_overrides.image : local.match_manager_ecr_image,
        command     = var.environment == "local" ? local.match_manager_local_container_overrides.command : null,
        mountPoints = var.environment == "local" ? local.match_manager_local_container_overrides.mountPoints : null,
        volumes     = var.environment == "local" ? local.match_manager_local_container_overrides.volumes : null
      }
    )
  ])

  dynamic "volume" {
    for_each = var.environment == "local" ? [1] : []
    content {
      name      = "local_volume"
      host_path = "${var.root_dir}/apps/match-manager/dist"
    }
  }
}

resource "aws_ecs_service" "match_manager_service" {
  name            = "${var.prefix}-match-manager-svc-${var.environment}"
  cluster         = aws_ecs_cluster.cluster.id
  task_definition = aws_ecs_task_definition.match_manager_task_definition.arn
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
