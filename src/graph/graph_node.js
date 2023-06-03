function listStyleType(node) {
    if (!node) {
        return undefined;
    }

    let style = window.getComputedStyle(node);
    let t = style["list-style-type"];
    if (t) {
        return t;
    } else {
        return listStyleType(node.parentNode);
    }
}

function borderRadius(node) {
    if (!node) {
        return undefined;
    }
    let style = window.getComputedStyle(node);
    let t = style["border-radius"];
    if (t) {
        return parseFloat(t);
    } else {
        return borderRadius(node.parentNode);
    }
}


export default class GraphNode extends HTMLElement {
    _updateComputedStyles() {
        let style = window.getComputedStyle(this);
        this._color =
            this.style.stroke ? this.style.stroke :
            style.stroke !== "none" ? style.stroke :
            this.style.color ? this.style.color :
            style.color !== "none" ? style.color :
            "black";
        this._backgroundColor =
            this.style.backgroundColor ? this.style.backgroundColor :
            style.getPropertyValue("background-color") ? style.getPropertyValue("background-color") :
            this.style.fill ? this.style.fill :
            style.fill ? style.fill :
            null;
        this._borderWidth =
            this.style["border-width"] ? parseFloat(this.style["border-width"]) :
            style["border-width"] ? parseFloat(style["border-width"]) :
            this.style["stroke-width"] ? parseFloat(this.style["stroke-width"]) :
            style["stroke-width"] ? parseFloat(style["stroke-width"]) :
            1;
        this._borderRadius = borderRadius(this);
        this._padding = parseFloat(style["padding"]) || 0;
        this._borderColor = style["border-color"];
        this._fontSize = parseFloat(style.fontSize) || 14;
        this._font = style.font || "14px sans-serif";
    }

    get color() {
        if (this._color) {
            this._updateComputedStyles();
        }
        return this._color;
    }

    get backgroundColor() {
        if (this._backgroundColor === undefined) {
            this._updateComputedStyles();
        }
        return this._backgroundColor;
    }

    get borderWidth() {
        if (this._borderWidth === undefined) {
            this._updateComputedStyles();
        }
        return this._borderWidth;
    }

    get padding() {
        if (this._padding === undefined) {
            this._updateComputedStyles();
        }
        return this._padding;
    }

    get fontSize() {
        if (this._fontSize === undefined) {
            this._updateComputedStyles();
        }
        return this._fontSize;
    }

    get font() {
        if (this._font === undefined) {
            this._updateComputedStyles();
        }
        return this._font;
    }

    get listStyleType() {
        if (this._listStyleType === undefined) {
            this._listStyleType = listStyleType(this);
        }
        return this._listStyleType;
    }

    get borderRadius() {
        if (this._borderRadius === undefined) {
            this._updateComputedStyles();
        }
        return this._borderRadius;
    }

    get borderColor() {
        if (this._borderColor === undefined) {
            this._updateComputedStyles();
        }
        return this._borderColor;
    }

    get borderWidth() {
        if (this._borderWidth === undefined) {
            this._updateComputedStyles();
        }
        return this._borderWidth;
    }
}