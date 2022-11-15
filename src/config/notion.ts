import { Client } from '@notionhq/client'

let _notion: Client
const init = () => {
  if (_notion) return _notion
  _notion = new Client({
    auth: process.env.NOTION_TOKEN,
  })
  return _notion
}

const notion = init()

export { init, notion }
