import { Apple, ExternalLink, Globe, Music2, Radio, Waves, Youtube } from 'lucide-react'
import type { PlatformLink } from '../types'

const icons = { Spotify: Music2, 'Apple Music': Apple, SoundCloud: Waves, 'YouTube Music': Music2, YouTube: Youtube, Bandcamp: Radio, Deezer: Music2, Tidal: Waves, Custom: Globe }

function safeExternalUrl(value: string) { try { const url = new URL(value); return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null } catch { return null } }

export function PlatformLinks({ links, compact = false }: { links?: PlatformLink[]; compact?: boolean }) {
  const available = [...(links ?? [])].filter((link) => safeExternalUrl(link.url)).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  if (!available.length) return <p className="platform-empty">No external links available.</p>
  return <div className={`platform-links ${compact ? 'compact' : ''}`}>{available.map((link) => { const Icon = icons[link.platform as keyof typeof icons] ?? Globe; return <a href={safeExternalUrl(link.url) ?? '#'} target="_blank" rel="noopener noreferrer" key={link.id} aria-label={link.label ?? `Open ${link.platform}`}><Icon size={compact ? 14 : 16} /><span>{link.label ?? link.platform}</span><ExternalLink size={12} /></a> })}</div>
}