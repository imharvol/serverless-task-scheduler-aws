output "tasks_table_name" {
  description = "DDB Tasks Table Nable"
  value       = module.serverless_task_scheduler_aws.tasks_table_name
}

output "tasks_queue_url" {
  description = "SQS Tasks Queue Url"
  value       = module.serverless_task_scheduler_aws.tasks_queue_url
}
