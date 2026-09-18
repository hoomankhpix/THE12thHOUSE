import { artist, platformLinks } from '../data/demo'
import { PlatformLinks } from '../components/PlatformLinks'
import { useEffect, useState } from 'react'
import type { PlatformLink } from '../types'
import { fetchArtistPlatformLinks } from '../lib/platformLinks'
export function About() { const [links, setLinks] = useState<PlatformLink[]>(platformLinks); useEffect(() => { void fetchArtistPlatformLinks(artist.id).then(setLinks) }, []); return <div className="page about-page"><div className="about-header"><p className="eyebrow">About the artist</p><h1>Between signal<br />and silence.</h1></div><div className="about-grid"><img src={artist.image} alt="12th House artist portrait" /><div className="about-copy"><p>{artist.bio}</p><p>Built from field recordings, modular synthesis, and an instinct for restraint. 12th House is the solo project of an artist interested in what happens when a song leaves enough room to breathe.</p><PlatformLinks links={links} compact /></div></div></div> }