import { assert } from 'chai';

import { Server } from '@soundworks/core/server.js';
import { Client } from '@soundworks/core/client.js';

import serverPluginPosition from '../src/server/plugin-position.js';
import clientPluginPosition from '../src/client/plugin-position.js';

const config = {
  app: {
    name: 'test-plugin-position',
    clients: {
      test: {
        target: 'node',
      },
    },
  },
  env: {
    port: 8080,
    serverAddress: '127.0.0.1',
    useHttps: false,
    verbose: false,
  },
};

describe('PluginPosition', () => {
  describe('[server]', () => {
    it('should throw if options.xRange is not an array', async () => {
      const server = new Server(config);

      let errored = false;
      try {
        server.pluginManager.register('position', serverPluginPosition, {
          xRange: null,
        });

        await server.init();
      } catch(err) {
        console.log(err.message);
        errored = true;
      }
      if (!errored) { assert.fail('should have thrown'); }
    });

    it('should throw if options.xRange.length is not 2', async () => {
      const server = new Server(config);

      let errored = false;
      try {
        server.pluginManager.register('position', serverPluginPosition, {
          xRange: [0, 1, 2],
        });

        await server.init();
      } catch(err) {
        console.log(err.message);
        errored = true;
      }
      if (!errored) { assert.fail('should have thrown'); }
    });

    it('should throw if options.yRange is not an array', async () => {
      const server = new Server(config);

      let errored = false;
      try {
        server.pluginManager.register('position', serverPluginPosition, {
          yRange: null,
        });

        await server.init();
      } catch(err) {
        console.log(err.message);
        errored = true;
      }
      if (!errored) { assert.fail('should have thrown'); }
    });

    it('should throw if options.yRange.length is not 2', async () => {
      const server = new Server(config);

      let errored = false;
      try {
        server.pluginManager.register('position', serverPluginPosition, {
          yRange: [0, 1, 2],
        });

        await server.init();
      } catch(err) {
        console.log(err.message);
        errored = true;
      }
      if (!errored) { assert.fail('should have thrown'); }
    });

    it('should throw if options.backgroundImage is not null or not string', async () => {
      const server = new Server(config);

      let errored = false;
      try {
        server.pluginManager.register('position', serverPluginPosition, {
          backgroundImage: true,
        });

        await server.init();
      } catch(err) {
        console.log(err.message);
        errored = true;
      }
      if (!errored) { assert.fail('should have thrown'); }
    });

    it('should properly register its schema', async () => {
      const server = new Server(config);

      let errored = false;
      try {
        server.pluginManager.register('position', serverPluginPosition, {});
        await server.init();
      } catch(err) {
        console.log(err.message);
        errored = true;
      }
      if (errored) { assert.fail('should not have thrown'); }
    });

    it('infos state should represent given options', async () => {
      const options = {
        xRange: [-1, 2],
        yRange: [-3, 0.5],
        backgroundImage: 'test.png',
      };

      const server = new Server(config);
      server.pluginManager.register('position', serverPluginPosition, options);
      await server.init();

      const plugin = await server.pluginManager.get('position');

      assert.deepEqual(options, plugin.infos.getValues());
    });
  });

  describe('[client]', () => {
    it('plugin should start once setPosition is called', async () => {
      const options = {
        xRange: [-1, 1],
        yRange: [-1, 1],
        backgroundImage: 'test.png',
      };

      const server = new Server(config);
      server.pluginManager.register('position', serverPluginPosition, options);
      await server.init();
      await server.start();

      const client = new Client({ role: 'test', ...config });
      client.pluginManager.register('position', clientPluginPosition);
      // the plugin wont resolve start() until setPosition is called
      client.pluginManager.onStateChange((plugins) => {
        const position = plugins['position'];

        // @note - this is a bit complicated...
        if (position.status === 'inited') {
          if (position.state && position.state.infos) {
            assert.deepEqual(position.state.infos, options);

            if (position.state.x === null && position.state.y === null) {
              position.setPosition(0, 0);
            }
          }
        }
      });

      await client.init();

      const position = await client.pluginManager.get('position');
      assert.deepEqual(position.getPosition(), { x: 0, y: 0 });
      assert.deepEqual(position.getNormalizedPosition(), { normX: 0.5, normY: 0.5 });

      await server.stop();
    });

    it('plugin should start once setNormalizedPosition is called', async () => {
      const options = {
        xRange: [-1, 1],
        yRange: [-1, 1],
        backgroundImage: 'test.png',
      };

      const server = new Server(config);
      server.pluginManager.register('position', serverPluginPosition, options);
      await server.init();
      await server.start();

      const client = new Client({ role: 'test', ...config });
      client.pluginManager.register('position', clientPluginPosition);
      // the plugin wont resolve start() until setPosition is called
      client.pluginManager.onStateChange((plugins) => {
        const position = plugins['position'];

        // @note - this is a bit complicated...
        if (position.status === 'inited') {
          if (position.state && position.state.infos) {
            assert.deepEqual(position.state.infos, options);

            if (position.state.x === null && position.state.y === null) {
              position.setNormalizedPosition(0.5, 0.5);
            }
          }
        }
      });

      await client.init();

      const position = await client.pluginManager.get('position');
      assert.deepEqual(position.getPosition(), { x: 0, y: 0 });
      assert.deepEqual(position.getNormalizedPosition(), { normX: 0.5, normY: 0.5 });

      await server.stop();
    });

    it('option.randomize should assign random position to client', async () => {
      const server = new Server(config);
      server.pluginManager.register('position', serverPluginPosition);
      await server.init();
      await server.start();

      const client = new Client({ role: 'test', ...config });
      client.pluginManager.register('position', clientPluginPosition, {
        randomize: true,
      });
      await client.init();

      const plugin = await client.pluginManager.get('position');
      const position = plugin.getPosition();
      console.log(position);
      assert.isNumber(position.x);
      assert.isNumber(position.y);

      await server.stop();
    });
  });
});
