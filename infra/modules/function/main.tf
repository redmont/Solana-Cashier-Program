locals {
  full_file_path = "${var.lambda_dir}/${var.filename}"
}

resource "aws_lambda_function" "lambda" {
  filename         = var.environment == "local" ? null : "${local.full_file_path}.zip"
  s3_bucket        = var.environment == "local" ? "hot-reload" : null
  s3_key           = var.environment == "local" ? local.full_file_path : null
  source_code_hash = var.environment == "local" ? null : filebase64sha256("${local.full_file_path}.zip")
  function_name    = "${var.prefix}-${var.name}-${var.environment}"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "dist/${var.filename}.handler"
  architectures    = [var.architecture != null ? var.architecture : "x86_64"]
  runtime          = "nodejs20.x"
  timeout          = var.timeout
  memory_size      = var.memory_size
  vpc_config {
    subnet_ids         = var.vpc_config != null ? var.vpc_config.subnet_ids : []
    security_group_ids = var.vpc_config != null ? var.vpc_config.security_group_ids : []
  }
  environment {
    variables = merge({ NODE_OPTIONS = "--enable-source-maps" }, var.env_variables)
  }
}

resource "aws_iam_role" "lambda_exec" {
  name = "func_exec_${var.name}-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Principal = {
          Service = var.assume_apigw_role ? ["lambda.amazonaws.com", "apigateway.amazonaws.com"] : ["lambda.amazonaws.com"]
        },
        Effect = "Allow",
        Sid    = ""
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "AWSLambdaVPCAccessExecutionRole" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

resource "aws_iam_policy" "lambda_log_policy" {
  name = "func_log_policy-${var.name}-${var.environment}"
  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        Action : [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Effect : "Allow",
        Resource : "arn:aws:logs:*:*:*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_log_policy_attachment" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = aws_iam_policy.lambda_log_policy.arn
}

output "exec_role_name" {
  description = "Name of the lambda execution role"
  value       = aws_iam_role.lambda_exec.name
}
output "exec_role_arn" {
  description = "ARN of the lambda execution role"
  value       = aws_iam_role.lambda_exec.arn
}

output "lambda_name" {
  description = "Name of the lambda"
  value       = aws_lambda_function.lambda.function_name
}

output "lambda_arn" {
  description = "ARN of the lambda"
  value       = aws_lambda_function.lambda.arn
}

output "invoke_arn" {
  description = "ARN to invoke the lambda"
  value       = aws_lambda_function.lambda.invoke_arn
}
