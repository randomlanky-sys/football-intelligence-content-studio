// packages/storage/src/index.test.ts
import { expect, test, describe } from 'vitest'
import {
  indexedDBStorage,
  opfsPersistence,
  fileSystemAccessHandle,
  IndexedDBStorage,
  OPFSPersistence,
  FileSystemAccessHandle,
  IndexedDBStorageImpl,
  OPFSPersistenceImpl,
  FileSystemAccessHandleImpl,
} from './index'

describe('storage utilities', () => {
  test('IndexedDBStorageImpl methods exist and return promises', async () => {
    // Test that the methods exist and return promises
    await expect(indexedDBStorage.save('test-key', {value: 'test'})).resolves.toBeUndefined()
    await expect(indexedDBStorage.load('test-key')).resolves.toBeNull()
    await expect(indexedDBStorage.delete('test-key')).resolves.toBeUndefined()
  })

  test('OPFSPersistenceImpl methods exist and return promises', async () => {
    const blob = new Blob()
    await expect(opfsPersistence.put('/tmp/test.txt', blob)).resolves.toBeUndefined()
    await expect(opfsPersistence.get('/tmp/test.txt')).resolves.toBeInstanceOf(Blob)
  })

  test('FileSystemAccessHandleImpl methods exist and return promises', async () => {
    await expect(fileSystemAccessHandle.write(new Uint8Array([65, 66, 67]))).resolves.toBeUndefined()
    await expect(fileSystemAccessHandle.read()).resolves.toBeInstanceOf(Uint8Array)
  })

  test('storage exports are of correct types', () => {
    // Type checks
    const db: IndexedDBStorage = indexedDBStorage
    const opfs: OPFSPersistence = opfsPersistence
    const fsa: FileSystemAccessHandle = fileSystemAccessHandle
    expect(db).toBeInstanceOf(IndexedDBStorageImpl)
    expect(opfs).toBeInstanceOf(OPFSPersistenceImpl)
    expect(fsa).toBeInstanceOf(FileSystemAccessHandleImpl)
  })
})