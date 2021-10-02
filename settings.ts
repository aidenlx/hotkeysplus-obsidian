import {
  App,
  debounce,
  PluginSettingTab,
  Setting,
} from "obsidian";

import HotkeysPlus from "./main";

export interface HotkeysPlusSettings {
  ulMarks: string;
  olMarks: string;
}

export const DEFAULT_SETTINGS: HotkeysPlusSettings = {
  ulMarks: "-",
  olMarks: ".",
};

export class HotkeysPlusSettingTab extends PluginSettingTab {
  constructor(public plugin: HotkeysPlus) {
    super(plugin.app, plugin);
  }

  display(): void {
    let { containerEl } = this;
    containerEl.empty();

    new Setting(this.containerEl)
      .setName("Unordered List Marks")
      .addText((text) => {
        const save = debounce(
          async (value: string) => {
            this.plugin.settings.ulMarks = value;
            await this.plugin.saveSettings();
          },
          500,
          true
        );
        text
          .setValue(this.plugin.settings.ulMarks)
          .onChange(async (value: string) => save(value));
      });
    new Setting(this.containerEl)
      .setName("Ordered List Marks")
      .addText((text) => {
        const save = debounce(
          async (value: string) => {
            this.plugin.settings.olMarks = value;
            await this.plugin.saveSettings();
          },
          500,
          true
        );
        text
          .setValue(this.plugin.settings.olMarks)
          .onChange(async (value: string) => save(value));
      });
  }
}
