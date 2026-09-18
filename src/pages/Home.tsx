import { ArrowDownRight, ArrowRight, ArrowUpRight, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import { artist, platformLinks, releases } from '../data/demo'
import { Artwork } from '../components/Artwork'
import { PlatformLinks } from '../components/PlatformLinks'
import { useAudioPlayer } from '../context/AudioPlayerContext'
import { useEffect, useState } from 'react'
import { InteractiveIntro } from '../components/InteractiveIntro'
import { fetchArtistPlatformLinks } from '../lib/platformLinks'
import type { PlatformLink } from '../types'

export function Home() {
  const [introComplete, setIntroComplete] = useState(false)
  const [links, setLinks] = useState<PlatformLink[]>(platformLinks)
  const currentRelease = releases[1] ?? releases[0]
  const additionalReleases = releases.filter((release) => release.id !== currentRelease.id)
  const { setQueue, playTrack } = useAudioPlayer()
  const tracksFor = (release: typeof currentRelease) => release.tracks.map((track) => ({ ...track, artwork: release.artwork, artistName: artist.name }))

  useEffect(() => { void fetchArtistPlatformLinks(artist.id).then(setLinks) }, [])

  const playRelease = (release: typeof currentRelease) => {
    const queue = tracksFor(release)
    setQueue(queue)
    playTrack(queue[0])
  }

  return <>
    <InteractiveIntro artistName={artist.name} onComplete={() => setIntroComplete(true)} />
    <div className={`page home-page ${introComplete ? 'home-is-visible' : 'home-is-hidden'}`} aria-hidden={!introComplete}>
      <section className="home-hero" aria-labelledby="home-release-title">
        <div className="hero-artwork-wrap">
          <Link to={`/releases/${currentRelease.id}`} aria-label={`View ${currentRelease.title}`}>
            <Artwork src={currentRelease.artwork} title={currentRelease.title} accent={currentRelease.accent} className="hero-artwork" />
          </Link>
          <span className="hero-artwork-index">01 / {String(releases.length).padStart(3, '0')}</span>
        </div>
        <div className="hero-content">
          <div className="hero-meta"><span>Current release</span><span>12th House / {currentRelease.type}</span></div>
          <p className="hero-number">001 / 012</p>
          <h1 id="home-release-title">{currentRelease.title}</h1>
          <p className="home-artist-note">{artist.name}</p>
          <p className="hero-description">{currentRelease.description}</p>
          <div className="discipline-list" aria-label="Creative disciplines"><span>Music</span><span>Cover art</span><span>Motion</span><span>Code</span></div>
          <button className="play-release" onClick={() => playRelease(currentRelease)} aria-label={`Play ${currentRelease.title}`}><span><Play size={13} fill="currentColor" /></span> Play release <ArrowRight size={15} /></button>
        </div>
      </section>

      <section className="selected-releases" aria-labelledby="selected-releases-title">
        <div className="section-heading home-section-heading"><div><p className="eyebrow">Selected work</p><h2 id="selected-releases-title">Other rooms.</h2></div><Link className="text-link" to="/releases">All releases <ArrowUpRight size={14} /></Link></div>
        <div className="release-list">{additionalReleases.map((release, index) => <article className={`release-entry ${index % 2 === 1 ? 'release-entry-reverse' : ''}`} key={release.id}><Link className="release-entry-art" to={`/releases/${release.id}`}><Artwork src={release.artwork} title={release.title} accent={release.accent} /></Link><div className="release-entry-info"><p className="release-entry-number">0{index + 2} / {release.type}</p><h3>{release.title}</h3><p className="release-entry-artist">{artist.name}</p><p className="release-entry-description">{release.description}</p><div className="release-entry-meta"><span>{new Date(release.releaseDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span><div><Link className="entry-link" to={`/releases/${release.id}`}>View release <ArrowUpRight size={13} /></Link><button className="entry-play" onClick={() => playRelease(release)} aria-label={`Play ${release.title}`}><Play size={12} fill="currentColor" /> Play</button></div></div></div></article>)}</div>
      </section>

      <section className="platforms home-platforms" id="platforms"><div><p className="eyebrow">Find the music</p><h2>Out in the world.</h2></div><PlatformLinks links={links} /></section>
    </div>
  </>
}
