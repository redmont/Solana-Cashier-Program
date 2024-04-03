resource "aws_ecr_repository" "ui_gateway_cr" {
  name = "${var.prefix}-ui-gateway-cr-${var.environment}"
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
        name = "REDIS_HOST", value = var.redis_host
      },
      {
        name = "REDIS_PORT", value = var.redis_port
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
  execution_role_arn       = aws_iam_role.ecs_tasks_execution_role.arn

  container_definitions = jsonencode([
    merge(
      local.ui_gateway_container_definition,
      {
        image       = var.environment == "local" ? local.ui_gateway_local_container_overrides.image : local.ui_gateway_ecr_image,
        command     = var.environment == "local" ? local.ui_gateway_local_container_overrides.command : null,
        mountPoints = var.environment == "local" ? local.ui_gateway_local_container_overrides.mountPoints : null,
        volumes     = var.environment == "local" ? local.ui_gateway_local_container_overrides.volumes : null
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
    protocol = "TCP"
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
}
