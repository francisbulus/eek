export interface IJiraTicket extends Record<string, string> {
  id: string
}

export interface IIssue<TFieldKey extends string> {
  key: string
  fields: Record<TFieldKey, any>
}

export type TFilter = string | Record<'in', string[]>

export interface IFilters {
  status?: TFilter
  assignee?: TFilter
  label?: TFilter
}
