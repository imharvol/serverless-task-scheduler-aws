import { shouldPospone, sendSqsMessage } from './sqsUtils.js'

import executeTask from './executeTask.js'

export const handler = async (event) => {
  if (process.env.DEBUG) console.debug('Event: ' + JSON.stringify(event))

  // https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html#services-sqs-batchfailurereporting
  const failureIds = []

  for (const message of event.Records) {
    try {
      const sqsMessage = JSON.parse(message.body)
      const taskId = sqsMessage.taskId

      // Check if the execution should be posponed and delay if needed
      if (shouldPospone(sqsMessage)) {
        if (process.env.DEBUG)
          console.debug(
            `Delaying execution of task until ${sqsMessage.targetTimestamp}: ${JSON.stringify(
              sqsMessage
            )}`
          )
        await sendSqsMessage(sqsMessage, sqsMessage.targetTimestamp)
        continue // Skip execution and remove the task from the queue
      }

      // Execute the task
      let { completed, newTargetTimestamp } = await executeTask(taskId)
      if (process.env.DEBUG) console.debug('Task completed: ' + completed)

      // If the task is not completed add it back to the queue
      if (!completed) {
        if (process.env.DEBUG) {
          if (newTargetTimestamp)
            console.debug(
              `Task ${taskId} not completed. Scheduling for execution at ${newTargetTimestamp}`
            )
          else console.debug(`Task ${taskId} not completed. Scheduling for inmediate execution`)
        }

        await sendSqsMessage(sqsMessage, newTargetTimestamp)
      }
    } catch (err) {
      console.error('Error processing message: ' + JSON.stringify(message))
      console.error(err)
      // This should probably stay commented for now so as not to create a infinite loop
      // failureIds.push(message.messageId) // TODO: Make the delay gradually bigger if the error persists
      // TODO: Switch error types
      continue // Skip execution and remove the task from the queue
    }
  }

  return {
    batchItemFailures: failureIds.map((failureId) => ({
      itemIdentifier: failureId
    }))
  }
}
