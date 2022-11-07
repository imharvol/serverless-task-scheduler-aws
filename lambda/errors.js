export class UnknownTaskId extends Error {
  constructor(taskId) {
    super(`Unknown task id: ${taskId}`)
    this.name = 'UnknownTaskId'
    this.taskId = taskId
  }
}

export class CompletedTaskInQueue extends Error {
  constructor(ddbTask) {
    super(`Found completed task in the queue: ${JSON.stringify(ddbTask)}`)
    this.name = 'CompletedTaskInQueue'
    this.ddbTask = ddbTask
  }
}

export class UnknownTaskType extends Error {
  constructor(taskType) {
    super(`Unknown task type: ${taskType}`)
    this.name = 'UnknownTaskType'
    this.taskType = taskType
  }
}
