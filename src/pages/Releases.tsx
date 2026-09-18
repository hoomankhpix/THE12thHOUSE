import { ArrowRight, ArrowUpRight, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { artist, releases } from '../data/demo'
import { Artwork } from '../components/Artwork'
import { useAudioPlayer } from '../context/AudioPlayerContext'
import type { ReleaseType } from '../types'

export function Releases() {
  const [filter, setFilter] = useState<'all' | ReleaseType>('all')
  const visible = releases.filter((release) => filter === 'all' || release.type === filter)
  const { setQueue, playTrack } = useAudioPlayer()
  const playRelease = (release: typeof releases[number]) => { const queue = release.tracks.map((track) => ({ ...track, artwork: release.artwork, artistName: artist.name })); setQueue(queue); playTrack(queue[0]) }
  return <div className="page releases-page"><div className="page-intro archive-intro"><p className="eyebrow">Catalogue / 2024—25</p><h1>Releases</h1><p className="intro-copy">A curated collection of music, image, and atmosphere from the house.</p></div><div className="filter-row archive-filter" role="tablist" aria-label="Filter releases">{(['all', 'album', 'single'] as const).map((option) => <button className={filter === option ? 'active' : ''} onClick={() => setFilter(option)} key={option} role="tab" aria-selected={filter === option}>{option}</button>)}</div><div className="archive-list">{visible.map((release, index) => <article className={`archive-entry ${index % 2 === 1 ? 'archive-entry-reverse' : ''}`} key={release.id}><Link className="archive-artwork" to={`/releases/${release.id}`}><Artwork src={release.artwork} title={release.title} accent={release.accent} /></Link><div className="archive-info"><p className="archive-number">0{index + 1} / {release.type}</p><h2>{release.title}</h2><p className="archive-artist">{artist.name}</p><div className="archive-meta"><span>{new Date(release.releaseDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span><span>{release.tracks.length} {release.tracks.length === 1 ? 'track' : 'tracks'}</span></div><div className="archive-actions"><Link className="archive-link" to={`/releases/${release.id}`}>View release <ArrowUpRight size={14} /></Link><button className="archive-play" onClick={() => playRelease(release)} aria-label={`Play ${release.title}`}><Play size={12} fill="currentColor" /> Play <ArrowRight size={14} /></button></div></div></article>)}</div></div>
}
