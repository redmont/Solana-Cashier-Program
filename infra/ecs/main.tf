resource "aws_security_group" "task_sg" {
  vpc_id = var.vpc_id
  ingress {
    from_port   = 3333
    to_port     = 3333
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr_block]
  }

  ingress {
    from_port   = 4222
    to_port     = 4222
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr_block]
  }

  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}


data "aws_iam_policy_document" "ecs_tasks_execution_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ecs_tasks_execution_role" {
  name               = "${var.prefix}-ecs-exec-role-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.ecs_tasks_execution_role.json
}

resource "aws_iam_role_policy_attachment" "ecs_tasks_execution_role" {
  role       = aws_iam_role.ecs_tasks_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_cloudwatch_log_group" "log_group" {
  name              = "${var.prefix}-${var.environment}"
  retention_in_days = 30
}
