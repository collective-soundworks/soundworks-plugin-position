function createSchema(xRange, yRange) {
  const schema = {
    x: {
      type: 'float',
      min: xRange[0],
      max: xRange[1],
      default: null,
      nullable: true,
    },
    y: {
      type: 'float',
      min: yRange[0],
      max: yRange[1],
      default: null,
      nullable: true,
    },
    normX: {
      type: 'float',
      min: 0,
      max: 1,
      nullable: true,
      default: null,
    },
    normY: {
      type: 'float',
      min: 0,
      max: 1,
      nullable: true,
      default: null,
    }
  }

  return schema;
}

const serviceFactory = function(Service) {

  return class ServicePosition extends Service {
    constructor(server, name, options) {
      super(server, name);

      const defaults = {
        xRange: [0, 1],
        yRange: [0, 1],
      }

      this.options = this.configure(defaults, options);
      this.states = new Map();

      const { xRange, yRange } = this.options;
      const schema = createSchema(xRange, yRange);

      this.server.stateManager.registerSchema(`s:${this.name}`, schema);
    }

    start() {
      this.server.stateManager.observe(async (schemaName, clientId) => {
        if (schemaName === `s:${this.name}`) {
          const state = await this.server.stateManager.attach(schemaName, clientId);

          this.states.set(clientId, state);

          state.onDetach(() => {
            this.states.delete(clientId);
          });
        }
      });

      this.started();
      this.ready();
    }

    connect(client) {
      super.connect(client);

      const { xRange, yRange } = this.options;

      const init = () => {
        client.socket.send(`s:${this.name}:config`, xRange, yRange);
        client.socket.removeListener(`s:${this.name}:init`, init);
      }

      client.socket.addListener(`s:${this.name}:init`, init);
    }

    disconnect(client) {
      super.disconnect(client);
    }
  }
}

// not mandatory
serviceFactory.defaultName = 'service-position';

export default serviceFactory;
