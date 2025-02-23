import { ServerPlugin } from '@soundworks/core/server.js';
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

/**
 * Server-side representation of the position plugin.
 *
 * The constructor should never be called manually. The plugin will be
 * instantiated by soundworks when registered in the `pluginManager`
 *
 * Available options:
 * - `[xRange=[0, 1]]` {Array} - Range of the area in the x axis.
 * - `[yRange=[0, 1]]` {Array} - Range of the area in the y axis.
 * - `[backgroundImage=null]` {String} - Path to a background image to be displayed
 *   by the launcher view.
 *
 * @example
 * server.pluginManager.register('position', ServerPluginPosition, {
 *   xRange: [0, 2],
 *   yRange: [-1, 1],
 *   backgroundImage: 'public/path/to/map.png',
 * });
 */
export default class ServerPluginPosition extends ServerPlugin {
  /** @hideconstructor */
  constructor(server, id, options) {
    super(server, id);

    const defaults = {
      xRange: [0, 1],
      yRange: [0, 1],
      backgroundImage: null,
    };

    this.options = Object.assign({}, defaults, options);

    if (!Array.isArray(this.options.xRange) || this.options.xRange.length !== 2) {
      throw new TypeError(`Cannot construct 'ServerPluginPosition': Invalid option "xRange", "xRange" should be an Array of length 2`);
    }

    if (!Array.isArray(this.options.yRange) || this.options.yRange.length !== 2) {
      throw new TypeError(`Cannot construct 'ServerPluginPosition': Invalid option "yRange", "yRange" should be an Array of length 2`);
    }

    if (!Array.isArray(this.options.yRange) || this.options.yRange.length !== 2) {
      throw new TypeError(`Cannot construct 'ServerPluginPosition': Invalid option "yRange", "yRange" should be an Array of length 2`);
    }

    if (this.options.backgroundImage !== null && !isString(this.options.backgroundImage)) {
      throw new TypeError(`Cannot construct 'ServerPluginPosition': Invalid option "backgroundImage", "backgroundImage" should "null" or "string"`);
    }

    this.server.stateManager.defineClass(`sw:plugin:${this.id}`, schema);
  }

  /** @private */
  async start() {
    await super.start();

    this.infos = await this.server.stateManager.create(`sw:plugin:${this.id}`, this.options);
  }
}
