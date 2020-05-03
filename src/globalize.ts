export function globalize(name: string, thingy: any) {
  if (name in window) {
    console.warn(`Overriding existing global var ${name} with ${thingy}`);
  }
  // Bad bad not good
  eval("window[name] = thingy");
}
