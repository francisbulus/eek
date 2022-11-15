import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core'

export type Maybe<T> = T | null
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> }
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> }
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
  /**
   * The `BigInt` scalar type represents non-fractional signed whole numeric values.
   * BigInt can represent values between -(2^53) + 1 and 2^53 - 1.
   */
  BigInt: any
  Date: any
  /** ISO string of a duration */
  Duration: any
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: any
}

export type IAgentUpdate = INode & {
  __typename?: 'AgentUpdate'
  agentId: Scalars['Int']
  body: Scalars['String']
  createdAt: Scalars['Date']
  /** Unique identifier for the resource */
  id: Scalars['Int']
  userId: Scalars['Int']
}

export type IAnswer = INode & {
  __typename?: 'Answer'
  comment?: Maybe<Scalars['String']>
  createdAt: Scalars['Date']
  /** Form Submission */
  formSubmission: IFormSubmission
  formSubmissionId: Scalars['Int']
  /** Unique identifier for the resource */
  id: Scalars['Int']
  lastEditedByUserId?: Maybe<Scalars['Int']>
  /** Question */
  question: IQuestion
  questionId: Scalars['Int']
  updatedAt: Scalars['Date']
  value?: Maybe<Scalars['Int']>
}

export type IAssistant = INode & {
  __typename?: 'Assistant'
  /** The Assistant's monthly budget in cents */
  budget?: Maybe<Scalars['Int']>
  closer: Scalars['String']
  company: ICompany
  department?: Maybe<IDepartment>
  departmentId?: Maybe<Scalars['Int']>
  /** Unique identifier for the resource */
  id: Scalars['Int']
  opener: Scalars['String']
  /** The Assistant's owner */
  owner: IClient
  ownerId: Scalars['Int']
  profile?: Maybe<IProfile>
  profileId?: Maybe<Scalars['Int']>
  /** Clients who belong to the assistant's team */
  teamMembers: IAssistantTeamMember[]
  /** The Assistant's team name */
  teamName?: Maybe<Scalars['String']>
}

/** Role of a client relative to assistant */
export const IAssistantClientRole = {
  Admin: 'admin',
  Collaborator: 'collaborator',
  Owner: 'owner',
} as const

export type IAssistantClientRole = typeof IAssistantClientRole[keyof typeof IAssistantClientRole]
export type IAssistantTeamMember = IIClient &
  INode & {
    __typename?: 'AssistantTeamMember'
    /** Account Directors for the Client */
    accountDirectors: IUser[]
    assistantRole: IAssistantClientRole
    /** The assistants a client has access to */
    assistants: IAssistant[]
    /** A company (by id) a client has access to */
    company?: Maybe<ICompany>
    companyRole: ICompanyRole
    /** Delivery Managers for the Client */
    deliveryManagers: IUser[]
    /** The first assistant a client has access to */
    firstAssistant?: Maybe<IAssistant>
    /** Unique identifier for the resource */
    id: Scalars['Int']
    /** Client Resource Links */
    oldProcesses?: Maybe<IOldProcess[]>
    preference?: Maybe<Scalars['String']>
    /** The profile of a person (e.g. Agent, Client). */
    profile?: Maybe<IProfile>
    profileId?: Maybe<Scalars['Int']>
    role: IAssistantClientRole
    /** Client credential tags */
    tags?: Maybe<ITag[]>
    tagToClients: ITagToClient[]
    /** Relationships of Users to Clients */
    usersToClientsAccess?: Maybe<IUsersToClientsAccess[]>
  }

export type IAssistantTeamMemberAssistantRoleArgs = {
  assistantId: Scalars['Int']
}

export type IAssistantTeamMemberAssistantsArgs = {
  companyId?: Maybe<Scalars['Int']>
}

export type IAssistantTeamMemberCompanyArgs = {
  id: Scalars['Int']
}

export type IAssistantTeamMemberCompanyRoleArgs = {
  companyId?: Maybe<Scalars['Int']>
  companySlug?: Maybe<Scalars['String']>
}

export type IAssistantTeamMemberUsersToClientsAccessArgs = {
  roleIds: Scalars['String']
}

export type IAssistantToClient = {
  __typename?: 'AssistantToClient'
  assistant: IAssistant
  assistantId: Scalars['Int']
  client: IClient
  clientId: Scalars['Int']
  role: IAssistantClientRole
}

export type IBalance = {
  __typename?: 'Balance'
  amount: Scalars['Float']
  balance: Scalars['Float']
  creditCreatedAt?: Maybe<Scalars['String']>
  description?: Maybe<Scalars['String']>
  eventDate: Scalars['String']
  eventType?: Maybe<Scalars['String']>
  id: Scalars['Int']
  instanceId?: Maybe<Scalars['Int']>
  invoice?: Maybe<IStripeInvoice>
  rate?: Maybe<Scalars['Float']>
  recurring?: Maybe<Scalars['Boolean']>
  stripeChargeId?: Maybe<Scalars['String']>
  timeTracked?: Maybe<Scalars['String']>
  type?: Maybe<Scalars['String']>
}

/** Internal shift response type for multiple userIds */
export type IBulkInternalShift = {
  __typename?: 'BulkInternalShift'
  /** Internal Shifts for user */
  shifts?: Maybe<IInternalShift[]>
  /** Agent working shift */
  user: IUser
  userId: Scalars['Int']
}

export type ICalendarEvent = {
  __typename?: 'CalendarEvent'
  end: Scalars['Date']
  name?: Maybe<Scalars['String']>
  start: Scalars['Date']
}

export type ICard = {
  __typename?: 'Card'
  brand: Scalars['String']
  last4: Scalars['String']
  name?: Maybe<Scalars['String']>
  type: Scalars['String']
}

/** Check in to agent shift */
export type ICheckIn = INode & {
  __typename?: 'CheckIn'
  createdAt: Scalars['Date']
  /** Unique identifier for the resource */
  id: Scalars['Int']
  lateness?: Maybe<Scalars['Int']>
  latenessReason?: Maybe<Scalars['String']>
  /** Parent Shift */
  shift: IInternalShift
  shiftId: Scalars['Int']
  timeIn: Scalars['Date']
  updatedAt: Scalars['Date']
  /** Agent working shift */
  user: IUser
  userId: Scalars['Int']
}

export type IClient = IIClient &
  INode & {
    __typename?: 'Client'
    /** Account Directors for the Client */
    accountDirectors: IUser[]
    assistantRole: IAssistantClientRole
    /** The assistants a client has access to */
    assistants: IAssistant[]
    /** A company (by id) a client has access to */
    company?: Maybe<ICompany>
    companyRole: ICompanyRole
    /** Delivery Managers for the Client */
    deliveryManagers: IUser[]
    /** The first assistant a client has access to */
    firstAssistant?: Maybe<IAssistant>
    /** Unique identifier for the resource */
    id: Scalars['Int']
    /** Client Resource Links */
    oldProcesses?: Maybe<IOldProcess[]>
    preference?: Maybe<Scalars['String']>
    /** The profile of a person (e.g. Agent, Client). */
    profile?: Maybe<IProfile>
    profileId?: Maybe<Scalars['Int']>
    /** Client credential tags */
    tags?: Maybe<ITag[]>
    tagToClients: ITagToClient[]
    /** Relationships of Users to Clients */
    usersToClientsAccess?: Maybe<IUsersToClientsAccess[]>
  }

export type IClientAssistantRoleArgs = {
  assistantId: Scalars['Int']
}

export type IClientAssistantsArgs = {
  companyId?: Maybe<Scalars['Int']>
}

export type IClientCompanyArgs = {
  id: Scalars['Int']
}

export type IClientCompanyRoleArgs = {
  companyId?: Maybe<Scalars['Int']>
  companySlug?: Maybe<Scalars['String']>
}

export type IClientUsersToClientsAccessArgs = {
  roleIds: Scalars['String']
}

export type IComment = INode & {
  __typename?: 'Comment'
  body: Scalars['String']
  createdAt: Scalars['Date']
  /** Descriptor */
  descriptor: IDescriptor
  descriptorId: Scalars['Int']
  /** Unique identifier for the resource */
  id: Scalars['Int']
  isWorkStatus: Scalars['Boolean']
  message: IMessage
  messageId: Scalars['Int']
  /** Stage */
  stage: IStage
  stageId: Scalars['Int']
  /** Status */
  status: IStatus
  statusId: Scalars['Int']
  type: ICommentType
}

export const ICommentType = {
  General: 'general',
  Quote: 'quote',
} as const

export type ICommentType = typeof ICommentType[keyof typeof ICommentType]
export type ICommodity = INode & {
  __typename?: 'Commodity'
  defaultRate: Scalars['Int']
  /** Unique identifier for the resource */
  id: Scalars['Int']
  name: Scalars['String']
  unit: Scalars['String']
}

export type ICompany = INode & {
  __typename?: 'Company'
  /** Total balance without open quotes */
  actualBalance: Scalars['Float']
  allowNegativeBalance: Scalars['Boolean']
  /** The assistants a company has access to */
  assistants?: Maybe<IAssistant[]>
  autoRecharge: Scalars['Boolean']
  /** Amount to charge client based on proposed quote */
  autoRechargeAmount?: Maybe<Scalars['Float']>
  /** Maximum amount that a quote can be charged automatically (in cents). */
  autoRechargeMaxAmount: Scalars['Float']
  /** Stripe subscription plan */
  availablePlans: IPlan[]
  averageCsatScore?: Maybe<Scalars['Float']>
  balance: Scalars['Float']
  /** Event of company balance history */
  balanceHistory: IBalance[]
  /** Event of company balance history completed only */
  balanceHistoryCompleted: IBalance[]
  /** Event of pending company balance history */
  balanceHistoryPending: IBalance[]
  /** Total completed usage within a given time period */
  completedUsage?: Maybe<Scalars['Float']>
  consumingProcessRate: Scalars['Float']
  /** Company creation date */
  createdAt: Scalars['Date']
  /** The CSM assigned to the Company. */
  csmUser?: Maybe<IUser>
  csmUserId?: Maybe<Scalars['Int']>
  /** The delegations of all assistants in the company */
  delegations?: Maybe<IInstance[]>
  /** Number of delegations in company grouped by status */
  delegationsCounts: IDelegationCounts
  /** The delegations in progress for all assistants in the company */
  delegationsInProgress?: Maybe<IInstance[]>
  /** Summary of deliverable counts */
  deliverablesCounts: IDeliverablesCount[]
  /** Credit Expiration enabled for this Company */
  expireCredits: Scalars['Boolean']
  /** Credits expiring within a given time period */
  expiringCredits: IExpiringCredit[]
  externalInternal: IExternalInternal
  fromEmailsBlacklist?: Maybe<Maybe<Scalars['String']>[]>
  /** Unique identifier for the resource */
  id: Scalars['Int']
  invites: IInvite[]
  isPaidFor: Scalars['Boolean']
  isSelfServed: Scalars['Boolean']
  logoUrl?: Maybe<Scalars['String']>
  /** The members of the company (e.g. Owner and invited team members). */
  members: IClient[]
  name: Scalars['String']
  offboarded: Scalars['Boolean']
  /** The owner of the company */
  owner: IClient
  ownerId: Scalars['Int']
  preference?: Maybe<Scalars['String']>
  /** Processes attached to this company */
  processes?: Maybe<IProcess[]>
  processRate: Scalars['Float']
  /** Event of quote history of a delegation */
  quotesForDelegation: IBalance[]
  slug: Scalars['String']
  stripeCustomerId?: Maybe<Scalars['String']>
  /** Next subscription renewal date and amount */
  subscription?: Maybe<ISubscription>
  tier: ITier
  toEmailsBlacklist?: Maybe<Maybe<Scalars['String']>[]>
  /** Total usage within a given time period */
  usage?: Maybe<Scalars['Float']>
  weeklyUsage: IUsage[]
}

export type ICompanyActualBalanceArgs = {
  date: Scalars['String']
}

export type ICompanyAutoRechargeAmountArgs = {
  instanceDuplication?: Maybe<Scalars['Boolean']>
  lineItemsAttributes: ILineItemAttributesInputType[]
  quoteInstanceId: Scalars['Int']
}

export type ICompanyAvailablePlansArgs = {
  discountCode?: Maybe<Scalars['String']>
}

export type ICompanyBalanceArgs = {
  date?: Maybe<Scalars['String']>
}

export type ICompanyBalanceHistoryArgs = {
  from: Scalars['String']
  to: Scalars['String']
}

export type ICompanyBalanceHistoryCompletedArgs = {
  from: Scalars['String']
  to: Scalars['String']
}

export type ICompanyBalanceHistoryPendingArgs = {
  from: Scalars['String']
  to: Scalars['String']
}

export type ICompanyCompletedUsageArgs = {
  from: Scalars['String']
  to: Scalars['String']
}

export type ICompanyDelegationsArgs = {
  limit?: Maybe<Scalars['Int']>
  offset?: Maybe<Scalars['Int']>
  status?: Maybe<IInstanceStatus>
  statusIds?: Maybe<Scalars['Int'][]>
}

export type ICompanyDelegationsCountsArgs = {
  from?: Maybe<Scalars['String']>
  to?: Maybe<Scalars['String']>
}

export type ICompanyInvitesArgs = {
  used: Scalars['Boolean']
}

export type ICompanyMembersArgs = {
  limit?: Maybe<Scalars['Int']>
}

export type ICompanyQuotesForDelegationArgs = {
  instanceId: Scalars['Int']
}

export type ICompanyUsageArgs = {
  from: Scalars['String']
  to: Scalars['String']
}

export type ICompanyWeeklyUsageArgs = {
  from: Scalars['String']
  to: Scalars['String']
}

/** Company Role */
export const ICompanyRole = {
  Admin: 'admin',
  Collaborator: 'collaborator',
  Owner: 'owner',
} as const

export type ICompanyRole = typeof ICompanyRole[keyof typeof ICompanyRole]
export type ICompanyToClient = INode & {
  __typename?: 'CompanyToClient'
  company: ICompany
  companyId: Scalars['Int']
  /** Unique identifier for the resource */
  id: Scalars['Int']
  owner: IClient
  ownerId: Scalars['Int']
  role: ICompanyRole
}

export type ICompletedDelegation = INode & {
  __typename?: 'CompletedDelegation'
  createdAt?: Maybe<Scalars['Date']>
  /** Form Submission */
  formSubmission: IFormSubmission
  formSubmissionId?: Maybe<Scalars['Int']>
  /** Unique identifier for the resource */
  id: Scalars['Int']
  /** Instance */
  instance: IInstance
  instanceId?: Maybe<Scalars['Int']>
  meta?: Maybe<Scalars['JSON']>
  /** Process Run */
  processRun: IProcessRun
  processRunId?: Maybe<Scalars['Int']>
  qaScore?: Maybe<Scalars['Float']>
  updatedAt?: Maybe<Scalars['Date']>
  /** User */
  user: IUser
  userId: Scalars['Int']
}

export type IComplexity = INode & {
  __typename?: 'Complexity'
  /** Unique identifier for the resource */
  id: Scalars['Int']
  label: Scalars['String']
  rank: Scalars['Int']
}

export type ICostCode = INode & {
  __typename?: 'CostCode'
  category: Scalars['String']
  code: Scalars['String']
  description: Scalars['String']
  /** Unique identifier for the resource */
  id: Scalars['Int']
  internalTeam: Scalars['String']
}

export type IDelegationCounts = {
  __typename?: 'DelegationCounts'
  all?: Maybe<Scalars['Int']>
  awaitingClient?: Maybe<Scalars['Int']>
  done?: Maybe<Scalars['Int']>
  inProgress?: Maybe<Scalars['Int']>
}

export type IDelegator = {
  __typename?: 'Delegator'
  email?: Maybe<Scalars['String']>
  isTeamMember: Scalars['Boolean']
  name?: Maybe<Scalars['String']>
}

export type IDeliverable = INode & {
  __typename?: 'Deliverable'
  /** Unique identifier for the resource */
  id: Scalars['Int']
  instanceId: Scalars['Int']
  link: Scalars['String']
  name: Scalars['String']
  userId: Scalars['Int']
}

export type IDeliverablesCount = {
  __typename?: 'DeliverablesCount'
  count: Scalars['Int']
  name: Scalars['String']
}

export type IDepartment = INode & {
  __typename?: 'Department'
  /** Unique identifier for the resource */
  id: Scalars['Int']
  name: Scalars['String']
}

export type IDescriptor = INode & {
  __typename?: 'Descriptor'
  /** Unique identifier for the resource */
  id: Scalars['Int']
  name: Scalars['String']
}

export type IDraftAgentInvoice = INode & {
  __typename?: 'DraftAgentInvoice'
  cycleRange: Scalars['Date'][]
  /** Unique identifier for the resource */
  id: Scalars['Int']
  resultsBasedTotal: Scalars['Int']
  status?: Maybe<IDraftAgentInvoiceStatus>
  timeBasedTotal: Scalars['Int']
  timeEntries?: Maybe<ITimeEntry[]>
  total: Scalars['Int']
  user: IUser
  userId: Scalars['Int']
  xeroInvoice?: Maybe<IXeroInvoice>
  xeroInvoiceId?: Maybe<Scalars['Int']>
}

