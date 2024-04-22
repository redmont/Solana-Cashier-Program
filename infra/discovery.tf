resource "aws_service_discovery_private_dns_namespace" "discovery_namespace" {
  name        = "${local.prefix}.${var.environment}.local"
  description = "Private DNS namespace for '${local.prefix}' service discovery"
  vpc         = module.vpc.vpc_id
}

