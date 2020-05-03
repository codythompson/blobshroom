import Phaser from "phaser"
import {globalize} from "./globalize"

import { LevelA } from "./Levels"
import { Level } from "./Level"

let activeLevel: Level

const gaem = new Phaser.Game({
  width: 1200,
  height: 800,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300},
      debug: true
    }
  },
  scene: {
    preload: function () {
      activeLevel = LevelA.build(gaem, "default")
      activeLevel.preload()
      // const scene:Phaser.Scene = gaem.scene.getScene("default")
      // scene.load.image("block", "assets/png/blockA.png")
      // scene.load.image("heroblob", "assets/png/heroblob2.png")
    },
    create: function () {
      activeLevel.create()
      const scene:Phaser.Scene = gaem.scene.getScene("default")
      // const platforms:Phaser.Physics.Arcade.StaticGroup = scene.physics.add.staticGroup()

      const padding = 128
      const w = 64
      // for (let i:number = 0; i < 12; i++) {
      //   platforms.create(padding + (i*w), scene.cameras.main.height - (w/2), "block")
      // }

      const heroBlob:Phaser.Physics.Arcade.Sprite = scene.physics.add.sprite(scene.cameras.main.centerX, scene.cameras.main.height - w - (w/2) - padding, "heroblob")
      heroBlob.tint = 0xff0f0000

      activeLevel.addPlayerController(heroBlob)

      scene.physics.add.collider(heroBlob, activeLevel.platforms as Phaser.Physics.Arcade.StaticGroup)
    },
    update(elapsed:number, delta:number) {
      activeLevel.update(elapsed, delta)
    }
  }
})
globalize("gaem", gaem)