/** Draft Agent Invoice Statuses */
export const IDraftAgentInvoiceStatus = {
  Approved: 'approved',
  Drafted: 'drafted',
} as const

export type IDraftAgentInvoiceStatus = typeof IDraftAgentInvoiceStatus[keyof typeof IDraftAgentInvoiceStatus]

export type IEmail = INode & {
  __typename?: 'Email'
  BCC?: Maybe<Scalars['String'][]>
  body: Scalars['String']
  CC?: Maybe<Scalars['String'][]>
  createdAt: Scalars['Date']
  EK: Scalars['String']
  files: Scalars['String']
  filesCount: Scalars['Int']
  from: Scalars['String']
  /** Unique identifier for the resource */
  id: Scalars['Int']
  message: IMessage
  messageId: Scalars['Int']
  recipient?: Maybe<Scalars['String']>
  sanitizedBody: Scalars['String']
  subject: Scalars['String']
  to?: Maybe<Scalars['String'][]>
}

export type IEmailBodyArgs = {
  allowUnsanitized?: Maybe<Scalars['Boolean']>
}

export type IExpiringCredit = {
  __typename?: 'ExpiringCredit'
  amount: Scalars['Int']
  expireAt: Scalars['Date']
}

/** Assistant External or Internal-ness */
export const IExternalInternal = {
  External: 'External',
  Internal: 'Internal',
} as const

export type IExternalInternal = typeof IExternalInternal[keyof typeof IExternalInternal]
export type IFilter = {
  field?: Maybe<Scalars['String']>
  name?: Maybe<Scalars['String']>
  range?: Maybe<Scalars['JSON']>
  values?: Maybe<Maybe<Scalars['JSON']>[]>
}

export type IForm = INode & {
  __typename?: 'Form'
  createdAt: Scalars['Date']
  /** Unique identifier for the resource */
  id: Scalars['Int']
  type: IFormType
}

export type IFormSubmission = INode & {
  __typename?: 'FormSubmission'
  /** Answers */
  answers: IAnswer[]
  createdAt: Scalars['Date']
  /** Form */
  form: IForm
  formId: Scalars['Int']
  /** Unique identifier for the resource */
  id: Scalars['Int']
  /** Instance */
  instance: IInstance
  instanceId: Scalars['Int']
  overallRating?: Maybe<Scalars['Int']>
  passed?: Maybe<Scalars['Boolean']>
  submitedByUserId?: Maybe<Scalars['Int']>
  submittedAt?: Maybe<Scalars['Date']>
  /** Task Run */
  taskRun?: Maybe<ITaskRun>
  taskRunId?: Maybe<Scalars['Int']>
}

export const IFormType = {
  Csat: 'csat',
  Qa: 'qa',
  TaskQa: 'taskQa',
} as const

export type IFormType = typeof IFormType[keyof typeof IFormType]
/** Interface for Client */
export type IIClient = {
  /** Account Directors for the Client */
  accountDirectors: IUser[]
  assistantRole: IAssistantClientRole
  /** The assistants a client has access to */
  assistants: IAssistant[]
  /** A company (by id) a client has access to */
  company?: Maybe<ICompany>
  companyRole: ICompanyRole
  /** Delivery Managers for the Client */
  deliveryManagers: IUser[]
  /** The first assistant a client has access to */
  firstAssistant?: Maybe<IAssistant>
  /** Client Resource Links */
  oldProcesses?: Maybe<IOldProcess[]>
  preference?: Maybe<Scalars['String']>
  /** The profile of a person (e.g. Agent, Client). */
  profile?: Maybe<IProfile>
  profileId?: Maybe<Scalars['Int']>
  /** Client credential tags */
  tags?: Maybe<ITag[]>
  tagToClients: ITagToClient[]
  /** Relationships of Users to Clients */
  usersToClientsAccess?: Maybe<IUsersToClientsAccess[]>
}

/** Interface for Client */
export type IIClientAssistantRoleArgs = {
  assistantId: Scalars['Int']
}

/** Interface for Client */
export type IIClientAssistantsArgs = {
  companyId?: Maybe<Scalars['Int']>
}

/** Interface for Client */
export type IIClientCompanyArgs = {
  id: Scalars['Int']
}

/** Interface for Client */
export type IIClientCompanyRoleArgs = {
  companyId?: Maybe<Scalars['Int']>
  companySlug?: Maybe<Scalars['String']>
}

/** Interface for Client */
export type IIClientUsersToClientsAccessArgs = {
  roleIds: Scalars['String']
}

export type IInstance = INode & {
  __typename?: 'Instance'
  activeProcessRun?: Maybe<IProcessRun>
  /** Active Time Entries */
  activeTimeEntries: ITimeEntry[]
  /** Agent who is assigned to the Instance. */
  assignee?: Maybe<IUser>
  assigneeId?: Maybe<Scalars['Int']>
  /** The assistant that received the email */
  assistant: IAssistant
  assistantId: Scalars['Int']
  /** benchmark as an iso string */
  benchmark?: Maybe<Scalars['Duration']>
  /** benchmark as a float number of hours */
  benchmarkHours?: Maybe<Scalars['Float']>
  billingRate?: Maybe<Scalars['Float']>
  /** The client that delegated us the instance */
  client?: Maybe<IClient>
  clientId?: Maybe<Scalars['Int']>
  /** Date of completion for done instances */
  completedAt?: Maybe<Scalars['Date']>
  complexity?: Maybe<IComplexity>
  complexityRank?: Maybe<Scalars['Int']>
  cost?: Maybe<Scalars['Float']>
  costCode: ICostCode
  costCodeId: Scalars['Int']
  createdAt: Scalars['Date']
  deadline?: Maybe<Scalars['Date']>
  /** Instance delegator */
  delegator?: Maybe<IDelegator>
  /** Deliverables */
  deliverables: IDeliverable[]
  description?: Maybe<Scalars['String']>
  /** Descriptor */
  descriptor: IDescriptor
  descriptorId: Scalars['Int']
  duplicatedFrom?: Maybe<IInstance>
  duplicatedFromId?: Maybe<Scalars['Int']>
  duplicatedTo?: Maybe<IInstance[]>
  duplicatedToIds: Scalars['Int'][]
  emailDraft?: Maybe<Scalars['String']>
  ETA?: Maybe<Scalars['Date']>
  form?: Maybe<IForm>
  formId?: Maybe<Scalars['Int']>
  help: Scalars['Boolean']
  /** Unique identifier for the resource */
  id: Scalars['Int']
  /** InstanceDraft */
  instanceDraft?: Maybe<IInstanceDraft>
  instanceDraftId?: Maybe<Scalars['Int']>
  isCurrentlyBeingTrackedIn: Scalars['Boolean']
  looksLikeSpam: Scalars['Boolean']
  /** management benchmark as an iso string */
  managementBenchmark?: Maybe<Scalars['Duration']>
  /** management benchmark as a float number of hours */
  managementBenchmarkHours?: Maybe<Scalars['Float']>
  name?: Maybe<Scalars['String']>
  /** Instructions for completing the Instance. */
  oldProcess?: Maybe<IOldProcess>
  oldProcessId?: Maybe<Scalars['Int']>
  /** sum of oldTask benchmarks as a float number of hours */
  oldTaskBenchmarkHours: Scalars['Float']
  oldTasks?: Maybe<IOldTask[]>
  /** Agent who is the owner of the Instance. */
  owner?: Maybe<IUser>
  ownerId?: Maybe<Scalars['Int']>
  qualification?: Maybe<IQualification>
  qualificationId?: Maybe<Scalars['Int']>
  /** Instance quote */
  quote?: Maybe<IQuote>
  quotedHours?: Maybe<Scalars['Float']>
  rating?: Maybe<Scalars['Int']>
  recurring: Scalars['Boolean']
  recurringFrequency?: Maybe<Scalars['String']>
  /** The last 5 instances on the duplication relationships */
  relatedInstances?: Maybe<IInstance[]>
  /** scoping benchmark as an iso string */
  scopingBenchmark?: Maybe<Scalars['Duration']>
  /** scoping benchmark as a float number of hours */
  scopingBenchmarkHours?: Maybe<Scalars['Float']>
  /** Stage */
  stage: IStage
  stageId: Scalars['Int']
  /** Status */
  status: IStatus
  statusId: Scalars['Int']
  /** Tags */
  tags?: Maybe<ITag[]>
  tagToInstances: ITagToInstance[]
  /** sum of taskRun benchmarks as a float number of hours */
  taskRunBenchmarkHours: Scalars['Float']
  totalTimeTracked: Scalars['BigInt']
  uid: Scalars['String']
  unsnoozeAt?: Maybe<Scalars['Date']>
  updatedAt?: Maybe<Scalars['Date']>
}

export type IInstanceDelegatorArgs = {
  companyId: Scalars['Int']
}

export type IInstanceDraft = INode & {
  __typename?: 'InstanceDraft'
  assistant: IAssistant
  assistantId: Scalars['Int']
  client: IClient
  clientId: Scalars['Int']
  company: ICompany
  companyId: Scalars['Int']
  createdAt: Scalars['Date']
  deadline?: Maybe<Scalars['Date']>
  /** Unique identifier for the resource */
  id: Scalars['Int']
  instances?: Maybe<IInstance[]>
  instanceTemplate?: Maybe<IInstanceTemplate>
  instanceTemplateId?: Maybe<Scalars['Int']>
  instructions?: Maybe<Scalars['String']>
  name?: Maybe<Scalars['String']>
  requiresCredentials: Scalars['Boolean']
  submittedAt?: Maybe<Scalars['Date']>
  templateData?: Maybe<Scalars['JSON']>
  updatedAt: Scalars['Date']
}

export type IInstanceDraftSubmittedValue = {
  __typename?: 'InstanceDraftSubmittedValue'
  instance: IInstance
  instanceDraft: IInstanceDraft
  process?: Maybe<IProcess>
}

export const IInstanceStatus = {
  Done: 'Done',
  NotDone: 'NotDone',
} as const

export type IInstanceStatus = typeof IInstanceStatus[keyof typeof IInstanceStatus]
export type IInstanceTemplate = INode & {
  __typename?: 'InstanceTemplate'
  blurb: Scalars['String']
  createdAt: Scalars['Date']
  description: Scalars['String']
  /** Unique identifier for the resource */
  id: Scalars['Int']
  imageUrl: Scalars['String']
  instanceDrafts?: Maybe<IInstanceDraft[]>
  name: Scalars['String']
  process?: Maybe<IProcess>
  /** Category the process belongs to */
  processCategory?: Maybe<ITag>
  processCategoryTagId?: Maybe<Scalars['Int']>
  processId?: Maybe<Scalars['Int']>
  questions: IInstanceTemplateQuestion[]
}

export type IInstanceTemplateQuestion = {
  __typename?: 'InstanceTemplateQuestion'
  answers?: Maybe<Scalars['String'][]>
  description: Scalars['String']
  id: Scalars['String']
  name: Scalars['String']
  question: Scalars['String']
  required?: Maybe<Scalars['Boolean']>
  type: Scalars['String']
}

/** Time record for agent shift */
export type IInternalShift = INode & {
  __typename?: 'InternalShift'
  /** Agent working shift */
  agent: IUser
  createdAt: Scalars['Date']
  editedByUserId?: Maybe<Scalars['Int']>
  endDate: Scalars['Date']
  endTime: Scalars['String']
  /** Unique identifier for the resource */
  id: Scalars['Int']
  /** Shift Owner */
  owner?: Maybe<IUser>
  /** Parent Shift */
  parent?: Maybe<IInternalShift>
  parentId?: Maybe<Scalars['Int']>
  recurring: Scalars['Boolean']
  recurringFrequency?: Maybe<Scalars['String']>
  startDate: Scalars['Date']
  startTime: Scalars['String']
  timezone?: Maybe<Scalars['String']>
  type: Scalars['String']
  userId: Scalars['Int']
}

export type IInvite = {
  __typename?: 'Invite'
  companyId: Scalars['Int']
  expiredAt: Scalars['Date']
  invitedClientEmail: Scalars['String']
  inviterId: Scalars['Int']
  isExistingClient?: Maybe<Scalars['Boolean']>
  isExpiredToken: Scalars['Boolean']
  used: Scalars['Boolean']
}

export type ILineItem = INode & {
  __typename?: 'LineItem'
  agentPaymentPerUnit?: Maybe<Scalars['Int']>
  agentPaymentType: ILineItemAgentPaymentType
  amountInCents: Scalars['Int']
  buffer: Scalars['Float']
  centsPerOutput?: Maybe<Scalars['Float']>
  commodity: ICommodity
  commodityId: Scalars['Int']
  discount: Scalars['Float']
  grossMargin: Scalars['Float']
  hoursPerOutput: Scalars['Float']
  /** Unique identifier for the resource */
  id: Scalars['Int']
  /** iso string of management time */
  managementTimeDuration: Scalars['Duration']
  outputsPerHour?: Maybe<Scalars['Float']>
  quantity: Scalars['Float']
  saasCostPerUnit: Scalars['Int']
  /** iso string of scoping time */
  scopingTimeDuration: Scalars['Duration']
  serviceMargin: Scalars['Float']
  /** iso string of time to one unit */
  timeToOneUnit: Scalars['Duration']
  type: Scalars['String']
  unitCost: Scalars['Float']
}

/** Line Item Agent Payment Type */
export const ILineItemAgentPaymentType = {
  Benchmark: 'benchmark',
  Timetracked: 'timetracked',
  Unit: 'unit',
} as const

export type ILineItemAgentPaymentType = typeof ILineItemAgentPaymentType[keyof typeof ILineItemAgentPaymentType]
export type ILineItemAttributesInputType = {
  agentPaymentPerUnit?: Maybe<Scalars['Int']>
  agentPaymentType?: Maybe<ILineItemAgentPaymentType>
  buffer?: Maybe<Scalars['Float']>
  commodityId?: Maybe<Scalars['Int']>
  discount?: Maybe<Scalars['Float']>
  managementTimeDuration?: Maybe<Scalars['String']>
  quantity: Scalars['Float']
  saasCostPerUnit?: Maybe<Scalars['Int']>
  scopingTimeDuration?: Maybe<Scalars['String']>
  serviceMargin?: Maybe<Scalars['Float']>
  timeToOneUnit?: Maybe<Scalars['String']>
  type?: Maybe<ILineItemType>
}

/** Line Item Type */
export const ILineItemType = {
  FixedAmount: 'fixedAmount',
  General: 'general',
  Scoping: 'scoping',
} as const

export type ILineItemType = typeof ILineItemType[keyof typeof ILineItemType]
export type ILoginException = INode & {
  __typename?: 'LoginException'
  createdAt: Scalars['Date']
  createdByUserId: Scalars['Int']
  /** User that created the exception */
  creator: IUser
  endAt: Scalars['Date']
  /** Unique identifier for the resource */
  id: Scalars['Int']
  note?: Maybe<Scalars['String']>
  updatedAt: Scalars['Date']
  /** User */
  user: IUser
  userId: Scalars['Int']
}

export type IMenuToTags = INode & {
  __typename?: 'MenuToTags'
  createdAt?: Maybe<Scalars['Date']>
  id: Scalars['Int']
  /** Menu */
  menu?: Maybe<IMenus>
  menuId?: Maybe<Scalars['Int']>
  /** Parent Tag */
  parentTag?: Maybe<ITag>
  parentTagId?: Maybe<Scalars['Int']>
  updatedAt?: Maybe<Scalars['Date']>
}

export type IMenus = INode & {
  __typename?: 'Menus'
  createdAt?: Maybe<Scalars['Date']>
  id: Scalars['Int']
  name: Scalars['String']
  updatedAt?: Maybe<Scalars['Date']>
}

export type IMessage = INode & {
  __typename?: 'Message'
  assistant?: Maybe<IAssistant>
  assistantId?: Maybe<Scalars['Int']>
  direction: Scalars['String']
  /** Unique identifier for the resource */
  id: Scalars['Int']
  instances?: Maybe<IInstance[]>
  user?: Maybe<IUser>
  userId?: Maybe<Scalars['Int']>
}

