import { getDdbTask, updateDdbTaskParams } from './ddbUtils.js'
import { CompletedTaskInQueue, UnknownTaskType } from './errors.js'

// Import task runners
import taskRunners from './taskRunners/index.js'

const executeTask = async (taskId) => {
  let completed,
    newTargetTimestamp,
    newParams = {}

  // Get the task
  const ddbTask = await getDdbTask(taskId)
  if (process.env.DEBUG) console.debug('DDB Task: ' + JSON.stringify(ddbTask))
  if (ddbTask.completed) throw new CompletedTaskInQueue(ddbTask)

  // Check that the task type is supported
  if (taskRunners[ddbTask.type] == null || typeof taskRunners[ddbTask.type] !== 'function')
    throw new UnknownTaskType(ddbTask.type)

  // Execute the task
  ;({ completed, newTargetTimestamp, newParams } = await taskRunners[ddbTask.type](ddbTask))

  // Update task in DDB
  await updateDdbTaskParams(ddbTask.id, completed, newParams)

  return { completed, newTargetTimestamp }
}
export default executeTask
