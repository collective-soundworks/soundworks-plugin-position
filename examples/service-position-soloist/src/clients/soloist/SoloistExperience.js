import { Experience } from '@soundworks/core/client';
import { render, html } from 'lit-html';
import '../views/elements/sw-dot-map.js';
// import '../views/elements/sw-dot-map.js';

class ControllerExperience extends Experience {
  constructor(client, config, $container) {
    super(client);

    this.config = config;
    this.$container = $container;

    this.playerStates = new Map();
  }

  async start() {
    super.start();

    this.soloistState = await this.client.stateManager.attach('soloist');
    this.soloistState.subscribe(() => this.renderApp());

    // should be:
    // this.client.stateManager.observe(async (list) => {
    //   for (const { name, nodeId } of list) {
    //     ...
    this.client.stateManager.observe(async (name, nodeId) => {
      if (name === 'player') {
        const state = await this.client.stateManager.attach(name, nodeId);

        state.subscribe(updates => this.renderApp());

        state.onDetach(() => {
          this.playerStates.delete(nodeId);
          this.renderApp();
        });

        this.playerStates.set(nodeId, state);
        this.renderApp();
      }
    });

    this.eventListeners = {
      updateTriggers: e => {
        this.soloistState.set({ triggers: e.detail }) ;
      },
    };

    // init app with current values
    this.renderApp();

    window.addEventListener('resize', () => this.renderApp());
  }

  renderApp() {
    const playerStates = Array.from(this.playerStates.values()).map(s => s.getValues());
    const positions = playerStates.filter(p => p.position !== null).map(p => p.position);

    const soloistState = this.soloistState.getValues();
    const { width, height } = this.$container.getBoundingClientRect();

    render(
      html`
        <div style="position: relative">
          <sw-dot-map
            class="players"
            width="${width}"
            height="${height}"
            x-range="${JSON.stringify(soloistState.xRange)}"
            y-range="${JSON.stringify(soloistState.yRange)}"
            background-color="#232323"
            dots="${JSON.stringify(positions)}"
          ></sw-dot-map>
          <sw-dot-map
            class="feedback"
            style="position: absolute; top: 0; left: 0; z-index: 1"
            width="${width}"
            height="${height}"
            x-range="${JSON.stringify(soloistState.xRange)}"
            y-range="${JSON.stringify(soloistState.yRange)}"
            dots-color="#AA3456"
            dots-radius-rel="0.3"
            dots-opacity="0.3"
            background-opacity="0"
            dots="${JSON.stringify(soloistState.triggers)}"
          ></sw-dot-map>
          <sw-dot-map
            class="interactions"
            style="position: absolute; top: 0; left: 0; z-index: 2"
            width="${width}"
            height="${height}"
            x-range="${JSON.stringify(soloistState.xRange)}"
            y-range="${JSON.stringify(soloistState.yRange)}"
            dots-color="#AA3456"
            dots-radius-rel="0.3"
            dots-opacity="0.1"
            background-opacity="0"
            capture-events
            @input=${this.eventListeners.updateTriggers}
          ></sw-dot-map>
        </div>`
      , this.$container
    );
  }
}

export default ControllerExperience;
