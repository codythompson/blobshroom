import Phaser from "phaser";

export abstract class SpriteController {
  constructor(
    public scene: Phaser.Scene,
    public sprite: Phaser.Physics.Arcade.Sprite
  ) {}

  abstract update(total: number, delta: number): void;
}

export class EntityController extends SpriteController {
  public locked: boolean = false;

  private _maxXVel: number = 400;
  private _maxYVel: number = 600;
  public minXVel: number = 300;

  public xAccel: number = 300;
  // public stopAccel: number = -30
  public jumpInitialVel: number = -600;

  stepXVel: number | null = null;
  stepYVel: number | null = null;
  stepXAccel: number | null = null;

  constructor(scene: Phaser.Scene, sprite: Phaser.Physics.Arcade.Sprite) {
    super(scene, sprite);

    this.sprite.setMaxVelocity(this._maxXVel);
    this.sprite.setMaxVelocity(this._maxYVel);
  }

  update(): void {
    if (!this.locked) {
      if (this.stepXAccel != null) {
        this.sprite.setAccelerationX(this.stepXAccel);
      }
      if (this.stepXVel != null) {
        this.sprite.setVelocityX(this.stepXVel);
      }
      if (this.stepYVel != null) {
        this.sprite.setVelocityY(this.stepYVel);
      }
    }

    this.stepXAccel = null;
    this.stepXVel = null;
    this.stepYVel = null;
  }
}

export class PlayerController extends EntityController {
  public leftKey: Phaser.Input.Keyboard.Key;
  public rightKey: Phaser.Input.Keyboard.Key;
  public jumpKey: Phaser.Input.Keyboard.Key;

  // public locked: boolean = false;

  // private _maxXVel: number = 400;
  // private _maxYVel: number = 600;
  // public minXVel: number = 300;

  private _lastKeyWasLeft: boolean = false;
  private _jumpReleased: boolean = true;

  // public xAccel: number = 300;
  // // public stopAccel: number = -30
  // public jumpInitialVel: number = -600;

  constructor(scene: Phaser.Scene, sprite: Phaser.Physics.Arcade.Sprite) {
    super(scene, sprite);

    const keyboard = scene.input.keyboard;

    this.leftKey = keyboard.addKey("A");
    this.rightKey = keyboard.addKey("D");
    this.jumpKey = keyboard.addKey("SPACE");
  }

  directionIsLeft(): boolean | null {
    if (this.leftKey.isDown && this.rightKey.isDown) {
      return !this._lastKeyWasLeft;
    } else if (this.leftKey.isDown) {
      this._lastKeyWasLeft = true;
      return true;
    } else if (this.rightKey.isDown) {
      this._lastKeyWasLeft = false;
      return false;
    } else {
      return null;
    }
  }

  updatePhysicsSetttings() {
    const directionIsLeft: boolean | null = this.directionIsLeft();
    if (directionIsLeft == null) {
      // no horizontal keys are down
      // this.sprite.setAccelerationX(0);
      // this.sprite.setVelocityX(0);
      this.stepXAccel = 0;
      this.stepXVel = 0;
    } else if (directionIsLeft) {
      // left key is down
      if (this.sprite.body.velocity.x > -this.minXVel) {
        // this.sprite.setVelocityX(-this.minXVel);
        this.stepXVel = -this.minXVel;
      }
      // this.sprite.setAccelerationX(-this.xAccel);
      this.stepXAccel = -this.xAccel;
    } else {
      // right key is down
      if (this.sprite.body.velocity.x < this.minXVel) {
        // this.sprite.setVelocityX(this.minXVel);
        this.stepXVel = this.minXVel;
      }
      // this.sprite.setAccelerationX(this.xAccel);
      this.stepXAccel = this.xAccel;
    }

    if (this.jumpKey.isUp) {
      this._jumpReleased = true;
    } else if (
      this.jumpKey.isDown &&
      this.sprite.body.blocked.down &&
      this._jumpReleased
    ) {
      this._jumpReleased = false;
      // this.sprite.setVelocityY(this.jumpInitialVel);
      this.stepYVel = this.jumpInitialVel;
    }
  }

  // update(elapsed: number, delta: number): void {
  update(): void {
    if (!this.locked) {
      this.updatePhysicsSetttings();
    }
    super.update();
  }
}
