export default {
  tag: "Discord Mod",

  header: function (type: 'error' | 'info' | 'warn', category: string) {
    const tag_color = {
      "error": "#f88",
      "info": "#8cf",
      "warn": "#fc8"
    }[type];

    return [
      `%c[${this.tag}]%c::%c(${category})%c`,
      `color: ${tag_color}`,
      "",
      "color: #cfc",
      ""
    ]
  },

  info: function (category: string, ...args: any[]) {
    console.log(
      ...this.header("info", category),
      ...args
    );
  },
  warn: function (category: string, ...args: any[]) {
    console.warn(
      ...this.header("warn", category),
      ...args
    );
  },
  error: function (category: string, ...args: any[]) {
    console.error(
      ...this.header("error", category),
      ...args
    );
  },
};