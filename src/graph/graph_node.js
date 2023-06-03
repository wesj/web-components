function getStyleUnit(node, attr, resolved) {
    let val = getStyleAttr(node, attr, resolved);
    if (val) {
        try {
            let match = val.match(/([+-]?([0-9]+([.][0-9]*)?|[.][0-9]+))\s*(em|ex|ch|rem|vw|vh|vmin|vmax|%|cm|mm|px|pt|pc)/i)
            return { value: parseFloat(match[1]), unit: match[4] };
        } catch(ex) {
            console.error("Can't match unit", val, ex);
        }
    } else {
        return undefined;
    }
}

function getStyleAttr(node, attr, resolved) {
    resolved = resolved || getComputedStyle(node);
    return node.style[attr]           ? node.style[attr] :
            resolved[attr] !== "none" ? resolved[attr] : undefined;
}

export function getCachedStyleAttrWithUnit(node, attr, defaultValue, shouldIterate, resolved) {
    let key = "_" + attr + "_";
    if (!node[key]) {
        let val = getStyleUnit(node, attr, resolved);
        if (val) {
            node[key] = val;
        } else if (shouldIterate && node.parentNode) {
            node[key] = getCachedStyleAttrWithUnit(node.parentNode, attr, defaultValue, shouldIterate);
        } else {
            node[key] = defaultValue;
        }
    }

    return node[key];
}

export function getCachedStyleAttr(node, attr, defaultValue, shouldIterate, resolved) {
    let key = "_" + attr + "_";
    if (!node[key]) {
        let val = getStyleAttr(node, attr, resolved);
        if (val) {
            node[key] = val;
        } else if (shouldIterate && node.parentNode instanceof Element) {
            node[key] = getCachedStyleAttr(node.parentNode, attr, defaultValue, shouldIterate);
        } else {
            node[key] = defaultValue;
        }
    }

    return node[key];
}

export function getCachedFloatAttr(node, attr, defaultValue) {
    let key = "_" + attr + "_";
    if (!node[key]) {
        if (node.hasAttribute(attr)) {
            let val = node.getAttribute(attr);
            try {
                node[key] = parseFloat(val);
            } catch(ex) {
                console.error("Could not parse", val, ex)
                return defaultValue;
            }
        } else {
            return defaultValue;
        }
    }

    return node[key];
}

export default class GraphNode extends HTMLElement {
    _updateComputedStyles() {
        let style = window.getComputedStyle(this);
        // this._stroke = getCachedStyleAttr(this, "stroke", "black", true, style);
        this._color = getCachedStyleAttr(this, "color", "black", true, style);
        this._backgroundColor = getCachedStyleAttr(this, "background-color", "transparent", true, style);
        // this._fill = getCachedStyleAttr(this, "fill", "transparent", false, style);
        this._borderWidth = getCachedStyleAttrWithUnit(this, "border-width", 1, false, style);
        // this._strokeWidth = getCachedStyleAttrWithUnit(this, "stroke-width", 1, false, style);
        this._borderRadius = getCachedStyleAttrWithUnit(this, "border-radius", 0, true, style);
        getCachedStyleAttrWithUnit(this, "padding", 0, false, style);
        this._borderColor = getCachedStyleAttr(this, "border-color", "transparent", true, style);
        this._fontSize = getCachedStyleAttrWithUnit(this, "font-size", 14, false, style);
        getCachedStyleAttr(this, "font", "14px sans-serif", false, style);
        this._listStyleType = getCachedStyleAttr(this, "list-style-type", "none", true, style);
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
            this._updateComputedStyles();
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

    drawChildren(renderer, debug) {
        for (var i = 0; i < this.shadowRoot.childNodes.length; i++) {
            let child = this.shadowRoot.childNodes[i];
            if (child.render) {
                child.render(renderer, debug);
            }
        }
        for (var i = 0; i < this.childNodes.length; i++) {
            let child = this.childNodes[i];
            if (child.render) {
                child.render(renderer, debug);
            }
        }
    }
}