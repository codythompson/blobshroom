import Phaser from "phaser";
import Sprite = Phaser.Physics.Arcade.Sprite;
import StaticGroup = Phaser.Physics.Arcade.StaticGroup;

import { LevelBuilder } from "../LevelBuilder";
import { Level } from "../Level";
import { PlayerController } from "../SpriteController";

export const LevelA: LevelBuilder = LevelBuilder.start()
  .image("playtext", "assets/png/playtext.png")
  .image("block", "assets/png/blockA.png")
  .image("weirdblock", "assets/png/weirdblock.png")
  .tilemap(
    "levelA",
    "assets/tilemaps/levelA.json",
    "testtileset",
    "assets/png/testtileset.png"
  )
  .fgLayer("fg")
  .bgLayer("bg")
  .bgLayer("plax1", 1 / 64)
  .bgLayer("plax2", 1 / 128)
  .sound("level1_soundtrack", "assets/audio/ogg/King James VR - Drunkbus.ogg")
  .on("createlast", (level: Level) => {
    const scene: Phaser.Scene = level.scene as Phaser.Scene;
    const playButton: Phaser.GameObjects.Image = scene.add.image(
      scene.cameras.main.centerX,
      scene.cameras.main.centerY - 420,
      "playtext"
    );
    const pCtl = level.heroController as PlayerController;
    pCtl.locked = true;
    playButton.tint = 0xff90ff10;
    playButton.setScrollFactor(0, -1.2);
    playButton.setInteractive();
    playButton.once("pointerup", () => {
      playButton.destroy();
      pCtl.locked = false;
      scene.sound.play("level1_soundtrack");
    });
  });
