import '@babel/polyfill';
import 'source-map-support/register';

import { Server } from '@soundworks/core/server';
import getConfig from './utils/getConfig';
import path from 'path';
import serveStatic from 'serve-static';
import compile from 'template-literal';

import playerSchema from './schemas/playerSchema';
import soloistSchema from './schemas/soloistSchema';

// import services
import servicePositionFactory from '@soundworks/service-position/server';

import PlayerExperience from './PlayerExperience';
import SoloistExperience from './SoloistExperience';

import osc from 'osc';

const ENV = process.env.ENV || 'default';
const config = getConfig(ENV);

console.log(`
--------------------------------------------------------
- running "${config.app.name}" in "${ENV}" environment -
--------------------------------------------------------
`);

(async function launch() {
  try {
    const server = new Server();

    const area = {
      xRange: [0, 1],
      yRange: [0, 1],
    }

    // -------------------------------------------------------------------
    // register services
    // -------------------------------------------------------------------

    server.registerService('position', servicePositionFactory, area, []);

    // -------------------------------------------------------------------
    // launch application
    // -------------------------------------------------------------------

    await server.init(config, (clientType, config, httpRequest) => {
      return {
        clientType: clientType,
        app: {
          name: config.app.name,
          author: config.app.author,
        },
        env: {
          type: config.env.type,
          websockets: config.env.websockets,
          assetsDomain: config.env.assetsDomain,
        }
      };
    });

    // register schemas and init shared states
    server.stateManager.registerSchema('player', playerSchema);
    server.stateManager.registerSchema('soloist', soloistSchema);

    const soloistState = await server.stateManager.create('soloist');
    soloistState.set(area);

    // html template and static files (in most case, this should not be modified)
    server.configureHtmlTemplates({ compile }, path.join('.build', 'server', 'tmpl'))
    server.router.use(serveStatic('public'));
    server.router.use('build', serveStatic(path.join('.build', 'public')));

    const playerExperience = new PlayerExperience(server, 'player', soloistState);
    const soloistExperience = new SoloistExperience(server, 'soloist');

    await server.start();
    playerExperience.start();
    soloistExperience.start();

    // Create an osc.js UDP Port listening on port 57121.
    const udpPort = new osc.UDPPort({
        localAddress: '127.0.0.1',
        localPort: 57121,
        metadata: true
    });

    udpPort.on('message', msg => {
      switch (msg.address) {
        case '/trigger': {
          const position = {
            x: msg.args[0].value,
            y: msg.args[1].value,
          }
          soloistState.set({ triggers: [position] });
        }
      }
    });

    udpPort.open();


  } catch (err) {
    console.error(err.stack);
  }
})();

process.on('unhandledRejection', (reason, p) => {
  console.log('> Unhandled Promise Rejection');
  console.log(reason);
});
