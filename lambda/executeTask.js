import { getDdbTask, updateDdbTaskParams } from './ddbUtils.js'
import { CompletedTaskInQueue, UnknownTaskType } from './errors.js'

// Import task runners
import defaultTaskRunner from './taskRunners/default.js'

const executeTask = async (taskId) => {
  let completed,
    newTargetTimestamp,
    newParams = {}

  // Get the task
  const ddbTask = await getDdbTask(taskId)
  if (process.env.DEBUG) console.debug('DDB Task: ' + JSON.stringify(ddbTask))
  if (ddbTask.completed) throw new CompletedTaskInQueue(ddbTask)

  switch (ddbTask.type) {
    case 'default':
      ;({ completed, newTargetTimestamp, newParams } = await defaultTaskRunner(ddbTask))
      break
    default:
      throw new UnknownTaskType(ddbTask.type)
  }

  // Update task in DDB
  await updateDdbTaskParams(ddbTask.id, completed, newParams)

  return { completed, newTargetTimestamp }
}
export default executeTask
