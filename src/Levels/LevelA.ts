import { LevelBuilder } from ".";

export const LevelA: LevelBuilder = LevelBuilder
  .start()
  .image("block", "assets/png/blockA.png")
  .image("heroblob", "assets/png/heroblob2.png")
  .loop(12, (builder, i) => builder.platform((i*64)+128, 700, "block"))