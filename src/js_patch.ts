const js_patch = {
  patchNewobject() {
    function filterDescriptor(desc: PropertyDescriptor): PropertyDescriptor {
      const newDesc = { ...desc };
      if (newDesc.writable === false) {
        newDesc.writable = true;
      }

      if (newDesc.configurable === false) {
        newDesc.configurable = true;
      }

      if (newDesc.enumerable === false) {
        newDesc.enumerable = true;
      }

      return newDesc;
    }

    Object.defineProperties = ((orig) => (obj, props) => {
      const newProps = { ...props };

      Object.keys(props).forEach((prop) => {
        newProps[prop] = filterDescriptor(props[prop]);

        const currentCescriptor = Object.getOwnPropertyDescriptor(obj, prop);
        if (!currentCescriptor) {
          newProps[prop].configurable = true;
        }
      });

      return orig(obj, newProps);
    })(Object.defineProperties);

    Object.defineProperty = ((orig) => (obj, prop, desc) => {
      const newDesc = filterDescriptor(desc);

      const currentDescriptor = Object.getOwnPropertyDescriptor(obj, prop);
      if (!currentDescriptor) {
        newDesc.configurable = true;
      }

      return orig(obj, prop, newDesc);
    })(Object.defineProperty);
  },

  patchFreeze() {
    const protect = (obj: object) => obj;
    const isProtected = () => false;

    // @ts-expect-error: This is JS Code
    Object.seal = protect;
    // @ts-expect-error: This is JS Code
    Object.preventExtensions = protect;
    Object.freeze = protect;
    Reflect.preventExtensions = (obj) => { protect(obj); return true; };

    Object.isFrozen = isProtected;
    Object.isSealed = isProtected;
    // @ts-expect-error: This is JS Code
    Object.isExtensible = (obj) => !isProtected(obj);
  },
  /* patchNetwork() {
    unsafeWindow.XMLHttpRequest.prototype.open = ((orig) => function (method, url) {
      logger.info("Patch|XHR", `Requested ${method} ${url.toString()}`);
      //  @ts-expect-error: This is JS Code
      return orig.apply(this, arguments);
    })(unsafeWindow.XMLHttpRequest.prototype.open);

    unsafeWindow.fetch = ((orig) => (x, opts) => {
      logger.info("Patch|Fetch", `Requested ${opts?.method} ${x.toString()}`);

      return orig(x, opts);
    })(unsafeWindow.fetch.bind(unsafeWindow));
  }, */

  patch() {
    this.patchNewobject();
    this.patchFreeze();
    // this.patchNetwork();
  }
};

js_patch.patch();

export default js_patch;