export type IMutation = {
  __typename?: 'Mutation'
  addCheckIn: ICheckIn
  addCheckInLatenessReason: ICheckIn
  addClientToAssistant: IAssistantTeamMember
  addCompanyEmailBlacklist: ICompany
  addCompanyToProcess?: Maybe<IProcess>
  addDeliverable: IDeliverable
  addMenu: IMenus
  addMenuToTag: IMenuToTags
  addPreset: IPresets
  addProcessToInstance?: Maybe<IInstance>
  addQuote: IQuote
  addSimpleQuote: IQuote
  addStepToProcess: IStep
  addTagToClient?: Maybe<IClient>
  addTagToInstance: IInstance
  addTagToProcess?: Maybe<IProcess>
  addTagToUser?: Maybe<IUser>
  addTaskDeliverable?: Maybe<ITaskDeliverable>
  addTaskRunDeliverable?: Maybe<ITaskRunDeliverable>
  addWorkStatus: IComment
  archiveAllNotifications?: Maybe<Scalars['Boolean']>
  archiveNotification: INotification
  archiveTag: Scalars['Int']
  autoCompleteStepGotos?: Maybe<IProcess>
  batchifyTaskRun: ITaskRun[]
  changeProcessTagRank?: Maybe<IProcess>
  changeUserTagRank?: Maybe<IUser>
  completeTaskRun: ITaskRun
  completeTaskRunQa: ITaskRun
  /** Converts a simple process to complex */
  convertSimpleProcessToComplex?: Maybe<IProcess>
  createAssistantTeam: IAssistant
  createDepartment: IDepartment
  createEmptyTask?: Maybe<ITask>
  createFormSubmission: IFormSubmission
  createInstance: IInstance
  createInstanceDraft?: Maybe<IInstanceDraft>
  createLoginException: ILoginException
  createMapStep: IStep
  createNotification: INotification
  createOldTask?: Maybe<IOldTask>
  createProcess?: Maybe<IProcess>
  createRole: IRole
  createShift?: Maybe<IInternalShift>
  createStep?: Maybe<IStep>
  createStepFromInstructionStep?: Maybe<IStep>
  createStepFromStepTemplate?: Maybe<IStep>
  createStepGoTo?: Maybe<IStepGoTo>
  createStepRun?: Maybe<IStepRun>
  createStepRunGoTo?: Maybe<IStepRunGoTo>
  createStepTemplate?: Maybe<IStepTemplate>
  createStepTemplateCategory?: Maybe<IStepTemplateCategory>
  createTag?: Maybe<ITag>
  createTask?: Maybe<ITask>
  createTaskRun?: Maybe<ITaskRun>
  createUsersToClientsAccess: IUsersToClientsAccess
  createVariable?: Maybe<IVariable>
  createVariableGoTo?: Maybe<IVariableGoTo>
  createVariableTemplate?: Maybe<IVariableTemplate>
  createVariableValue?: Maybe<IVariableValue>
  createVariableValueGoTo?: Maybe<IVariableValueGoTo>
  deleteAssistantTeam: IAssistant
  deleteDeliverable: IDeliverable
  deleteLoginException: ILoginException
  deleteMenu: IMenus
  deleteMenuToTag: IMenuToTags
  deleteOldProcess: IClient
  deleteOldTask?: Maybe<Scalars['Boolean']>
  deletePreset: IPresets
  deleteProcess: Scalars['Boolean']
  deleteShift?: Maybe<IInternalShift>
  deleteStep: Scalars['Boolean']
  deleteStepGoTo: Scalars['Boolean']
  deleteStepRun: Scalars['Boolean']
  deleteStepRunGoTo: Scalars['Boolean']
  deleteStepTemplate: Scalars['Boolean']
  deleteStepTemplateCategory: Scalars['Boolean']
  deleteTask?: Maybe<Scalars['Boolean']>
  deleteTaskRun?: Maybe<Scalars['Boolean']>
  deleteUsersToClientsAccess: IUsersToClientsAccess
  deleteVariable: Scalars['Boolean']
  deleteVariableGoTo?: Maybe<IVariableGoTo>
  deleteVariableTemplate?: Maybe<IVariableTemplate>
  deleteVariableValue: Scalars['Boolean']
  deleteVariableValueGoTo: Scalars['Boolean']
  draftAgentInvoiceToXero: IDraftAgentInvoice
  duplicateInstance?: Maybe<IInstance>
  duplicateOldTask: IOldTask
  duplicateProcess?: Maybe<IProcess>
  duplicateStep: IStep
  duplicateStepRun: IStepRun
  duplicateStepTemplate: IStepTemplate
  duplicateTaskRun: ITaskRun
  duplicateVariable: IVariable
  duplicateVariableTemplate: IVariableTemplate
  editShift?: Maybe<IInternalShift>
  executeStepRun: IStepRun
  markAllNotificationsAsRead?: Maybe<Scalars['Boolean']>
  markNotificationAsRead: INotification
  markStepRunAsDone: IStepRun
  markStepRunAsFailed: IStepRun
  markStepRunAsQueued: IStepRun
  markStepRunAsRunning: IStepRun
  moveStepAndLinkGoTos: IStep
  onboardAgent: IUser
  publishMapTask?: Maybe<ITask>
  publishProcess: IProcess
  removeAccessFromClient?: Maybe<Scalars['Int']>
  removeClientFromAssistant: IAssistantTeamMember
  removeClientFromCompany?: Maybe<IClient>
  removeCompanyFromProcess?: Maybe<IProcess>
  removeInstanceDraft: IInstanceDraft
  removeProcessFromInstance: IInstance
  removeTagFromClient?: Maybe<IClient>
  removeTagFromInstance: IInstance
  removeTagFromProcess?: Maybe<IProcess>
  removeTagFromUser?: Maybe<IUser>
  removeTaskDeliverable?: Maybe<Scalars['Boolean']>
  removeTaskRunDeliverable?: Maybe<Scalars['Boolean']>
  reorderStep: IProcess
  reorderStepRun: Scalars['Boolean']
  reorderTask: Scalars['Boolean']
  reorderTaskRun: Scalars['Boolean']
  setAssistantBudget: IAssistant
  setAssistantDepartment: IAssistant
  setAssistantTeamName: IAssistant
  setCategoryForProcess?: Maybe<IProcess>
  /** Sets the associated companies for the given process */
  setCompaniesForProcess?: Maybe<IProcess>
  /** Sets the associated tags for the given process */
  setTagsForProcess?: Maybe<IProcess>
  /** Sets the associated team tags for the given process */
  setTeamTagsForProcess?: Maybe<IProcess>
  splitStep: IStep
  /** start time tracking */
  startTracking: ITimeEntry
  /** stop time tracking */
  stopTracking: ITimeEntry
  submitForm: IFormSubmission
  submitInstanceDraft: IInstanceDraftSubmittedValue
  transferAssistantOwnership: IAssistantTeamMember
  updateAfterCallback: IStepRun
  updateAgent: IUser
  updateAnswerComment: IAnswer
  updateAnswerValueForQuestion: IAnswer
  updateClient?: Maybe<IClient>
  updateCompany?: Maybe<ICompany>
  updateCredentialStatus?: Maybe<IClient>
  updateDeliverable?: Maybe<IDeliverable>
  updateDraftAgentInvoice: IDraftAgentInvoice
  updateInstanceAssignee: IInstance
  updateInstanceBenchmark: IInstance
  updateInstanceComplexity: IInstance
  updateInstanceDeadline: IInstance
  updateInstanceDescription: IInstance
  updateInstanceDraft: IInstanceDraft
  updateInstanceEmailDraft: IInstance
  updateInstanceHelp: IInstance
  updateInstanceName: IInstance
  updateInstanceOldProcess: IInstance
  updateInstanceOwner: IInstance
  updateInstanceRating: IInstance
  updateInstanceRecurring: IInstance
  updateInstanceStageStatusDescriptor: IInstance
  updateInstanceUnsnoozeAt: IInstance
  updateOldTask: IOldTask
  updateOldTaskBenchmark: IOldTask
  updatePreset: IPresets
  updateProcess?: Maybe<IProcess>
  updateProfile: IProfile
  updateRole: IRole
  updateStep?: Maybe<IStep>
  updateStepGoTo?: Maybe<IStepGoTo>
  updateStepRun?: Maybe<IStepRun>
  updateStepTemplate?: Maybe<IStepTemplate>
  updateStepTemplateCategory?: Maybe<IStepTemplateCategory>
  updateTag?: Maybe<ITag>
  updateTask?: Maybe<ITask>
  updateTaskDeliverable?: Maybe<ITaskDeliverable>
  updateTaskRun: ITaskRun
  updateTaskRunAssignee: ITaskRun
  updateTaskRunBenchmark: ITaskRun
  updateTaskRunDeliverable?: Maybe<ITaskRunDeliverable>
  updateTaskRunMapInputVariableValueId: ITaskRun
  updateTaskRunQAAssignee: ITaskRun
  updateUsersToClientsAccess: IUsersToClientsAccess
  updateVariable?: Maybe<IVariable>
  updateVariableGoTo?: Maybe<IVariableGoTo>
  updateVariableSchemaFromCSV: IVariable
  updateVariableSchemaFromGoogleSheet: IVariable
  updateVariableTemplate?: Maybe<IVariableTemplate>
  updateVariableTemplateSchemaFromCSV: IVariableTemplate
  updateVariableTemplateSchemaFromGoogleSheet: IVariableTemplate
  updateVariableValue?: Maybe<IVariableValue>
  updateVariableValueGoTo?: Maybe<IVariableValueGoTo>
  upsertOldProcess: IClient
}

export type IMutationAddCheckInArgs = {
  shiftId: Scalars['Int']
  timeIn: Scalars['String']
  userId: Scalars['Int']
}

export type IMutationAddCheckInLatenessReasonArgs = {
  id: Scalars['Int']
  latenessReason: Scalars['String']
}

export type IMutationAddClientToAssistantArgs = {
  assistantId: Scalars['Int']
  clientId: Scalars['Int']
  role: IAssistantClientRole
}

export type IMutationAddCompanyEmailBlacklistArgs = {
  instanceId: Scalars['Int']
}

export type IMutationAddCompanyToProcessArgs = {
  companyId: Scalars['Int']
  id: Scalars['Int']
}

export type IMutationAddDeliverableArgs = {
  instanceId: Scalars['Int']
  link: Scalars['String']
  name: Scalars['String']
  userId: Scalars['Int']
}

export type IMutationAddMenuArgs = {
  name: Scalars['String']
}

export type IMutationAddMenuToTagArgs = {
  menuId: Scalars['Int']
  parentTagId: Scalars['Int']
}

export type IMutationAddPresetArgs = {
  filters: Maybe<IFilter>[]
  name: Scalars['String']
}

export type IMutationAddProcessToInstanceArgs = {
  instanceId: Scalars['Int']
  processId: Scalars['Int']
}

export type IMutationAddQuoteArgs = {
  lineItemsAttributes: ILineItemAttributesInputType[]
  quoteAttributes: IQuoteAttributesInputType
}

export type IMutationAddSimpleQuoteArgs = {
  lineItemsAttributes: ILineItemAttributesInputType[]
  quoteAttributes: IQuoteAttributesInputType
}

export type IMutationAddStepToProcessArgs = {
  insertStepAfterPosition?: Maybe<Scalars['Int']>
  insertTaskAfterPosition?: Maybe<Scalars['Int']>
  processId: Scalars['Int']
  stepTemplateId: Scalars['Int']
  taskId?: Maybe<Scalars['Int']>
}

export type IMutationAddTagToClientArgs = {
  clientId: Scalars['Int']
  tagId: Scalars['Int']
}

export type IMutationAddTagToInstanceArgs = {
  id: Scalars['Int']
  tagId: Scalars['Int']
}

export type IMutationAddTagToProcessArgs = {
  id: Scalars['Int']
  tagId: Scalars['Int']
}

export type IMutationAddTagToUserArgs = {
  id: Scalars['Int']
  tagId: Scalars['Int']
}

export type IMutationAddTaskDeliverableArgs = {
  commodityId: Scalars['Int']
  quantityRequired?: Maybe<Scalars['Int']>
  taskId: Scalars['Int']
}

export type IMutationAddTaskRunDeliverableArgs = {
  commodityId: Scalars['Int']
  quantityRequired?: Maybe<Scalars['Int']>
  taskRunId: Scalars['Int']
}

export type IMutationAddWorkStatusArgs = {
  body: Scalars['String']
  descriptorId: Scalars['Int']
  instanceId: Scalars['Int']
  stageId: Scalars['Int']
  statusId: Scalars['Int']
  userId: Scalars['Int']
}

export type IMutationArchiveNotificationArgs = {
  id: Scalars['Int']
}

export type IMutationArchiveTagArgs = {
  id: Scalars['Int']
}

export type IMutationAutoCompleteStepGotosArgs = {
  id: Scalars['Int']
}

export type IMutationBatchifyTaskRunArgs = {
  id: Scalars['Int']
  numBatches: Scalars['Int']
}

export type IMutationChangeProcessTagRankArgs = {
  newRank: Scalars['Int']
  processId: Scalars['Int']
  tagId: Scalars['Int']
}

export type IMutationChangeUserTagRankArgs = {
  newRank: Scalars['Int']
  tagId: Scalars['Int']
  userId: Scalars['Int']
}

export type IMutationCompleteTaskRunArgs = {
  id: Scalars['Int']
  status: ITaskRunStatus
}

export type IMutationCompleteTaskRunQaArgs = {
  id: Scalars['Int']
  rating: Scalars['Int']
}

export type IMutationConvertSimpleProcessToComplexArgs = {
  id: Scalars['Int']
}

export type IMutationCreateAssistantTeamArgs = {
  assistantEmail?: Maybe<Scalars['String']>
  assistantId?: Maybe<Scalars['Int']>
  assistantName?: Maybe<Scalars['String']>
  budget: Scalars['Int']
  clientIds: Scalars['Int'][]
  companyId: Scalars['Int']
  departmentId: Scalars['Int']
  name: Scalars['String']
  ownerId: Scalars['Int']
}

export type IMutationCreateDepartmentArgs = {
  name: Scalars['String']
}

export type IMutationCreateEmptyTaskArgs = {
  benchmark?: Maybe<Scalars['String']>
  description?: Maybe<Scalars['String']>
  name: Scalars['String']
  position?: Maybe<Scalars['Int']>
  processId: Scalars['Int']
  qaBenchmark?: Maybe<Scalars['String']>
}

export type IMutationCreateFormSubmissionArgs = {
  formId: Scalars['Int']
  instanceId: Scalars['Int']
  taskRunId?: Maybe<Scalars['Int']>
}

export type IMutationCreateInstanceArgs = {
  assistantId: Scalars['Int']
  clientId?: Maybe<Scalars['Int']>
  name?: Maybe<Scalars['String']>
  processId?: Maybe<Scalars['Int']>
  threadId?: Maybe<Scalars['Int']>
}

export type IMutationCreateInstanceDraftArgs = {
  assistantId?: Maybe<Scalars['Int']>
  clientId?: Maybe<Scalars['Int']>
  companyId: Scalars['Int']
  deadline?: Maybe<Scalars['String']>
  instanceTemplateId?: Maybe<Scalars['Int']>
  instructions?: Maybe<Scalars['String']>
  name: Scalars['String']
  requiresCredentials?: Maybe<Scalars['Boolean']>
  templateData?: Maybe<Scalars['String']>
}

export type IMutationCreateLoginExceptionArgs = {
  endDate: Scalars['String']
  note?: Maybe<Scalars['String']>
  userId: Scalars['Int']
}

export type IMutationCreateMapStepArgs = {
  processId: Scalars['Int']
}

export type IMutationCreateNotificationArgs = {
  body: Scalars['String']
  title?: Maybe<Scalars['String']>
  type: INotificationType
  url?: Maybe<Scalars['String']>
}

export type IMutationCreateOldTaskArgs = {
  assigneeId?: Maybe<Scalars['Int']>
  benchmark?: Maybe<Scalars['String']>
  deadline?: Maybe<Scalars['String']>
  description?: Maybe<Scalars['String']>
  instanceId: Scalars['Int']
  name: Scalars['String']
  status?: Maybe<IOldTaskStatus>
}

export type IMutationCreateProcessArgs = {
  benchmark?: Maybe<Scalars['String']>
  companyId?: Maybe<Scalars['Int']>
  complexity?: Maybe<IProcessComplexity>
  description?: Maybe<Scalars['String']>
  name: Scalars['String']
  status?: Maybe<IProcessStatus>
}

export type IMutationCreateRoleArgs = {
  description?: Maybe<Scalars['String']>
  emailPreference?: Maybe<IRoleEmailPreference>
  name: Scalars['String']
}

export type IMutationCreateShiftArgs = {
  editedByUserId?: Maybe<Scalars['Int']>
  endTime: Scalars['String']
  parentId?: Maybe<Scalars['Int']>
  recurring: Scalars['Boolean']
  recurringFrequency?: Maybe<Scalars['String']>
  startDate: Scalars['String']
  startTime: Scalars['String']
  type: Scalars['String']
  userId: Scalars['Int']
}

export type IMutationCreateStepArgs = {
  allowRetry?: Maybe<Scalars['Boolean']>
  automationLevel?: Maybe<IStepTemplateAutomationLevel>
  description?: Maybe<Scalars['String']>
  external?: Maybe<Scalars['Boolean']>
  meta?: Maybe<Scalars['JSON']>
  name: Scalars['String']
  position?: Maybe<Scalars['Int']>
  processId: Scalars['Int']
  stepTemplateId: Scalars['Int']
  synchronous?: Maybe<Scalars['Boolean']>
  taskId?: Maybe<Scalars['Int']>
}

export type IMutationCreateStepFromInstructionStepArgs = {
  stepId: Scalars['Int']
  stepTemplateId: Scalars['Int']
}

export type IMutationCreateStepFromStepTemplateArgs = {
  processId: Scalars['Int']
  stepTemplateId: Scalars['Int']
  taskId?: Maybe<Scalars['Int']>
}

export type IMutationCreateStepGoToArgs = {
  goFromStepId: Scalars['Int']
  goToStepId: Scalars['Int']
  ifBranch?: Maybe<Scalars['Boolean']>
  processId: Scalars['Int']
}

