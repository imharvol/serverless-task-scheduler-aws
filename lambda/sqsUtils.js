import { SQSClient } from '@aws-sdk/client-sqs'
import { SendMessageCommand } from '@aws-sdk/client-sqs'

const maxDelaySeconds = 900

export const sqsClient = new SQSClient()

export const shouldPospone = (sqsMessage) => {
  if (sqsMessage.targetTimestamp == null) return false
  return sqsMessage.targetTimestamp - Date.now() > 0
}

export const sendSqsMessage = async (message, targetTimestamp = null) => {
  // Notice that sqsDelay = 0 is not the same as sqsDelay = null
  // With sqsDelay = null the message will have the default delay for the queue
  let sqsDelay = null

  if (targetTimestamp != null) {
    const targetTimestampOffset = Math.max(targetTimestamp - Date.now(), 0)

    sqsDelay = Math.min(maxDelaySeconds, Math.ceil(targetTimestampOffset / 1000))
  }

  await sqsClient.send(
    new SendMessageCommand({
      QueueUrl: process.env.TASKS_QUEUE_URL,
      MessageBody: JSON.stringify({
        ...message,
        targetTimestamp
      }),
      DelaySeconds: sqsDelay
    })
  )
}
