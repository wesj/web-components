import GraphNode, {getCachedFloatAttr} from "./graph_node.js";

const Directions = {
    X: "x",
    Y: "y"
}

export class GridTicks extends GraphNode {
    get width() {
        return getCachedFloatAttr(this, "width", 3);
    }

    drawTick(renderer, value, position, size) {
        renderer.strokePath(() => {
            if (this.parentNode.direction === Directions.X) {
                renderer.translate(value, position, () => {
                    renderer.moveTo(0, -size, true);
                    renderer.lineTo(0, size, true);
                })
            } else {
                renderer.translate(position, value, () => {
                    renderer.moveTo(-size, 0, true);
                    renderer.lineTo(size, 0, true);
                })
            }
        })
    }

    render(renderer, debug) {
        debug && debug.groupCollapsed("Draw ticks");
        let values = this.parentNode.values;
        let position = this.parentNode.position(renderer);
        let size = this.width;

        if (!values || !(this.parentNode instanceof Axis)) {
            console.error("Ticks must be a child of an Axis");
            return;
        }

        renderer.save(() => {
            values.forEach((value) => {
                this.drawTick(renderer, value, position, size);
            })
        });
        debug && debug.groupEnd();
    }
}
customElements.define("x-grid-ticks", GridTicks);

class GridLabels extends GraphNode {
    render(renderer, debug) {
        debug && debug.groupCollapsed("Draw labels");
        renderer.font = this.font;
        let values = this.parentNode.values;
        let position = this.parentNode.position(renderer);

        if (!values || !(this.parentNode instanceof Axis)) {
            console.error("Labels must be a child of an Axis");
            return;
        }

        if (this.parentNode.direction === "x") {
            values.forEach((value) => {
                let txt = value;
                let textSize = renderer.measureText(txt);
                renderer.translate(value, position, () => {
                    if (txt instanceof Number || txt === 0) {
                        renderer.drawText(txt, -textSize.width / 2, this.fontSize * 1, true);
                    } else {
                        // Offset text labels to be between the tick marks
                        renderer.translate(0.5, null, () => {
                            renderer.drawText(txt, -textSize.width / 2, this.fontSize * 1, true);
                        });
                    }
                })
            });
        } else {
            values.forEach((value) => {
                let txt = value;
                let textSize = renderer.measureText(txt);
                renderer.translate(position, value, () => {
                    renderer.drawText(txt, -textSize.width - this.fontSize / 2, this.fontSize / 4, true);
                })
            });
        }

        debug && debug.groupEnd();        
    }
}
customElements.define("x-grid-labels", GridLabels);

