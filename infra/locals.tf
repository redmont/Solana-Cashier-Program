locals {
  prefix          = "brawl"
  aws_region      = "ap-southeast-1"
  vpc_cidr        = var.environment == "mg" ? "10.2.0.0/16" : "10.1.0.0/16"
  private_subnets = var.environment == "mg" ? ["10.2.0.0/24", "10.2.1.0/24", "10.2.2.0/24"] : ["10.1.0.0/24", "10.1.1.0/24", "10.1.2.0/24"]
  public_subnets  = var.environment == "mg" ? ["10.2.100.0/24", "10.2.101.0/24", "10.2.102.0/24"] : ["10.1.100.0/24", "10.1.101.0/24", "10.1.102.0/24"]
}
