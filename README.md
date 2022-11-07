# Serverless Task Scheduler for AWS

Using AWS DDB, SQS and Lambda.

### Task Types

Supported task types functions should be exported by `./lambda/taskRunners/index.js`.

Task runners receive a `ddbTask` as an argument and should return an object like this:

```json
{
  "completed": true,
  "newParams": {},
  "newTargetTimestamp": null
}
```

- `completed`: wether the task has been completed in this iteration or not.
- `newParams`: params to update in the DDB item.
- `newTargetTimestamp`: timestamp (in ms) at witch the next iteration of the execution should be executed.

See `./lambda/taskRunners/` for an example.

### Setup

```bash
# Clone the repository
git clone git@github.com:imharvol/serverless-task-scheduler-aws.git
cd ./serverless-task-scheduler-aws/

cd ./lambda/

# Add task types to ./taskRunners/

# Bundle the function into a .zip
npm run lambda-symlink && npm run bundle

# Bundle the dependencies into a .zip (this will be the layer)
# Feel free to use my package create-lambda-layer-aws, but you can also zip them manually
npx create-lambda-layer-aws ./package.json

cd ../

# Move the function bundle and layer bundle into the terraform folder
mv ./lambda/function.zip ./terraform/
mv ./lambda/layer.zip ./terraform/

# Initialize the terraform project
terraform init

# Apply the terraform configuration
terraform apply
```

`terraform apply` will output a `tasks_queue_url` and a `tasks_table_name` which you will need to send tasks. See `example.js` for an example of how to create and execute a task.

### DDB Task Items

DDB Task Items should have the following format:

```json
{
  "id": 0,
  "completed": false,
  "type": "exampleTask",
  "params": {}
}
```

- `id`: task id, it can be generated using `node:crypto`'s `randomUUID` function.
- `completed`: wether the task is completed or not, this should be initialized as `false`.
- `type`: task type name, this task type should be exported by `./lambda/taskRunners/index.js`.
- `params`: any other parameters needed in the task.

### SQS Task Messages

SQS Task Messages should have the following format:

```json
{
  "taskId": 0,
  "targetTimestamp": null,
  "priority": null
}
```

- `taskId`: task id in DDB.
- `targetTimestamp`: timestamp (in ms) at which we want the task to be executed.
- `priority`: reserved for future use.
