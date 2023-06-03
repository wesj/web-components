function getStyleUnit(node, attr, resolved) {
    let val = getStyleAttr(node, attr, resolved);
    if (val) {
        try {
            let match = val.match(/([+-]?([0-9]+([.][0-9]*)?|[.][0-9]+))\s*(em|ex|ch|rem|vw|vh|vmin|vmax|%|cm|mm|px|pt|pc)/i);
            if (match) {
                return { value: parseFloat(match[1]), unit: match[4] };
            }
        } catch(ex) {
            console.error("Can't match unit", val, ex);
        }
    }
    return undefined;
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
            node[key] = { value: defaultValue, unit: "px" };
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
        this._borderRadius = getCachedStyleAttrWithUnit(this, "border-radius", 0, true, style);
        this._borderColor = getCachedStyleAttr(this, "border-color", "transparent", true, style);
        this._fontSize = getCachedStyleAttrWithUnit(this, "font-size", 14, false, style);
        getCachedStyleAttr(this, "font", "14px sans-serif", false, style);
        this._listStyleType = getCachedStyleAttr(this, "list-style-type", "none", true, style);
    }

    get width() {
        return getCachedStyleAttrWithUnit(this, "width", 0, false);
    }

    get height() {
        return getCachedStyleAttrWithUnit(this, "height", 0, false);
    }

    get color() {
        return getCachedStyleAttr(this, "color", "black", false);
    }

    get backgroundColor() {
        return getCachedStyleAttr(this, "background-color", "transparent", true);
    }

    get borderWidth() {
        return getCachedStyleAttrWithUnit(this, "border-width", 0, true);
    }

    get padding() {
        return getCachedStyleAttrWithUnit(this, "padding", 0, false);
    }
 
    get paddingLeft() {
        return getCachedStyleAttrWithUnit(this, "paddingLeft", 0, false);
    }

    get paddingRight() {
        return getCachedStyleAttrWithUnit(this, "paddingRight", 0, false);
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
        return getCachedStyleAttr(this, "border-color", "transparent", true);
    }

    get top() {
        return getCachedStyleAttrWithUnit(this, "top", 0, false);
    }

    get left() {
        return getCachedStyleAttrWithUnit(this, "left", 0, false);
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