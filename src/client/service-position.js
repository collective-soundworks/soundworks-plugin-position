const serviceFactory = function(Service) {

  return class ServicePosition extends Service {
    constructor(client, name, options) {
      super(client, name);

      const defaults = {

      };

      this.options = this.configure(defaults, options);
    }

    async start() {
      super.start();

      this.state = await this.client.stateManager.create(`s:${this.name}`);
      // wait for some position to be given before ready
      this.state.subscribe(updates => {
        if (this.signals.ready.value === false) {
          this.ready();
        }
      });

      this.client.socket.addListener(`s:${this.name}:config`, (xRange, yRange) => {
        this.options = { xRange, yRange };
        this.started();
      });

      this.client.socket.send(`s:${this.name}:init`);
    }

    setPosition(x, y) {
      const { xRange, yRange } = this.options;
      const normX = (x - xRange[0]) / (xRange[1] - xRange[0]);
      const normY = (y - yRange[0]) / (yRange[1] - yRange[0]);

      this.state.set({ x, y, normX, normY });
    }

    setNormalizedPosition(normX, normY) {
      const { xRange, yRange } = this.options;
      const x = normX * (xRange[1] - xRange[0]) + xRange[0];
      const y = normY * (yRange[1] - yRange[0]) + yRange[0];

      this.state.set({ x, y, normX, normY });
    }
  }

}

// not mandatory
serviceFactory.defaultName = 'service-position';

export default serviceFactory;
