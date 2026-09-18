import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { Track } from '../types'

export type AudioPlayerStatus = 'idle' | 'loading' | 'ready' | 'error'

interface AudioPlayerContextValue {
  queue: Track[]
  currentTrack: Track | null
  isPlaying: boolean
  status: AudioPlayerStatus
  error: string | null
  currentTime: number
  duration: number
  volume: number
  playTrack: (track: Track) => void
  pauseTrack: () => void
  togglePlay: () => void
  nextTrack: () => void
  previousTrack: () => void
  seekTo: (time: number) => void
  setVolume: (volume: number) => void
  setQueue: (tracks: Track[]) => void
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null)

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const queueRef = useRef<Track[]>([])
  const currentTrackRef = useRef<Track | null>(null)
  const currentTimeRef = useRef(0)
  const durationRef = useRef(0)
  const [queue, setQueueState] = useState<Track[]>([])
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [status, setStatus] = useState<AudioPlayerStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(0.8)

  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'metadata'
    audio.volume = volume
    audioRef.current = audio

    const onLoadStart = () => { setStatus('loading'); setError(null); setDuration(0) }
    const onLoadedMetadata = () => { const nextDuration = Number.isFinite(audio.duration) ? audio.duration : 0; durationRef.current = nextDuration; setStatus('ready'); setDuration(nextDuration) }
    const onTimeUpdate = () => { currentTimeRef.current = audio.currentTime; setCurrentTime(audio.currentTime) }
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onError = () => { setStatus('error'); setIsPlaying(false); setError('This audio file could not be loaded.') }
    const onEnded = () => { const tracks = queueRef.current; const current = currentTrackRef.current; const index = tracks.findIndex((track) => track.id === current?.id); const next = tracks[index + 1]; if (next) playTrack(next); else { setIsPlaying(false); setCurrentTime(0) } }

    audio.addEventListener('loadstart', onLoadStart)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('error', onError)
    audio.addEventListener('ended', onEnded)
    return () => { audio.pause(); audio.removeEventListener('loadstart', onLoadStart); audio.removeEventListener('loadedmetadata', onLoadedMetadata); audio.removeEventListener('timeupdate', onTimeUpdate); audio.removeEventListener('play', onPlay); audio.removeEventListener('pause', onPause); audio.removeEventListener('error', onError); audio.removeEventListener('ended', onEnded); audioRef.current = null }
  }, [])

  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume }, [volume])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
      if (event.code === 'Space') { event.preventDefault(); togglePlay() }
      if (event.key === 'ArrowLeft') seekTo(Math.max(0, currentTimeRef.current - 5))
      if (event.key === 'ArrowRight') seekTo(Math.min(durationRef.current, currentTimeRef.current + 5))
      if (event.key.toLowerCase() === 'n') nextTrack()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [currentTrack, isPlaying, queue])

  const setQueue = (tracks: Track[]) => { queueRef.current = tracks; setQueueState(tracks) }

  const playTrack = (track: Track) => {
    const audio = audioRef.current
    currentTrackRef.current = track
    setCurrentTrack(track)
    setCurrentTime(0)
    setError(null)
    if (!queueRef.current.some((queuedTrack) => queuedTrack.id === track.id)) setQueue([track])
    if (!track.audioUrl) { audio?.removeAttribute('src'); audio?.load(); setStatus('error'); setError('Audio is not available for this track yet.'); setIsPlaying(false); return }
    if (!audio) return
    if (audio.src !== track.audioUrl) { audio.src = track.audioUrl; audio.load() }
    setStatus('loading')
    void audio.play().catch(() => { setStatus('error'); setIsPlaying(false); setError('Playback was blocked or the audio file is unavailable.') })
  }

  const pauseTrack = () => { audioRef.current?.pause() }
  const togglePlay = () => { if (!currentTrack) return; if (isPlaying) pauseTrack(); else playTrack(currentTrack) }
  const nextTrack = () => { const index = queueRef.current.findIndex((track) => track.id === currentTrackRef.current?.id); const next = queueRef.current[index + 1]; if (next) playTrack(next) }
  const previousTrack = () => { const audio = audioRef.current; if (audio && audio.currentTime > 3) { seekTo(0); return }; const index = queueRef.current.findIndex((track) => track.id === currentTrackRef.current?.id); const previous = queueRef.current[index - 1]; if (previous) playTrack(previous) }
  const seekTo = (time: number) => { const nextTime = Math.max(0, Math.min(time, durationRef.current || time)); if (audioRef.current) audioRef.current.currentTime = nextTime; currentTimeRef.current = nextTime; setCurrentTime(nextTime) }
  const setVolume = (nextVolume: number) => setVolumeState(Math.max(0, Math.min(1, nextVolume)))

  return <AudioPlayerContext.Provider value={{ queue, currentTrack, isPlaying, status, error, currentTime, duration, volume, playTrack, pauseTrack, togglePlay, nextTrack, previousTrack, seekTo, setVolume, setQueue }}>{children}</AudioPlayerContext.Provider>
}

export function useAudioPlayer() { const context = useContext(AudioPlayerContext); if (!context) throw new Error('useAudioPlayer must be used inside AudioPlayerProvider'); return context }