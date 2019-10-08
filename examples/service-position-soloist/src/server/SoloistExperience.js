import { Experience } from '@soundworks/core/server';

class SoloistExperience extends Experience {
  constructor(soundworks, clientTypes, options = {}) {
    super(soundworks, clientTypes);

  }

  start() {}

  enter(client) {}

  exit(client) {}
}

export default SoloistExperience;
