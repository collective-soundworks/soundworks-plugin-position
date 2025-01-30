/**
 * Server-side representation of the position plugin.
 *
 * The constructor should never be called manually. The plugin will be
 * instantiated by soundworks when registered in the `pluginManager`
 *
 * Available options:
 * - `[xRange=[0, 1]]` {Array} - Range of the area in the x axis.
 * - `[yRange=[0, 1]]` {Array} - Range of the area in the y axis.
 * - `[backgroundImage=null]` {String} - Path to a background image to be displayed
 *   by the launcher view.
 *
 * @example
 * server.pluginManager.register('position', ServerPluginPosition, {
 *   xRange: [0, 2],
 *   yRange: [-1, 1],
 *   backgroundImage: 'public/path/to/map.png',
 * });
 */
export default class ServerPluginPosition {
    /** @hideconstructor */
    constructor(server: any, id: any, options: any);
    options: any;
    /** @private */
    private start;
    infos: any;
}
//# sourceMappingURL=ServerPluginPosition.d.ts.map