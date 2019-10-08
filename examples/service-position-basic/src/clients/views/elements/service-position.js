import { LitElement, html, svg, css } from 'lit-element';
import { ifDefined } from 'lit-html/directives/if-defined';
import * as defaultStyles from './defaultStyles';

class ServicePosition extends LitElement {
  static get properties() {
    return {
      xRange: {
        type: Array,
        attribute: 'x-range',
      },
      yRange: {
        type: Array,
        attribute: 'y-range',
      },
      width: {
        type: Number
      },
      height: {
        type: Number
      },
      backgroundImage: { type: '' },
    }
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }

      .svg-container {
        position: relative;
      }

      svg {
        background-color: #343434;
        position: absolute;
      }

      .bottom-container {
        box-sizing: border-box;
        position: relative;
        padding: 20px;
      }

      .placeholder {
        position: relative;
        top: 50%;
        margin-top: -20px;
      }

      .btn {
        ${defaultStyles.largeBtn}
      }

      .info {
        ${defaultStyles.info}
      }
    `;
  }

  constructor() {
    super();

    this.cx = null;
    this.cy = null;
    this.active = false;

    this.containerSize = null;
    this.maxRange = null;
    this.svgWidth = null;
    this.svgHeight = null;

    this.touchId = null;
  }

  render() {
    return html`
      <section
        class="svg-container"
        style="width: ${this.containerSize}px; height: ${this.containerSize}px;"
      >
        <svg
          @mousedown="${this.activateDot}"
          @mousemove="${this.updateDot}"
          @mouseup="${this.deactiveDot}"
          @mouseleave="${this.deactiveDot}"

          @touchstart="${this.onTouchStart}"
          @touchmove="${this.onTouchMove}"
          @touchend="${this.onTouchEnd}"

          @contextmenu="${this.preventContextMenu}"

          viewBox="0 0 ${this.svgWidth} ${this.svgHeight}"
          style="width: ${this.svgWidth}px;
            height: ${this.svgHeight}px;
            top: ${(this.containerSize - this.svgHeight) / 2}px;
            left: ${(this.containerSize - this.svgWidth) / 2}px;"
        >
          ${(this.cx !== null && this.cy !== null) ? svg`
            <circle
              r="5"
              fill="steelblue"
              cx="${this.cx}"
              cy="${this.cy}"
              style="pointer-event: none"
            ></circle>
          ` : ''}
        </svg>
      </section>
      <section
        class="bottom-container"
        style="height: ${this.height - this.containerSize}px"
      >
        <div class="placeholder">
          ${(this.cx !== null && this.cy !== null)
            ? html`
              <button
                @click="${this.propagateChange}"
                class="btn"
              >Send</button>`
            : html`<p class="info">Please, select your position</p>`
          }
        </div>
      </section>
    `;
  }

  // define svg size, and ratio to map to xRange and yRange
  async performUpdate() {
    const orientation = this.width > this.height ? 'landscape' : 'portrait';
    const containerSize = orientation === 'portrait' ? this.width : this.height;
    const xDelta = this.xRange[1] - this.xRange[0];
    const yDelta = this.yRange[1] - this.yRange[0];
    const deltaRange = yDelta > xDelta ? yDelta : xDelta;

    this.svgWidth = containerSize / deltaRange * xDelta;
    this.svgHeight = containerSize / deltaRange * yDelta;
    this.containerSize = containerSize;
    this.deltaRange = deltaRange;

    super.performUpdate();
  }

  preventContextMenu(e) {
    e.preventDefault();
  }

  unifyEvent(touch, target) {
    const rect = target.getBoundingClientRect();
    const offsetX = touch.pageX - rect.left;
    const offsetY = touch.pageY - rect.top;
    return { offsetX, offsetY };
  }

  onTouchStart(e) {
    if (this.touchId) {
      return;
    }

    e.preventDefault();

    const touch = e.targetTouches[0];
    this.touchId = touch.identifier;
    this.activateDot(this.unifyEvent(touch, e.target));
  }

  onTouchMove(e) {
    e.preventDefault();

    Array.from(e.changedTouches).forEach(touch => {
      if (touch.identifier === this.touchId) {
        this.updateDot(this.unifyEvent(touch, e.target));
      }
    });
  }

  onTouchEnd(e) {
    e.preventDefault();

    Array.from(e.changedTouches).forEach(touch => {
      if (touch.identifier === this.touchId) {
        this.touchId = null;
        this.deactiveDot();
      }
    });
  }

  activateDot(e) {
    this.active = true;
    this.updateDot(e);
  }

  deactiveDot(e) {
    this.active = false;
  }

  updateDot({ offsetX, offsetY }) {
    if (!this.active) {
      return;
    }

    this.cx = Math.max(0, Math.min(this.svgWidth, offsetX));
    this.cy = Math.max(0, Math.min(this.svgHeight, offsetY));

    this.requestUpdate();
    this.propagateInput();
  }

  propagateInput() {
    this.propagateValues('input');
  }

  propagateChange() {
    this.propagateValues('change');
  }

  propagateValues(eventName) {
    const x = this.cx / this.containerSize * this.deltaRange + this.xRange[0];
    const y = this.cy / this.containerSize * this.deltaRange + this.yRange[0];

    const event = new CustomEvent(eventName, { detail: { x, y } });

    this.dispatchEvent(event);
  }
}

customElements.define('service-position', ServicePosition);
