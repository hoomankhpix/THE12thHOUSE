import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent, type TouchEvent, type WheelEvent } from 'react'

interface InteractiveIntroProps {
  artistName: string
  onComplete?: () => void
}

interface Point {
  x: number
  y: number
}

const MOVEMENT_STEP = 24

export function InteractiveIntro({ artistName, onComplete }: InteractiveIntroProps) {
  const letters = useMemo(() => Array.from(artistName).filter((character) => character.trim()), [artistName])
  const [placedLetters, setPlacedLetters] = useState<Point[]>([])
  const [isReducedMotion, setIsReducedMotion] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const lastPointRef = useRef<Point | null>(null)
  const movementRef = useRef(0)
  const completedRef = useRef(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setIsReducedMotion(mediaQuery.matches)
    updatePreference()
    mediaQuery.addEventListener('change', updatePreference)
    return () => mediaQuery.removeEventListener('change', updatePreference)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('intro-is-active', !isComplete)
    return () => document.body.classList.remove('intro-is-active')
  }, [isComplete])

  function completeIntro() {
    if (completedRef.current) return
    completedRef.current = true
    setIsComplete(true)
    onComplete?.()
  }

  function placeNextLetter(point: Point) {
    if (completedRef.current || placedLetters.length >= letters.length) return
    const nextLetters = [...placedLetters, point]
    setPlacedLetters(nextLetters)
    if (nextLetters.length === letters.length) completeIntro()
  }

  function consumeMovement(point: Point, distance = 0) {
    const previous = lastPointRef.current
    const delta = previous ? Math.hypot(point.x - previous.x, point.y - previous.y) : distance
    lastPointRef.current = point
    movementRef.current += delta
    if (movementRef.current >= MOVEMENT_STEP) {
      movementRef.current -= MOVEMENT_STEP
      placeNextLetter(point)
    }
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    consumeMovement({ x: event.clientX, y: event.clientY })
  }

  function handleTouchMove(event: TouchEvent<HTMLDivElement>) {
    const touch = event.touches[0]
    if (!touch) return
    event.preventDefault()
    consumeMovement({ x: touch.clientX, y: touch.clientY })
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    event.preventDefault()
    const point = lastPointRef.current ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    consumeMovement(point, Math.hypot(event.deltaX, event.deltaY))
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      completeIntro()
    }
  }

  const progress = letters.length ? `${placedLetters.length} / ${letters.length}` : '0 / 0'
  return <div className={`interactive-intro ${isComplete ? 'is-complete' : ''} ${isReducedMotion ? 'is-reduced-motion' : ''}`} onPointerMove={handlePointerMove} onPointerDown={handlePointerMove} onTouchMove={handleTouchMove} onWheel={handleWheel} onKeyDown={handleKeyDown} role="dialog" aria-label={`${artistName} typographic introduction`} aria-modal="true" tabIndex={-1}>
    <div className="intro-drawing" aria-label={isComplete ? artistName : `Draw ${artistName}`}>
      {letters.map((letter, index) => <span className={`intro-letter ${index < placedLetters.length ? 'is-placed' : ''}`} style={{ '--letter-x': `${placedLetters[index]?.x ?? -100}px`, '--letter-y': `${placedLetters[index]?.y ?? -100}px` } as CSSProperties} key={`${letter}-${index}`}>{letter}</span>)}
    </div>
    <div className="intro-meta"><span>{isReducedMotion ? 'Reduced motion' : 'Move / scroll to draw'}</span><span>{progress}</span></div>
    {isReducedMotion && !isComplete && <button className="intro-continue" onClick={completeIntro}>Continue <span aria-hidden="true">↗</span></button>}
  </div>
}
