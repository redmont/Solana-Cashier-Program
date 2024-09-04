variable "root_dir" {
  description = "Root directory of the project"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "public_assets_hostname" {
  description = "Public assets hostname"
  type        = string
}

variable "ui_gateway_image_tag" {
  description = "UI gateway image tag"
  type        = string
}

variable "core_image_tag" {
  description = "Core image tag"
  type        = string
}

variable "cashier_image_tag" {
  description = "Cashier image tag"
  type        = string
}

variable "dynamic_public_key" {
  description = "Dynamic.xyz public key"
  type        = string
}

variable "alchemy_webhook_signing_keys" {
  description = "Alchemy webhook signing keys"
  type        = string
}

variable "public_assets_cors_origins" {
  description = "CORS origins for public assets"
  type        = list(string)
}

variable "cors_origins" {
  description = "CORS origins"
  type        = list(string)
}

variable "stream_auth_parent_token_id" {
  description = "Stream authentication parent token ID"
  type        = string
}

variable "stream_auth_parent_token_secret" {
  description = "Stream authentication parent token secret"
  type        = string
}

variable "pubnub_publish_key" {
  description = "PubNub publish key"
  type        = string
}

variable "pubnub_subscribe_key" {
  description = "PubNub subscribe key"
  type        = string
}

variable "pubnub_secret_key" {
  description = "PubNub secret key"
  type        = string
}

variable "zealy_webhook_secret" {
  description = "Zealy webhook secret"
  type        = string
}

variable "helius_secret_key" {
  description = "Helius webhook secret key for authorization"
  type        = string
}
