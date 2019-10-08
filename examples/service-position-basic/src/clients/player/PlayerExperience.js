import { Experience } from '@soundworks/core/client';
import { render, html } from 'lit-html';
import renderAppInitialization from '../views/renderAppInitialization';

class PlayerExperience extends Experience {
  constructor(client, config = {}, $container) {
    super(client);

    this.config = config;
    this.$container = $container;

    // require services
    this.position = this.require('position');

    renderAppInitialization(client, config, $container);
  }

  start() {
    super.start();

    this.renderApp();
  }

  renderApp() {
    const position = this.position.state.getValues();

    render(html`
      <div class="screen">
        <section class="half-screen aligner">
          <pre><code>${JSON.stringify(position, null, 2)}</code></pre>
        </section>
        <section class="half-screen aligner"></section>
      </div>
    `, this.$container);
  }
}

export default PlayerExperience;