export default class Axis extends GraphNode {
    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: "open" });
    }

    get min() {
        if (!("_min" in this)) {
            if (this.hasAttribute("min")) { 
                this._min = parseFloat(this.getAttribute("min"));
            } else {
                return 0;
            }
        }
        return this._min;
    }

    get max() {
        if (!("_max" in this)) {
            if (this.hasAttribute("max")) { 
                this._max = parseFloat(this.getAttribute("max"));
            } else {
                return 1;
            }
        }
        return this._max;
    }

     toCanvasCoords(value, realSize) {
        let scale = realSize / (this.max - this.min);

        // Flip the y-axis
        let ret = value;
        if (this.direction == Directions.Y) {
            ret += -realSize;
            ret = ret / scale / -1 + this.min;
        } else {
            ret = ret / scale + this.min;
        }

        // Convert an int to a string if we have a values list
        if (!this._valuesAreNumbers && this.values.length) {
            ret = Math.round(ret);
            return this.values[ret];
        }

        return ret;
    }

    _coord_cache = {}
    toScreenCoords(originalValue, realSize, skipTransform) {
        let values = this.values;
        let val = originalValue;

        if (skipTransform) {
            return val;
        }

        if (this._coord_cache[val]) {
            return this._coord_cache[val];
        }

        // Convert a string to an int if we have a values list
        if (typeof(val) !== "number" && values.length) {
            let newVal = values.indexOf(val);
            if (newVal >= 0) {
                val = newVal;
            } else {
                // throw "Invalid coordinate " + val;
            }
        }

        let scale = realSize / (this.max - this.min);
        let ret = (val - this.min) * scale;

        // Flip the y-axis
        if (this.direction == Directions.Y) {
            ret = (val - this.min) * scale * -1 + realSize;
        }

        this._coord_cache[val] = ret;
        return ret;
    }

    get direction() {
        if (!this._direction) {
            if (this.hasAttribute("direction")) { 
                this._direction = this.getAttribute("direction").toLowerCase();
            } else if (this.nodeName === "Y-AXIS") {
                this._direction = Directions.Y;
            } else {
                this._direction = Directions.X;
            }
        }

        return this._direction;
    }

    _values = [];
    _valuesAreNumbers = true;
    setup(graph, crossAxis) {
        if (this.hasAttribute("values")) {
            return;
        }

        let points = graph.points;
        if (points) {
            let keys;

            if (this.direction === Directions.X) {
                keys = points.map((pt) => pt.x);
            } else {
                keys = points.map((pt) => pt.y);
            }

            // Read and all all the keys
            keys.forEach((key) => {
                if (key === undefined) {
                    return;
                }

                try {
                    let keyFloat = parseFloat(key);
                    if (!isNaN(keyFloat)) {
                        key = keyFloat;
                    } else {
                        this._valuesAreNumbers = false;
                    }
                } catch(ex) { console.error(ex); }

                if (this._values.indexOf(key) == -1) {
                    this._values.push(key);
                }
            });

            // Order is probably screwed up with keys, but for numbers lets try and sort
            if (this._valuesAreNumbers) {
                this._values = this._values.sort()
            }

            // Setup the minimum
            if (!this.hasAttribute("min")) {
                this._min = Math.min.apply(null, this._values) || 0;

                if (this.direction === Directions.Y) {
                    this._min = Math.floor(this._min * 0.9);
                }
            }

            // Setup the maximum
            if (!this.hasAttribute("max")) {
                this._max = Math.max.apply(null, this._values) || (this._values.length - 1);
                if (!this._valuesAreNumbers) {
                    this._max += 1;
                }
                if (this.direction === Directions.Y) {
                    this._max = Math.ceil(this._max * 1.1);
                }
            }
        }
    }

    position(renderer) {
        let position = 0;
        if (this.style.position === "absolute") {
            if (this.direction === Directions.Y) {
                if (this.style.right !== "") {
                    position = renderer.xAxis.max;
                } else if (this.style.left !== undefined) {
                    position = renderer.xAxis.min;
                }
            } else {
                if (this.style.top !== "") {
                    position = renderer.yAxis.max;
                } else if (this.style.bottom !== undefined) {
                    position = renderer.yAxis.min;
                }
            }
        }
        return position;
    }

    render(renderer, debug) {
        debug && debug.groupCollapsed("Render axis", this.direction, this.min, this.max, this._values);
        renderer.save(() => {
            renderer.strokeColor = this.borderColor;
            renderer.fillColor = this.color;
            renderer.lineWidth = this.borderWidth.value;
    
            this.drawAxis(renderer, this.position(renderer), debug);
            this.drawChildren(renderer, debug);
        });
        debug && debug.groupEnd();
    }

    drawAxis(renderer, position, debug) {
        debug && debug.groupCollapsed("Draw axis " + this.id, position);
        renderer.strokePath(() => {
            if (this.direction === Directions.X) {
                renderer.moveTo(this.min, position);
                renderer.lineTo(this.max, position);
            } else {
                renderer.moveTo(position, this.min);
                renderer.lineTo(position, this.max);
            }
        });
        debug && debug.groupEnd();
    }

    get values() {
        if (this._values.length === 0 && this.hasAttribute("values")) {
            this._valuesAreNumbers = true;
            this._values = this.getAttribute("values").split(/\s+/).map((val) => {
                let keyFloat = parseFloat(val);
                if (!isNaN(keyFloat)) {
                    return keyFloat;
                }
                this._this._valuesAreNumbers = false;
                return val;
            });
            this._min = Math.min.apply(null, this._values) || 0;
            this._max = Math.max.apply(null, this._values) || (this._values.length - 1);
            this._min = Math.floor(this._min * 0.9);
            this._max = Math.ceil(this._max * 1.1);
        }
        return this._values
    }

    // Controls the resolution used for functions. We should probably just calculate this based on the screen
    get resolution() {
        return getCachedFloatAttr(this, "resultion", (this.max - this.min) / 50);
    }

    * valuesIter() {
        let vals = this.values;
        if (vals.length > 0) {
            for (var i = 0; i < vals.length; i++) {
                yield vals[i];
            }
        } else {
            let step = this.resolution;
            for (var i = this.min; i < this.max; i += step) {
                yield i;
            }
        }
    }

    get labels() {
        if (!("_labels" in this)) {
            if (this.hasAttribute("labels")) { 
                this._labels =  this.getAttribute("labels") == true;
            } else {
                return true;
            }
        }
        return this._labels;
    }
}
customElements.define("x-axis", Axis);

class YAxis extends Axis { }
customElements.define("y-axis", YAxis);

if (window.registerTests) {
    registerTests("axis.js", async (register) => {
        register("constructor", async (assert) => {
            let axis = new Axis();
            axis.setAttribute("min", "12.3");
            assert.is(axis.min, 12.3, "True");
        });
    });
}