export type IMutationCreateStepRunArgs = {
  automationLevel?: Maybe<IStepTemplateAutomationLevel>
  description?: Maybe<Scalars['String']>
  name: Scalars['String']
  position?: Maybe<Scalars['Int']>
  processRunId: Scalars['Int']
  status?: Maybe<IStepRunStatus>
  stepId: Scalars['Int']
  stepTemplateId: Scalars['Int']
  taskRunId?: Maybe<Scalars['Int']>
}

export type IMutationCreateStepRunGoToArgs = {
  goFromStepRunId: Scalars['Int']
  goToStepRunId: Scalars['Int']
  ifBranch?: Maybe<Scalars['Boolean']>
  processRunId: Scalars['Int']
}

export type IMutationCreateStepTemplateArgs = {
  allowRetry?: Maybe<Scalars['Boolean']>
  automationLevel?: Maybe<IStepTemplateAutomationLevel>
  description?: Maybe<Scalars['String']>
  external?: Maybe<Scalars['Boolean']>
  inputs?: Maybe<Scalars['JSON']>
  meta?: Maybe<Scalars['JSON']>
  name: Scalars['String']
  outputs?: Maybe<Scalars['JSON']>
  status?: Maybe<IStepTemplateStatus>
  stepTemplateCategoryId: Scalars['Int']
  synchronous?: Maybe<Scalars['Boolean']>
  uid?: Maybe<Scalars['String']>
  upsert?: Maybe<Scalars['Boolean']>
}

export type IMutationCreateStepTemplateCategoryArgs = {
  description?: Maybe<Scalars['String']>
  name: Scalars['String']
}

export type IMutationCreateTagArgs = {
  color?: Maybe<Scalars['String']>
  label: Scalars['String']
  parentId?: Maybe<Scalars['Int']>
}

export type IMutationCreateTaskArgs = {
  benchmark?: Maybe<Scalars['String']>
  description?: Maybe<Scalars['String']>
  name: Scalars['String']
  position?: Maybe<Scalars['Int']>
  processId: Scalars['Int']
  qaBenchmark?: Maybe<Scalars['String']>
  status?: Maybe<ITaskStatus>
  stepIds: Scalars['Int'][]
}

export type IMutationCreateTaskRunArgs = {
  assigneeId?: Maybe<Scalars['Int']>
  benchmark?: Maybe<Scalars['String']>
  deadline?: Maybe<Scalars['String']>
  description?: Maybe<Scalars['String']>
  name: Scalars['String']
  processRunId: Scalars['Int']
  qaBenchmark?: Maybe<Scalars['String']>
  status?: Maybe<ITaskRunStatus>
  taskId?: Maybe<Scalars['Int']>
}

export type IMutationCreateUsersToClientsAccessArgs = {
  clientId: Scalars['Int']
  roleId: Scalars['Int']
  userId: Scalars['Int']
}

export type IMutationCreateVariableArgs = {
  defaultValue?: Maybe<Scalars['String']>
  description?: Maybe<Scalars['String']>
  direction: IVariableDirection
  internalId?: Maybe<Scalars['Int']>
  meta?: Maybe<Scalars['JSON']>
  name: Scalars['String']
  processId: Scalars['Int']
  required?: Maybe<Scalars['Boolean']>
  sampleData?: Maybe<Scalars['JSON']>
  schema?: Maybe<Scalars['JSON']>
  stageId?: Maybe<Scalars['Int']>
  stepId: Scalars['Int']
  type?: Maybe<IVariableType>
  variableTemplateId?: Maybe<Scalars['Int']>
}

export type IMutationCreateVariableGoToArgs = {
  fromField?: Maybe<Scalars['String']>
  goFromVariableId: Scalars['Int']
  goToVariableId: Scalars['Int']
  processId: Scalars['Int']
  toField?: Maybe<Scalars['String']>
}

export type IMutationCreateVariableTemplateArgs = {
  defaultValue?: Maybe<Scalars['String']>
  description?: Maybe<Scalars['String']>
  direction: IVariableDirection
  fieldTypeMapping?: Maybe<Scalars['JSON']>
  internalId?: Maybe<Scalars['Int']>
  meta?: Maybe<Scalars['JSON']>
  name: Scalars['String']
  required?: Maybe<Scalars['Boolean']>
  sampleData?: Maybe<Scalars['JSON']>
  schema?: Maybe<Scalars['JSON']>
  stageId?: Maybe<Scalars['Int']>
  stepTemplateId: Scalars['Int']
  type: IVariableType
}

export type IMutationCreateVariableValueArgs = {
  defaultValue?: Maybe<Scalars['String']>
  description?: Maybe<Scalars['String']>
  direction: IVariableDirection
  internalId?: Maybe<Scalars['Int']>
  meta?: Maybe<Scalars['JSON']>
  name: Scalars['String']
  processRunId: Scalars['Int']
  required?: Maybe<Scalars['Boolean']>
  sampleData?: Maybe<Scalars['JSON']>
  schema?: Maybe<Scalars['JSON']>
  stageId?: Maybe<Scalars['Int']>
  stepRunId: Scalars['Int']
  type: IVariableType
  value?: Maybe<Scalars['String']>
  variableId: Scalars['Int']
}

export type IMutationCreateVariableValueGoToArgs = {
  fromField?: Maybe<Scalars['String']>
  goFromVariableValueId: Scalars['Int']
  goToVariableValueId: Scalars['Int']
  processRunId: Scalars['Int']
  toField?: Maybe<Scalars['String']>
}

export type IMutationDeleteAssistantTeamArgs = {
  assistantId: Scalars['Int']
}

export type IMutationDeleteDeliverableArgs = {
  id: Scalars['Int']
}

export type IMutationDeleteLoginExceptionArgs = {
  id: Scalars['Int']
}

export type IMutationDeleteMenuArgs = {
  id: Scalars['Int']
}

export type IMutationDeleteMenuToTagArgs = {
  menuId: Scalars['Int']
  parentTagId: Scalars['Int']
}

export type IMutationDeleteOldProcessArgs = {
  clientId: Scalars['Int']
  id: Scalars['Int']
}

export type IMutationDeleteOldTaskArgs = {
  id: Scalars['Int']
}

export type IMutationDeletePresetArgs = {
  id: Scalars['Int']
}

export type IMutationDeleteProcessArgs = {
  id: Scalars['Int']
}

export type IMutationDeleteShiftArgs = {
  id: Scalars['Int']
  startDate?: Maybe<Scalars['String']>
}

export type IMutationDeleteStepArgs = {
  id: Scalars['Int']
}

export type IMutationDeleteStepGoToArgs = {
  id: Scalars['Int']
}

export type IMutationDeleteStepRunArgs = {
  id: Scalars['Int']
}

export type IMutationDeleteStepRunGoToArgs = {
  id: Scalars['Int']
}

export type IMutationDeleteStepTemplateArgs = {
  id: Scalars['Int']
}

export type IMutationDeleteStepTemplateCategoryArgs = {
  id: Scalars['Int']
}

export type IMutationDeleteTaskArgs = {
  id: Scalars['Int']
}

export type IMutationDeleteTaskRunArgs = {
  id: Scalars['Int']
}

export type IMutationDeleteUsersToClientsAccessArgs = {
  id: Scalars['Int']
}

export type IMutationDeleteVariableArgs = {
  id: Scalars['Int']
}

export type IMutationDeleteVariableGoToArgs = {
  id: Scalars['Int']
}

export type IMutationDeleteVariableTemplateArgs = {
  id: Scalars['Int']
}

export type IMutationDeleteVariableValueArgs = {
  id: Scalars['Int']
}

export type IMutationDeleteVariableValueGoToArgs = {
  id: Scalars['Int']
}

export type IMutationDraftAgentInvoiceToXeroArgs = {
  id: Scalars['Int']
}

export type IMutationDuplicateInstanceArgs = {
  batchifyTask?: Maybe<Scalars['Boolean']>
  deliverables?: Maybe<Scalars['Boolean']>
  id: Scalars['Int']
  instanceName?: Maybe<Scalars['String']>
  maintainPreviousQuote: Scalars['Boolean']
  newDeadline?: Maybe<Scalars['String']>
  operatorBenchmarks?: Maybe<Scalars['Boolean']>
  qaBenchmarks?: Maybe<Scalars['Boolean']>
  taskAssignees?: Maybe<Scalars['Boolean']>
  workStatus?: Maybe<Scalars['Boolean']>
}

export type IMutationDuplicateOldTaskArgs = {
  id: Scalars['Int']
  name?: Maybe<Scalars['String']>
}

export type IMutationDuplicateProcessArgs = {
  id: Scalars['Int']
}

export type IMutationDuplicateStepArgs = {
  id: Scalars['Int']
}

export type IMutationDuplicateStepRunArgs = {
  id: Scalars['Int']
}

export type IMutationDuplicateStepTemplateArgs = {
  id: Scalars['Int']
}

export type IMutationDuplicateTaskRunArgs = {
  id: Scalars['Int']
  name?: Maybe<Scalars['String']>
}

export type IMutationDuplicateVariableArgs = {
  id: Scalars['Int']
}

export type IMutationDuplicateVariableTemplateArgs = {
  id: Scalars['Int']
}

export type IMutationEditShiftArgs = {
  editedByUserId: Scalars['Int']
  endTime?: Maybe<Scalars['String']>
  id: Scalars['Int']
  parentId?: Maybe<Scalars['Int']>
  recurring?: Maybe<Scalars['Boolean']>
  recurringFrequency?: Maybe<Scalars['String']>
  startDate: Scalars['String']
  startTime?: Maybe<Scalars['String']>
  type?: Maybe<Scalars['String']>
}

export type IMutationExecuteStepRunArgs = {
  id: Scalars['Int']
  manualOverride?: Maybe<Scalars['Boolean']>
}

export type IMutationMarkNotificationAsReadArgs = {
  id: Scalars['Int']
}

export type IMutationMarkStepRunAsDoneArgs = {
  id: Scalars['Int']
}

export type IMutationMarkStepRunAsFailedArgs = {
  errorCode?: Maybe<Scalars['String']>
  errorMessage?: Maybe<Scalars['String']>
  id: Scalars['Int']
}

export type IMutationMarkStepRunAsQueuedArgs = {
  id: Scalars['Int']
}

export type IMutationMarkStepRunAsRunningArgs = {
  id: Scalars['Int']
}

export type IMutationMoveStepAndLinkGoTosArgs = {
  id: Scalars['Int']
  insertStepAfterPosition?: Maybe<Scalars['Int']>
  insertTaskAfterPosition?: Maybe<Scalars['Int']>
  taskId?: Maybe<Scalars['Int']>
}

export type IMutationOnboardAgentArgs = {
  address?: Maybe<Scalars['String']>
  birthday?: Maybe<Scalars['String']>
  category?: Maybe<Scalars['String']>
  currency?: Maybe<Scalars['String']>
  email: Scalars['String']
  legalName?: Maybe<Scalars['String']>
  location?: Maybe<Scalars['String']>
  managerId?: Maybe<Scalars['Int']>
  pay?: Maybe<Scalars['Int']>
  paymentId?: Maybe<Scalars['String']>
  paymentMeta?: Maybe<Scalars['String']>
  paymentName?: Maybe<Scalars['String']>
  paymentPlatform?: Maybe<Scalars['String']>
  personalEmail?: Maybe<Scalars['String']>
  phone?: Maybe<Scalars['String']>
  team?: Maybe<Scalars['String']>
}

export type IMutationPublishMapTaskArgs = {
  benchmark?: Maybe<Scalars['String']>
  description?: Maybe<Scalars['String']>
  id: Scalars['Int']
  name?: Maybe<Scalars['String']>
  outputVariableIds?: Maybe<Scalars['Int'][]>
  position?: Maybe<Scalars['Int']>
  qaBenchmark?: Maybe<Scalars['String']>
  status?: Maybe<ITaskStatus>
}

export type IMutationPublishProcessArgs = {
  id: Scalars['Int']
}

export type IMutationRemoveAccessFromClientArgs = {
  id: Scalars['Int']
}

export type IMutationRemoveClientFromAssistantArgs = {
  assistantId: Scalars['Int']
  clientId: Scalars['Int']
}

export type IMutationRemoveClientFromCompanyArgs = {
  clientEmail: Scalars['String']
  companyId: Scalars['Int']
}

export type IMutationRemoveCompanyFromProcessArgs = {
  companyId: Scalars['Int']
  id: Scalars['Int']
}

export type IMutationRemoveInstanceDraftArgs = {
  id: Scalars['Int']
}

export type IMutationRemoveProcessFromInstanceArgs = {
  instanceId: Scalars['Int']
}

export type IMutationRemoveTagFromClientArgs = {
  clientId: Scalars['Int']
  tagId: Scalars['Int']
}

export type IMutationRemoveTagFromInstanceArgs = {
  id: Scalars['Int']
  tagId: Scalars['Int']
}

export type IMutationRemoveTagFromProcessArgs = {
  id: Scalars['Int']
  tagId: Scalars['Int']
}

export type IMutationRemoveTagFromUserArgs = {
  id: Scalars['Int']
  tagId: Scalars['Int']
}

export type IMutationRemoveTaskDeliverableArgs = {
  taskDeliverableId: Scalars['Int']
}

export type IMutationRemoveTaskRunDeliverableArgs = {
  taskRunDeliverableId: Scalars['Int']
}

export type IMutationReorderStepArgs = {
  id: Scalars['Int']
  insertStepAfterPosition: Scalars['Int']
  processId: Scalars['Int']
}

export type IMutationReorderStepRunArgs = {
  id: Scalars['Int']
  insertStepRunAfterPosition: Scalars['Int']
  processRunId: Scalars['Int']
}

export type IMutationReorderTaskArgs = {
  id: Scalars['Int']
  insertTaskAfterPosition?: Maybe<Scalars['Int']>
  processId: Scalars['Int']
}

export type IMutationReorderTaskRunArgs = {
  id: Scalars['Int']
  positionBeforeTaskRun: Scalars['Int']
  processRunId: Scalars['Int']
}

export type IMutationSetAssistantBudgetArgs = {
  budget: Scalars['Int']
  id: Scalars['Int']
}

export type IMutationSetAssistantDepartmentArgs = {
  departmentId: Scalars['Int']
  id: Scalars['Int']
}

export type IMutationSetAssistantTeamNameArgs = {
  id: Scalars['Int']
  name: Scalars['String']
}

export type IMutationSetCategoryForProcessArgs = {
  id: Scalars['Int']
  processCategoryTagId?: Maybe<Scalars['Int']>
}

export type IMutationSetCompaniesForProcessArgs = {
  companyIds: Scalars['Int'][]
  id: Scalars['Int']
}

export type IMutationSetTagsForProcessArgs = {
  id: Scalars['Int']
  tagIds: Scalars['Int'][]
  tagType: IProcessTagType
}

export type IMutationSetTeamTagsForProcessArgs = {
  id: Scalars['Int']
  teamTagIds: Scalars['Int'][]
}

export type IMutationSplitStepArgs = {
  id: Scalars['Int']
  step1Instructions: Scalars['String']
  step2Instructions: Scalars['String']
}

export type IMutationStartTrackingArgs = {
  instanceId: Scalars['Int']
  oldTaskId?: Maybe<Scalars['Int']>
  taskRunId?: Maybe<Scalars['Int']>
  type?: Maybe<ITimeEntryType>
}

export type IMutationStopTrackingArgs = {
  instanceId: Scalars['Int']
}

export type IMutationSubmitFormArgs = {
  id: Scalars['Int']
  overallRating: Scalars['Int']
  taskRunId?: Maybe<Scalars['Int']>
}

export type IMutationSubmitInstanceDraftArgs = {
  id: Scalars['Int']
}

export type IMutationTransferAssistantOwnershipArgs = {
  assistantId: Scalars['Int']
  clientId: Scalars['Int']
}

export type IMutationUpdateAfterCallbackArgs = {
  errorCode?: Maybe<Scalars['String']>
  errorMessage?: Maybe<Scalars['String']>
  id: Scalars['Int']
  status: IStepRunStatus
}

export type IMutationUpdateAgentArgs = {
  address?: Maybe<Scalars['String']>
  birthday?: Maybe<Scalars['String']>
  category?: Maybe<Scalars['String']>
  currency?: Maybe<Scalars['String']>
  id: Scalars['Int']
  legalName?: Maybe<Scalars['String']>
  location?: Maybe<Scalars['String']>
  locationPlusCode?: Maybe<Scalars['String']>
  managerId?: Maybe<Scalars['Int']>
  pay?: Maybe<Scalars['Int']>
  paymentId?: Maybe<Scalars['String']>
  paymentMeta?: Maybe<Scalars['String']>
  paymentName?: Maybe<Scalars['String']>
  paymentPlatform?: Maybe<Scalars['String']>
  phone?: Maybe<Scalars['String']>
  team?: Maybe<Scalars['String']>
  timezone?: Maybe<Scalars['String']>
  workspaceComputerName?: Maybe<Scalars['String']>
  workspaceComputerRegion?: Maybe<Scalars['String']>
}

export type IMutationUpdateAnswerCommentArgs = {
  comment: Scalars['String']
  formSubmissionId?: Maybe<Scalars['Int']>
  questionId: Scalars['Int']
}

export type IMutationUpdateAnswerValueForQuestionArgs = {
  formSubmissionId?: Maybe<Scalars['Int']>
  questionId: Scalars['Int']
  value: Scalars['Int']
}

