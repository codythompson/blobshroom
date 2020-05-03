import Phaser from "phaser";
import { globalize } from "./globalize";

import { LevelA } from "./Levels";
import { Level } from "./Levels";

let activeLevel: Level;

const gaem = new Phaser.Game({
  width: 1200,
  height: 800,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: true,
    },
  },
  scene: {
    preload: function () {
      activeLevel = LevelA.build(gaem, "default");
      activeLevel.preload();
      // const scene:Phaser.Scene = gaem.scene.getScene("default")
      // scene.load.image("block", "assets/png/blockA.png")
      // scene.load.image("heroblob", "assets/png/heroblob2.png")
    },
    create: function () {
      activeLevel.create();
    },
    update(elapsed: number, delta: number) {
      activeLevel.update(elapsed, delta);
    },
  },
});
globalize("gaem", gaem);
