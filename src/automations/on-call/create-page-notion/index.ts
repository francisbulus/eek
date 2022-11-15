import { NowRequest, NowResponse } from '@vercel/node'
import { addDays, format } from 'date-fns'
import { find, flow, get, omit } from 'lodash/fp'
import { userService } from 'src/external/user-service'
import { z } from 'zod'

import { notion } from '../../../config/notion'
import { STEP_RUN_STATUSES } from '../../../constants'
import { handleError } from '../../../helpers/errors'
import { validateBasics } from '../../../helpers/yup'

const inputSchema = z.object({
  userId: z.string().uuid(),
})
type TInputSchema = z.infer<typeof inputSchema>

const outputSchema = z.object({
  pageId: z.string().uuid(),
  url: z.string().url(),
})
type TOutputSchema = z.infer<typeof outputSchema>

const ON_CALL_REPORTS_DB = 'b25b5d7cd35f42f1800daf05e4cb9c0e'
const TEMPLATE_PAGE_ID = 'd3a4013b9f9d466383eb245e6f93aada'

const createNotionPage = async ({ userId }: TInputSchema): Promise<TOutputSchema> => {
  const user = await userService.findById(userId)
  const start = new Date()
  const end = addDays(start, 7)
  const title = `On-Call Report  - ${user.name} <${format(start, 'MM/dd/yy')}-${format(
    end,
    'MM/dd/yy'
  )}>`

  const notionUser = await notion.users.list({ page_size: 200 }).then(
    flow(
      get('results'),
      find<{ id: string; person: { email: string } }>({ person: { email: user.email } })
    )
  )
  if (!notionUser) throw new Error(`Could not find Notion user with email ${user.email}`)

  const page = await notion.pages.create({
    parent: {
      database_id: ON_CALL_REPORTS_DB,
    },
    properties: {
      Name: { id: 'title', title: [{ text: { content: title } }] },
      'On-Call Team Member': { people: [{ id: notionUser.id }] },
      Date: {
        date: {
          start: format(start, 'yyyy-MM-dd'),
          end: format(end, 'yyyy-MM-dd'),
        },
      },
    },
  })

  const templateBlocks = await notion.blocks.children
    .list({
      block_id: TEMPLATE_PAGE_ID,
    })
    .then((res) =>
      res.results.map(
        omit([
          'id',
          'type',
          'parent',
          'archived',
          'object',
          'created_time',
          'created_by',
          'last_edited_by',
          'last_edited_time',
          'has_children',
        ])
      )
    )

  await notion.blocks.children.append({
    block_id: page.id,
    children: templateBlocks as any[],
  })
  return { pageId: page.id, url: (page as any).url }
}

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  try {
    const { stepRunId, token } = validateBasics(req)
    const inputData = inputSchema.parse(req.body.data)

    const output = await createNotionPage(inputData)
    const outputData = outputSchema.parse(output)

    res.send({
      stepRunId,
      token,
      data: outputData,
      status: STEP_RUN_STATUSES.DONE,
    })
  } catch (err: any) {
    handleError({ err, req, res })
  }
}
