import Phaser, { GameObjects } from "phaser";
import Sprite = Phaser.Physics.Arcade.Sprite
import StaticGroup = Phaser.Physics.Arcade.StaticGroup
import StaticTilemapLayer = Phaser.Tilemaps.StaticTilemapLayer

import { SpriteController, PlayerController } from "../SpriteController";
import { Inventory } from "../Inventory";
import { handle } from "../TileObjects";

export class Level {
  public hero: Sprite | null = null
  public heroController: PlayerController | null = null
  public tilemap: Phaser.Tilemaps.Tilemap | null = null
  public tileset: Phaser.Tilemaps.Tileset | null = null
  public worldLayer: StaticTilemapLayer|null = null
  public objectLayer: Phaser.Tilemaps.ObjectLayer|null = null
  public controllers: SpriteController[] = [];
  public platforms: StaticGroup | null = null
  public touchables: StaticGroup | null = null
  public scene: Phaser.Scene | null = null;
  public onPreload: ((level: Level) => void)[] = [];
  public onCreate: ((level: Level) => void)[] = [];

  constructor(public gaem: Phaser.Game, public name: string, public inventory: Inventory) {}

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
    const scene: Phaser.Scene = this.getScene()
    this.platforms = scene.physics.add.staticGroup()
    this.touchables = scene.physics.add.staticGroup()
    for (let func of this.onCreate) {
      func(this)
    }

    const hero = this.hero as Sprite
    scene.physics.add.collider(hero as Sprite, this.worldLayer as StaticTilemapLayer)
    scene.physics.add.collider(hero, this.platforms, (hero:GameObjects.GameObject, thingy:GameObjects.GameObject) => {
      handle(hero, thingy, this.inventory)
    })
    scene.physics.add.overlap(hero, this.touchables, (hero:GameObjects.GameObject, thingy:GameObjects.GameObject) => {
      handle(hero, thingy, this.inventory)
    })
  }

  addPlayerController(sprite: Sprite): PlayerController {
    const scene: Phaser.Scene = this.getScene();
    const controller = new PlayerController(scene, sprite);
    this.controllers.push(controller);
    return controller;
  }

  addPlatform(x: number, y: number, texture: string): any {
    return this.platforms?.create(x, y, texture);
  }

  update(elapsed: number, delta: number) {
    for (let controller of this.controllers) {
      controller.update(elapsed, delta);
    }
  }
}
