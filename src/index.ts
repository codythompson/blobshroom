import Phaser from "phaser"
import {globalize} from "./globalize"

const gaem = new Phaser.Game({
  width: 1200,
  height: 800,
  scene: {
    preload: function () {
      const scene:Phaser.Scene = gaem.scene.getScene("default")
      scene.load.image("block", "assets/png/blockA.png")
      scene.load.image("heroblob", "assets/png/heroblob1.png")
    },
    create: function () {
      const scene:Phaser.Scene = gaem.scene.getScene("default")

      const padding = 128
      const w = 64
      for (let i:number = 0; i < 12; i++) {
        scene.add.sprite(padding + (i*w), scene.cameras.main.height - (w/2), "block")
      }

      const heroBlob:Phaser.GameObjects.Sprite = scene.add.sprite(scene.cameras.main.centerX, scene.cameras.main.height - w - (w/2), "heroblob")
      heroBlob.tint = 0xff0f0000
    }
  }
})
globalize("gaem", gaem)
