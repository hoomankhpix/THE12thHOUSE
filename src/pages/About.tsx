import { ArrowUpRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { artist, collectiveMembers, platformLinks } from '../data/demo'
import { PlatformLinks } from '../components/PlatformLinks'
import type { PlatformLink } from '../types'
import { fetchArtistPlatformLinks } from '../lib/platformLinks'

export function About() {
  const [links, setLinks] = useState<PlatformLink[]>(platformLinks)
  useEffect(() => { void fetchArtistPlatformLinks(artist.id).then(setLinks) }, [])
  return <div className="page about-page"><section className="collective-intro"><p className="eyebrow">The collective / 12th House</p><h1>Sound, image,<br />movement, code.</h1><p className="collective-statement">A creative collective working across<br /><span>SOUND / IMAGE / MOTION / CODE</span></p></section><section className="collective-body"><div className="collective-image-wrap"><img src={artist.image} alt="12th House creative work" /><span>One house / many forms</span></div><div className="collective-copy"><p className="collective-lead">{artist.bio}</p><p>We make work that moves between disciplines without needing to announce the border. A record can become an image. An image can become a system. A system can become a place to listen.</p><PlatformLinks links={links} compact /></div></section><section className="members-section" aria-labelledby="members-title"><div className="members-heading"><p className="eyebrow">The people behind the work</p><h2 id="members-title">Three ways<br />of making.</h2></div><div className="members-list">{collectiveMembers.map((member, index) => <article className="member-entry" key={member.id}><span className="member-index">0{index + 1}</span><div className="member-main"><p className="member-discipline">{member.discipline}</p><h3>{member.name}</h3><p className="member-description">{member.description}</p></div><ArrowUpRight className="member-arrow" size={18} /></article>)}</div></section></div>
}
