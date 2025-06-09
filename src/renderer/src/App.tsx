import React, { useEffect, useRef, useCallback } from 'react'
import { Player } from './components/Player'
import spriteUrl from './assets/sprite/GandalfHardcore Character Asset Pack/Character skin colors/Male Skin4.png'

const CANVAS_SIZE = 400
const SPRITE_SCALE = 2 // 80x64 sprite scaled to 160x128
const FRAME_WIDTH = 80
const FRAME_HEIGHT = 64
const ACTIONS = ['idle', 'walk', 'run', 'jumpUp', 'jumpDown', 'throw', 'die'] as const

function App(): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const playerRef = useRef<Player>()
  const animationRef = useRef<number>(null)
  const actionIndexRef = useRef<number>(0)
  const spriteImageRef = useRef<HTMLImageElement | null>(null)

  // Cycle to next action
  const nextAction = useCallback((): void => {
    actionIndexRef.current = (actionIndexRef.current + 1) % ACTIONS.length
    playerRef.current?.setAction(ACTIONS[actionIndexRef.current])
  }, [])

  useEffect((): (() => void) => {
    playerRef.current = new Player()
    let lastTime = performance.now()

    // Load the sprite image for background visualization
    const spriteImg = new window.Image()
    spriteImg.src = spriteUrl
    spriteImg.onload = () => {
      spriteImageRef.current = spriteImg
    }

    function render(now: number): void {
      const dt = now - lastTime
      lastTime = now
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      // High-DPI support
      const dpr = window.devicePixelRatio || 1
      canvas.width = CANVAS_SIZE * dpr
      canvas.height = CANVAS_SIZE * dpr
      canvas.style.width = `${CANVAS_SIZE}px`
      canvas.style.height = `${CANVAS_SIZE}px`
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

      // Draw the whole sprite sheet as background for visualization
      if (spriteImageRef.current) {
        ctx.save()
        ctx.globalAlpha = 0.2
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(
          spriteImageRef.current,
          0,
          0,
          spriteImageRef.current.width,
          spriteImageRef.current.height,
          0,
          0,
          spriteImageRef.current.width * SPRITE_SCALE,
          spriteImageRef.current.height * SPRITE_SCALE
        )
        ctx.restore()
      }

      // Animate current action
      const currentAction = ACTIONS[actionIndexRef.current]
      playerRef.current?.setAction(currentAction)
      playerRef.current?.update(dt)
      // Get current frame for rectangle overlay
      // @ts-ignore: Accessing private frame property for debug visualization
      const frame = playerRef.current?.frame ?? 0
      const actionRow = actionIndexRef.current

      // Draw red rectangle to show current frame and row
      ctx.save()
      ctx.strokeStyle = 'red'
      ctx.lineWidth = 3
      ctx.strokeRect(
        frame * FRAME_WIDTH * SPRITE_SCALE,
        actionRow * FRAME_HEIGHT * SPRITE_SCALE,
        FRAME_WIDTH * SPRITE_SCALE,
        FRAME_HEIGHT * SPRITE_SCALE
      )
      ctx.restore()

      // Draw the player sprite at the center, feet at bottom
      const drawWidth = FRAME_WIDTH * SPRITE_SCALE
      const drawHeight = FRAME_HEIGHT * SPRITE_SCALE
      const x = (CANVAS_SIZE - drawWidth) / 2
      const y = CANVAS_SIZE - drawHeight
      playerRef.current?.draw(ctx, x, y, SPRITE_SCALE)

      animationRef.current = requestAnimationFrame(render)
    }
    animationRef.current = requestAnimationFrame(render)
    return (): void => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [])

  // Mouse click cycles animation
  useEffect((): (() => void) => {
    const handleClick = (): void => nextAction()
    const handleKey = (e: KeyboardEvent): void => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
        nextAction()
      }
    }
    window.addEventListener('mousedown', handleClick)
    window.addEventListener('keydown', handleKey)
    return (): void => {
      window.removeEventListener('mousedown', handleClick)
      window.removeEventListener('keydown', handleKey)
    }
  }, [nextAction])

  return (
    <div
      style={{
        width: CANVAS_SIZE,
        height: CANVAS_SIZE,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent'
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', background: 'transparent' }} />
    </div>
  )
}

export default App
