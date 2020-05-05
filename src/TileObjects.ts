import Phaser from "phaser"
import GameObject = Phaser.GameObjects.GameObject
import { Inventory } from "./Inventory"

export enum HandlerNames {
  pickup = "pickup",
  door = "door"
}

export const handlers = {
  [HandlerNames.pickup]: function (actor:GameObject, obj:GameObject, inventory:Inventory):void {
    const objData:TiledBaseObj = obj.data.get("objectData")
    for (let i = 0; i < objData.inventoryKeys.length; i++) {
      inventory.addToHero(objData.inventoryKeys[i], objData.inventoryValues[i])
    }
    obj.destroy()
  },
  [HandlerNames.door]: function (actor:GameObject, obj:GameObject, inventory:Inventory):void {
    const objData:TiledBaseObj = obj.data.get("objectData")
    let hasEnough: boolean = true
    for (let i = 0; i < objData.inventoryKeys.length; i++) {
      if (inventory.getFromHero(objData.inventoryKeys[i]) < objData.inventoryValues[i]) {
        hasEnough = false
        break
      }
    }
    if (hasEnough) {
      for (let i = 0; i < objData.inventoryKeys.length; i++) {
        inventory.removeFromHero(objData.inventoryKeys[i], objData.inventoryValues[i])
      }
      obj.destroy()
    }
  }
}

export function handle(actor:GameObject, obj:GameObject, inventory:Inventory):void {
  if (obj.data == null) {
    return
  }
  const objData: TiledBaseObj = obj.data.get("objectData")
  handlers[objData.handler](actor, obj, inventory)
}

export type TiledProp = {
  name: string
  value: boolean|string|number
}

export class TiledBaseObj {
  key!: string
  frame!: number
  ignore!: boolean
  collideable!: boolean
  inventoryKeys!: string[]
  inventoryValues!: number[]
  handler!: HandlerNames

  constructor(props: TiledProp[]) {
    for (let prop of props) {
      switch (prop.name) {
        case "key":
          this.key = prop.value as string
          break;
        case "frame":
          this.frame = prop.value as number
          break;
        case "ignore":
          this.ignore = prop.value as boolean
          break;
        case "collideable":
          this.collideable = prop.value as boolean
          break;
        case "inventoryKeys":
          this.inventoryKeys = (prop.value as string)
            .trim()
            .split(",")
          break;
        case "inventoryValues":
          this.inventoryValues = (prop.value as string)
            .trim()
            .split(",")
            .map(str => parseInt(str))
          break;
        case "handler":
          this.handler = prop.value as HandlerNames
          break;
      }
    }

    if (this.inventoryKeys.length != this.inventoryValues.length) {
      throw new Error(`Number of values doesn't match number of keys. ${this.inventoryKeys.length} vs ${this.inventoryValues.length}`)
    }
  }
}
