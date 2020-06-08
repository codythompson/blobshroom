import Phaser from "phaser";
import GameObject = Phaser.GameObjects.GameObject;
import { Level } from "./Level";
import { Inventory } from "./Inventory";
import { TiledBaseObj } from "./TileObjects";
import { EntityType } from "./SpriteControllers";

export enum HandlerNames {
  none = "none",
  pickup = "pickup",
  door = "door",
  death = "death",
}

export const handlers = {
  [HandlerNames.none]: function (
    actor: GameObject,
    obj: GameObject,
    level: Level
  ): void {},
  [HandlerNames.pickup]: function (
    actor: GameObject,
    obj: GameObject,
    level: Level
  ): void {
    const inventory: Inventory = level.inventory;
    const objData: TiledBaseObj = obj.data.get("objectData");
    for (let i = 0; i < objData.inventoryKeys.length; i++) {
      inventory.addToHero(objData.inventoryKeys[i], objData.inventoryValues[i]);
    }
    obj.destroy();
  },
  [HandlerNames.door]: function (
    actor: GameObject,
    obj: GameObject,
    level: Level
  ): void {
    const inventory: Inventory = level.inventory;
    const objData: TiledBaseObj = obj.data.get("objectData");
    let hasEnough: boolean = true;
    for (let i = 0; i < objData.inventoryKeys.length; i++) {
      if (
        inventory.getFromHero(objData.inventoryKeys[i]) <
        objData.inventoryValues[i]
      ) {
        hasEnough = false;
        break;
      }
    }
    if (hasEnough) {
      for (let i = 0; i < objData.inventoryKeys.length; i++) {
        inventory.removeFromHero(
          objData.inventoryKeys[i],
          objData.inventoryValues[i]
        );
      }
      obj.destroy();
    }
  },
  [HandlerNames.death]: function (
    actor: GameObject,
    obj: GameObject,
    level: Level
  ): void {
    level.death(actor);
  },
};

export function handle(actor: GameObject, obj: GameObject, level: Level): void {
  if (obj.data == null) {
    return;
  }
  const objData: TiledBaseObj = obj.data.get("objectData");
  handlers[objData.handler as HandlerNames](actor, obj, level);
}
