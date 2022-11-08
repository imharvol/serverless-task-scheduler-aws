resource "aws_sqs_queue" "task_queue" {
  name = "${var.prepend}-task-scheduler-queue"

  visibility_timeout_seconds = 60
  delay_seconds              = 0
  message_retention_seconds  = 604800 # 7 days
  receive_wait_time_seconds  = 20

  tags = {
    Name = "${var.prepend}-task-scheduler-queue"
    Project = var.project_name
  }
}
