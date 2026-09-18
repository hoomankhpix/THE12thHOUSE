import { AlertCircle, LoaderCircle, Pause, Play, SkipBack, SkipForward, Volume2 } from 'lucide-react'
import { useAudioPlayer } from '../context/AudioPlayerContext'

const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`

export function GlobalAudioPlayer() {
  const { currentTrack, isPlaying, status, error, currentTime, duration, volume, togglePlay, nextTrack, previousTrack, seekTo, setVolume } = useAudioPlayer()
  if (!currentTrack) return null
  const artwork = currentTrack.artwork
  return <aside className="player-bar" aria-label="Global audio player">
    {artwork ? <img className="player-artwork" src={artwork} alt="" /> : <div className="player-artwork player-artwork-empty" aria-hidden="true">12H</div>}
    <div className="player-info"><span className="player-kicker">{status === 'loading' ? 'Loading' : 'Now playing'}</span><strong>{currentTrack.title}</strong><span>{currentTrack.artistName ?? '12th House'}{error ? ` / ${error}` : ''}</span></div>
    <div className="player-controls"><button onClick={previousTrack} aria-label="Previous track"><SkipBack size={16} /></button><button className="play-button" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'} disabled={status === 'loading'}>{status === 'loading' ? <LoaderCircle className="spin" size={16} /> : isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}</button><button onClick={nextTrack} aria-label="Next track"><SkipForward size={16} /></button></div>
    <div className="player-progress"><span>{formatTime(currentTime)}</span><input aria-label="Seek through track" type="range" min="0" max={duration || 1} value={Math.min(currentTime, duration || 1)} onChange={(event) => seekTo(Number(event.target.value))} /><span>{duration ? formatTime(duration) : '--:--'}</span></div>
    <label className="volume"><Volume2 size={15} /><input aria-label="Volume" type="range" min="0" max="1" step="0.05" value={volume} onChange={(event) => setVolume(Number(event.target.value))} /></label>
    {error && <span className="player-error" role="status"><AlertCircle size={13} />Unavailable</span>}
  </aside>
}