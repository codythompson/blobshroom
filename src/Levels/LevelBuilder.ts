import { Level } from "./Level";

export type AssetInfo = {
  name: string;
  path: string;
};

export type PlatformInfo = {
  x: number;
  y: number;
  texture: string;
};

export type TilemapInfo = {
  tilemap: AssetInfo
  tileset: AssetInfo
  tileWidth: number
  tileHeight: number
}

export class LevelBuilder {
  static start(): LevelBuilder {
    return new LevelBuilder();
  }

  public level: Level | null = null;
  public onPreload: ((level: Level) => void) | null = null;
  public onCreate: ((level: Level) => void) | null = null;
  public onCreateLast: ((level: Level) => void) | null = null;
  public onUpdate: ((level: Level) => void) | null = null;
  public _tilemap: TilemapInfo|null = null
  public images: AssetInfo[] = [];
  public sounds: AssetInfo[] = [];
  public platforms: PlatformInfo[] = [];

  tilemap(csvName: string, csvPath:string, tilesetName: string, tilesetPath: string, tileWidth:number=32, tileHeight:number=32): LevelBuilder {
    this._tilemap = {
      tilemap: {
        name: csvName,
        path: csvPath
      },
      tileset: {
        name: tilesetName,
        path: tilesetPath
      },
      tileWidth,
      tileHeight
    }
    return this
  }

  image(name: string, path: string): LevelBuilder {
    this.images.push({ name, path });
    return this
  }

  sound(name: string, path: string): LevelBuilder {
    this.sounds.push({name, path})
    return this
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

  build(gaem: Phaser.Game, name: string): Level {
    const level: Level = new Level(gaem, name);

    level.onPreload.push((level: Level) => {
      const scene: Phaser.Scene = level.scene as Phaser.Scene
      if (this._tilemap != null) {
        const {tilemap, tileset, tileWidth:frameWidth, tileHeight:frameHeight} = this._tilemap
        scene.load.image(tileset.name, tileset.path)
        scene.load.spritesheet(`${tileset.name}_sheet`, tileset.path, {frameWidth, frameHeight})
        scene.load.tilemapTiledJSON(tilemap.name, tilemap.path)
      }
      for (let imgInfo of this.images) {
        scene.load.image(imgInfo.name, imgInfo.path);
      }
      for (let soundInfo of this.sounds) {
        scene.load.audio(soundInfo.name, soundInfo.path)
      }
    });
    if (this.onPreload != null) {
      level.onPreload.push(this.onPreload);
    }

    let tilesetImage: Phaser.Tilemaps.Tileset
    level.onCreate.push((level: Level) => {
      const scene: Phaser.Scene = level.scene as Phaser.Scene

      if (this._tilemap != null) {
        const {tilemap, tileset, tileWidth, tileHeight} = this._tilemap
        level.tilemap = scene.make.tilemap({
          key: tilemap.name,
          width: tileWidth,
          height: tileHeight
        })

        // create the object layer (touchables powerups, etc.)
        level.tilemap.getObjectLayer("objects").objects
          .filter(obj => obj.name == "touchable")
          .map((obj) => {
            obj.x = obj.x as number
            obj.y = obj.y as number
            obj.width = obj.width as number
            obj.height = obj.height as number
            obj.gid = obj.gid as number
            const sprite:Phaser.Physics.Arcade.Sprite = level.touchables?.create(obj.x + obj.width/2, obj.y-obj.height/2, `${tileset.name}_sheet`, obj.gid-1)
            const touchabletype = obj.properties[0].value
            sprite.setDataEnabled()
            sprite.data.set("touchabletype", touchabletype)
            return sprite
          })

        tilesetImage = level.tilemap.addTilesetImage(tileset.name)
        level.worldLayer = level.tilemap.createStaticLayer("worldLayer", tilesetImage)
        level.worldLayer.setCollisionByExclusion([-1])
      }
      for (let platInfo of this.platforms) {
        level.addPlatform(platInfo.x, platInfo.y, platInfo.texture);
      }
    });
    if (this.onCreate != null) {
      level.onCreate.push(this.onCreate);
    }
    if (this._tilemap != null) {
      level.onCreate.push((level: Level) => {
        level.tilemap?.createStaticLayer("fgLayer", tilesetImage)
      })
    }
    if (this.onCreateLast != null) {
      level.onCreate.push(this.onCreateLast)
    }

    return level;
  }
}
