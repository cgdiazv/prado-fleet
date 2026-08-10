import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

export type StoredAuditEntry<TPayload> = {
  id: string;
  kind: string;
  createdAt: string;
  source: string;
  payload: TPayload;
};

const DATA_ROOT = path.join(process.cwd(), "data", "prado-fleet");

async function ensureDataRoot() {
  await mkdir(DATA_ROOT, { recursive: true });
}

async function readCollection<TPayload>(collectionName: string): Promise<StoredAuditEntry<TPayload>[]> {
  await ensureDataRoot();

  const filePath = path.join(DATA_ROOT, `${collectionName}.json`);

  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as StoredAuditEntry<TPayload>[];

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function writeCollection<TPayload>(collectionName: string, entries: StoredAuditEntry<TPayload>[]) {
  await ensureDataRoot();

  const filePath = path.join(DATA_ROOT, `${collectionName}.json`);

  await writeFile(filePath, `${JSON.stringify(entries, null, 2)}\n`, "utf8");
}

function createAuditId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

export async function appendAuditEntry<TPayload>(collectionName: string, kind: string, payload: TPayload, source = "prado-fleet") {
  const existingEntries = await readCollection<TPayload>(collectionName);
  const entry: StoredAuditEntry<TPayload> = {
    id: createAuditId(collectionName),
    kind,
    createdAt: new Date().toISOString(),
    source,
    payload,
  };

  existingEntries.push(entry);
  await writeCollection(collectionName, existingEntries);

  return entry;
}

export async function listAuditEntries<TPayload>(collectionName: string) {
  return readCollection<TPayload>(collectionName);
}