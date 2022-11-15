import { AxiosResponse } from 'axios'

import { google, init } from '../../config/google'

const createFileInFolder = async ({
  fileStream,
  folderId,
  fileName,
}: {
  fileStream: AxiosResponse
  folderId: string
  fileName: string
}) => {
  await init()

  const media = {
    body: fileStream,
  }

  const requestBody = {
    parents: [folderId],
    uploadType: 'multipart',
    name: fileName,
  }

  const newFile = await google.drive('v3').files.create({ media, requestBody })

  return newFile.data
}

const createFolderInFolder = async ({
  folderId,
  folderName,
}: {
  folderId: string
  folderName: string
}) => {
  await init()

  const requestBody = {
    parents: [folderId],
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  }

  const file = await google.drive('v3').files.create({
    requestBody,
    fields: 'id',
  })

  return file.data.id
}

export { createFileInFolder, createFolderInFolder }
