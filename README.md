# `@soundworks/plugin-position`

> [`soundworks`](https://github.com/collective-soundworks/soundworks) plugin for locating people in an area. In the soundworks-template default views, the plugin is associated to an initialization screen where people are asked to give their position on a map.

## Table of Contents

<!-- toc -->

- [Installation](#installation)
- [Example](#example)
- [Usage](#usage)
  * [Server installation](#server-installation)
    + [Registering the plugin](#registering-the-plugin)
    + [Requiring the plugin](#requiring-the-plugin)
  * [Client installation](#client-installation)
    + [Registering the plugin](#registering-the-plugin-1)
    + [Requiring the plugin](#requiring-the-plugin-1)
  * [Getting and Setting Position](#getting-and-setting-position)
- [Credits](#credits)
- [License](#license)

<!-- tocstop -->

## Installation

```sh
npm install @soundworks/plugin-position --save
```

## Example

A working example can be found in the [https://github.com/collective-soundworks/soundworks-examples](https://github.com/collective-soundworks/soundworks-examples) repository.

## Usage

### Server installation

#### Registering the plugin

```js
// index.js
import { Server } from '@soundworks/core/server';
import pluginPositionFactory from '@soundworks/plugin-position/server';

const server = new Server();
server.pluginManager.register('position', pluginPositionFactory, {
  // these values define the coordinates system of the area, they have
  // no special meaning and could be in any unit you find useful for
  // your application, defaults to [0, 1]
  xRange: [0, 2],
  yRange: [-1, 1],
  // @unstable - define a background image that will be used by
  // the default view of the plugin.
  backgroundImage: 'public/path/to/bg-image.png'
}, []);
```

#### Requiring the plugin

```js
// MyExperience.js
import { AbstractExperience } from '@soundworks/core/server';

class MyExperience extends AbstractExperience {
  constructor(server, clientType) {
    super(server, clientType);
    // require plugin in the experience
    this.position = this.require('position');
  }
}
```

### Client installation

#### Registering the plugin

```js
// index.js
import { Client } from '@soundworks/core/client';
import pluginPositionFactory from '@soundworks/plugin-position/client';

const client = new Client();
client.pluginManager.register('position', pluginPositionFactory, {}, []);
```

#### Requiring the plugin

```js
// MyExperience.js
import { Experience } from '@soundworks/core/client';

class MyExperience extends Experience {
  constructor(client) {
    super(client);
    // require plugin in the experience
    this.position = this.require('position');
  }
}
```

### Getting and Setting Position

The following API is available client-side only.

```js
const { x, y } = this.position.getPosition();
```

In some situation, you might want to set the position programmatically, for example to assign a position to people and asking them to go to the given place. Using this possibility as shown below will therefore bypass the default screen, the visual feedback or information will therefore be the responsibility of the developer.

```js
class MyExperience extends Experience {
  constructor(client) {
    super(client);
    // require plugin in the experience
    this.position = this.require('position');
    this.position.setPosition(x, y[, label]);
  }
}
```

For testing purpose (mainly), the position can also be given as a normalized value without having to take into account the `xRange` and `yRange` values.

```js
this.position.setNormalizedPosition(Math.random(), Math.random());
```

## Credits

The code has been initiated in the framework of the WAVE and CoSiMa research projects, funded by the French National Research Agency (ANR).

## License

BSD-3-Clause
