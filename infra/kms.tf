resource "aws_kms_key" "withdrawal_signer_key" {
  description              = "Brawlers withdrawal signer key (${var.environment})"
  key_usage                = "SIGN_VERIFY"
  customer_master_key_spec = "ECC_SECG_P256K1"
}
