/**
 * Client-side representation of the position plugin.
 *
 * The constructor should never be called manually. The plugin will be
 * instantiated by soundworks when registered in the `pluginManager`
 *
 * Available options:
 * - `randomize` {Boolean} - Automatically give a random position to the client.
 *   Useful for testing
 *
 * @example
 * client.pluginManager.register('position', ClientPluginPosition, { randomize: true });
 */
export default class ClientPluginPosition {
    /** @hideconstructor */
    constructor(client: any, id: any, options?: {});
    options: any;
    state: {
        infos: any;
        x: any;
        y: any;
        normX: any;
        normY: any;
    };
    _startPromiseResolve: any;
    _startPromiseReject: any;
    /**
     * Start will resolve once `setPosition` or `setNormalizedPosition` is called.
     * If you do not rely on the `@soundworks/helpers` default views, you should
     * track the plugin start process and call one of these methods using
     * `client.stateManager.onStateChange` method. The callback should be written
     * very carefully to avoid running into infinite loop: first check for inited status,
     * then check for `state.infos`, then call setPosition on if `state.x` && `state.y`
     * are not null
     *
     * @example
     * client.pluginManager.onStateChange((plugins) => {
     *   const position = plugins['position'];
     *
     *   if (position.status === 'inited') {
     *     if (position.state && position.state.infos) {
     *       if (position.state.x === null && position.state.y === null) {
     *         position.setNormalizedPosition(0.5, 0.5);
     *       }
     *     }
     *   }
     * });
     *
     * @private
     */
    private start;
    /**
     * Set the x and y position of the client in the given ranges units.
     *
     * By default, this method is automatically called by the soundworks launcher,
     * you should not have to call it manually in most cases.
     *
     * @param {Number} x - x position in the given ranges units.
     * @param {Number} y - y position in the given ranges units.
     */
    setPosition(x: number, y: number): void;
    /**
     * Retrieve the given position in the given ranges units.
     *
     * @return {Object} - x / y position of the client.
     */
    getPosition(): any;
    /**
     * Set the x and y position of the client in normalized units.
     *
     * By default, this method is automatically called by the soundworks launcher,
     * you should not have to call it manually in most cases.
     *
     * @param {Number} x - x position in normalized units.
     * @param {Number} y - y position in normalized units.
     */
    setNormalizedPosition(normX: any, normY: any): void;
    /**
     * Retrieve the given position in normalized units.
     *
     * @return {Object} - normalized x / y position of the client.
     */
    getNormalizedPosition(): any;
}
//# sourceMappingURL=ClientPluginPosition.d.ts.map