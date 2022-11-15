import { google, init } from '../../config/google'

const createDocInFolder = async ({
  content,
  folderId,
  title,
}: {
  content: string
  folderId: string
  title: string
}) => {
  await init()

  const media = {
    body: content,
    mimeType: 'text/plain',
  }

  const requestBody = {
    parents: [folderId],
    name: title,
    mimeType: 'application/vnd.google-apps.document',
  }

  const newFile = await google.drive('v3').files.create({ media, requestBody })

  return newFile.data
}

export { createDocInFolder }
