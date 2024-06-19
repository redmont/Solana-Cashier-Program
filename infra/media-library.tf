resource "aws_s3_bucket" "public_assets_bucket" {
  bucket = "${local.prefix}-public-assets-${var.environment}"
}

resource "aws_s3_bucket_ownership_controls" "public_assets_bucket_ownership" {
  bucket = aws_s3_bucket.public_assets_bucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_public_access_block" "public_assets_public_access_block" {
  bucket = aws_s3_bucket.public_assets_bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_acl" "public_assets_bucket_acl" {
  depends_on = [aws_s3_bucket_ownership_controls.public_assets_bucket_ownership, aws_s3_bucket_public_access_block.public_assets_public_access_block]

  bucket = aws_s3_bucket.public_assets_bucket.id
  acl    = "public-read"
}

resource "aws_s3_bucket_policy" "public_assets_bucket_policy" {
  bucket = aws_s3_bucket.public_assets_bucket.bucket

  policy = <<EOF
    {
      "Version":"2008-10-17",
      "Statement":[{
        "Sid":"AllowPublicRead",
        "Effect":"Allow",
        "Principal": {"AWS": "*"},
        "Action":["s3:GetObject"],
        "Resource":["arn:aws:s3:::${aws_s3_bucket.public_assets_bucket.bucket}/*"]
      }]
    }
  EOF
}

resource "aws_cloudfront_origin_access_identity" "public_assets_origin_access_identity" {
  comment = "Access identity for public assets (${var.environment})"
}

resource "aws_acm_certificate" "public_assets_certificate" {
  domain_name       = var.public_assets_hostname
  validation_method = "DNS"

  tags = {
    Environment = var.environment
  }

  provider = aws.us_east_1
}

resource "aws_cloudfront_response_headers_policy" "public_assets_response_headers_policy" {
  name = "${local.prefix}-public-asset-response-headers-policy-${var.environment}"

  cors_config {
    access_control_allow_credentials = false

    access_control_allow_headers {
      items = ["*"]
    }

    access_control_allow_methods {
      items = ["GET", "HEAD", "OPTIONS"]
    }

    access_control_allow_origins {
      items = var.public_assets_cors_origins
    }

    origin_override = true
  }
}

resource "aws_cloudfront_distribution" "public_assets_distribution" {
  origin {
    domain_name = aws_s3_bucket.public_assets_bucket.bucket_regional_domain_name
    origin_id   = aws_s3_bucket.public_assets_bucket.id

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.public_assets_origin_access_identity.cloudfront_access_identity_path
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Public assets (${var.environment})"
  default_root_object = "index.html"

  aliases = [var.public_assets_hostname]

  default_cache_behavior {
    allowed_methods            = ["GET", "HEAD", "OPTIONS"]
    cached_methods             = ["GET", "HEAD", "OPTIONS"]
    target_origin_id           = aws_s3_bucket.public_assets_bucket.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.public_assets_response_headers_policy.id

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  price_class = "PriceClass_All"

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.public_assets_certificate.arn
    ssl_support_method  = "sni-only"
  }

  tags = {
    Environment = var.environment
  }
}


