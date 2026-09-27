const DB_NAME = 'personal-dashboard'
// Bump whenever a store is added to STORES so `onupgradeneeded` runs for existing users.
const DB_VERSION = 4

const STORES = {
  bookmarks: { keyPath: 'id' },
  bookmarkLists: { keyPath: 'id' },
  documents: { keyPath: 'id' },
  assets: { keyPath: 'id' },
}

let dbPromise = null

function openDatabase() {
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) {
      reject(new Error('IndexedDB is not available in this browser.'))
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      for (const [name, options] of Object.entries(STORES)) {
        if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, options)
      }
    }

    request.onsuccess = () => {
      const db = request.result
      db.onversionchange = () => {
        db.close()
        dbPromise = null
      }
      resolve(db)
    }

    request.onerror = () => {
      dbPromise = null
      reject(request.error)
    }
  })

  return dbPromise
}

async function runInStore(storeName, mode, operation) {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode)
    const request = operation(transaction.objectStore(storeName))

    transaction.oncomplete = () => resolve(request.result)
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error ?? new Error('Transaction aborted.'))
  })
}

export function getAllRecords(storeName) {
  return runInStore(storeName, 'readonly', (store) => store.getAll())
}

export function getRecord(storeName, key) {
  return runInStore(storeName, 'readonly', (store) => store.get(key))
}

export function putRecord(storeName, record) {
  return runInStore(storeName, 'readwrite', (store) => store.put(record))
}

export function deleteRecord(storeName, key) {
  return runInStore(storeName, 'readwrite', (store) => store.delete(key))
}
