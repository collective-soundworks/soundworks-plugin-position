export default function(Plugin) {
  /**
   * Client-side representation of the soundworks' position plugin.
   */
  class PluginPositionClient extends Plugin {
    /**
     * The constructor should never be called manually. The plugin will be
     * instantiated by soundworks when registered in the `pluginManager`
     *
     * Available options:
     * - `randomize` {Boolean} - Autoamtically give a random position to the client.
     *   Useful for testing
     *
     * @example
     * client.pluginManager.register('position', positionPlugin, { randomize: true });
     */
    constructor(client, id, options = {}) {
      super(client, id);

      // @todo - allow to pass a function to create more advanced maps,
      // e.g.: matrixes, circles, etc.
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
      };

      this._startPromiseResolve = null;
      this._startPromiseReject = null;
    }

    /**
     * Start will resolve once `setPosition` or `setNormalizedPosition` is called.
     * If you do not rely on the `@soundworks/helpers` default views, you should
     * track the plugin start process and call one of these methods using
     * `client.stateManager.onStateChange` method. The callback should be written
     * very carefully to avoid running into infinite loop: first check for inited status,
     * then check for `state.infos`, then call setPosition on if `state.x` && `state.y`
     * are not null
     *
     * @example
     * client.pluginManager.onStateChange((plugins) => {
     *   const position = plugins['position'];
     *
     *   if (position.status === 'inited') {
     *     if (position.state && position.state.infos) {
     *       if (position.state.x === null && position.state.y === null) {
     *         position.setNormalizedPosition(0.5, 0.5);
     *       }
     *     }
     *   }
     * });
     *
     * @private
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

    /**
     * Set the x and y position of the client in the given ranges units.
     *
     * By default, this method is automatically called by the soundworks launcher,
     * you should not have to call it manually in most cases.
     */
    setPosition(x, y) {
      const { xRange, yRange } = this.state.infos;
      const normX = (x - xRange[0]) / (xRange[1] - xRange[0]);
      const normY = (y - yRange[0]) / (yRange[1] - yRange[0]);

      this._startPromiseResolve();
      // @note - this is a bit dangerous as this can lead to infinite loop if the
      // `stateManager.onStateChange` method is not written carefully, see note above
      this.propagateStateChange({ x, y, normX, normY });
    }

    /**
     * Retrieve the given position in the given ranges units.
     *
     * @return {Object} - x / y position of the client.
     */
    getPosition() {
      const { x, y } = this.state;
      return { x, y };
    }

    /**
     * Set the x and y position of the client in normalized units.
     *
     * By default, this method is automatically called by the soundworks launcher,
     * you should not have to call it manually in most cases.
     */
    setNormalizedPosition(normX, normY) {
      const { xRange, yRange } = this.state.infos;
      const x = normX * (xRange[1] - xRange[0]) + xRange[0];
      const y = normY * (yRange[1] - yRange[0]) + yRange[0];

      this._startPromiseResolve();
      // @note - this is a bit dangerous as this can lead to infinite loop if the
      // `stateManager.onStateChange` method is not written carefully, see note above
      this.propagateStateChange({ x, y, normX, normY });
    }

    /**
     * Retrieve the given position in normalized units.
     *
     * @return {Object} - normalized x / y position of the client.
     */
    getNormalizedPosition() {
      const { normX, normY } = this.state;
      return { normX, normY };
    }
  };

  return PluginPositionClient;
}
