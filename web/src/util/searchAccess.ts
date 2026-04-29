import type { SettingsData } from '../model/UserSettings'

export type SearchAccess =
  | { allowed: true }
  | { allowed: false; reason: 'disabled' | 'offline' }

export function getSearchAccess(settings: Pick<SettingsData, 'searchEnabled'>, online: boolean): SearchAccess {
  if (!settings.searchEnabled) return { allowed: false, reason: 'disabled' }
  if (!online) return { allowed: false, reason: 'offline' }
  return { allowed: true }
}
