
resource "aws_alb" "lb" {
  name                             = "${local.prefix}-lb-${var.environment}"
  load_balancer_type               = "network"
  subnets                          = module.vpc.public_subnets
  enable_cross_zone_load_balancing = true
}


