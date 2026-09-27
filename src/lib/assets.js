import { deleteRecord, getRecord, putRecord } from './db.js'
import { createId } from './id.js'

const ASSETS_STORE = 'assets'

export async function saveAsset(blob) {
  const id = createId()
  await putRecord(ASSETS_STORE, { id, blob, createdAt: Date.now() })
  return id
}

export async function loadAsset(id) {
  const record = await getRecord(ASSETS_STORE, id)
  return record?.blob ?? null
}

export function deleteAsset(id) {
  return deleteRecord(ASSETS_STORE, id)
}
