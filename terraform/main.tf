terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "4.38.0"
    }
  }
}

provider "aws" {
  region = "eu-west-1"
}

module "serverless_task_scheduler_aws" {
  source = "./serverless-task-scheduler-aws"

  prepend      = var.prepend
  project_name = var.project_name
}
