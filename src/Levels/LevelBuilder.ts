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

export class LevelBuilder {
  static start(): LevelBuilder {
    return new LevelBuilder();
  }

  public level: Level | null = null;
  public onPreload: ((level: Level) => void) | null = null;
  public onCreate: ((level: Level) => void) | null = null;
  public onUpdate: ((level: Level) => void) | null = null;
  public images: AssetInfo[] = [];
  public sounds: AssetInfo[] = [];
  public platforms: PlatformInfo[] = [];

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
    }
    return this;
  }

  build(gaem: Phaser.Game, name: string): Level {
    const level: Level = new Level(gaem, name);

    level.onPreload.push((level: Level) => {
      for (let imgInfo of this.images) {
        level.scene?.load.image(imgInfo.name, imgInfo.path);
      }
      for (let soundInfo of this.sounds) {
        level.scene?.load.audio(soundInfo.name, soundInfo.path)
      }
    });
    if (this.onPreload != null) {
      level.onPreload.push(this.onPreload);
    }

    level.onCreate.push((level: Level) => {
      for (let platInfo of this.platforms) {
        level.addPlatform(platInfo.x, platInfo.y, platInfo.texture);
      }
    });
    if (this.onCreate != null) {
      level.onCreate.push(this.onCreate);
    }

    return level;
  }
}
