import Phaser from "phaser";
import { globalize } from "./globalize";

import { LevelA } from "./Levels";
import { Level } from "./Level";
import { Inventory } from "./Inventory";

let activeLevel: Level;

const inventory = new Inventory()

const gaem = new Phaser.Game({
  width: 1200,
  height: 800,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 1200 },
      debug: true,
    },
  },
  scene: {
    preload: function () {
      activeLevel = LevelA.build(gaem, "default", inventory);
      globalize("level", activeLevel);
      activeLevel.preload();
    },
    create: function () {
      activeLevel.create();
    },
    update(elapsed: number, delta: number) {
      activeLevel.update(elapsed, delta);
    },
  },
});

// create global vars for debugging
globalize("gaem", gaem);
globalize("inventory", inventory);
