import { VercelRequest } from '@vercel/node'
import { z } from 'zod'

const stepRunIdSchema = z.string().uuid()

const basics = {
  stepRunId: stepRunIdSchema,
  token: z.string().optional(),
}

const basicInputSchema = z.object(basics).required()

const validateBasics = (req: VercelRequest) => basicInputSchema.parse(req.body)

export { basicInputSchema, validateBasics }