export type IMutationUpdateClientArgs = {
  id: Scalars['Int']
  preference?: Maybe<Scalars['String']>
}

export type IMutationUpdateCompanyArgs = {
  autoRecharge?: Maybe<Scalars['Boolean']>
  id: Scalars['Int']
  tier?: Maybe<Scalars['String']>
}

export type IMutationUpdateCredentialStatusArgs = {
  clientId: Scalars['Int']
  credentialStatus: Scalars['String']
  tagId: Scalars['Int']
}

export type IMutationUpdateDeliverableArgs = {
  id: Scalars['Int']
  link?: Maybe<Scalars['String']>
  name?: Maybe<Scalars['String']>
}

export type IMutationUpdateDraftAgentInvoiceArgs = {
  id: Scalars['Int']
  status?: Maybe<IDraftAgentInvoiceStatus>
}

export type IMutationUpdateInstanceAssigneeArgs = {
  assigneeId: Scalars['Int']
  id: Scalars['Int']
}

export type IMutationUpdateInstanceBenchmarkArgs = {
  benchmark: Scalars['String']
  id: Scalars['Int']
}

export type IMutationUpdateInstanceComplexityArgs = {
  complexityRank: Scalars['Int']
  id: Scalars['Int']
}

export type IMutationUpdateInstanceDeadlineArgs = {
  deadline: Scalars['String']
  id: Scalars['Int']
}

export type IMutationUpdateInstanceDescriptionArgs = {
  description: Scalars['String']
  id: Scalars['Int']
}

export type IMutationUpdateInstanceDraftArgs = {
  clientId?: Maybe<Scalars['Int']>
  deadline?: Maybe<Scalars['String']>
  id: Scalars['Int']
  instanceTemplateId?: Maybe<Scalars['Int']>
  instructions?: Maybe<Scalars['String']>
  name?: Maybe<Scalars['String']>
  requiresCredentials?: Maybe<Scalars['Boolean']>
  templateData?: Maybe<Scalars['String']>
}

export type IMutationUpdateInstanceEmailDraftArgs = {
  emailDraft: Scalars['String']
  id: Scalars['Int']
}

export type IMutationUpdateInstanceHelpArgs = {
  help: Scalars['Boolean']
  id: Scalars['Int']
}

export type IMutationUpdateInstanceNameArgs = {
  id: Scalars['Int']
  name: Scalars['String']
}

export type IMutationUpdateInstanceOldProcessArgs = {
  id: Scalars['Int']
  oldProcessId: Scalars['Int']
}

export type IMutationUpdateInstanceOwnerArgs = {
  id: Scalars['Int']
  ownerId: Scalars['Int']
}

export type IMutationUpdateInstanceRatingArgs = {
  id: Scalars['Int']
  rating: Scalars['Int']
}

export type IMutationUpdateInstanceRecurringArgs = {
  id: Scalars['Int']
  recurring?: Maybe<Scalars['Boolean']>
  recurringFrequency?: Maybe<Scalars['String']>
}

export type IMutationUpdateInstanceStageStatusDescriptorArgs = {
  descriptorId?: Maybe<Scalars['Int']>
  id: Scalars['Int']
  stageId?: Maybe<Scalars['Int']>
  statusId?: Maybe<Scalars['Int']>
}

export type IMutationUpdateInstanceUnsnoozeAtArgs = {
  id: Scalars['Int']
  unsnoozeAt: Scalars['String']
}

export type IMutationUpdateOldTaskArgs = {
  assigneeId?: Maybe<Scalars['Int']>
  deadline?: Maybe<Scalars['String']>
  description?: Maybe<Scalars['String']>
  id: Scalars['Int']
  instanceId: Scalars['Int']
  name?: Maybe<Scalars['String']>
  status?: Maybe<IOldTaskStatus>
}

export type IMutationUpdateOldTaskBenchmarkArgs = {
  benchmark: Scalars['String']
  id: Scalars['Int']
}

export type IMutationUpdatePresetArgs = {
  filters?: Maybe<Maybe<IFilter>[]>
  id: Scalars['Int']
  name: Scalars['String']
}

export type IMutationUpdateProcessArgs = {
  benchmark?: Maybe<Scalars['Duration']>
  companyId?: Maybe<Scalars['Int']>
  complexity?: Maybe<IProcessComplexity>
  description?: Maybe<Scalars['String']>
  id: Scalars['Int']
  name?: Maybe<Scalars['String']>
}

export type IMutationUpdateProfileArgs = {
  email: Scalars['String']
  name?: Maybe<Scalars['String']>
  pictureUrl?: Maybe<Scalars['String']>
}

export type IMutationUpdateRoleArgs = {
  description?: Maybe<Scalars['String']>
  emailPreference?: Maybe<IRoleEmailPreference>
  id: Scalars['Int']
  name?: Maybe<Scalars['String']>
}

export type IMutationUpdateStepArgs = {
  allowRetry?: Maybe<Scalars['Boolean']>
  automationLevel?: Maybe<IStepTemplateAutomationLevel>
  description?: Maybe<Scalars['String']>
  external?: Maybe<Scalars['Boolean']>
  id: Scalars['Int']
  meta?: Maybe<Scalars['JSON']>
  name?: Maybe<Scalars['String']>
  position?: Maybe<Scalars['Int']>
  processId?: Maybe<Scalars['Int']>
  synchronous?: Maybe<Scalars['Boolean']>
  taskId?: Maybe<Scalars['Int']>
}

export type IMutationUpdateStepGoToArgs = {
  goFromStepId?: Maybe<Scalars['Int']>
  goToStepId?: Maybe<Scalars['Int']>
  id: Scalars['Int']
  ifBranch?: Maybe<Scalars['Boolean']>
}

export type IMutationUpdateStepRunArgs = {
  allowRetry?: Maybe<Scalars['Boolean']>
  automationLevel?: Maybe<Scalars['String']>
  description?: Maybe<Scalars['String']>
  external?: Maybe<Scalars['Boolean']>
  id: Scalars['Int']
  instanceId?: Maybe<Scalars['Int']>
  name?: Maybe<Scalars['String']>
  position?: Maybe<Scalars['Int']>
  status?: Maybe<IStepRunStatus>
  stepId?: Maybe<Scalars['Int']>
  stepTemplateId?: Maybe<Scalars['Int']>
  taskRunId?: Maybe<Scalars['Int']>
}

export type IMutationUpdateStepTemplateArgs = {
  allowRetry?: Maybe<Scalars['Boolean']>
  automationLevel?: Maybe<Scalars['String']>
  description?: Maybe<Scalars['String']>
  external?: Maybe<Scalars['Boolean']>
  id: Scalars['Int']
  meta?: Maybe<Scalars['JSON']>
  name?: Maybe<Scalars['String']>
  status?: Maybe<IStepTemplateStatus>
  stepTemplateCategoryId: Scalars['Int']
  synchronous?: Maybe<Scalars['Boolean']>
}

export type IMutationUpdateStepTemplateCategoryArgs = {
  description?: Maybe<Scalars['String']>
  id: Scalars['Int']
  name?: Maybe<Scalars['String']>
}

export type IMutationUpdateTagArgs = {
  color?: Maybe<Scalars['String']>
  id: Scalars['Int']
  label?: Maybe<Scalars['String']>
  parentId?: Maybe<Scalars['Int']>
}

export type IMutationUpdateTaskArgs = {
  benchmark?: Maybe<Scalars['String']>
  description?: Maybe<Scalars['String']>
  id: Scalars['Int']
  name?: Maybe<Scalars['String']>
  position?: Maybe<Scalars['Int']>
  processId?: Maybe<Scalars['Int']>
  qaBenchmark?: Maybe<Scalars['String']>
  status?: Maybe<ITaskStatus>
  taskId?: Maybe<Scalars['Int']>
}

export type IMutationUpdateTaskDeliverableArgs = {
  commodityId?: Maybe<Scalars['Int']>
  quantityRequired?: Maybe<Scalars['Int']>
  taskDeliverableId: Scalars['Int']
}

export type IMutationUpdateTaskRunArgs = {
  deadline?: Maybe<Scalars['String']>
  description?: Maybe<Scalars['String']>
  id: Scalars['Int']
  name?: Maybe<Scalars['String']>
  status?: Maybe<ITaskRunStatus>
  taskId?: Maybe<Scalars['Int']>
}

export type IMutationUpdateTaskRunAssigneeArgs = {
  assigneeId: Scalars['Int']
  id: Scalars['Int']
}

export type IMutationUpdateTaskRunBenchmarkArgs = {
  benchmark: Scalars['String']
  id: Scalars['Int']
  isQa: Scalars['Boolean']
}

export type IMutationUpdateTaskRunDeliverableArgs = {
  commodityId?: Maybe<Scalars['Int']>
  quantityApproved?: Maybe<Scalars['Int']>
  quantityCompleted?: Maybe<Scalars['Int']>
  quantityRequired?: Maybe<Scalars['Int']>
  taskRunDeliverableId: Scalars['Int']
}

export type IMutationUpdateTaskRunMapInputVariableValueIdArgs = {
  id: Scalars['Int']
  mapInputVariableValueId: Scalars['Int']
}

export type IMutationUpdateTaskRunQaAssigneeArgs = {
  id: Scalars['Int']
  qaAssigneeId: Scalars['Int']
}

export type IMutationUpdateUsersToClientsAccessArgs = {
  id: Scalars['Int']
  roleId: Scalars['Int']
}

export type IMutationUpdateVariableArgs = {
  defaultValue?: Maybe<Scalars['String']>
  description?: Maybe<Scalars['String']>
  direction?: Maybe<IVariableDirection>
  id: Scalars['Int']
  internalId?: Maybe<Scalars['Int']>
  meta?: Maybe<Scalars['JSON']>
  name?: Maybe<Scalars['String']>
  required?: Maybe<Scalars['Boolean']>
  sampleData?: Maybe<Scalars['JSON']>
  schema?: Maybe<Scalars['JSON']>
  stageId?: Maybe<Scalars['Int']>
  stepId?: Maybe<Scalars['Int']>
  type?: Maybe<IVariableType>
  variableTemplateId?: Maybe<Scalars['Int']>
}

export type IMutationUpdateVariableGoToArgs = {
  fromField?: Maybe<Scalars['String']>
  goFromVariableId?: Maybe<Scalars['Int']>
  goToVariableId?: Maybe<Scalars['Int']>
  id: Scalars['Int']
  toField?: Maybe<Scalars['String']>
}

export type IMutationUpdateVariableSchemaFromCsvArgs = {
  csvFileUrl: Scalars['String']
  id: Scalars['Int']
}

export type IMutationUpdateVariableSchemaFromGoogleSheetArgs = {
  googleSheetUrl: Scalars['String']
  id: Scalars['Int']
  range?: Maybe<Scalars['String']>
  tabName: Scalars['String']
}

export type IMutationUpdateVariableTemplateArgs = {
  defaultValue?: Maybe<Scalars['String']>
  description?: Maybe<Scalars['String']>
  direction?: Maybe<IVariableDirection>
  fieldTypeMapping?: Maybe<Scalars['JSON']>
  id: Scalars['Int']
  internalId?: Maybe<Scalars['Int']>
  meta?: Maybe<Scalars['JSON']>
  name?: Maybe<Scalars['String']>
  required?: Maybe<Scalars['Boolean']>
  sampleData?: Maybe<Scalars['JSON']>
  schema?: Maybe<Scalars['JSON']>
  stageId?: Maybe<Scalars['Int']>
  type?: Maybe<IVariableType>
}

export type IMutationUpdateVariableTemplateSchemaFromCsvArgs = {
  csvFileUrl: Scalars['String']
  id: Scalars['Int']
}

export type IMutationUpdateVariableTemplateSchemaFromGoogleSheetArgs = {
  googleSheetUrl: Scalars['String']
  id: Scalars['Int']
  range?: Maybe<Scalars['String']>
  tabName: Scalars['String']
}

export type IMutationUpdateVariableValueArgs = {
  defaultValue?: Maybe<Scalars['String']>
  description?: Maybe<Scalars['String']>
  direction?: Maybe<IVariableDirection>
  id: Scalars['Int']
  meta?: Maybe<Scalars['JSON']>
  name?: Maybe<Scalars['String']>
  required?: Maybe<Scalars['Boolean']>
  sampleData?: Maybe<Scalars['JSON']>
  schema?: Maybe<Scalars['JSON']>
  stageId?: Maybe<Scalars['Int']>
  stepRunId?: Maybe<Scalars['Int']>
  type?: Maybe<IVariableType>
  value?: Maybe<Scalars['String']>
  variableId?: Maybe<Scalars['Int']>
}

export type IMutationUpdateVariableValueGoToArgs = {
  fromField?: Maybe<Scalars['String']>
  goFromVariableValueId?: Maybe<Scalars['Int']>
  goToVariableValueId?: Maybe<Scalars['Int']>
  id: Scalars['Int']
  toField?: Maybe<Scalars['String']>
}

export type IMutationUpsertOldProcessArgs = {
  body?: Maybe<Scalars['String']>
  clientId: Scalars['Int']
  id?: Maybe<Scalars['Int']>
  name?: Maybe<Scalars['String']>
}

export type INode = {
  /** Unique identifier for the resource */
  id: Scalars['Int']
}

export type INotification = INode & {
  __typename?: 'Notification'
  archived: Scalars['Boolean']
  body: Scalars['String']
  createdAt: Scalars['Date']
  /** Unique identifier for the resource */
  id: Scalars['Int']
  read: Scalars['Boolean']
  title: Scalars['String']
  type: INotificationType
  url: Scalars['String']
  /** User for whom this Notification was written. */
  user: IUser
  userId: Scalars['Int']
}

export const INotificationType = {
  Alert: 'alert',
  Flash: 'flash',
  Info: 'info',
  Push: 'push',
} as const

export type INotificationType = typeof INotificationType[keyof typeof INotificationType]
export type IOldProcess = INode & {
  __typename?: 'OldProcess'
  body?: Maybe<Scalars['String']>
  /** Client for whom this Process was written. */
  client?: Maybe<IClient>
  clientId?: Maybe<Scalars['Int']>
  /** Unique identifier for the resource */
  id: Scalars['Int']
  name: Scalars['String']
}

/** Deprecated */
export type IOldTask = INode & {
  __typename?: 'OldTask'
  /** Agent who is assigned to this oldTask. */
  assignee?: Maybe<IUser>
  assigneeId?: Maybe<Scalars['Int']>
  /** benchmark as an iso string */
  benchmark?: Maybe<Scalars['Duration']>
  /** benchmark as a float number of hours */
  benchmarkHours?: Maybe<Scalars['Float']>
  createdAt: Scalars['Date']
  deadline?: Maybe<Scalars['Date']>
  description?: Maybe<Scalars['String']>
  duplicatedFrom?: Maybe<IOldTask>
  duplicatedFromId?: Maybe<Scalars['Int']>
  duplicatedTo?: Maybe<IOldTask[]>
  /** Unique identifier for the resource */
  id: Scalars['Int']
  instance: IInstance
  instanceId: Scalars['Int']
  isCurrentlyBeingTrackedIn: Scalars['Boolean']
  name: Scalars['String']
  qaComplete: Scalars['Boolean']
  qaPass: Scalars['Boolean']
  status: IOldTaskStatus
  timeEntries?: Maybe<ITimeEntry[]>
  totalTimeTracked: Scalars['BigInt']
}

/** Deprecated */
export type IOldTaskDescriptionArgs = {
  sanitize?: Maybe<Scalars['Boolean']>
}

export const IOldTaskStatus = {
  Done: 'done',
  Operating: 'operating',
  Pending: 'pending',
  Qa: 'qa',
} as const

export type IOldTaskStatus = typeof IOldTaskStatus[keyof typeof IOldTaskStatus]
export type IPlan = {
  __typename?: 'Plan'
  description?: Maybe<Scalars['String']>
  hours: Scalars['Float']
  imageUrl?: Maybe<Scalars['String']>
  intervalCount?: Maybe<Scalars['Int']>
  monthlyAmount: Scalars['Float']
  name: Scalars['String']
  planId: Scalars['String']
  rate: Scalars['Float']
}

export type IPresets = INode & {
  __typename?: 'Presets'
  createdAt: Scalars['Date']
  filters: Scalars['JSON']
  /** Unique identifier for the resource */
  id: Scalars['Int']
  name: Scalars['String']
  updatedAt: Scalars['Date']
  /** User */
  user: IUser
  userId: Scalars['Int']
}

