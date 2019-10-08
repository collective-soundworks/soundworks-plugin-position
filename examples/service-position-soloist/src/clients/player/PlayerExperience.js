import { Experience } from '@soundworks/core/client';
import { render, html } from 'lit-html';
import '../views/elements/sw-dot-map';

class PlayerExperience extends Experience {
  constructor(client, config = {}, $container) {
    super(client);

    this.config = config;
    this.$container = $container;
    // require services
    this.position = this.require('position');

    // random position
    this.client.serviceManager.observe((serviceStates) => {
      if (serviceStates['position'] === 'started') {
        this.position.setPosition(Math.random(), Math.random());
      }
    });
  }

  async start() {
    super.start();

    this.playerState = await this.client.stateManager.create('player');
    this.playerState.set({ position: this.position.state.getValues() });

    this.playerState.subscribe(updates => {
      if ('distance' in updates) {
        this.renderApp();
      }
    });

    this.renderApp();
  }

  renderApp() {
    const position = this.position.state.getValues();
    const { xRange, yRange } = this.position.options;
    const { distance } = this.playerState.getValues();
    const { width, height } = this.$container.getBoundingClientRect();

    render(html`
      <div
        class="screen"
        style="background-color: rgba(255, 255, 255, ${1 - distance})"
      >
        <section class="half-screen aligner">
          <pre><code>${JSON.stringify(position, null, 2)}</code></pre>
        </section>
        <section class="half-screen aligner">
          <sw-dot-map
            width="${width}"
            height="${height / 2}"
            x-range="${JSON.stringify(xRange)}"
            y-range="${JSON.stringify(yRange)}"
            background-color="#232323"
            dots="${JSON.stringify([position])}"
          ></sw-dot-map>
        </section>
      </div>
    `, this.$container);
  }
}

export default PlayerExperience;
