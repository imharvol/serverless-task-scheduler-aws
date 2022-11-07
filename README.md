# Serverless Task Scheduler for AWS

Using AWS DDB, SQS and Lambda

### Setup

```bash
# Clone the repository
git clone git@github.com:imharvol/serverless-task-scheduler-aws.git
cd ./serverless-task-scheduler-aws/

cd ./lambda/

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