export type IProcess = INode & {
  __typename?: 'Process'
  /** benchmark as an iso string */
  benchmark?: Maybe<Scalars['Duration']>
  /** benchmark as a float number of hours */
  benchmarkHours?: Maybe<Scalars['Float']>
  /** Companies who are attached to this process */
  companies?: Maybe<ICompany[]>
  complexity: IProcessComplexity
  description?: Maybe<Scalars['String']>
  duplicatedFrom?: Maybe<IProcess>
  duplicatedFromId?: Maybe<Scalars['Int']>
  duplicatedTo: IProcess[]
  /** Unique identifier for the resource */
  id: Scalars['Int']
  instances?: Maybe<IInstance[]>
  name: Scalars['String']
  /** Category the process belongs to */
  processCategory?: Maybe<ITag>
  /** Executions of this Process */
  processRuns: IProcessRun[]
  /** Skills the process is tagged with */
  skillTags?: Maybe<ITag[]>
  /** Standard Processes the process is tagged with */
  standardProcessesTags?: Maybe<ITag[]>
  status: IProcessStatus
  /** Steps in the process */
  steps: IStep[]
  /** Tasks in the process */
  tasks: ITask[]
  /** Teams the process is tagged with */
  teamTags?: Maybe<ITag[]>
  /** Tools the process is tagged with */
  toolTags?: Maybe<ITag[]>
  uid: Scalars['String']
  /** Variables in the process */
  variables: IVariable[]
}

export const IProcessComplexity = {
  Complex: 'complex',
  Simple: 'simple',
} as const

export type IProcessComplexity = typeof IProcessComplexity[keyof typeof IProcessComplexity]
export type IProcessRun = INode & {
  __typename?: 'ProcessRun'
  createdAt: Scalars['Date']
  duplicatedFrom?: Maybe<IProcessRun>
  duplicatedFromId?: Maybe<Scalars['Int']>
  duplicatedTo?: Maybe<IProcessRun[]>
  /** Unique identifier for the resource */
  id: Scalars['Int']
  instance: IInstance
  instanceId: Scalars['Int']
  process: IProcess
  processId: Scalars['Int']
  stepRuns?: Maybe<IStepRun[]>
  taskRuns?: Maybe<ITaskRun[]>
  uid: Scalars['String']
  updatedAt: Scalars['Date']
  variableValues?: Maybe<IVariableValue[]>
}

export const IProcessStatus = {
  Draft: 'draft',
  Hidden: 'hidden',
  Published: 'published',
} as const

export type IProcessStatus = typeof IProcessStatus[keyof typeof IProcessStatus]
export const IProcessTagType = {
  Skill: 'skill',
  StandardProcesses: 'standardProcesses',
  Team: 'team',
  Tool: 'tool',
} as const

export type IProcessTagType = typeof IProcessTagType[keyof typeof IProcessTagType]
export type IProfile = INode & {
  __typename?: 'Profile'
  address?: Maybe<Scalars['String']>
  birthday?: Maybe<Scalars['Date']>
  email: Scalars['String']
  /** Unique identifier for the resource */
  id: Scalars['Int']
  legalName?: Maybe<Scalars['String']>
  location?: Maybe<Scalars['String']>
  name?: Maybe<Scalars['String']>
  personalEmail?: Maybe<Scalars['String']>
  phone?: Maybe<Scalars['String']>
  pictureUrl?: Maybe<Scalars['String']>
  title?: Maybe<Scalars['String']>
}

export type IQualification = INode & {
  __typename?: 'Qualification'
  domain: Scalars['String']
  /** Unique identifier for the resource */
  id: Scalars['Int']
}

export type IQuery = {
  __typename?: 'Query'
  absences?: Maybe<IInternalShift[]>
  activeTimeEntries: ITimeEntry[]
  admins: IUser[]
  agentUpdates: IAgentUpdate[]
  allCompletedDelegations?: Maybe<ICompletedDelegation[]>
  allUsersToClientsAccountDirectors: IUsersToClientsAccess[]
  allUsersToClientsDeliveryManagers: IUsersToClientsAccess[]
  assistant?: Maybe<IAssistant>
  assistants: IAssistant[]
  /** Indirect labor costs as a percentage of direct labor costs */
  averageAgentIndirectLaborCost: Scalars['Float']
  averageAgentRate: Scalars['Float']
  /** Percentage of average trasaction, dm and software costs */
  averageIndirectCost: Scalars['Float']
  bulkInternalShifts?: Maybe<IBulkInternalShift[]>
  checkIn?: Maybe<ICheckIn>
  checkProfileExistsByEmail: Scalars['Boolean']
  client: IClient
  clients: IClient[]
  comment: IComment
  comments: IComment[]
  commodities: ICommodity[]
  companies: ICompany[]
  company: ICompany
  companyBySlug: ICompany
  complexities: IComplexity[]
  cycleTimeEntries: ITimeEntry[]
  deliverables: IDeliverable[]
  departments: IDepartment[]
  descriptors: IDescriptor[]
  draftAgentInvoice?: Maybe<IDraftAgentInvoice>
  draftAgentInvoices: IDraftAgentInvoice[]
  email: IEmail
  /** Just ids and createdAt, for performance */
  emailIds: IEmail[]
  emailSearch: IEmail[]
  instance: IInstance
  instanceDraft?: Maybe<IInstanceDraft>
  instanceDrafts: IInstanceDraft[]
  instanceForTracker: IInstance
  instances: IInstance[]
  instanceTemplate?: Maybe<IInstanceTemplate>
  instanceTemplates: IInstanceTemplate[]
  invite?: Maybe<IInvite>
  invites: IInvite[]
  isValidTask: ITaskValidation
  latestQuoteComment?: Maybe<IComment>
  loggedInClient: IClient
  loggedInUser: IUser
  loginException?: Maybe<ILoginException>
  loginExceptions?: Maybe<ILoginException[]>
  managers: IUser[]
  menus?: Maybe<IMenus[]>
  menuTags?: Maybe<ITag[]>
  myCompanies: ICompany[]
  notification: INotification
  notifications: INotification[]
  oldProcesses: IOldProcess[]
  oldProcessesForInstance: IOldProcess[]
  oldTask?: Maybe<IOldTask>
  oldTasks: IOldTask[]
  preset?: Maybe<IPresets>
  presets?: Maybe<IPresets[]>
  process: IProcess
  processCategoryTags: ITag[]
  processes: IProcess[]
  qualifications: IQualification[]
  quote: IQuote
  role: IRole
  roles: IRole[]
  skillTags: ITag[]
  stages: IStage[]
  standardProcessesTags: ITag[]
  statuses: IStatus[]
  statusUpdates: IComment[]
  step?: Maybe<IStep>
  stepRun: IStepRun
  steps?: Maybe<IStep[]>
  stepTemplate: IStepTemplate
  stepTemplateCategories?: Maybe<IStepTemplateCategory[]>
  stepTemplateCategory: IStepTemplateCategory
  stepTemplates: IStepTemplate[]
  tag: ITag
  tags: ITag[]
  taskRun?: Maybe<ITaskRun>
  taskRunByMapStepRunId?: Maybe<ITaskRun>
  taskRuns: ITaskRun[]
  teams: ITeam[]
  teamTags: ITag[]
  /** @deprecated This field has been deprecated. */
  teramindHours: ITeramind[]
  timeEntries: ITimeEntry[]
  toolTags: ITag[]
  user: IUser
  userOldTasks?: Maybe<IOldTask[]>
  users: IUser[]
  usersToClientsAccess: IUsersToClientsAccess[]
  userTaskRuns?: Maybe<ITaskRun[]>
  validGoFromVariables?: Maybe<IVariable[]>
  variableTemplate?: Maybe<IVariableTemplate>
  variableTemplates?: Maybe<IVariableTemplate[]>
  variableValue?: Maybe<IVariableValue>
  variableValueByStepRunAndInternalId?: Maybe<IVariableValue>
  workStatuses: IComment[]
  xeroInvoice: IXeroInvoice
  xeroInvoices: IXeroInvoice[]
}

export type IQueryAbsencesArgs = {
  bustCache?: Maybe<Scalars['Boolean']>
  endDate: Scalars['String']
  parentId: Scalars['Int']
  startDate: Scalars['String']
}

export type IQueryActiveTimeEntriesArgs = {
  instanceId: Scalars['Int']
}

export type IQueryAgentUpdatesArgs = {
  agentId: Scalars['Int']
}

export type IQueryAllCompletedDelegationsArgs = {
  userId: Scalars['Int']
}

export type IQueryAssistantArgs = {
  id: Scalars['Int']
}

export type IQueryAssistantsArgs = {
  companyId?: Maybe<Scalars['Int']>
}

export type IQueryBulkInternalShiftsArgs = {
  bustCache?: Maybe<Scalars['Boolean']>
  endDate: Scalars['String']
  startDate: Scalars['String']
  userIds: Scalars['Int'][]
}

export type IQueryCheckInArgs = {
  bustCache?: Maybe<Scalars['Boolean']>
  dateIsoString: Scalars['String']
  shiftId: Scalars['Int']
}

export type IQueryCheckProfileExistsByEmailArgs = {
  email: Scalars['String']
}

export type IQueryClientArgs = {
  id: Scalars['Int']
}

export type IQueryCommentArgs = {
  bustCache?: Maybe<Scalars['Boolean']>
  id: Scalars['Int']
}

export type IQueryCommentsArgs = {
  instanceId?: Maybe<Scalars['Int']>
}

export type IQueryCompanyArgs = {
  id: Scalars['Int']
}

export type IQueryCompanyBySlugArgs = {
  slug: Scalars['String']
}

export type IQueryCycleTimeEntriesArgs = {
  cycleEnd: Scalars['String']
  cycleStart: Scalars['String']
  userId: Scalars['Int']
}

export type IQueryDeliverablesArgs = {
  bustCache?: Maybe<Scalars['Boolean']>
  instanceId: Scalars['Int']
}

export type IQueryDraftAgentInvoiceArgs = {
  bustCache?: Maybe<Scalars['Boolean']>
  cycleRange?: Maybe<Scalars['String'][]>
  id?: Maybe<Scalars['Int']>
  userId?: Maybe<Scalars['Int']>
}

export type IQueryDraftAgentInvoicesArgs = {
  bustCache?: Maybe<Scalars['Boolean']>
  cycleRange: Scalars['String'][]
}

export type IQueryEmailArgs = {
  bustCache?: Maybe<Scalars['Boolean']>
  id: Scalars['Int']
}

export type IQueryEmailIdsArgs = {
  instanceId: Scalars['Int']
}

export type IQueryEmailSearchArgs = {
  query: Scalars['String']
}

export type IQueryInstanceArgs = {
  bustCache?: Maybe<Scalars['Boolean']>
  id: Scalars['Int']
}

export type IQueryInstanceDraftArgs = {
  bustCache?: Maybe<Scalars['Boolean']>
  id: Scalars['Int']
}

export type IQueryInstanceDraftsArgs = {
  bustCache?: Maybe<Scalars['Boolean']>
  companyId: Scalars['Int']
}

export type IQueryInstanceForTrackerArgs = {
  bustCache?: Maybe<Scalars['Boolean']>
  id: Scalars['Int']
}

export type IQueryInstancesArgs = {
  bustCache?: Maybe<Scalars['Boolean']>
  filter?: Maybe<Scalars['String']>
  limit?: Maybe<Scalars['Int']>
  offset?: Maybe<Scalars['Int']>
  order?: Maybe<Scalars['String']>
}

export type IQueryInstanceTemplateArgs = {
  id: Scalars['Int']
}

export type IQueryInviteArgs = {
  token: Scalars['String']
}

export type IQueryInvitesArgs = {
  companyId: Scalars['Int']
  used: Scalars['Boolean']
}

export type IQueryIsValidTaskArgs = {
  stepIds: Scalars['Int'][]
}

export type IQueryLatestQuoteCommentArgs = {
  instanceId: Scalars['Int']
}

export type IQueryLoginExceptionArgs = {
  id: Scalars['Int']
}

export type IQueryLoginExceptionsArgs = {
  createdByUserId?: Maybe<Scalars['Int']>
  userId?: Maybe<Scalars['Int']>
}

export type IQueryMenuTagsArgs = {
  menuId: Scalars['Int']
}

export type IQueryNotificationArgs = {
  id: Scalars['Int']
}

export type IQueryOldProcessesArgs = {
  clientId?: Maybe<Scalars['Int']>
}

export type IQueryOldProcessesForInstanceArgs = {
  instanceId: Scalars['Int']
}

export type IQueryOldTaskArgs = {
  id: Scalars['Int']
}

export type IQueryOldTasksArgs = {
  filter?: Maybe<Scalars['String']>
  limit?: Maybe<Scalars['Int']>
  offset?: Maybe<Scalars['Int']>
  order?: Maybe<Scalars['String']>
}

export type IQueryPresetArgs = {
  id: Scalars['Int']
}

export type IQueryProcessArgs = {
  bustCache?: Maybe<Scalars['Boolean']>
  id: Scalars['Int']
}

export type IQueryProcessCategoryTagsArgs = {
  bustCache?: Maybe<Scalars['Boolean']>
}

export type IQueryProcessesArgs = {
  bustCache?: Maybe<Scalars['Boolean']>
  clientId?: Maybe<Scalars['Int']>
}

export type IQueryQuoteArgs = {
  id: Scalars['Int']
}

export type IQueryRoleArgs = {
  id: Scalars['Int']
}

export type IQuerySkillTagsArgs = {
  bustCache?: Maybe<Scalars['Boolean']>
}

export type IQueryStandardProcessesTagsArgs = {
  bustCache?: Maybe<Scalars['Boolean']>
}

export type IQueryStatusUpdatesArgs = {
  instanceId: Scalars['Int']
}

export type IQueryStepArgs = {
  id: Scalars['Int']
}

export type IQueryStepRunArgs = {
  bustCache?: Maybe<Scalars['Boolean']>
  id: Scalars['Int']
}

export type IQueryStepsArgs = {
  processId: Scalars['Int']
}

export type IQueryStepTemplateArgs = {
  bustCache?: Maybe<Scalars['Boolean']>
  id: Scalars['Int']
}

export type IQueryStepTemplateCategoryArgs = {
  id: Scalars['Int']
}

export type IQueryStepTemplatesArgs = {
  bustCache?: Maybe<Scalars['Boolean']>
}

export type IQueryTagArgs = {
  id: Scalars['Int']
}

export type IQueryTagsArgs = {
  parentLabel?: Maybe<Scalars['String']>
}

export type IQueryTaskRunArgs = {
  id: Scalars['Int']
}

export type IQueryTaskRunByMapStepRunIdArgs = {
  mapStepRunId: Scalars['Int']
}

export type IQueryTaskRunsArgs = {
  filter?: Maybe<Scalars['String']>
  limit?: Maybe<Scalars['Int']>
  offset?: Maybe<Scalars['Int']>
  order?: Maybe<Scalars['String']>
}

export type IQueryTeamTagsArgs = {
  bustCache?: Maybe<Scalars['Boolean']>
}

export type IQueryTeramindHoursArgs = {
  cycleEnd: Scalars['String']
  cycleStart: Scalars['String']
  userId: Scalars['Int']
}

export type IQueryTimeEntriesArgs = {
  instanceId: Scalars['Int']
}

export type IQueryToolTagsArgs = {
  bustCache?: Maybe<Scalars['Boolean']>
}

export type IQueryUserArgs = {
  id: Scalars['Int']
}

export type IQueryUserOldTasksArgs = {
  assigneeId?: Maybe<Scalars['Int']>
}

export type IQueryUsersArgs = {
  cycleRange?: Maybe<Scalars['String'][]>
  draftAgentInvoiceStatus?: Maybe<Scalars['String'][]>
  limit?: Maybe<Scalars['Int']>
  managerId?: Maybe<Scalars['Int'][]>
  offboarded?: Maybe<Scalars['Boolean'][]>
  offboardedAt?: Maybe<Scalars['Boolean'][]>
  offset?: Maybe<Scalars['Int']>
  team?: Maybe<Scalars['String'][]>
  userProfileName?: Maybe<Scalars['String']>
  userType?: Maybe<Scalars['String']>
}

export type IQueryUsersToClientsAccessArgs = {
  clientId?: Maybe<Scalars['Int']>
}

export type IQueryUserTaskRunsArgs = {
  assigneeId?: Maybe<Scalars['Int']>
}

export type IQueryValidGoFromVariablesArgs = {
  goToVariableId: Scalars['Int']
}

export type IQueryVariableTemplateArgs = {
  bustCache?: Maybe<Scalars['Boolean']>
  id: Scalars['Int']
}

export type IQueryVariableValueArgs = {
  id: Scalars['Int']
}

export type IQueryVariableValueByStepRunAndInternalIdArgs = {
  internalId?: Maybe<Scalars['Int']>
  stepRunId: Scalars['Int']
}

export type IQueryWorkStatusesArgs = {
  bustCache?: Maybe<Scalars['Boolean']>
  instanceId: Scalars['Int']
}

export type IQueryXeroInvoiceArgs = {
  id: Scalars['Int']
}

export type IQueryXeroInvoicesArgs = {
  userId: Scalars['Int']
}

export type IQuestion = INode & {
  __typename?: 'Question'
  /** Answers */
  answers: IAnswer[]
  createdAt: Scalars['Date']
  /** Form */
  form?: Maybe<IForm>
  formId?: Maybe<Scalars['Int']>
  /** Unique identifier for the resource */
  id: Scalars['Int']
  position?: Maybe<Scalars['Int']>
  /** Question Category */
  questionCategory: IQuestionCategory
  questionCategoryId: Scalars['Int']
  text?: Maybe<Scalars['String']>
  type: IQuestionType
}

export type IQuestionCategory = INode & {
  __typename?: 'QuestionCategory'
  createdAt: Scalars['Date']
  /** Unique identifier for the resource */
  id: Scalars['Int']
  name: Scalars['String']
  /** Questions */
  questions: IQuestion[]
}

