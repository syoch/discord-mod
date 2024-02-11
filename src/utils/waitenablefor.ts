import logger from "../logger";

export default async function waitEnableFor<T>(func: () => T, timeout_ms = 5000, fail_message = "") {
  let tried = 0;
  return new Promise<T>((resolve, reject) => {
    let interval: number;

    let timeout: number;

    interval = setInterval(() => {
      const val = func();
      if (!val) {
        tried++;
        return;
      }
      clearInterval(interval);
      if (timeout_ms !== -1) clearTimeout(timeout);
      resolve(val);
    }, 100);

    if (timeout_ms !== -1) {
      timeout = setTimeout(() => {
        logger.error("waitEnableFor", `timeout (tried ${tried} times, timeout_ms: ${timeout_ms})`);
        clearInterval(interval);
        reject(fail_message);
      }, timeout_ms);
    }
  });
}
