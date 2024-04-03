resource "aws_ecs_cluster" "cluster" {
  name = "${var.prefix}-cluster-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  configuration {
    execute_command_configuration {
      logging = "OVERRIDE"
      log_configuration {
        cloud_watch_log_group_name = "/aws/ecs/aws-ec2"
      }
    }
  }
}


