terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  # WARNING: The bucket and dynamodb_table values below are PLACEHOLDERS for the DevOps Portfolio.
  # Before executing 'terraform init' in production, you MUST provision these resources natively in AWS.
  backend "s3" {
    bucket         = "your-terraform-state-bucket"
    key            = "eks/three-tier/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
}