export const IQuestionType = {
  Csat: 'csat',
  YesNo: 'yes_no',
} as const

export type IQuestionType = typeof IQuestionType[keyof typeof IQuestionType]
export type IQuote = INode & {
  __typename?: 'Quote'
  amountInCents: Scalars['Int']
  email: IEmail
  emailId: Scalars['Int']
  grossMargin: Scalars['Float']
  /** Unique identifier for the resource */
  id: Scalars['Int']
  instance: IInstance
  instanceId: Scalars['Int']
  lineItems: ILineItem[]
}

export type IQuoteAttributesInputType = {
  emailId: Scalars['Int']
  instanceId: Scalars['Int']
}

export type IRole = INode & {
  __typename?: 'Role'
  description?: Maybe<Scalars['String']>
  emailPreference?: Maybe<IRoleEmailPreference>
  /** Unique identifier for the resource */
  id: Scalars['Int']
  name: Scalars['String']
}

/** Whether the user in the given role should be BCC or CC on emails */
export const IRoleEmailPreference = {
  Bcc: 'BCC',
  Cc: 'CC',
} as const

export type IRoleEmailPreference = typeof IRoleEmailPreference[keyof typeof IRoleEmailPreference]
export type IShift = {
  __typename?: 'Shift'
  endOfCurrentShift?: Maybe<Scalars['String']>
  onShift: Scalars['Boolean']
  startOfNextShift?: Maybe<Scalars['String']>
  timezone?: Maybe<Scalars['String']>
}

export type IStage = INode & {
  __typename?: 'Stage'
  count: Scalars['Int']
  /** Unique identifier for the resource */
  id: Scalars['Int']
  name: IStageName
  statuses: IStatus[]
}

export const IStageName = {
  Delivering: 'Delivering',
  Done: 'Done',
  Operating: 'Operating',
  Qa: 'QA',
  Routing: 'Routing',
  Scoping: 'Scoping',
} as const

export type IStageName = typeof IStageName[keyof typeof IStageName]
export type IStatus = INode & {
  __typename?: 'Status'
  descriptors: IDescriptor[]
  /** Unique identifier for the resource */
  id: Scalars['Int']
  name: Scalars['String']
}

export type IStep = INode & {
  __typename?: 'Step'
  allowRetry: Scalars['Boolean']
  automationLevel: IStepTemplateAutomationLevel
  description?: Maybe<Scalars['String']>
  duplicatedFrom?: Maybe<IStep>
  duplicatedFromId?: Maybe<Scalars['Int']>
  duplicatedTo?: Maybe<IStep[]>
  external: Scalars['Boolean']
  goFromSteps?: Maybe<IStep[]>
  goToSteps?: Maybe<IStep[]>
  /** Unique identifier for the resource */
  id: Scalars['Int']
  inputs?: Maybe<IVariable[]>
  meta?: Maybe<Scalars['JSON']>
  name: Scalars['String']
  outputs?: Maybe<IVariable[]>
  position: Scalars['Int']
  process: IProcess
  processId: Scalars['Int']
  stepGoFroms?: Maybe<IStepGoTo[]>
  stepGoTos?: Maybe<IStepGoTo[]>
  stepRuns?: Maybe<IStepRun[]>
  stepTemplate: IStepTemplate
  stepTemplateId: Scalars['Int']
  synchronous: Scalars['Boolean']
  task?: Maybe<ITask>
  taskId?: Maybe<Scalars['Int']>
  uid: Scalars['String']
  variables?: Maybe<IVariable[]>
}

export type IStepGoTo = INode & {
  __typename?: 'StepGoTo'
  duplicatedFrom?: Maybe<IStepGoTo>
  duplicatedFromId?: Maybe<Scalars['Int']>
  duplicatedTo?: Maybe<IStepGoTo[]>
  goFromStep: IStep
  goFromStepId: Scalars['Int']
  goToStep: IStep
  goToStepId: Scalars['Int']
  /** Unique identifier for the resource */
  id: Scalars['Int']
  ifBranch?: Maybe<Scalars['Boolean']>
  processId: Scalars['Int']
}

export type IStepRun = INode & {
  __typename?: 'StepRun'
  allowRetry: Scalars['Boolean']
  automationLevel: IStepTemplateAutomationLevel
  description?: Maybe<Scalars['String']>
  duplicatedFrom?: Maybe<IStepRun>
  duplicatedFromId?: Maybe<Scalars['Int']>
  duplicatedTo: IStepRun[]
  errorCode?: Maybe<Scalars['String']>
  errorMessage?: Maybe<Scalars['String']>
  executionStartedAt?: Maybe<Scalars['Date']>
  executionStoppedAt?: Maybe<Scalars['Date']>
  external: Scalars['Boolean']
  goFromStepRuns: IStepRun[]
  goToStepRuns?: Maybe<IStepRun[]>
  /** Unique identifier for the resource */
  id: Scalars['Int']
  inputs?: Maybe<IVariableValue[]>
  isManual: Scalars['Boolean']
  meta?: Maybe<Scalars['JSON']>
  name: Scalars['String']
  outputs?: Maybe<IVariableValue[]>
  position: Scalars['Int']
  processRun: IProcessRun
  processRunId: Scalars['Int']
  status: IStepRunStatus
  /** Step can be null if the stepRun was generated by the instance itself */
  step?: Maybe<IStep>
  stepId?: Maybe<Scalars['Int']>
  stepRunGoTos: IStepRunGoTo[]
  stepTemplate: IStepTemplate
  stepTemplateId: Scalars['Int']
  synchronous: Scalars['Boolean']
  taskRun?: Maybe<ITaskRun>
  taskRunId?: Maybe<Scalars['Int']>
  uid: Scalars['String']
  variableValues?: Maybe<IVariableValue[]>
}

export type IStepRunGoTo = INode & {
  __typename?: 'StepRunGoTo'
  duplicatedFrom?: Maybe<IStepRunGoTo>
  duplicatedFromId?: Maybe<Scalars['Int']>
  duplicatedTo: IStepRunGoTo[]
  goFromStepRun: IStepRun
  goFromStepRunId: Scalars['Int']
  goToStepRun: IStepRun
  goToStepRunId: Scalars['Int']
  /** Unique identifier for the resource */
  id: Scalars['Int']
  ifBranch?: Maybe<Scalars['Boolean']>
  processRun: IProcessRun
  processRunId: Scalars['Int']
}

export const IStepRunStatus = {
  Disabled: 'disabled',
  Done: 'done',
  Failed: 'failed',
  Pending: 'pending',
  Queued: 'queued',
  Running: 'running',
} as const

export type IStepRunStatus = typeof IStepRunStatus[keyof typeof IStepRunStatus]
export type IStepTemplate = INode & {
  __typename?: 'StepTemplate'
  allowRetry: Scalars['Boolean']
  automationLevel: IStepTemplateAutomationLevel
  description?: Maybe<Scalars['String']>
  duplicatedFrom?: Maybe<IStepTemplate>
  duplicatedFromId?: Maybe<Scalars['Int']>
  duplicatedTo?: Maybe<IStepTemplate[]>
  external: Scalars['Boolean']
  /** Unique identifier for the resource */
  id: Scalars['Int']
  inputs?: Maybe<IVariableTemplate[]>
  meta?: Maybe<Scalars['JSON']>
  name: Scalars['String']
  outputs?: Maybe<IVariableTemplate[]>
  status: IStepTemplateStatus
  stepRuns?: Maybe<IStepRun[]>
  steps?: Maybe<IStep[]>
  stepTemplateCategory?: Maybe<IStepTemplateCategory>
  stepTemplateCategoryId: Scalars['Int']
  synchronous: Scalars['Boolean']
  uid: Scalars['String']
  variableTemplates?: Maybe<IVariableTemplate[]>
}

export const IStepTemplateAutomationLevel = {
  Full: 'full',
  Manual: 'manual',
  Semi: 'semi',
} as const

export type IStepTemplateAutomationLevel = typeof IStepTemplateAutomationLevel[keyof typeof IStepTemplateAutomationLevel]
export type IStepTemplateCategory = INode & {
  __typename?: 'StepTemplateCategory'
  description?: Maybe<Scalars['String']>
  /** Unique identifier for the resource */
  id: Scalars['Int']
  name: Scalars['String']
  stepTemplates?: Maybe<IStepTemplate[]>
}

export const IStepTemplateStatus = {
  Draft: 'draft',
  Hidden: 'hidden',
  Published: 'published',
} as const

export type IStepTemplateStatus = typeof IStepTemplateStatus[keyof typeof IStepTemplateStatus]
export type IStripeInvoice = {
  __typename?: 'StripeInvoice'
  date?: Maybe<Scalars['String']>
  downloadUrl?: Maybe<Scalars['String']>
  id?: Maybe<Scalars['String']>
  number?: Maybe<Scalars['String']>
  status?: Maybe<Scalars['String']>
  total?: Maybe<Scalars['Float']>
}

export type ISubscription = {
  __typename?: 'Subscription'
  amount?: Maybe<Scalars['Int']>
  billingCycleAnchor?: Maybe<Scalars['String']>
  cancelledAt?: Maybe<Scalars['String']>
  card?: Maybe<ICard>
  intervalCount?: Maybe<Scalars['Int']>
  periodEnd?: Maybe<Scalars['String']>
  planId?: Maybe<Scalars['String']>
  rate?: Maybe<Scalars['Int']>
  status?: Maybe<Scalars['String']>
  type?: Maybe<Scalars['String']>
}

export type ITag = INode & {
  __typename?: 'Tag'
  clients?: Maybe<IClient[]>
  color?: Maybe<Scalars['String']>
  iconUrl?: Maybe<Scalars['String']>
  /** Unique identifier for the resource */
  id: Scalars['Int']
  instances?: Maybe<IInstance[]>
  label: Scalars['String']
  parent?: Maybe<ITag>
  parentId?: Maybe<Scalars['Int']>
  /** Processes that have this tag */
  processes?: Maybe<IProcess[]>
  tagToClients?: Maybe<ITagToClient[]>
  tagToInstances?: Maybe<ITagToInstance[]>
  tagToProcesses?: Maybe<ITagToProcess[]>
  tagToUsers?: Maybe<ITagToUser[]>
  users?: Maybe<IUser[]>
}

export type ITagToClient = {
  __typename?: 'TagToClient'
  client: IClient
  clientId: Scalars['Int']
  credentialStatus?: Maybe<Scalars['String']>
  tag: ITag
  tagId: Scalars['Int']
  updatedAt: Scalars['Date']
}

export type ITagToInstance = {
  __typename?: 'TagToInstance'
  instance: IInstance
  instanceId: Scalars['Int']
  rank: Scalars['Int']
  tag: ITag
  tagId: Scalars['Int']
  updatedAt: Scalars['Date']
}

export type ITagToProcess = {
  __typename?: 'TagToProcess'
  process: IProcess
  processId: Scalars['Int']
  rank?: Maybe<Scalars['String']>
  tag: ITag
  tagId: Scalars['Int']
}

export type ITagToUser = {
  __typename?: 'TagToUser'
  rank: Scalars['Int']
  tag: ITag
  tagId: Scalars['Int']
  updatedAt: Scalars['Date']
  user: IUser
  userId: Scalars['Int']
}

export type ITask = INode & {
  __typename?: 'Task'
  /** benchmark as an iso string */
  benchmark?: Maybe<Scalars['Duration']>
  /** benchmark as a float number of hours */
  benchmarkHours?: Maybe<Scalars['Float']>
  description?: Maybe<Scalars['String']>
  duplicatedFrom?: Maybe<ITask>
  duplicatedFromId?: Maybe<Scalars['Int']>
  duplicatedTo?: Maybe<ITask[]>
  /** Unique identifier for the resource */
  id: Scalars['Int']
  inputs?: Maybe<IVariable[]>
  isMap: Scalars['Boolean']
  /** The input from the map step, if the task is a map */
  mapInputVariable?: Maybe<IVariable>
  mapInputVariableId?: Maybe<Scalars['Int']>
  /** The map step at the start, if the task is a map */
  mapStep?: Maybe<IStep>
  mapStepId?: Maybe<Scalars['Int']>
  name: Scalars['String']
  outputs?: Maybe<IVariable[]>
  position: Scalars['Int']
  process: IProcess
  processId: Scalars['Int']
  /** qaBenchmark as an iso string */
  qaBenchmark?: Maybe<Scalars['Duration']>
  status: ITaskStatus
  steps?: Maybe<IStep[]>
  taskDeliverables?: Maybe<ITaskDeliverable[]>
  taskRuns?: Maybe<ITaskRun[]>
  uid: Scalars['String']
  variables?: Maybe<IVariable[]>
}

export type ITaskDeliverable = INode & {
  __typename?: 'TaskDeliverable'
  commodity: ICommodity
  commodityId: Scalars['Int']
  /** Unique identifier for the resource */
  id: Scalars['Int']
  quantityRequired: Scalars['Int']
  task: ITask
  taskId: Scalars['Int']
}

/** An assignable set of stepRuns */
export type ITaskRun = INode & {
  __typename?: 'TaskRun'
  /** Agent who is assigned to this taskRun. */
  assignee?: Maybe<IUser>
  assigneeId?: Maybe<Scalars['Int']>
  batchifiedFrom?: Maybe<ITaskRun>
  batchifiedFromId?: Maybe<Scalars['Int']>
  batchifiedTo?: Maybe<ITaskRun[]>
  /** benchmark as an iso string */
  benchmark?: Maybe<Scalars['Duration']>
  /** benchmark as a float number of hours */
  benchmarkHours?: Maybe<Scalars['Float']>
  createdAt: Scalars['Date']
  deadline?: Maybe<Scalars['Date']>
  description?: Maybe<Scalars['String']>
  duplicatedFrom?: Maybe<ITaskRun>
  duplicatedFromId?: Maybe<Scalars['Int']>
  duplicatedTo?: Maybe<ITaskRun[]>
  /** Unique identifier for the resource */
  id: Scalars['Int']
  inputs?: Maybe<IVariableValue[]>
  isCurrentlyBeingTrackedIn: Scalars['Boolean']
  isMap: Scalars['Boolean']
  /** The input from the map step, if the task is a map */
  mapInputVariableValue?: Maybe<IVariableValue>
  mapInputVariableValueId?: Maybe<Scalars['Int']>
  /** The map stepRun at the start, if the task is a map */
  mapStepRun?: Maybe<IStepRun>
  mapStepRunId?: Maybe<Scalars['Int']>
  name: Scalars['String']
  outputs?: Maybe<IVariableValue[]>
  position: Scalars['Int']
  processRun: IProcessRun
  processRunId: Scalars['Int']
  /** Agent who is assigned to QA this taskRun. */
  qaAssignee?: Maybe<IUser>
  qaAssigneeId?: Maybe<Scalars['Int']>
  /** benchmark as an iso string */
  qaBenchmark?: Maybe<Scalars['Duration']>
  /** qaBenchmark as a float number of hours */
  qaBenchmarkHours?: Maybe<Scalars['Float']>
  qaComplete: Scalars['Boolean']
  qaFormSubmission?: Maybe<Scalars['String']>
  qaPass: Scalars['Boolean']
  qaScore?: Maybe<Scalars['Int']>
  qaTimeTracked: Scalars['BigInt']
  status: ITaskRunStatus
  stepRuns?: Maybe<IStepRun[]>
  task?: Maybe<ITask>
  taskId?: Maybe<Scalars['Int']>
  taskRunDeliverables?: Maybe<ITaskRunDeliverable[]>
  timeEntries?: Maybe<ITimeEntry[]>
  totalTimeTracked: Scalars['BigInt']
  uid: Scalars['String']
  variableValues?: Maybe<IVariableValue[]>
}

/** An assignable set of stepRuns */
export type ITaskRunDescriptionArgs = {
  sanitize?: Maybe<Scalars['Boolean']>
}

export type ITaskRunDeliverable = INode & {
  __typename?: 'TaskRunDeliverable'
  commodity: ICommodity
  commodityId: Scalars['Int']
  /** Unique identifier for the resource */
  id: Scalars['Int']
  quantityApproved: Scalars['Int']
  quantityCompleted: Scalars['Int']
  quantityPaid: Scalars['Int']
  quantityRequired: Scalars['Int']
  taskRun: ITaskRun
  taskRunId: Scalars['Int']
}

export const ITaskRunStatus = {
  Done: 'done',
  Operating: 'operating',
  Pending: 'pending',
  Qa: 'qa',
} as const

export type ITaskRunStatus = typeof ITaskRunStatus[keyof typeof ITaskRunStatus]
export const ITaskStatus = {
  Draft: 'draft',
  Published: 'published',
} as const

export type ITaskStatus = typeof ITaskStatus[keyof typeof ITaskStatus]
export type ITaskValidation = {
  __typename?: 'TaskValidation'
  errors?: Maybe<ITaskValidationError[]>
  valid: Scalars['Boolean']
}

export type ITaskValidationError = {
  __typename?: 'TaskValidationError'
  message: Scalars['String']
  processIds?: Maybe<Scalars['Int'][]>
  stepGoTos?: Maybe<IStepGoTo[]>
  stepIds?: Maybe<Scalars['Int'][]>
  steps?: Maybe<IStep[]>
}

