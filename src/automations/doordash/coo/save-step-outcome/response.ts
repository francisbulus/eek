import { UUIDs } from '../../../../external/doordash/coo/constants'
import { ultron } from '../../../../external/ultron'
import { BusinessInstanceNotFound } from '../../../../helpers/errors'

const saveStepOutcome = async ({ stepRunId }: { stepRunId: string }) => {
  const stepRun = await ultron.stepRun.findById(stepRunId)

  if (!stepRun)
    throw new BusinessInstanceNotFound(
      {
        name: 'stepRun',
        by: 'stepRunId',
        source: 'doordash/coo/save-step-outcome',
      },
      { stepRunId }
    )
  const [goFromStepRun] = await ultron.stepRun.findGoFromStepRuns({ stepRun })

  const baseRun = await ultron.baseRun.findById(stepRun.baseRunId)

  const baseRunVariables = baseRun.baseRunVariables

  await ultron.baseRun.createMany({
    baseId: UUIDs.Bases.Outcome.id,
    parentBaseRunId: stepRun.baseRunId,
    initialValuesArray: [
      [
        {
          value: goFromStepRun.stepId,
          baseVariableId: UUIDs.Bases.Outcome.BaseVariables['Step ID'], // Step ID
        },
        {
          value: goFromStepRun.assigneeId,
          baseVariableId: UUIDs.Bases.Outcome.BaseVariables['Assignee ID'], // Assignee ID
        },
        {
          value: baseRunVariables.find(
            (brv) => brv.baseVariableId === UUIDs.Bases.Cases.BaseVariables['Result']
          )?.value,
          baseVariableId: UUIDs.Bases.Outcome.BaseVariables['Result'], // Result
        },
        {
          value: baseRunVariables.find(
            (brv) =>
              brv.baseVariableId === UUIDs.Bases.Cases.BaseVariables['Changed Opportunity Owner']
          )?.value,
          baseVariableId: UUIDs.Bases.Outcome.BaseVariables['Changed Opportunity Owner'], // Changed Opportunity Owner
        },
      ],
    ],
  })
}

export { saveStepOutcome }
