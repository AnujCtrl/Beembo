// Player.ts
// Player class for handling sprite animation and rendering

import spriteUrl from '../assets/sprite/GandalfHardcore Character Asset Pack/Character skin colors/Male Skin4.png'

// Sprite sheet details
const FRAME_WIDTH = 80 // px per frame
const FRAME_HEIGHT = 64 // px per frame
const ACTIONS = [
  'idle', // 1st row
  'walk', // 2nd row
  'run', // 3rd row
  'jumpUp', // 4th row
  'jumpDown', // 5th row
  'throw', // 6th row
  'die' // 7th row
]

export type PlayerAction = (typeof ACTIONS)[number]

export class Player {
  private image: HTMLImageElement
  private loaded: boolean = false
  private frame: number = 0
  private action: PlayerAction = 'idle'
  private frameCounts: Record<PlayerAction, number> = {
    idle: 5,
    walk: 8,
    run: 8,
    jumpUp: 4,
    jumpDown: 4,
    throw: 6,
    die: 10
  }
  private frameTimer: number = 0
  private frameInterval: number = 1000 / 12 // 60 FPS default

  constructor() {
    this.image = new window.Image()
    this.image.src = spriteUrl
    this.image.onload = () => {
      this.loaded = true
    }
  }

  setAction(action: PlayerAction): void {
    if (ACTIONS.includes(action) && this.action !== action) {
      this.action = action
      this.frame = 0
      this.frameTimer = 0
    }
  }

  update(dt: number): void {
    if (!this.loaded) return
    this.frameTimer += dt
    if (this.frameTimer > this.frameInterval) {
      this.frame = (this.frame + 1) % this.frameCounts[this.action]
      this.frameTimer = 0
    }
  }

  draw(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number = 5): void {
    if (!this.loaded) return
    const actionIndex = ACTIONS.indexOf(this.action)
    ctx.save()
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(
      this.image,
      this.frame * FRAME_WIDTH,
      actionIndex * FRAME_HEIGHT,
      FRAME_WIDTH,
      FRAME_HEIGHT,
      x,
      y,
      FRAME_WIDTH * scale,
      FRAME_HEIGHT * scale
    )
    ctx.restore()
  }
}

// Usage:
// const player = new Player();
// player.setAction('walk');
// player.update(dt);
// player.draw(ctx, x, y, scale);
//
// Actions: idle, walk, walkFast, run, jump, throw, die
