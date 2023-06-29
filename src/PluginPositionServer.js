import { isString } from '@ircam/sc-utils';

const schema = {
  xRange: {
    type: 'any',
    default: null,
  },
  yRange: {
    type: 'any',
    default: null,
  },
  backgroundImage: {
    type: 'string',
    nullable: true,
    default: null,
  },
};

export default function(Plugin) {
  /**
   * Server-side representation of the soundworks' position plugin.
   */
  class PluginPositionServer extends Plugin {
    /**
     * The constructor should never be called manually. The plugin will be
     * instantiated by soundworks when registered in the `pluginManager`
     *
     * Available options:
     * - `xRange` {Array} - Range of the area in the x axis.
     * - `yRange` {Array} - Range of the area in the y axis.
     * - `backgroundImage` {String} - Path to a background image to be displayed
     *   by the launcher view.
     *
     * @example
     * server.pluginManager.register('position', positionPlugin, {
     *   xRange: [0, 2],
     *   yRange: [-1, 1],
     *   backgroundImage: 'public/path/to/map.png',
     * });
     */
    constructor(server, id, options) {
      super(server, id);

      const defaults = {
        xRange: [0, 1],
        yRange: [0, 1],
        backgroundImage: null,
      };

      this.options = Object.assign({}, defaults, options);

      if (!Array.isArray(this.options.xRange) || this.options.xRange.length !== 2) {
        throw new Error(`[soundworks:PluginPosition] Invalid option "xRange", "xRange" should be an Array of length 2`);
      }

      if (!Array.isArray(this.options.yRange) || this.options.yRange.length !== 2) {
        throw new Error(`[soundworks:PluginPosition] Invalid option "yRange", "yRange" should be an Array of length 2`);
      }

      if (!Array.isArray(this.options.yRange) || this.options.yRange.length !== 2) {
        throw new Error(`[soundworks:PluginPosition] Invalid option "yRange", "yRange" should be an Array of length 2`);
      }

      if (this.options.backgroundImage !== null && !isString(this.options.backgroundImage)) {
        throw new Error(`[soundworks:PluginPosition] Invalid option "backgroundImage", "backgroundImage" should "null" or "string"`);
      }

      this.server.stateManager.registerSchema(`sw:plugin:${this.id}`, schema);
    }

    /** @private */
    async start() {
      await super.start();

      this.infos = await this.server.stateManager.create(`sw:plugin:${this.id}`, this.options);
    }
  };

  return PluginPositionServer;
}
