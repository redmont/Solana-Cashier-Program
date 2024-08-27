
module "cashier_webhook_listener" {
  source      = "./modules/function"
  name        = "cashier-webhook"
  prefix      = local.prefix
  environment = var.environment
  lambda_dir  = "${var.root_dir}/modules/cashier/dist"
  filename    = "webhookListener"
  env_variables = {
    ALCHEMY_WEBHOOK_SIGNING_KEY      = var.alchemy_webhook_signing_key
    SERVICE_DISCOVERY_NAMESPACE_NAME = aws_service_discovery_private_dns_namespace.discovery_namespace.name
    SERVICE_DISCOVERY_SERVICE_NAMES  = "nats-n1-c1,nats-n2-c1,nats-n3-c1"
  }
  vpc_config = {
    subnet_ids         = module.vpc.private_subnets
    security_group_ids = [module.vpc.default_security_group_id]
  }
}

resource "aws_iam_role_policy" "cashier_webhook_listener" {
  name = "${local.prefix}-cashier-webhook-listener-${var.environment}"

  role = module.cashier_webhook_listener.exec_role_name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "servicediscovery:DiscoverInstances"
        ]
        Resource = [
          "*"
        ]
      }
    ]
  })
}

resource "aws_lambda_function_url" "cashier_webhook_listener" {
  function_name      = module.cashier_webhook_listener.lambda_name
  authorization_type = "NONE"
}

module "zealy_webhook_listener" {
  source      = "./modules/function"
  name        = "zealy-webhook"
  prefix      = local.prefix
  environment = var.environment
  lambda_dir  = "${var.root_dir}/modules/zealy/dist"
  filename    = "webhookListener"
  env_variables = {
    ZEALY_WEBHOOK_SECRET             = var.zealy_webhook_secret
    SERVICE_DISCOVERY_NAMESPACE_NAME = aws_service_discovery_private_dns_namespace.discovery_namespace.name
    SERVICE_DISCOVERY_SERVICE_NAMES  = "nats-n1-c1,nats-n2-c1,nats-n3-c1"
  }
  vpc_config = {
    subnet_ids         = module.vpc.private_subnets
    security_group_ids = [module.vpc.default_security_group_id]
  }
}

resource "aws_iam_role_policy" "zealy_webhook_listener" {
  name = "${local.prefix}-zealy-webhook-listener-${var.environment}"

  role = module.zealy_webhook_listener.exec_role_name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "servicediscovery:DiscoverInstances"
        ]
        Resource = [
          "*"
        ]
      }
    ]
  })
}

resource "aws_lambda_function_url" "zealy_webhook_listener" {
  function_name      = module.zealy_webhook_listener.lambda_name
  authorization_type = "NONE"
}


module "posthog_webhook_listener" {
  source      = "./modules/function"
  name        = "posthog-webhook"
  prefix      = local.prefix
  environment = var.environment
  lambda_dir  = "${var.root_dir}/modules/posthog/dist"
  timeout     = 300
  filename    = "handler"
  env_variables = {
    CORE_TABLE_NAME = aws_dynamodb_table.core_table.name
    BUCKET_NAME     = aws_s3_bucket.posthog_bucket.bucket
  }
  vpc_config = {
    subnet_ids         = module.vpc.private_subnets
    security_group_ids = [module.vpc.default_security_group_id]
  }
}

resource "aws_iam_role_policy" "posthog_webhook_listener" {
  name = "${local.prefix}-posthog-webhook-listener-${var.environment}"

  role = module.posthog_webhook_listener.exec_role_name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:Query",
          "s3:GetObject",
          "s3:PutObject"
        ]
        Resource = [
          aws_dynamodb_table.core_table.arn,
          "${aws_s3_bucket.posthog_bucket.arn}/*"
        ]
      }
    ]
  })
}

# Schedule PostHog function to run every hour, 5 minutes after the hour
resource "aws_cloudwatch_event_rule" "posthog_webhook_listener" {
  count               = var.environment == "prod" ? 1 : 0
  name                = "${local.prefix}-posthog-webhook-listener-${var.environment}"
  description         = "Schedule PostHog webhook listener to run every hour"
  schedule_expression = "cron(5 * * * ? *)"
}

resource "aws_cloudwatch_event_target" "posthog_webhook_listener" {
  count     = var.environment == "prod" ? 1 : 0
  rule      = aws_cloudwatch_event_rule.posthog_webhook_listener[0].name
  target_id = module.posthog_webhook_listener.lambda_name
  arn       = module.posthog_webhook_listener.lambda_arn
}

resource "aws_lambda_permission" "posthog_webhook_listener" {
  count         = var.environment == "prod" ? 1 : 0
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = module.posthog_webhook_listener[0].lambda_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.posthog_webhook_listener[0].arn
}

# New Module for webhookListenerHelius
module "webhook_listener_helius" {
  source      = "./modules/function"
  name        = "cashier-helius-webhook"
  prefix      = local.prefix
  environment = var.environment
  lambda_dir  = "${var.root_dir}/modules/cashier/dist"
  filename    = "webhookListenerHelius"
  env_variables = {
    SERVICE_DISCOVERY_NAMESPACE_NAME  = aws_service_discovery_private_dns_namespace.discovery_namespace.name
    SERVICE_DISCOVERY_SERVICE_NAMES   = var.service_discovery_service_names
    HELIUS_SECRET_KEY                 = var.helius_secret_key
  }
  vpc_config = {
    subnet_ids         = module.vpc.private_subnets
    security_group_ids = [module.vpc.default_security_group_id]
  }
}

resource "aws_iam_role_policy" "webhook_listener_helius" {
  name = "${local.prefix}-cashier-helius-webhook-listener-${var.environment}"

  role = module.webhook_listener_helius.exec_role_name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "servicediscovery:DiscoverInstances"
        ]
        Resource = [
          "*"
        ]
      }
    ]
  })
}

resource "aws_lambda_function_url" "webhook_listener_helius" {
  function_name      = module.webhook_listener_helius.lambda_name
  authorization_type = "NONE"
}
