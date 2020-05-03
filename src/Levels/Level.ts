import Phaser from "phaser";

import { SpriteController, PlayerController } from "../SpriteController";

export class Level {
  public controllers: SpriteController[] = [];
  public platforms: Phaser.Physics.Arcade.StaticGroup | null = null;
  public scene: Phaser.Scene | null = null;
  public onPreload: ((level: Level) => void)[] = [];
  public onCreate: ((level: Level) => void)[] = [];

  constructor(public gaem: Phaser.Game, public name: string) {}

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
    for (let func of this.onCreate) {
      func(this);
    }
  }

  addPlayerController(sprite: Phaser.Physics.Arcade.Sprite): PlayerController {
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
