import Phaser, { GameObjects } from "phaser";
import Sprite = Phaser.Physics.Arcade.Sprite;
import StaticGroup = Phaser.Physics.Arcade.StaticGroup;
import Group = Phaser.Physics.Arcade.Group
import StaticTilemapLayer = Phaser.Tilemaps.StaticTilemapLayer;
import GameObject = GameObjects.GameObject;

import { PlayerController, EntityController, EntityType } from "./SpriteControllers";
import { Inventory } from "./Inventory";
import { handle } from "./CollisionHandlers";

export class Level {
  public hero: Sprite | null = null;
  public heroController: PlayerController | null = null;
  public entities: EntityController[] = [];
  public tilemap: Phaser.Tilemaps.Tilemap | null = null;
  public tileset: Phaser.Tilemaps.Tileset | null = null;
  public collisionLayer: StaticTilemapLayer | null = null;
  public platforms: StaticGroup | null = null;
  public touchables: StaticGroup | null = null;
  public entityGroups: Record<string, Group> = {};
  public overlappingGroups: Record<string, Group> = {};
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

    const entSprites: GameObject[] = this.entities.map((ent) => ent.sprite);
    scene.physics.add.collider(
      entSprites,
      this.platforms,
      (entity: GameObject, thingy: GameObject) => {
        handle(entity, thingy, this);
      }
    );
    scene.physics.add.collider(
      entSprites,
      this.collisionLayer as StaticTilemapLayer
    );
    scene.physics.add.overlap(
      entSprites,
      this.touchables,
      (entity: GameObject, thingy: GameObject) => {
        handle(entity, thingy, this);
      }
    );
    for(let key in this.overlappingGroups) {
      const group:Group = this.overlappingGroups[key]
      const entGroup:Group = this.entityGroups[key]
      scene.physics.add.overlap(entGroup, group, (entity:GameObject, groupEntity: GameObject) => {
        console.log("TODO: hook this handler up to something. Think about adding a overlapStart and End event (need to manully program)")
      })
    }
  }

  addPlayerController(sprite: Sprite): PlayerController {
    const scene: Phaser.Scene = this.getScene();
    const controller = new PlayerController(scene, sprite);
    this.add(controller);
    return controller;
  }

  // TODO move this to level builder
  addPlatform(x: number, y: number, texture: string): any {
    return this.platforms?.create(x, y, texture);
  }

  addEntToGroup(groups: Record<string, Group>, ent: EntityController, type: EntityType) {
    let group:Group
    if (type in groups) {
      group = groups[type]
    }
    else {
      group = this.getScene().physics.add.group()
      groups[type] = group
    }
    group.add(ent.sprite)
  }

  add(ent: EntityController) {
    this.entities.push(ent);
    this.addEntToGroup(this.entityGroups, ent, ent.type)
    for (let type of ent.overlapsWith) {
      this.addEntToGroup(this.overlappingGroups, ent, type)
    }
  }

  find(sprite: Sprite): EntityController | undefined {
    return this.entities.find((ent) => ent.sprite == sprite);
  }

  destroy(entity: EntityController) {
    this.entities.splice(this.entities.indexOf(entity), 1);
    entity.sprite.destroy();
  }

  /*
   * Lifecycle functions
   */

  update(elapsed: number, delta: number) {
    if (!this.paused) {
      for (let entity of this.entities) {
        entity.update();
      }
    }
  }

  death(actor: GameObject) {
    // TODO move to controller
    const sprite: Sprite = actor as Sprite;
    sprite.disableBody();
    sprite.setAcceleration(0);
    sprite.setVelocity(0);
    sprite.tint = 0xff0000;

    const ent: EntityController = this.find(sprite) as EntityController;
    ent.locked = true;

    if (actor == this.hero) {
      console.log("YOU DIED!!!!");
      this.paused = true;
      setTimeout(() => window.location.reload(), 1000);
    } else {
      setTimeout(() => this.destroy(ent), 1000);
    }

    // TODO: something more controlled
  }
}
