const pluginFactory = function(AbstractPlugin) {
  return class PluginPosition extends AbstractPlugin {
    constructor(client, name, options) {
      super(client, name);

      const defaults = {};

      this.options = this.configure(defaults, options);
      // store values if setPosition is called before the service is started
      this._tmpState = null;
    }

    async start() {
      this.state = await this.client.stateManager.create(`s:${this.name}`);
      // wait for some position to be given before ready
      this.state.subscribe(updates => {
        if (this.signals.ready.value === false) {
          this.ready();
        }
      });

      this.client.socket.addListener(`s:${this.name}:config`, (xRange, yRange, backgroundImage) => {
        this.options = { xRange, yRange, backgroundImage };

        this.started();

        // if set position have been called before start
        if (this._tmpState && 'x' in this._tmpState && 'y' in this._tmpState) {
          const { x, y, label } = this._tmpState;
          this.setPosition(x, y, label);
        } else if (this._tmpState && 'normX' in this._tmpState && 'normY' in this._tmpState) {
          const { normX, normY, label } = this._tmpState;
          this.setNormalizedPosition(x, y, label);
        }
      });

      this.client.socket.send(`s:${this.name}:init`);
    }

    setPosition(x, y, label = null) {
      if (!this.state) {
        this._tmpState = { x, y, label };
        return;
      }

      const { xRange, yRange } = this.options;
      const normX = (x - xRange[0]) / (xRange[1] - xRange[0]);
      const normY = (y - yRange[0]) / (yRange[1] - yRange[0]);

      this.state.set({ x, y, normX, normY, label });
    }

    getPosition() {
      const x = this.state.get('x');
      const y = this.state.get('y');
      const label = this.state.get('label');
      return { x, y, label };
    }

    setNormalizedPosition(normX, normY, label = null) {
      if (!this.state) {
        this._tmpState = { normX, normY, label };
        return;
      }

      const { xRange, yRange } = this.options;
      const x = normX * (xRange[1] - xRange[0]) + xRange[0];
      const y = normY * (yRange[1] - yRange[0]) + yRange[0];

      if (this.state) {
        this.state.set({ x, y, normX, normY, label });
      } else {
        this._tmpState = { x, y, normX, normY, label };
      }
    }

    getNormalizedPosition() {
      const normX = this.state.get('normX');
      const normY = this.state.get('normY');
      const label = this.state.get('label');
      return { normX, normY, label };
    }
  }

}

export default pluginFactory;
