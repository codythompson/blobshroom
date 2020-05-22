import Phaser from "phaser"
import GameObject = Phaser.GameObjects.GameObject
import { Inventory } from "./Inventory"
import { Level } from "./Level"

export enum HandlerNames {
  none = "none",
  pickup = "pickup",
  door = "door",
  death = "death"
}

export const handlers = {
  [HandlerNames.none]: function (actor:GameObject, obj:GameObject, level:Level):void {},
  [HandlerNames.pickup]: function (actor:GameObject, obj:GameObject, level:Level):void {
    const inventory:Inventory = level.inventory
    const objData:TiledBaseObj = obj.data.get("objectData")
    for (let i = 0; i < objData.inventoryKeys.length; i++) {
      inventory.addToHero(objData.inventoryKeys[i], objData.inventoryValues[i])
    }
    obj.destroy()
  },
  [HandlerNames.door]: function (actor:GameObject, obj:GameObject, level:Level):void {
    const inventory:Inventory = level.inventory
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
  },
  [HandlerNames.death]: function (actor:GameObject, obj:GameObject, level:Level): void {
    level.death(actor)
  }
}

export function handle(actor:GameObject, obj:GameObject, level:Level):void {
  if (obj.data == null) {
    return
  }
  const objData: TiledBaseObj = obj.data.get("objectData")
  handlers[objData.handler](actor, obj, level)
}

export type ObjConfig = {
  visible: boolean
  key: string
  frame: number
  frameBelow: number|null
  collideable: boolean
  inventoryKeys: string[]
  inventoryValues: number[]
  handler: HandlerNames
}

export const BaseConfig = {
  visible: true,
  key: "",
  frame: 0,
  frameBelow: null,
  collideable: false,
  inventoryKeys: [],
  inventoryValues: [],
  handler: HandlerNames.none
}

/**
 * object config
 * naming conventions
 * 
 * OBJ_CONFIG_NAME$variant
 */

 export const DEATH$0:ObjConfig = {
  ...BaseConfig,
  visible: false,
  collideable: true,
  handler: HandlerNames.death
 }

export const BLUE_FLOWER$1:ObjConfig = {
  ...BaseConfig,
  key: "testtileset",
  frame: 4,
  inventoryKeys: ["blue_flower"],
  inventoryValues: [1],
  handler: HandlerNames.pickup
}

export const BLUE_FLOWER$2:ObjConfig = {
  ...BLUE_FLOWER$1,
  inventoryValues: [2]
}

export const BLUE_FLOWER_DOOR$1:ObjConfig = {
  ...BaseConfig,
  key: "testtileset",
  frame: 3,
  frameBelow: 11,
  collideable: true,
  inventoryKeys: ["blue_flower"],
  inventoryValues: [1],
  handler: HandlerNames.door
}

export const BLUE_FLOWER_DOOR$2:ObjConfig = {
  ...BLUE_FLOWER_DOOR$1,
  inventoryValues: [2]
}

export const CONFIGS:any = {
  DEATH$0,
  BLUE_FLOWER$1,
  BLUE_FLOWER$2,
  BLUE_FLOWER_DOOR$1,
  BLUE_FLOWER_DOOR$2
}

export type TiledProp = {
  name: string
  value: boolean|string|number
}

export class TiledBaseObj {
  visible!: boolean
  key!: string
  frame!: number
  frameBelow!: number|null
  ignore!: boolean
  collideable!: boolean
  inventoryKeys!: string[]
  inventoryValues!: number[]
  handler!: HandlerNames

  constructor(props: TiledProp[]) {
    let configKeyProp:TiledProp|undefined = props.find(prop => prop.name == "configKey")
    if (configKeyProp == undefined) {
      throw new Error("TiledObject missing 'configKey' property")
    }
    const configKey:string = configKeyProp.value as string
    if (!(configKey in CONFIGS)) {
      throw new Error(`Unknown configKey ${configKey}`)
    }
    const config:ObjConfig = CONFIGS[configKey]
    // TODO figure out a more typescripty way to do this
    for(let propName in config) {
      // if (this.hasOwnProperty(propName)) {
        (this as any)[propName] = (config as any)[propName]
      // }
    }

    for (let prop of props) {
      switch (prop.name) {
        case "visible":
          this.visible = prop.value as boolean
          break;
        case "key":
          this.key = prop.value as string
          break;
        case "frame":
          this.frame = prop.value as number
          break;
        case "frameBelow":
          this.frameBelow = prop.value as number
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
