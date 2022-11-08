output "tasks_table_name" {
  description = "DDB Tasks Table Nable"
  value       = aws_dynamodb_table.tasks_table.id
}

output "tasks_queue_url" {
  description = "SQS Tasks Queue Url"
  value       = aws_sqs_queue.task_queue.url
}
