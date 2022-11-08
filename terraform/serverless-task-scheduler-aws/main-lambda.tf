resource "aws_iam_role" "task_function_role" {
  name = "${var.prepend}-task-scheduler-function-role"

  assume_role_policy = jsonencode(
    {
      "Version" : "2012-10-17",
      "Statement" : [
        {
          "Action" : "sts:AssumeRole",
          "Principal" : {
            "Service" : "lambda.amazonaws.com"
          },
          "Effect" : "Allow",
          "Sid" : ""
        }
      ]
    }
  )

  # DDB Policy
  inline_policy {
    name = "ddb-tasks-table-policy"

    policy = jsonencode({
      "Version" : "2012-10-17",
      "Statement" : [
        {
          "Sid" : "",
          "Effect" : "Allow",
          "Action" : [
            "dynamodb:BatchGetItem",
            "dynamodb:BatchWriteItem",
            "dynamodb:PutItem",
            "dynamodb:DeleteItem",
            "dynamodb:GetItem",
            "dynamodb:Scan",
            "dynamodb:Query",
            "dynamodb:UpdateItem"
          ],
          "Resource" : [
            "${aws_dynamodb_table.tasks_table.arn}",
            "${aws_dynamodb_table.tasks_table.arn}/index/*"
          ]
        }
      ]
    })
  }

  # SQS Policy
  inline_policy {
    name = "tasks-queue-policy"

    policy = jsonencode({
      "Version" : "2012-10-17",
      "Statement" : [
        {
          "Sid" : "VisualEditor0",
          "Effect" : "Allow",
          "Action" : [
            "sqs:DeleteMessage",
            "sqs:GetQueueUrl",
            "sqs:PurgeQueue",
            "sqs:ReceiveMessage",
            "sqs:SendMessage",
            "sqs:GetQueueAttributes"
          ],
          "Resource" : [
            "${aws_sqs_queue.task_queue.arn}",
          ]
        }
      ]
    })
  }

  tags = {
    Name    = "${var.prepend}-task-scheduler-function"
    Project = var.project_name
  }
}

resource "aws_lambda_layer_version" "tasks_function_layer" {
  layer_name = "${var.prepend}-task-scheduler-function-layer"

  filename         = "layer.zip"
  source_code_hash = filebase64sha256("layer.zip")

  compatible_runtimes      = ["nodejs16.x"]
  compatible_architectures = ["x86_64"]
}

resource "aws_lambda_function" "tasks_function" {
  function_name = "${var.prepend}-task-scheduler-function"

  role = aws_iam_role.task_function_role.arn

  handler = "index.handler"

  filename         = "function.zip"
  source_code_hash = filebase64sha256("function.zip")

  layers = [aws_lambda_layer_version.tasks_function_layer.arn]

  runtime = "nodejs16.x"

  environment {
    variables = {
      DEBUG            = "1"
      TASKS_TABLE_NAME = aws_dynamodb_table.tasks_table.id
      TASKS_QUEUE_URL  = aws_sqs_queue.task_queue.url
    }
  }

  tags = {
    Name    = "${var.prepend}-task-scheduler-function"
    Project = var.project_name
  }
}

resource "aws_cloudwatch_log_group" "tasks_function_log_group" {
  name = "/aws/lambda/${aws_lambda_function.tasks_function.function_name}"

  tags = {
    Name    = "${var.prepend}-task-scheduler-function"
    Project = var.project_name
  }
}

resource "aws_iam_policy" "tasks_function_logging" {
  name = "${var.prepend}-task-scheduler-function-logging-policy"

  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Action" : [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        "Resource" : "${aws_cloudwatch_log_group.tasks_function_log_group.arn}:*",
        "Effect" : "Allow"
      }
    ]
  })

  tags = {
    Name    = "${var.prepend}-task-scheduler-function"
    Project = var.project_name
  }
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.task_function_role.name
  policy_arn = aws_iam_policy.tasks_function_logging.arn
}

resource "aws_lambda_event_source_mapping" "task_queue" {
  event_source_arn = aws_sqs_queue.task_queue.arn
  function_name    = aws_lambda_function.tasks_function.arn

  function_response_types = ["ReportBatchItemFailures"]
}
