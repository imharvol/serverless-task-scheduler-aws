import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { GetItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

import { UnknownTaskId } from './errors.js'

export const ddbClient = new DynamoDBClient()

export const getDdbTask = async (taskId) => {
  const getItemResponse = await ddbClient.send(
    new GetItemCommand({
      TableName: process.env.TASKS_TABLE_NAME,
      Key: marshall({
        id: taskId
      })
    })
  )
  const ddbTask = getItemResponse.Item ? unmarshall(getItemResponse.Item) : null
  if (ddbTask == null) throw new UnknownTaskId(taskId)
  return ddbTask
}

export const updateDdbTaskParams = async (taskId, completed, newParams) => {
  newParams = newParams == null ? {} : newParams

  await ddbClient.send(
    new UpdateItemCommand({
      TableName: process.env.TASKS_TABLE_NAME,
      Key: marshall({
        id: taskId
      }),
      UpdateExpression: 'SET completed = :completed, params = :params',
      ExpressionAttributeValues: {
        ':completed': marshall(completed),
        ':params': { M: marshall(newParams) }
      }
    })
  )
}
