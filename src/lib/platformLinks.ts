import type { PlatformLink } from '../types'
import { platformLinks as demoPlatformLinks } from '../data/demo'
import { supabase } from './supabase'

interface SupabasePlatformLink { id: string; artist_id: string | null; release_id: string | null; platform: string; label: string | null; url: string; sort_order: number }

const mapLink = (link: SupabasePlatformLink): PlatformLink => ({ id: link.id, artistId: link.artist_id, releaseId: link.release_id, platform: link.platform, label: link.label ?? undefined, url: link.url, sortOrder: link.sort_order })

export async function fetchArtistPlatformLinks(artistId: string): Promise<PlatformLink[]> {
  if (!supabase) return demoPlatformLinks.filter((link) => link.artistId === artistId)
  const { data, error } = await supabase.from('platform_links').select('*').eq('artist_id', artistId).is('release_id', null).eq('published', true).order('sort_order')
  if (error || !data?.length) return demoPlatformLinks.filter((link) => link.artistId === artistId)
  return (data as SupabasePlatformLink[]).map(mapLink)
}

export async function fetchReleasePlatformLinks(releaseId: string, artistId: string): Promise<PlatformLink[]> {
  if (!supabase) return demoPlatformLinks.filter((link) => link.artistId === artistId || link.releaseId === releaseId)
  const { data, error } = await supabase.from('platform_links').select('*').eq('release_id', releaseId).eq('published', true).order('sort_order')
  if (error || !data?.length) return fetchArtistPlatformLinks(artistId)
  return (data as SupabasePlatformLink[]).map(mapLink)
}