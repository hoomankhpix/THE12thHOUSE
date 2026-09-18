import { Pause, Play } from 'lucide-react'
import type { Track } from '../types'
import { useAudioPlayer } from '../context/AudioPlayerContext'

export function TrackRow({ track, queue }: { track: Track; queue: Track[] }) {
  const { currentTrack, isPlaying, setQueue, playTrack, pauseTrack } = useAudioPlayer()
  const isCurrent = currentTrack?.id === track.id
  const handlePlay = () => { setQueue(queue); if (isCurrent && isPlaying) pauseTrack(); else playTrack(track) }
  return <div className={`track-row ${isCurrent ? 'is-current' : ''}`}><span>{String(track.trackNumber).padStart(2, '0')}</span><button onClick={handlePlay} aria-label={`${isCurrent && isPlaying ? 'Pause' : 'Play'} ${track.title}`}><span className="track-row-icon">{isCurrent && isPlaying ? <Pause size={13} /> : <Play size={13} fill="currentColor" />}</span>{track.title}</button><span>{track.duration}</span></div>
}