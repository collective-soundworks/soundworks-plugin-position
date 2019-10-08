import '@babel/polyfill';
import "@wessberg/pointer-events";
import { Client } from '@soundworks/core/client';
import SoloistExperience from './SoloistExperience';

const config = window.soundworksConfig;

async function init() {
  try {
    // remove initial loader
    const client = new Client();

    await client.init(config);

    const $container = document.querySelector('#container');
    // create client side (player) experience and start the client
    const soloistExperience = new SoloistExperience(client, config, $container);

    document.body.classList.remove('loading');
    // start everything
    await client.start();
    soloistExperience.start();

    // ...
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        window.location.reload(true);
      }
    }, false);

    client.socket.addListener('close', () => {
      setTimeout(() => window.location.reload(true), 2000);
    });
  } catch(err) {
    console.error(err);
  }
}

window.addEventListener('load', init);
