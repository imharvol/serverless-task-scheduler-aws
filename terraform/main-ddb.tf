resource "aws_dynamodb_table" "tasks_table" {
  name = "${var.prepend}-task-scheduler-tasks-table"

  billing_mode = "PAY_PER_REQUEST"

  hash_key = "id"
  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    Name = "${var.prepend}-task-scheduler-tasks-table"
    Project = local.project_name
  }
}
