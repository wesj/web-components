import GraphNode from "./graph_node.js";

function cacheFloatAttribute(node, attr) {
    let key = "_" + attr + "_";
    if (node[key]) {
        return node[key];
    }

    if (node.hasAttribute(attr)) {
        let val = node.getAttribute(attr);
        try {
            let parsed = parseFloat(val);
            if (!isNaN(parsed)) {
                node[key] = parsed;
            } else {
                node[key] = val;
            }
        } catch(ex) {
            console.error("Could not parse", val, ex);
            node[key] = val;
        }
    }
    return node[key];
}

export class BarNode extends GraphNode {
    render(renderer, debug) {
        debug.groupCollapsed("Draw bar", this.id, this.x, this.y);
        renderer.translate(this.x, null, () => {
            renderer.fillColor = this.backgroundColor;
            renderer.strokeColor = this.borderColor;
            renderer.lineWidth = this.borderWidth.value;

            // Because of weird coordinate system issues, we basically have to do
            // all the coordinate system transforms here for this to work.
            let p1 = renderer.toScreenCoords(0, 0);
            let p2 = renderer.toScreenCoords(this.width.value, this.y);
            let x = p1[0];
            let y = p1[1];
            let w = p2[0] - p1[0];
            let h = p2[1] - p1[1];
            renderer.fillRect(x, y, w, h, true);
            renderer.strokeRect(x, y, w, h, true);    
        });
        debug.groupEnd();
    }

    _y = undefined
    get y() {
        let val = cacheFloatAttribute(this, "y")
        if (!val) {
            try {
                this._y_ = parseFloat(this.textContent);
            } catch(ex) {
                this._y_ = this.textContent;
            }    
        }

        return this._y_;
    }
    set y(val) {
        this.textContent = val;
        this._y_ = val;
    }

    _x_ = undefined
    get x() {
        return cacheFloatAttribute(this, "x");
    }
    set x(val) {
        this.setAttribute("x", val);
        this._x_ = val;
    }
 
    style = {};

    distanceTo(x, y) {
        let dx = this.x - x;
        let dy = this.y - y;
        return dx * dx + dy * dy;
    }
}

customElements.define("x-bar", BarNode);

function numberToBar(num, x) {
    let point = new BarNode();
    point.y = num;
    point.x = x;
    return point;
}

function arrayToBars(data) {
    return data.map((d, index) => {
        if (d instanceof Object) {
            return objectToBar(d);
        } else {
            return numberToBar(d, index);
        }
    })
}

function objectToBar(obj, x) {
    let point = new BarNode();
    point.y = obj.y;
    point.x = x || obj.x;
    // point.style = obj.style;
    return point;
}

function objectToBars(data) {
    return Object.keys(data).map((x) => {
        let d = data[x];
        if (d instanceof Object) {
            return objectToBar(d, x);
        } else {
            return numberToBar(d, x);
        }
    })
}

function toBars(data) {
    if (Array.isArray(data)) {
        return arrayToBars(data);
    } else {
        return objectToBars(data);
    }
}

export default class BarGraph extends GraphNode {
    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: "open" });
    }

    get points() {
        if (this._points) {
            return this._points;
        }

        this._points = [];
        let index = 0; 

        let nodes = this.parentNode.parentNode.querySelectorAll("x-bars");
        let totalWidth = 1;
        nodes.forEach((node) => {
            if (node instanceof GraphNode) {
                if (node.paddingLeft) totalWidth -= node.paddingLeft.value;
                if (node.paddingRight) totalWidth -= node.paddingRight.value;
            }
        });
        let width = totalWidth / nodes.length;

        for (var i = 0; i < this.childNodes.length; i++) {
            let child = this.childNodes[i];
            if (child instanceof Text && child.textContent.trim()) {
                try {
                    let data = JSON.parse(child.textContent);
                    this._points = this._points.concat(toBars(data));
                    this._points.forEach((point) => {
                        point.setAttribute("style", `
                            width: ${width}%;
                            background-color: ${this.backgroundColor};
                            border-color: ${this.borderColor};
                            border-width: ${this.borderWidth.value}${this.borderWidth.unit};`);
                        this.shadow.appendChild(point);
                    });
                    index += this._points.length;
                } catch(ex) {
                    console.log("Can't parse", child.textContent, ex);
                }
            } else if (child instanceof BarNode) {
                if (!child.x) child.x = index;
                child.style.width = width + "%";
                this._points.push(child);
            }
            index += 1;
        }

        this.style.display = "none";
        return this._points;
    }

    get width() {
        if (this.children.length && this.children[0].width) {
            return this.children[0].width.value;
        } else if (this.shadow.childNodes.length && this.shadow.childNodes[0].width) {
            return this.shadow.childNodes[0].width.value;
        }
        return 0;
    }

    get offset() {
        let nodes = this.parentNode.querySelectorAll("x-bars");
        let offset = 0;
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].paddingLeft) offset += nodes[i].paddingLeft.value;
            if (nodes[i] === this) return offset;
            if (nodes[i].width) offset += nodes[i].width;
            if (nodes[i].paddingRight) offset += nodes[i].paddingRight.value;
        }
        return 0;
    }

    drawIndicator(renderer, width, height) {
        renderer.save(() => {
            renderer.fillColor = this.backgroundColor;
            renderer.strokeColor = this.borderColor;
            renderer.lineWidth = this.borderWidth.value;
            renderer.fillRect(0, 0, width, height, true);
            renderer.strokeRect(0, 0, width, height, true);
        });
    }

    render(renderer, debug) {
        debug.groupCollapsed("Render bars", this.id, this.offset);
        renderer.translate(this.offset, null, () => {
            this.drawChildren(renderer, debug);
        });
        debug.groupEnd();
    }
}

customElements.define("x-bars", BarGraph);