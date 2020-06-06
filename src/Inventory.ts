export class Inventory {
  hero: any = {};

  addToHero(slot: string, value: number): void {
    if (!(slot in this.hero)) {
      this.hero[slot] = 0;
    }
    this.hero[slot] += value;
  }

  getFromHero(slot: string): number {
    if (!(slot in this.hero)) {
      return 0;
    }
    return this.hero[slot];
  }

  removeFromHero(slot: string, value: number): void {
    if (!(slot in this.hero)) {
      this.hero[slot] = 0;
    }
    this.hero[slot] -= value;
  }
}
