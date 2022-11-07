const deleteSelected = async (ddbTask) => {
  console.log(ddbTask)

  return {
    completed: true,
    newParams: {},
    newTargetTimestamp: null
  }
}

export default deleteSelected
