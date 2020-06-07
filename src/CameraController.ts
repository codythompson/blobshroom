import Phaser from "phaser";
import Camera = Phaser.Cameras.Scene2D.Camera;
import Sprite = Phaser.Physics.Arcade.Sprite;

export class CameraController {
  public paddingX: number = 256;
  public paddingY: number = 10;

  constructor(public camera: Camera, public following: Sprite) {}

  update() {
    // this.camera.setScroll()
  }
}
