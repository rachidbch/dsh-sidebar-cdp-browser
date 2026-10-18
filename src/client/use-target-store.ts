import { useCallback, useMemo, useState } from 'react'
import type { TargetDescriptor, TargetKey } from './cdp-api.ts'

export interface TargetStore {
  targets: TargetDescriptor[]
  selectedKey?: TargetKey
  selected?: TargetDescriptor
  replace(targets: TargetDescriptor[]): void
  remove(key: TargetKey): void
  select(key: TargetKey): void
}

export function useTargetStore(initialKey?: TargetKey): TargetStore {
  const [targets, setTargets] = useState<TargetDescriptor[]>([])
  const [selectedKey, setSelectedKey] = useState<TargetKey | undefined>(initialKey)

  const replace = useCallback((next: TargetDescriptor[]) => {
    const live = next.filter(target => target.lifecycle !== 'closed')
    setTargets(live)
    // Prefer a page with a real URL over an empty tab: auto-selecting
    // chrome://newtab/ shows "waiting for frames" because a blank page never
    // repaints, which reads as a broken panel.
    const rank = (t: { url?: string }) => (/^chrome(-error)?:\/\/newtab|^about:blank/.test(t.url ?? '') ? 1 : 0)
    const best = [...live].sort((a, b) => rank(a) - rank(b))[0]
    setSelectedKey(current => current && live.some(target => target.key === current) ? current : best?.key)
  }, [])
  const remove = useCallback((key: TargetKey) => {
    setTargets(current => current.filter(target => target.key !== key))
    setSelectedKey(current => current === key ? undefined : current)
  }, [])
  const select = useCallback((key: TargetKey) => setSelectedKey(key), [])
  const selected = useMemo(() => targets.find(target => target.key === selectedKey), [targets, selectedKey])

  return { targets, selectedKey, selected, replace, remove, select }
}
