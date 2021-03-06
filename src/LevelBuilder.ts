import Phaser, { Physics } from "phaser";

import { Level } from "./Level";
import { Inventory } from "./Inventory";
import { TiledBaseObj } from "./TileObjects";

export type AssetInfo = {
  name: string;
  path: string;
};

export const HERO_ASSET_INFO = {
  name: "heroblob",
  path: "assets/png/heroblob2.png",
};
export const HERO_TINT = 0xff0f0000;

const SOLID_PLATFORM_INDEX = 5;
const JUMP_THROUGH_PLATFORM_INDEX = 56;

export type PlatformInfo = {
  x: number;
  y: number;
  texture: string;
};

export type TilemapInfo = {
  tilemap: AssetInfo;
  tileset: AssetInfo;
  tileWidth: number;
  tileHeight: number;
};

export type LayerInfo = {
  name: string;
  scrollFactorX: number;
  scrollFactorY: number;
};

export class LevelBuilder {
  static start(): LevelBuilder {
    return new LevelBuilder();
  }

  public level: Level | null = null;
  public onPreload: ((level: Level) => void) | null = null;
  public onCreate: ((level: Level) => void) | null = null;
  public onCreateLast: ((level: Level) => void) | null = null;
  public onUpdate: ((level: Level) => void) | null = null;
  public _tilemap: TilemapInfo | null = null;
  public fgLayers: LayerInfo[] = [];
  public bgLayers: LayerInfo[] = [];
  public images: AssetInfo[] = [];
  public sounds: AssetInfo[] = [];
  public platforms: PlatformInfo[] = [];

  tilemap(
    csvName: string,
    csvPath: string,
    tilesetName: string,
    tilesetPath: string,
    tileWidth: number = 32,
    tileHeight: number = 32
  ): LevelBuilder {
    this._tilemap = {
      tilemap: {
        name: csvName,
        path: csvPath,
      },
      tileset: {
        name: tilesetName,
        path: tilesetPath,
      },
      tileWidth,
      tileHeight,
    };
    return this;
  }

  fgLayer(
    name: string,
    scrollFactorX: number = 1,
    scrollFactorY?: number
  ): LevelBuilder {
    scrollFactorY = scrollFactorY == undefined ? scrollFactorX : scrollFactorY;
    this.fgLayers.push({ name, scrollFactorX, scrollFactorY });
    return this;
  }

  bgLayer(
    name: string,
    scrollFactorX: number = 1,
    scrollFactorY?: number
  ): LevelBuilder {
    scrollFactorY = scrollFactorY == undefined ? scrollFactorX : scrollFactorY;
    this.bgLayers.unshift({ name, scrollFactorX, scrollFactorY });
    return this;
  }

  image(name: string, path: string): LevelBuilder {
    this.images.push({ name, path });
    return this;
  }

  sound(name: string, path: string): LevelBuilder {
    this.sounds.push({ name, path });
    return this;
  }

  platform(x: number, y: number, texture: string): LevelBuilder {
    this.platforms.push({ x, y, texture });
    return this;
  }

  loop(
    max: number,
    callback: (builder: LevelBuilder, index: number) => void
  ): LevelBuilder {
    const callbackCaller = (index: number) => {
      callback(this, index);
    };
    for (let i = 0; i < max; i++) {
      callbackCaller(i);
    }
    return this;
  }

  on(event: string, callback: (level: Level) => void): LevelBuilder {
    if (event == "preload") {
      this.onPreload = callback;
    } else if (event == "create") {
      this.onCreate = callback;
    } else if (event == "createlast") {
      this.onCreateLast = callback;
    }
    return this;
  }

  private _preload(level: Level) {
    const scene: Phaser.Scene = level.scene as Phaser.Scene;
    scene.load.image(HERO_ASSET_INFO.name, HERO_ASSET_INFO.path);
    if (this._tilemap != null) {
      const {
        tilemap,
        tileset,
        tileWidth: frameWidth,
        tileHeight: frameHeight,
      } = this._tilemap;
      scene.load.image(tileset.name, tileset.path);
      scene.load.spritesheet(`${tileset.name}_sheet`, tileset.path, {
        frameWidth,
        frameHeight,
      });
      scene.load.tilemapTiledJSON(tilemap.name, tilemap.path);
    }
    for (let imgInfo of this.images) {
      scene.load.image(imgInfo.name, imgInfo.path);
    }
    for (let soundInfo of this.sounds) {
      scene.load.audio(soundInfo.name, soundInfo.path);
    }
  }

