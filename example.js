const awsRegion = 'eu-west-1'
const tasksTableName = '' // CHANGEME
const tasksQueueUrl = '' // CHANGEME

import { randomUUID } from 'node:crypto'

import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs'

const ddbClient = new DynamoDBClient({
  region: awsRegion
})
const sqsClient = new SQSClient({
  region: awsRegion
})

const taskId = randomUUID()

const ddbCommand = new PutItemCommand({
  TableName: tasksTableName,
  Item: marshall({
    id: taskId,
    completed: false,
    type: 'exampleTask',
    params: {}
  })
})
await ddbClient.send(ddbCommand)

console.log(`Created task with id ${taskId}`)

const sqsMessage = {
  taskId: taskId,
  targetTimestamp: null, // Date.now() + 30 * 1000,
  priority: null // This is not in use right now
}

const sqsCommand = new SendMessageCommand({
  QueueUrl: tasksQueueUrl,
  MessageBody: JSON.stringify(sqsMessage)
})
await sqsClient.send(sqsCommand)
