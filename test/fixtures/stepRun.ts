const mockedStepRun = {
  id: 11111,
  name: 'myStepRun',
  processRun: {
    instance: {
      id: 22222,
      name: 'myInstance',
      deadline: '2021-09-10 13:37:43',
      assistant: {
        id: 33333,
        profile: {
          name: 'myAssistant',
          email: 'assitant@mail.com',
        },
        company: {
          name: 'myCompany',
          id: 44444,
        },
      },
      client: {
        id: 55555,
        profile: {
          name: 'myClient',
          email: 'client@mail.com',
        },
      },
      owner: {
        id: 66666,
        profile: {
          name: 'myOwner',
          email: 'rene@mail.com',
        },
      },
      quote: {
        id: 77777,
        amountInCents: 123450,
      },
    },
    process: {
      id: 88888,
      name: 'myProcess',
    },
  },
  taskRun: {
    id: 99999,
    name: 'myTaskRun',
    qaAssignee: {
      id: 12345,
      profile: {
        name: 'myQaAssignee',
        email: 'matteo@mail.com',
      },
    },
    assignee: {
      id: 678910,
      profile: {
        name: 'myAssignee',
        email: 'gabriela.benitez@mail.com',
      },
    },
  },
}

export { mockedStepRun }
