export type ReleaseType = 'single' | 'album'
export interface Track { id: string; releaseId: string; title: string; duration: string; audioUrl?: string; artwork?: string; artistName?: string; trackNumber: number }
export interface Release { id: string; title: string; type: ReleaseType; releaseDate: string; description: string; artwork: string; accent: string; featured?: boolean; published: boolean; tracks: Track[]; platformLinks?: PlatformLink[] }
export type PlatformName = 'SoundCloud' | 'Spotify' | 'Apple Music' | 'YouTube Music' | 'YouTube' | 'Bandcamp' | 'Deezer' | 'Tidal' | 'Custom'
export interface PlatformLink { id: string; artistId?: string | null; releaseId?: string | null; platform: PlatformName | string; url: string; label?: string; sortOrder?: number }
export interface Artist { id: string; name: string; bio: string; image: string }