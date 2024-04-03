locals {
  redis_cluster_name = "${local.prefix}-redis-${var.environment}"
  redis_port         = 4515
}

module "elasticache" {
  source = "terraform-aws-modules/elasticache/aws"

  cluster_id               = local.redis_cluster_name
  create_cluster           = true
  create_replication_group = false

  //engine_version = "7.1"
  node_type = "cache.t4g.small"
  port      = local.redis_port

  maintenance_window = "sun:05:00-sun:09:00"
  apply_immediately  = true

  # Security Group
  vpc_id = module.vpc.vpc_id
  security_group_rules = {
    ingress_vpc = {
      # Default type is `ingress`
      # Default port is based on the default engine port
      description = "VPC traffic"
      cidr_ipv4   = module.vpc.vpc_cidr_block
      from_port   = local.redis_port
      to_port     = local.redis_port
    }
  }

  # Subnet Group
  subnet_group_name        = local.redis_cluster_name
  subnet_group_description = "${title(local.redis_cluster_name)} subnet group"
  subnet_ids               = module.vpc.private_subnets

  # Parameter Group
  create_parameter_group      = true
  parameter_group_name        = local.redis_cluster_name
  parameter_group_family      = "redis7"
  parameter_group_description = "${title(local.redis_cluster_name)} parameter group"
  parameters = [
    {
      name  = "latency-tracking"
      value = "yes"
    }
  ]
}
