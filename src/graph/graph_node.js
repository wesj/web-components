export default class GraphNode extends HTMLElement {
    _updateComputedStyles() {
        let style = window.getComputedStyle(this);
        this._color = style.stroke !== "none" ? style.stroke :
                     style.color !== "none" ? style.color : "black";
        this._backgroundColor = style.backgroundColor !== "rgba(0, 0, 0, 0)" ? style.backgroundColor : undefined;
        this._fill = style.fill !== "rgb(0, 0, 0)" ? style.fill : undefined;
        this._lineWidth = parseFloat(style["stroke-width"]) || 1;
        this._padding = parseFloat(style["padding-left"]) || 0;
        this._borderColor = style["border-top-color"];
        this._borderRadius = parseFloat(style["border-radius"]) || 0;
        this._fontSize = parseFloat(style.fontSize) || 14;
        this._font = style.font || "14px sans-serif";
        this._borderWidth = parseFloat(style["border-width"]) || 0;
        console.log(this.nodeName, style);
    }

    get color() {
        if (!this._color) {
            this._updateComputedStyles();
        }
        return this._color;
    }

    get backgroundColor() {
        if (!this._backgroundColor) {
            this._updateComputedStyles();
        }
        return this._backgroundColor;
    }

    get fill() {
        if (!this._fill) {
            this._updateComputedStyles();
        }
        return this._fill;
    }

    get lineWidth() {
        if (!this._lineWidth) {
            this._updateComputedStyles();
        }
        return this._lineWidth;
    }

    get padding() {
        if (!this._padding) {
            this._updateComputedStyles();
        }
        return this._padding;
    }

    get fontSize() {
        if (!this._fontSize) {
            this._updateComputedStyles();
        }
        return this._fontSize;
    }

    get font() {
        if (!this._font) {
            this._updateComputedStyles();
        }
        return this._font;
    }

    get listStyleType() {
        let style = window.getComputedStyle(this);
        let t = style["list-style-type"];
        return t;
    }

    get borderRadius() {
        if (!this._borderRadius) {
            this._updateComputedStyles();
        }
        return this._borderRadius;
    }

    get borderColor() {
        if (!this._borderColor) {
            this._updateComputedStyles();
        }
        return this._borderColor;
    }

    get borderWidth() {
        if (!this._borderWidth) {
            this._updateComputedStyles();
        }
        return this._borderWidth;
    }
}