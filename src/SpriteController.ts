import Phaser from "phaser"

export abstract class SpriteController {
  constructor(public scene: Phaser.Scene, public sprite: Phaser.Physics.Arcade.Sprite) {}

  abstract update(total:number, delta:number): void
}

export class PlayerController extends SpriteController {
  public leftKey: Phaser.Input.Keyboard.Key
  public rightKey: Phaser.Input.Keyboard.Key
  public jumpKey: Phaser.Input.Keyboard.Key

  private _maxXVel: number = 400
  private _maxYVel: number = 400
  public minXVel: number = 300

  private _lastKeyWasLeft: boolean = false

  public xAccel: number = 300
  // public stopAccel: number = -30
  public jumpInitialVel: number = -300

  constructor(scene: Phaser.Scene, sprite: Phaser.Physics.Arcade.Sprite) {
    super(scene, sprite)

    const keyboard = scene.input.keyboard 

    this.leftKey = keyboard.addKey("A")
    this.rightKey = keyboard.addKey("D")
    this.jumpKey = keyboard.addKey("SPACE")

    this.sprite.setMaxVelocity(this._maxXVel)
    this.sprite.setMaxVelocity(this._maxYVel)
  }

  directionIsLeft(): boolean | null {
    if (this.leftKey.isDown && this.rightKey.isDown) {
      return !this._lastKeyWasLeft
    } else if (this.leftKey.isDown) {
      this._lastKeyWasLeft = true
      return true
    } else if (this.rightKey.isDown) {
      this._lastKeyWasLeft = false
      return false
    } else {
      return null
    }
  }

  update(elapsed:number, delta:number): void {
    const directionIsLeft: boolean | null = this.directionIsLeft()
    if (directionIsLeft == null) {
      // no horizontal keys are down
      this.sprite.setAccelerationX(0)
      this.sprite.setVelocityX(0)
    } else if (directionIsLeft) {
      // left key is down
      if (this.sprite.body.velocity.x > -this.minXVel) {
        this.sprite.setVelocityX(-this.minXVel)
      }
      this.sprite.setAccelerationX(-this.xAccel)
    } else {
      // right key is down
      if (this.sprite.body.velocity.x < this.minXVel) {
        this.sprite.setVelocityX(this.minXVel)
      }
      this.sprite.setAccelerationX(this.xAccel)
    }

    if (this.jumpKey.isDown) {
      this.sprite.setVelocityY(this.jumpInitialVel)
    }
  }
}