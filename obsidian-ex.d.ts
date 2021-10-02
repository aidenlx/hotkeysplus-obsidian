import "obsidian";
declare module "obsidian" {
  interface Vault {
    getConfig(key: string): any;
  }
}
