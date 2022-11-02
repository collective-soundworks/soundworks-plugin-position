const pluginFactory = function(Plugin) {
  return class PluginPosition extends Plugin {
    constructor(client, id, options = {}) {
      super(client, id);

      const defaults = {
        randomize: false,
      };

      this.options = Object.assign({}, defaults, options);

      this.state = {
        infos: null,
        x: null,
        y: null,
        normX: null,
        normY: null,
      }

      this._startPromiseResolve = null;
      this._startPromiseReject = null;
    }

    /**
     * Start will resolve once `setPosition` or `setNormalizedPosition` is called.
     * If you do not rely on the `@soundworks/helpers` default views, you should
     * track the plugin start process and call one of these methods using
     * `client.stateManager.onStateChange` method. The callback should be written
     * very carefully to avoid running into infinite loop, first check for inited status,
     * then check for `state.infos`, then call setPosition on if `state.x` && `state.y`
     * are null
     *
     * @example
     * client.pluginManager.onStateChange((plugins) => {
     *   const position = plugins['position'];
     *
     *   if (position.status === 'inited') {
     *     if (position.state && position.state.infos) {
     *       assert.deepEqual(position.state.infos, options);
     *
     *       if (position.state.x === null && position.state.y === null) {
     *         position.setNormalizedPosition(0.5, 0.5);
     *       }
     *     }
     *   }
     * });
     */
    async start() {
      await super.start();

      const startPromise = new Promise((resolve, reject) => {
        this._startPromiseResolve = resolve;
        this._startPromiseReject = reject;
      });

      const serverInfos = await this.client.stateManager.attach(`sw:plugin:${this.id}`);
      const infos = serverInfos.getValues();
      this.propagateStateChange({ infos });

      await serverInfos.detach();

      if (this.options.randomize) {
        const normX = Math.random();
        const normY = Math.random();
        this.setNormalizedPosition(normX, normY);
      }

      return startPromise;
    }

    setPosition(x, y) {
      const { xRange, yRange } = this.state.infos;
      const normX = (x - xRange[0]) / (xRange[1] - xRange[0]);
      const normY = (y - yRange[0]) / (yRange[1] - yRange[0]);

      this._startPromiseResolve();
      // @note - this is a bit dangerous as this can lead to infinite loop if
      // the `stateManager.onStateChange` method is not written carefully
      this.propagateStateChange({ x, y, normX, normY });
    }

    getPosition() {
      const { x, y } = this.state;
      return { x, y };
    }

    setNormalizedPosition(normX, normY) {
      const { xRange, yRange } = this.state.infos;
      const x = normX * (xRange[1] - xRange[0]) + xRange[0];
      const y = normY * (yRange[1] - yRange[0]) + yRange[0];

      this._startPromiseResolve();
      // @note - this is a bit dangerous as this can lead to infinite loop if
      // the
      this.propagateStateChange({ x, y, normX, normY });
    }

    getNormalizedPosition() {
      const { normX, normY } = this.state;
      return { normX, normY };
    }
  }

}

export default pluginFactory;
