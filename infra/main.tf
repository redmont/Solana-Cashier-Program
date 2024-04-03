terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = local.aws_region
}

module "vpc" {
  source                 = "terraform-aws-modules/vpc/aws"
  name                   = "${local.prefix}-vpc-${var.environment}"
  cidr                   = local.vpc_cidr
  azs                    = ["${local.aws_region}a", "${local.aws_region}b", "${local.aws_region}c"]
  private_subnets        = ["10.1.0.0/24", "10.1.1.0/24", "10.1.2.0/24"]
  public_subnets         = ["10.1.100.0/24", "10.1.101.0/24", "10.1.102.0/24"]
  enable_nat_gateway     = true
  single_nat_gateway     = false
  one_nat_gateway_per_az = true
  enable_vpn_gateway     = false
  enable_dns_hostnames   = true
  enable_dns_support     = true
}

module "ecs" {
  source      = "./ecs"
  root_dir    = var.root_dir
  prefix      = local.prefix
  environment = var.environment

  vpc_id              = module.vpc.vpc_id
  vpc_cidr_block      = module.vpc.vpc_cidr_block
  vpc_private_subnets = module.vpc.private_subnets

  redis_host = module.elasticache.cluster_cache_nodes.0.address
  redis_port = local.redis_port

  lb_arn = aws_alb.lb.arn
}
