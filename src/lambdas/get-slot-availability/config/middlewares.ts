import { PrismaClient } from 'prisma-seated'

const hardDeleteModels: string[] = []

export const handleSoftDeletes = (prisma: PrismaClient) => {
  prisma.$use((params: any, next: any) => {
    if (params.model && !hardDeleteModels.includes(params.model)) {
      if (params.action === 'findMany') {
        params.args['where'] = { ...params.args['where'], deleted_at: null }
      }
      if (params.action === 'updateMany') {
        params.args['where'] = { ...params.args['where'], deleted_at: null }
      }
      if (params.action === 'delete') {
        params.action = 'update'
        params.args.data = { deleted_at: new Date() }
      }
    }
    return next(params)
  })
}
