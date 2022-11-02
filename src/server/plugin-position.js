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
  // @todo - add a map of <label: position>
};

export function isString(val) {
  return (typeof val === 'string' || val instanceof String);
}

const pluginFactory = function(Plugin) {
  return class PluginPosition extends Plugin {
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

    async start() {
      await super.start();

      this.infos = await this.server.stateManager.create(`sw:plugin:${this.id}`, this.options);
    }
  }
}

export default pluginFactory;
