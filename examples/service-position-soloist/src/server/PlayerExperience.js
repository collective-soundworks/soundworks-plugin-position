import { Experience } from '@soundworks/core/server';

function getNormalizedDistance(center, target, radius) {
  const dx = target.x - center.x;
  const dy = target.y - center.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const normDistance = distance / radius;

  return normDistance;
}

class PlayerExperience extends Experience {
  constructor(server, clientTypes, soloistState) {
    super(server, clientTypes);

    this.position = this.require('position');

    this.soloistState = soloistState;
  }

  async start() {
    super.start();

    const activePlayers = new Set();
    const playerStates = new Map();

    this.server.stateManager.observe(async (schemaName, nodeId) => {
      if (schemaName === 'player') {
        const playerState = await this.server.stateManager.attach(schemaName, nodeId);

        playerState.onDetach(() => playerStates.delete(nodeId));
        playerStates.set(nodeId, playerState);
      }
    });

    let radius = this.soloistState.getValues()['radius'];

    this.soloistState.subscribe(updates => {
      for (let key in updates) {
        switch (key) {
          case 'radius': {
            radius = updates[key];
            break;
          }
          case 'triggers': {
            const triggers = updates[key];

            if (triggers.length === 0) {
              for (let [id, playerState] of playerStates.entries()) {
                playerState.set({ distance: 1 });
              }

              activePlayers.clear();
            } else {
              for (let [id, playerState] of playerStates.entries()) {
                // console.log(client);
                let normDistance = +Infinity;
                const isActive = activePlayers.has(playerState);

                triggers.forEach(trigger => {
                  const playerPosition = this.position.states.get(id).getValues();
                  const normDistance = getNormalizedDistance(trigger, playerPosition, radius);
                  const inRadius = (normDistance <= 1);

                  if (isActive && !inRadius) {
                    playerState.set({ distance: 1 });
                    activePlayers.delete(playerState);
                  }

                  if (!isActive && inRadius) {
                    activePlayers.add(playerState);
                  }

                  if (inRadius) {
                    playerState.set({ distance: normDistance });
                  }
                });
              };
            }
            break;
          }
        }
      }
    });
  }

  enter(client) {
    super.enter(client);
  }

  exit(client) {
    super.exit(client);
  }
}

export default PlayerExperience;