  private _create(level: Level) {
    const scene: Phaser.Scene = level.scene as Phaser.Scene;

    if (this._tilemap != null) {
      const { tilemap, tileset, tileWidth, tileHeight } = this._tilemap;
      level.tilemap = scene.make.tilemap({
        key: tilemap.name,
        width: tileWidth,
        height: tileHeight,
      });

      level.tileset = level.tilemap.addTilesetImage(tileset.name);

      this.setupLayers(level, this.bgLayers);

      // create the object layer (touchables powerups, etc.)
      level.tilemap.getObjectLayer("objects").objects.forEach((obj) => {
        obj.x = obj.x as number;
        obj.y = obj.y as number;
        switch (obj.type) {
          case "object":
            let baseObj: TiledBaseObj;
            try {
              baseObj = new TiledBaseObj(obj.properties);
            } catch (e) {
              throw new Error(
                `Error in level: "${tilemap.path}" in obj. ${obj.name} at ${obj.x},${obj.y}: ${e.message}`
              );
            }
            if (baseObj.ignore) {
              return; // continue on to the next object
            }

            obj.width = obj.width as number;
            obj.height = obj.height as number;

            let physGroup: Phaser.Physics.Arcade.StaticGroup;
            if (baseObj.collideable) {
              physGroup = level.platforms as Phaser.Physics.Arcade.StaticGroup;
            } else {
              physGroup = level.touchables as Phaser.Physics.Arcade.StaticGroup;
            }
            let sprite: Phaser.GameObjects.GameObject;
            if (baseObj.frameBelow == null) {
              sprite = physGroup.create(
                obj.x + obj.width / 2,
                obj.y + obj.height / 2,
                `${baseObj.key}_sheet`,
                baseObj.frame
              );
              if (!baseObj.visible) {
                const spriteSprite: Physics.Arcade.Sprite = sprite as Physics.Arcade.Sprite;
                spriteSprite.setVisible(false);
                spriteSprite.body.setSize(obj.width, obj.height);
              }
            } else {
              const container: Phaser.GameObjects.Container = scene.add.container(
                obj.x + obj.width / 2,
                obj.y + obj.height / 2
              );
              container.setSize(obj.width, obj.height);
              physGroup.add(container);
              sprite = container;
              // this is hardcoded for a double tall asset
              const main = scene.add.sprite(
                0,
                -obj.height / 4,
                `${baseObj.key}_sheet`,
                baseObj.frame
              );
              const below = scene.add.sprite(
                0,
                obj.height / 4,
                `${baseObj.key}_sheet`,
                baseObj.frameBelow
              );
              container.add([main, below]);
            }
            sprite.setDataEnabled();
            sprite.data.set("originalProps", obj.properties);
            sprite.data.set("objectData", baseObj);
            break;
          case "spawn":
            if (level.hero != null) {
              throw new Error(
                `multiple spawn points in level: "${tilemap.path}"`
              );
            }
            level.hero = scene.physics.add.sprite(
              obj.x,
              obj.y,
              HERO_ASSET_INFO.name
            );
            level.hero.scale = 0.5;
            level.hero.tint = HERO_TINT;
            level.heroController = level.addPlayerController(level.hero);
            scene.cameras.main.startFollow(level.hero);
            break;
          default:
            throw new Error(
              `Unknown object type "${obj.name}":"${obj.type}" encountered in map ${tilemap.path} at position ${obj.x},${obj.y}`
            );
        }
      });
      if (level.hero == null) {
        throw new Error(`no spawn point found in level: ${tilemap.path}`);
      }

      level.collisionLayer = level.tilemap.createStaticLayer(
        "collision",
        level.tileset
      );
      level.collisionLayer.setVisible(false);
      // level.worldLayer.setCollisionByExclusion([-1]);
      level.collisionLayer.forEachTile((tile: Phaser.Tilemaps.Tile) => {
        if (tile.index == SOLID_PLATFORM_INDEX) {
          tile.setCollision(true);
        } else if (tile.index == JUMP_THROUGH_PLATFORM_INDEX) {
          tile.setCollision(false, false, true, false);
        }
      });
    }
    for (let platInfo of this.platforms) {
      level.addPlatform(platInfo.x, platInfo.y, platInfo.texture);
    }

    this.setupLayers(level, this.fgLayers);

    scene.cameras.main.setBackgroundColor(0x7a70ff);
    scene.cameras.main.setRoundPixels(true);
    scene.cameras.main.roundPixels = true;
  }

  private setupLayers(level: Level, layers: LayerInfo[]) {
    layers.forEach(({ name, scrollFactorX, scrollFactorY }) => {
      if (level.tilemap && level.tileset) {
        const layer: Phaser.Tilemaps.StaticTilemapLayer = level.tilemap.createStaticLayer(
          name,
          level.tileset
        );
        if (!layer) {
          throw new Error(`Can't find layer "${name}"`);
        }
        layer.setScrollFactor(scrollFactorX, scrollFactorY);
      }
    });
  }

  build(gaem: Phaser.Game, name: string, inventory: Inventory): Level {
    const level: Level = new Level(gaem, name, inventory);

    level.onPreload.push(this._preload.bind(this));
    if (this.onPreload != null) {
      level.onPreload.push(this.onPreload);
    }

    level.onCreate.push(this._create.bind(this));
    if (this.onCreate != null) {
      level.onCreate.push(this.onCreate);
    }
    if (this.onCreateLast != null) {
      level.onCreate.push(this.onCreateLast);
    }

    return level;
  }
}
