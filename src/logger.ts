export default {
  tag: "Discord Mod",

  header(type: "error" | "info" | "warn", category: string) {
    const tagColor = {
      error: "#f88",
      info: "#8cf",
      warn: "#fc8",
    }[type];

    return [
      `%c[${this.tag}]%c::%c(${category})%c`,
      `color: ${tagColor}`,
      "",
      "color: #cfc",
      "",
    ];
  },

  info(category: string, ...args: string[]) {
    console.log(...this.header("info", category), ...args);
  },
  warn(category: string, ...args: string[]) {
    console.warn(...this.header("warn", category), ...args);
  },
  error(category: string, ...args: string[]) {
    console.error(...this.header("error", category), ...args);
  },
};
