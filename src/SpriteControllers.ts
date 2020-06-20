import Phaser from "phaser";
import { Level } from "./Level";

export abstract class SpriteController {
  constructor(
    public scene: Phaser.Scene,
    public sprite: Phaser.Physics.Arcade.Sprite
  ) {}

  abstract update(total: number, delta: number): void;
}

export enum HorDir {
  LEFT = "LEFT",
  RIGHT = "RIGHT",
  NONE = "NONE",
}

export enum EntityType {
  ENTITY = "ENTITY",
  PLAYER = "PLAYER",
  ENEMY = "ENEMY",
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

  currentHorDir: HorDir = HorDir.NONE;
  shouldJump: boolean = false;

  // TODO add to a collision group in Level
  public overlapsWith: EntityType[] = []

  constructor(scene: Phaser.Scene, sprite: Phaser.Physics.Arcade.Sprite) {
    super(scene, sprite);

    this.sprite.setMaxVelocity(this._maxXVel, this._maxYVel);
    this.sprite.setDataEnabled();

    this.type = EntityType.ENTITY;
  }

  set type(type: EntityType) {
    this.sprite.data.set("type", type);
  }

  get type(): EntityType {
    return this.sprite.data.get("type");
  }

  set maxXVel(newMax: number) {
    this._maxXVel = newMax;
    this.sprite.setMaxVelocity(this._maxXVel, this._maxYVel);
  }

  set maxYVel(newMax: number) {
    this._maxYVel = newMax;
    this.sprite.setMaxVelocity(this._maxXVel, this._maxYVel);
  }

  handleOverlap(other: EntityController, level: Level) {  }

  updateMotion() {
    if (this.currentHorDir == HorDir.NONE) {
      this.stepXAccel = 0;
      this.stepXVel = 0;
    } else if (this.currentHorDir == HorDir.LEFT) {
      // left key is down
      if (this.sprite.body.velocity.x > -this.minXVel) {
        this.stepXVel = -this.minXVel;
      }
      this.stepXAccel = -this.xAccel;
    } else {
      // right key is down
      if (this.sprite.body.velocity.x < this.minXVel) {
        this.stepXVel = this.minXVel;
      }
      this.stepXAccel = this.xAccel;
    }

    if (this.shouldJump && this.sprite.body.blocked.down) {
      this.stepYVel = this.jumpInitialVel;
    }
  }

  update(): void {
    if (!this.locked) {
      this.updateMotion();

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

  private _lastKeyWasLeft: boolean = false;
  private _jumpReleased: boolean = true;

  constructor(scene: Phaser.Scene, sprite: Phaser.Physics.Arcade.Sprite) {
    super(scene, sprite);
    this.type = EntityType.PLAYER;

    const keyboard = scene.input.keyboard;

    this.leftKey = keyboard.addKey("A");
    this.rightKey = keyboard.addKey("D");
    this.jumpKey = keyboard.addKey("SPACE");
  }

  updateDirection(): void {
    if (this.leftKey.isDown && this.rightKey.isDown) {
      this.currentHorDir = this._lastKeyWasLeft ? HorDir.RIGHT : HorDir.LEFT;
    } else if (this.leftKey.isDown) {
      this._lastKeyWasLeft = true;
      this.currentHorDir = HorDir.LEFT;
    } else if (this.rightKey.isDown) {
      this._lastKeyWasLeft = false;
      this.currentHorDir = HorDir.RIGHT;
    } else {
      this.currentHorDir = HorDir.NONE;
    }
  }

  updateJump(): void {
    this.shouldJump = false;
    if (this.jumpKey.isUp) {
      this._jumpReleased = true;
    } else if (this.jumpKey.isDown && this._jumpReleased) {
      this._jumpReleased = false;
      this.shouldJump = true;
    }
  }

  update(): void {
    if (!this.locked) {
      this.updateDirection();
      this.updateJump();
    }
    super.update();
  }
}

export class SimpleEnemy extends EntityController {
  constructor(scene: Phaser.Scene, sprite: Phaser.Physics.Arcade.Sprite) {
    super(scene, sprite);
    this.type = EntityType.ENEMY;
  }
}
