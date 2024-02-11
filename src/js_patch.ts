export default {
  patchNewobject() {
    function filterDescriptor(desc: PropertyDescriptor): PropertyDescriptor {
      if (desc.writable === false) {
        desc.writable = true;
      }

      if (desc.configurable === false) {
        desc.configurable = true;
      }

      if (desc.enumerable === false) {
        desc.enumerable = true;
      }

      return desc;
    }

    Object.defineProperties = ((orig) => (obj, props) => {
      for (const prop in props) {
        props[prop] = filterDescriptor(props[prop]);

        const current_descriptor = Object.getOwnPropertyDescriptor(obj, prop);
        if (!current_descriptor) {
          props[prop].configurable = true;
        }
      }

      return orig(obj, props);
    })(Object.defineProperties);

    Object.defineProperty = ((orig) => (obj, prop, desc) => {
      const new_desc = filterDescriptor(desc);

      const current_descriptor = Object.getOwnPropertyDescriptor(obj, prop);
      if (!current_descriptor) {
        new_desc.configurable = true;
      }

      return orig(obj, prop, desc);
    })(Object.defineProperty);
  },

  patchFreeze() {
    const protect = (obj: any) => obj;
    const isProtected = (_: any) => false;

    Object.freeze = protect;
    Object.seal = protect;
    Object.preventExtensions = protect;
    Reflect.preventExtensions = (obj) => { protect(obj); return true; };
    Object.isFrozen = isProtected;
    Object.isSealed = isProtected;
    Object.isExtensible = (obj) => !isProtected(obj);
  },

  patchNetwork() {
    // @ts-ignore
    unsafeWindow.XMLHttpRequest.prototype.open = ((orig) => function (method, url, async, user, password) {
      logger.info("Patch|XHR", `Requested ${method} ${url}`);
      // @ts-ignore
      orig.apply(this, arguments);
      // @ts-ignore
    })(unsafeWindow.XMLHttpRequest.prototype.open);

    // @ts-ignore
    unsafeWindow.fetch = (/** @type {()=>any} */ (orig): any => (x, opts) => {
      logger.info("Patch|Fetch", `Requested ${opts?.method} ${x}`);

      return orig(x, opts);
      // @ts-ignore
    })(unsafeWindow.fetch.bind(unsafeWindow));
  },

  patch() {
    this.patchNewobject();
    this.patchFreeze();
    // this.patchNetwork();
  },
};
