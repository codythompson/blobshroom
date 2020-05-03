import { Level } from "../Level";

export type ImageInfo = {
  name: string
  path: string
}

export type PlatformInfo = {
  x: number
  y: number
  texture: string
}

export class LevelBuilder {
  static start(): LevelBuilder {
    return new LevelBuilder()
  }

  public level: Level | null = null
  public onPreload: ((level:Level)=>void) | null = null
  public onCreate: ((level:Level)=>void) | null = null
  public images: ImageInfo[] = []
  public platforms: PlatformInfo[] = []

  image(name:string, path:string): LevelBuilder {
    this.images.push({name, path})
    return this
  }

  platform(x:number, y:number, texture:string): LevelBuilder {
    this.platforms.push({x, y, texture})
    return this
  }

  loop(max:number, callback:(builder:LevelBuilder, index:number)=>void): LevelBuilder {
    const callbackCaller = (index:number) => {
      callback(this, index)
    }
    for (let i = 0; i < max; i++) {
      callbackCaller(i)
    }
    return this
  }

  on(event:string, callback:((level:Level)=>void)): LevelBuilder {
    if (event == "preload") {
      this.onPreload = callback
    }
    else if (event == "onCreate") {
      this.onCreate = callback
    }
    return this
  }

  build(gaem:Phaser.Game, name:string): Level {
    const level:Level = new Level(gaem, name)

    level.onPreload.push((level:Level)=> {
      for (let imgInfo of this.images) {
        level.scene?.load.image(imgInfo.name, imgInfo.path)
      }
    })
    if (this.onPreload != null) {
      level.onPreload.push(this.onPreload)
    }

    level.onCreate.push((level:Level)=> {
      for (let platInfo of this.platforms) {
        level.addPlatform(platInfo.x, platInfo.y, platInfo.texture)
      }
    })

    return level
  }
}

export {LevelA } from "./LevelA"
