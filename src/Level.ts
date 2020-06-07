import Phaser, { GameObjects } from "phaser";
import Sprite = Phaser.Physics.Arcade.Sprite;
import StaticGroup = Phaser.Physics.Arcade.StaticGroup;
import StaticTilemapLayer = Phaser.Tilemaps.StaticTilemapLayer;
import GameObject = GameObjects.GameObject;

import { SpriteController, PlayerController } from "./SpriteController.module";
import { Inventory } from "./Inventory";
import { handle } from "./TileObjects";

export class Level {
  public hero: Sprite | null = null;
  public heroController: PlayerController | null = null;
  public tilemap: Phaser.Tilemaps.Tilemap | null = null;
  public tileset: Phaser.Tilemaps.Tileset | null = null;
  public collisionLayer: StaticTilemapLayer | null = null;
  public controllers: SpriteController[] = [];
  public platforms: StaticGroup | null = null;
  public touchables: StaticGroup | null = null;
  public scene: Phaser.Scene | null = null;
  public onPreload: ((level: Level) => void)[] = [];
  public onCreate: ((level: Level) => void)[] = [];
  public paused: boolean = true;

  constructor(
    public gaem: Phaser.Game,
    public name: string,
    public inventory: Inventory
  ) {}

  getScene(): Phaser.Scene {
    return this.scene as Phaser.Scene;
  }

  preload() {
    this.scene = this.gaem.scene.getScene(this.name);

    for (let func of this.onPreload) {
      func(this);
    }
  }

  create() {
    const scene: Phaser.Scene = this.getScene();
    this.platforms = scene.physics.add.staticGroup();
    this.touchables = scene.physics.add.staticGroup();
    for (let func of this.onCreate) {
      func(this);
    }

    const hero = this.hero as Sprite;
    scene.physics.add.collider(
      hero as Sprite,
      this.collisionLayer as StaticTilemapLayer
    );
    scene.physics.add.collider(
      hero,
      this.platforms,
      (hero: GameObject, thingy: GameObject) => {
        handle(hero, thingy, this);
      }
    );
    scene.physics.add.overlap(
      hero,
      this.touchables,
      (hero: GameObject, thingy: GameObject) => {
        handle(hero, thingy, this);
      }
    );
  }

  addPlayerController(sprite: Sprite): PlayerController {
    const scene: Phaser.Scene = this.getScene();
    const controller = new PlayerController(scene, sprite);
    this.controllers.push(controller);
    return controller;
  }

  // TODO move this to level builder
  addPlatform(x: number, y: number, texture: string): any {
    return this.platforms?.create(x, y, texture);
  }

  update(elapsed: number, delta: number) {
    if (!this.paused) {
      for (let controller of this.controllers) {
        controller.update(elapsed, delta);
      }
    }
  }

  death(actor: GameObject) {
    console.log("DEATH!");

    // TODO move to controller
    const sprite: Sprite = actor as Sprite;
    sprite.disableBody();
    sprite.setAcceleration(0);
    sprite.setVelocity(0);
    sprite.tint = 0xff0000;

    // TODO Figure out how to do this
    // turn off gravity

    this.controllers.forEach(
      (controller) => ((controller as PlayerController).locked = true)
    );

    // TODO: something more controlled
    setTimeout(() => window.location.reload(), 1000);
  }
}
