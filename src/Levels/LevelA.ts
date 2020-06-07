import Phaser from "phaser";

import { LevelBuilder } from "../LevelBuilder";
import { Level } from "../Level";

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
    playButton.tint = 0xff90ff10;
    playButton.setScrollFactor(0, -1.2);
    playButton.setInteractive();
    playButton.once("pointerup", () => {
      level.paused = false
      playButton.destroy();
      scene.sound.play("level1_soundtrack");
    });
  });
