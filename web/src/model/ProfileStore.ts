import { getDB, type ProfileRecord } from '../persistence/db'
import type { SettingsData } from './UserSettings'

export const DEFAULT_PROFILE_ID = 'default-child'

const PROFILE_SCHEMA_VERSION = 1

function cloneSettings(settings: SettingsData): SettingsData {
  return { ...settings }
}

function parseSettings(record: ProfileRecord): SettingsData | null {
  try {
    const settings = JSON.parse(record.settingsJson) as SettingsData
    return cloneSettings(settings)
  } catch {
    return null
  }
}

export async function loadDefaultProfileSettings(): Promise<SettingsData | null> {
  const db = await getDB()
  const record = await db.get('profiles', DEFAULT_PROFILE_ID) as ProfileRecord | undefined
  return record ? parseSettings(record) : null
}

export async function saveDefaultProfileSettings(settings: SettingsData, now = Date.now()): Promise<void> {
  const db = await getDB()
  const existing = await db.get('profiles', DEFAULT_PROFILE_ID) as ProfileRecord | undefined

  const record: ProfileRecord = {
    id: DEFAULT_PROFILE_ID,
    displayName: existing?.displayName ?? 'Child',
    settingsJson: JSON.stringify(cloneSettings(settings)),
    createdAt: existing?.createdAt ?? now,
    lastModifiedAt: now,
    schemaVersion: PROFILE_SCHEMA_VERSION,
  }

  await db.put('profiles', record)
}

