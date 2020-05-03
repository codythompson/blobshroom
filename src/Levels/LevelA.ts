import { LevelBuilder } from ".";
import { Level } from "./Level";
import { PlayerController } from "../SpriteController";

const padding = 128
const w = 64
const bottomIsh = 720

export const LevelA: LevelBuilder = LevelBuilder.start()
  .image("playtext", "assets/png/playtext.png")
  .image("block", "assets/png/blockA.png")
  .image("heroblob", "assets/png/heroblob2.png")
  .sound("level1_soundtrack", "assets/audio/ogg/King James VR - Drunkbus.ogg")
  .loop(12, (builder, i) => builder.platform(i * w + padding, bottomIsh, "block"))
  .loop(12, (builder, i) => builder.platform((12*w) + i * w + padding, bottomIsh - (3*w), "block"))
  .on("create", (level:Level):void => {
    // const scene:Phaser.Scene = level.scene as Phaser.Scene
    const scene = level.gaem.scene.getScene("default")
    const heroBlob: Phaser.Physics.Arcade.Sprite = scene.physics.add.sprite(
      scene.cameras.main.centerX- padding,
      scene.cameras.main.height - w - w / 2 - padding - padding,
      "heroblob"
    );
    heroBlob.tint = 0xff0f0000;

    const pCtl:PlayerController = level.addPlayerController(heroBlob)
    pCtl.locked = true

    scene.physics.add.collider(
      heroBlob,
      level.platforms as Phaser.Physics.Arcade.StaticGroup
    );
    const playButton:Phaser.GameObjects.Image = scene.add.image(scene.cameras.main.centerX, scene.cameras.main.centerY - padding, "playtext")
    playButton.tint = 0xff90ff10
    playButton.setScrollFactor(0, -1.2)
    playButton .setInteractive()
    playButton.once("pointerup", ()=> {
      playButton.destroy()
      pCtl.locked = false
      scene.sound.play("level1_soundtrack")
    })
  })