export type ITeam = INode & {
  __typename?: 'Team'
  /** Unique identifier for the resource */
  id: Scalars['Int']
  name: Scalars['String']
}

export type ITeramind = INode & {
  __typename?: 'Teramind'
  duration: Scalars['String']
  email: Scalars['String']
  /** Unique identifier for the resource */
  id: Scalars['Int']
  startDate: Scalars['Date']
}

/** Assistant Tier */
export const ITier = {
  Standard: 'Standard',
  Vip: 'VIP',
} as const

export type ITier = typeof ITier[keyof typeof ITier]
export type ITimeEntry = INode & {
  __typename?: 'TimeEntry'
  /** draftAgentInvoice associated with this timeEntry */
  draftAgentInvoice?: Maybe<IDraftAgentInvoice>
  draftAgentInvoiceId?: Maybe<Scalars['Int']>
  duration: Scalars['String']
  /** Unique identifier for the resource */
  id: Scalars['Int']
  /** Instance where time was tracked. */
  instance: IInstance
  instanceId: Scalars['Int']
  /** oldTask associated with this timeEntry */
  oldTask?: Maybe<IOldTask>
  oldTaskId?: Maybe<Scalars['Int']>
  startedAt: Scalars['Date']
  stoppedAt?: Maybe<Scalars['Date']>
  /** taskRun associated with this timeEntry */
  taskRun?: Maybe<ITaskRun>
  taskRunId?: Maybe<Scalars['Int']>
  type: ITimeEntryType
  /** User that tracked time. */
  user?: Maybe<IUser>
  userId: Scalars['Int']
}

/** Time Entry Type */
export const ITimeEntryType = {
  General: 'general',
  Management: 'management',
  Qa: 'qa',
  Scoping: 'scoping',
} as const

export type ITimeEntryType = typeof ITimeEntryType[keyof typeof ITimeEntryType]
export type ITransferWisePayment = INode & {
  __typename?: 'TransferWisePayment'
  /** Unique identifier for the resource */
  id: Scalars['Int']
  lastTransferWiseStatusUpdate?: Maybe<ITransferWiseStatusUpdate>
}

export type ITransferWiseStatusUpdate = INode & {
  __typename?: 'TransferWiseStatusUpdate'
  currentState: Scalars['String']
  /** Unique identifier for the resource */
  id: Scalars['Int']
  occurredAt: Scalars['Date']
}

export type IUsage = {
  __typename?: 'Usage'
  amount: Scalars['Int']
  from: Scalars['Date']
  to: Scalars['Date']
}

export type IUser = INode & {
  __typename?: 'User'
  activeTimeEntry?: Maybe<ITimeEntry>
  category: Scalars['String']
  currency?: Maybe<Scalars['String']>
  draftAgentInvoiceForCycle?: Maybe<IDraftAgentInvoice>
  /** Events that agent has on its calendar */
  events: ICalendarEvent[]
  /** Unique identifier for the resource */
  id: Scalars['Int']
  isTrackingNow: Scalars['Boolean']
  lastActivity?: Maybe<Scalars['Date']>
  linkedIn?: Maybe<Scalars['String']>
  locationPlusCode?: Maybe<Scalars['String']>
  manager?: Maybe<IUser>
  managerId?: Maybe<Scalars['Int']>
  /** @deprecated replaced with offboardedAt field. */
  offboarded: Scalars['Boolean']
  offboardedAt?: Maybe<Scalars['Date']>
  oldTasks?: Maybe<IOldTask[]>
  pay?: Maybe<Scalars['Int']>
  paymentId?: Maybe<Scalars['String']>
  paymentMeta?: Maybe<Scalars['JSON']>
  paymentName?: Maybe<Scalars['String']>
  paymentPlatform?: Maybe<Scalars['String']>
  profile?: Maybe<IProfile>
  profileId?: Maybe<Scalars['Int']>
  qaPassedPercentage?: Maybe<Scalars['Float']>
  qaScore?: Maybe<Scalars['Float']>
  /** Agent shift related data */
  shift?: Maybe<IShift>
  startDate?: Maybe<Scalars['Date']>
  status?: Maybe<Scalars['String']>
  /** Capability tags */
  tags?: Maybe<ITag[]>
  tagToUsers: ITagToUser[]
  taskRuns?: Maybe<ITaskRun[]>
  team?: Maybe<Scalars['String']>
  timeEntries: ITimeEntry[]
  timezone?: Maybe<Scalars['String']>
  totalTimeTracked: Scalars['BigInt']
  workspaceComputerName?: Maybe<Scalars['String']>
  workspaceComputerRegion?: Maybe<Scalars['String']>
}

export type IUserDraftAgentInvoiceForCycleArgs = {
  cycleRange: Scalars['String'][]
}

export type IUserEventsArgs = {
  endDate?: Maybe<Scalars['String']>
}

export type IUsersToClientsAccess = INode & {
  __typename?: 'UsersToClientsAccess'
  client?: Maybe<IClient>
  clientId: Scalars['Int']
  /** Unique identifier for the resource */
  id: Scalars['Int']
  role?: Maybe<IRole>
  roleId?: Maybe<Scalars['Int']>
  user?: Maybe<IUser>
  userId: Scalars['Int']
}

export type IVariable = INode & {
  __typename?: 'Variable'
  defaultValue?: Maybe<Scalars['String']>
  description?: Maybe<Scalars['String']>
  direction: IVariableDirection
  duplicatedFrom?: Maybe<IVariable>
  duplicatedFromId?: Maybe<Scalars['Int']>
  duplicatedTo?: Maybe<IVariable[]>
  goFromVariables?: Maybe<IVariable[]>
  goToVariables?: Maybe<IVariable[]>
  /** Unique identifier for the resource */
  id: Scalars['Int']
  internalId: Scalars['Int']
  keyName?: Maybe<Scalars['String']>
  meta?: Maybe<Scalars['JSON']>
  name: Scalars['String']
  process: IProcess
  processId: Scalars['Int']
  required: Scalars['Boolean']
  sampleData?: Maybe<Scalars['JSON']>
  schema?: Maybe<Scalars['JSON']>
  stage: IStage
  stageId?: Maybe<Scalars['Int']>
  step?: Maybe<IStep>
  stepId?: Maybe<Scalars['Int']>
  task?: Maybe<ITask>
  taskId?: Maybe<Scalars['Int']>
  type: IVariableType
  uid: Scalars['String']
  variableGoFroms?: Maybe<IVariableGoTo[]>
  variableGoTos?: Maybe<IVariableGoTo[]>
  variableTemplate?: Maybe<IVariableTemplate>
  variableTemplateId?: Maybe<Scalars['Int']>
  variableValues?: Maybe<IVariableValue[]>
}

export const IVariableDirection = {
  Input: 'input',
  Output: 'output',
} as const

export type IVariableDirection = typeof IVariableDirection[keyof typeof IVariableDirection]
export type IVariableGoTo = INode & {
  __typename?: 'VariableGoTo'
  duplicatedFrom?: Maybe<IVariableGoTo>
  duplicatedFromId?: Maybe<Scalars['Int']>
  duplicatedTo?: Maybe<IVariableGoTo[]>
  fromField?: Maybe<Scalars['String']>
  goFromVariable: IVariable
  goFromVariableId: Scalars['Int']
  goToVariable: IVariable
  goToVariableId: Scalars['Int']
  /** Unique identifier for the resource */
  id: Scalars['Int']
  process: IProcess
  processId: Scalars['Int']
  toField?: Maybe<Scalars['String']>
}

export type IVariableTemplate = INode & {
  __typename?: 'VariableTemplate'
  defaultValue?: Maybe<Scalars['String']>
  description?: Maybe<Scalars['String']>
  direction: IVariableDirection
  duplicatedFrom?: Maybe<IVariableTemplate>
  duplicatedFromId?: Maybe<Scalars['Int']>
  duplicatedTo?: Maybe<IVariableTemplate[]>
  /** Unique identifier for the resource */
  id: Scalars['Int']
  internalId: Scalars['Int']
  keyName?: Maybe<Scalars['String']>
  meta?: Maybe<Scalars['JSON']>
  name: Scalars['String']
  required: Scalars['Boolean']
  sampleData?: Maybe<Scalars['JSON']>
  schema?: Maybe<Scalars['JSON']>
  stage: IStage
  stageId?: Maybe<Scalars['Int']>
  stepTemplate: IStepTemplate
  stepTemplateId: Scalars['Int']
  type: IVariableType
  uid: Scalars['String']
  variables?: Maybe<IVariable[]>
  variableValues?: Maybe<IVariableValue[]>
}

export const IVariableType = {
  AAAny: 'a_a_any',
  AAObject: 'a_a_object',
  AAString: 'a_a_string',
  AAny: 'a_any',
  ABoolean: 'a_boolean',
  ADatetime: 'a_datetime',
  ADuration: 'a_duration',
  AEmail: 'a_email',
  AEnum: 'a_enum',
  AHtml: 'a_html',
  ANumber: 'a_number',
  AObject: 'a_object',
  AString: 'a_string',
  AUrl: 'a_url',
  Any: 'any',
  Boolean: 'boolean',
  Datetime: 'datetime',
  Duration: 'duration',
  Email: 'email',
  Enum: 'enum',
  Html: 'html',
  Number: 'number',
  Object: 'object',
  String: 'string',
  Url: 'url',
} as const

export type IVariableType = typeof IVariableType[keyof typeof IVariableType]
export type IVariableValue = INode & {
  __typename?: 'VariableValue'
  defaultValue?: Maybe<Scalars['String']>
  description?: Maybe<Scalars['String']>
  direction: IVariableDirection
  duplicatedFrom?: Maybe<IVariableValue>
  duplicatedFromId?: Maybe<Scalars['Int']>
  duplicatedTo?: Maybe<IVariableValue[]>
  goFromVariableValues?: Maybe<IVariableValue[]>
  goToVariableValues?: Maybe<IVariableValue[]>
  /** Unique identifier for the resource */
  id: Scalars['Int']
  internalId: Scalars['Int']
  keyName?: Maybe<Scalars['String']>
  meta?: Maybe<Scalars['JSON']>
  name: Scalars['String']
  parsedValue?: Maybe<Scalars['JSON']>
  processRun?: Maybe<IProcessRun>
  processRunId: Scalars['Int']
  required: Scalars['Boolean']
  sampleData?: Maybe<Scalars['JSON']>
  schema?: Maybe<Scalars['JSON']>
  stage: IStage
  stageId?: Maybe<Scalars['Int']>
  stepRun?: Maybe<IStepRun>
  stepRunId?: Maybe<Scalars['Int']>
  taskRun?: Maybe<ITaskRun>
  taskRunId?: Maybe<Scalars['Int']>
  type: IVariableType
  uid: Scalars['String']
  value?: Maybe<Scalars['String']>
  variable?: Maybe<IVariable>
  variableId?: Maybe<Scalars['Int']>
  variableTemplate?: Maybe<IVariableTemplate>
  variableTemplateId?: Maybe<Scalars['Int']>
  variableValueGoFroms?: Maybe<IVariableValueGoTo[]>
  variableValueGoTos?: Maybe<IVariableValueGoTo[]>
}

export type IVariableValueGoTo = INode & {
  __typename?: 'VariableValueGoTo'
  duplicatedFrom?: Maybe<IVariableValueGoTo>
  duplicatedFromId?: Maybe<Scalars['Int']>
  duplicatedTo?: Maybe<IVariableValueGoTo[]>
  fromField?: Maybe<Scalars['String']>
  goFromVariableValue: IVariableValue
  goFromVariableValueId: Scalars['Int']
  goToVariableValue: IVariableValue
  goToVariableValueId: Scalars['Int']
  /** Unique identifier for the resource */
  id: Scalars['Int']
  processRun: IProcessRun
  processRunId: Scalars['Int']
  toField?: Maybe<Scalars['String']>
}

export type IXeroInvoice = INode & {
  __typename?: 'XeroInvoice'
  contactEmail?: Maybe<Scalars['String']>
  contactName?: Maybe<Scalars['String']>
  createdAt: Scalars['Date']
  draftAgentInvoice?: Maybe<IDraftAgentInvoice>
  dueDate?: Maybe<Scalars['String']>
  /** Unique identifier for the resource */
  id: Scalars['Int']
  invoiceId: Scalars['String']
  lastTransferWisePayment?: Maybe<ITransferWisePayment>
  status: Scalars['String']
  timeEntries?: Maybe<ITimeEntry[]>
  total: Scalars['String']
}

export type IInstanceDetailsFragment = { __typename?: 'Instance' } & Pick<
  IInstance,
  'id' | 'name'
> & {
    assistant: { __typename?: 'Assistant' } & Pick<IAssistant, 'id'> & {
        profile?: Maybe<{ __typename?: 'Profile' } & Pick<IProfile, 'name' | 'email'>>
      }
    client?: Maybe<
      { __typename?: 'Client' } & Pick<IClient, 'id'> & {
          profile?: Maybe<{ __typename?: 'Profile' } & Pick<IProfile, 'name' | 'email'>>
        }
    >
    assignee?: Maybe<
      { __typename?: 'User' } & Pick<IUser, 'id'> & {
          profile?: Maybe<{ __typename?: 'Profile' } & Pick<IProfile, 'name' | 'email'>>
        }
    >
  }

export type IInstanceQueryVariables = Exact<{
  id: Scalars['Int']
  bustCache?: Maybe<Scalars['Boolean']>
}>

export type IInstanceQuery = { __typename?: 'Query' } & {
  instance: { __typename?: 'Instance' } & IInstanceDetailsFragment
}

export type IStepRunDetailsFragment = { __typename?: 'StepRun' } & Pick<IStepRun, 'id' | 'name'> & {
    processRun: { __typename?: 'ProcessRun' } & {
      instance: { __typename?: 'Instance' } & Pick<IInstance, 'id' | 'name' | 'deadline'> & {
          assistant: { __typename?: 'Assistant' } & Pick<IAssistant, 'id'> & {
              profile?: Maybe<{ __typename?: 'Profile' } & Pick<IProfile, 'name' | 'email'>>
              company: { __typename?: 'Company' } & Pick<ICompany, 'name' | 'id'>
            }
          client?: Maybe<
            { __typename?: 'Client' } & Pick<IClient, 'id'> & {
                profile?: Maybe<{ __typename?: 'Profile' } & Pick<IProfile, 'name' | 'email'>>
              }
          >
          owner?: Maybe<
            { __typename?: 'User' } & Pick<IUser, 'id'> & {
                profile?: Maybe<{ __typename?: 'Profile' } & Pick<IProfile, 'name' | 'email'>>
              }
          >
          quote?: Maybe<{ __typename?: 'Quote' } & Pick<IQuote, 'id' | 'amountInCents'>>
        }
      process: { __typename?: 'Process' } & Pick<IProcess, 'id' | 'name'>
    }
    taskRun?: Maybe<
      { __typename?: 'TaskRun' } & Pick<ITaskRun, 'id' | 'name'> & {
          qaAssignee?: Maybe<
            { __typename?: 'User' } & Pick<IUser, 'id'> & {
                profile?: Maybe<{ __typename?: 'Profile' } & Pick<IProfile, 'name' | 'email'>>
              }
          >
          assignee?: Maybe<
            { __typename?: 'User' } & Pick<IUser, 'id'> & {
                profile?: Maybe<{ __typename?: 'Profile' } & Pick<IProfile, 'name' | 'email'>>
              }
          >
        }
    >
  }

export type IStepRunQueryVariables = Exact<{
  id: Scalars['Int']
  bustCache?: Maybe<Scalars['Boolean']>
}>

export type IStepRunQuery = { __typename?: 'Query' } & {
  stepRun: { __typename?: 'StepRun' } & IStepRunDetailsFragment
}

export const InstanceDetailsFragmentDoc = ({
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'InstanceDetails' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Instance' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'assistant' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'profile' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'client' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'profile' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'assignee' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'profile' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown) as DocumentNode<IInstanceDetailsFragment, unknown>
export const StepRunDetailsFragmentDoc = ({
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'StepRunDetails' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'StepRun' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'processRun' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'instance' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'deadline' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'assistant' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'profile' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                                  { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                                ],
                              },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'company' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                                  { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'client' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'profile' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                                  { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'owner' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'profile' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                                  { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'quote' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'amountInCents' } },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'process' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'taskRun' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'qaAssignee' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'profile' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'assignee' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'profile' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown) as DocumentNode<IStepRunDetailsFragment, unknown>
export const InstanceDocument = ({
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'Instance' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'bustCache' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Boolean' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'instance' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'bustCache' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'bustCache' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'InstanceDetails' } },
              ],
            },
          },
        ],
      },
    },
    ...InstanceDetailsFragmentDoc.definitions,
  ],
} as unknown) as DocumentNode<IInstanceQuery, IInstanceQueryVariables>
export const StepRunDocument = ({
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'StepRun' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'bustCache' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Boolean' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'stepRun' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'bustCache' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'bustCache' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'StepRunDetails' } },
              ],
            },
          },
        ],
      },
    },
    ...StepRunDetailsFragmentDoc.definitions,
  ],
} as unknown) as DocumentNode<IStepRunQuery, IStepRunQueryVariables>
