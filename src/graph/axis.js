import GraphNode from "./graph_node.js";

const Directions = {
    X: "x",
    Y: "y"
}

const Positions = {
    START: "start",
    END: "end"
}

export default class Axis extends GraphNode {
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

    get resolution() {
        if (!("_resolution" in this)) {
            if (this.hasAttribute("resolution")) { 
                this._resolution =  parseFloat(this.getAttribute("resolution"));
            } else {
                this._resolution = (this.max - this.min) / 50;
            }
        }
        return this._resolution;
    }

    get ticks() {
        if (!("_ticks" in this)) {
            if (this.hasAttribute("ticks")) { 
                this._ticks =  this.getAttribute("ticks");
            }
        }
        return this._ticks || "grid";
    }

     toCanvasCoords(value, realSize) {
        let offset = 0;
        if (this.min === 0 && this.labels) {
            // TODO: This needs to be smarter on the right side
            offset = this.fontSize * 2;
        }

        let scale = (realSize - 2 * offset) / (this.max - this.min);

        // Flip the y-axis
        let ret = value;
        if (this.direction == Directions.Y) {
            ret += offset - realSize;
            ret = ret / scale / -1 + this.min;
        } else {
            ret -= offset;
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

        // Convert a string to an int if we have a values list
        if (typeof(val) != "number" && values.length) {
            let newVal = values.indexOf(val);
            if (newVal >= 0) {
                val = newVal;
            }
        }

        if (skipTransform) {
            return val;
        }

        if (this._coord_cache[val]) {
            return this._coord_cache[val];
        }

        let offset = 0;
        if (this.min === 0 && this.labels) {
            // TODO: This needs to be smarter on the right side
            offset = this.fontSize * 2;
        }

        let scale = (realSize - 2 * offset) / (this.max - this.min);
        let ret = (val - this.min) * scale;

        // Flip the y-axis
        if (this.direction == Directions.Y) {
            ret = (val - this.min) * scale * -1 + realSize - offset;
        } else {
            ret += offset;
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
                keys = Object.keys(points);
            } else {
                // If the cross axis is only showing a subset of values, we need to filter by it
                if (crossAxis) {
                    let newPoints = {};
                    crossAxis.forEach((key) => {
                        newPoints[key] = points[key];
                    })
                    points = newPoints;
                }
                keys = Object.values(points).filter(x => x !== null);
            }


            this._valuesAreNumbers = this._valuesAreNumbers;
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
                } catch(ex) { }

                if (this._values.indexOf(key) == -1) {
                    this._values.push(key);
                }
            });

            if (this._valuesAreNumbers) {
                this._values = this._values.sort()
            }

            if (!this.hasAttribute("min")) {
                this._min = Math.min.apply(null, this._values) || 0;
                if (this.direction === Directions.Y) {
                    this._min = Math.floor(this._min * 0.9);
                }
            }
            if (!this.hasAttribute("max")) {
                this._max = Math.max.apply(null, this._values) || (this._values.length - 1);
                if (this.direction === Directions.Y) {
                    this._max = Math.ceil(this._max * 1.1);
                }
            }
            console.log("Setup", this.direction, this._values, this._min, this._max);
        }
    }

    render(renderer) {
        console.log("   Render axis", this.direction, this.min, this.max, this._values);
        renderer.save(() => {
            renderer.strokeColor = this.borderColor;
            renderer.fillColor = this.color;
            renderer.lineWidth = this.borderWidth;
    
            let position = 0;
            this.drawAxis(renderer, position);    
            this.drawGrid(renderer, position);
        });
    }

    drawAxis(renderer, position) {
        renderer.strokePath(() => {
            if (this.direction === Directions.X) {
                renderer.moveTo(this.min, position);
                renderer.lineTo(this.max, position);
            } else {
                renderer.moveTo(position, this.min);
                renderer.lineTo(position, this.max);
            }
        });
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

    drawGrid(renderer, position) {
        if (this.ticks) {
            renderer.save(() => {
                console.log("       Draw grid", this.id);
                renderer.strokeColor = "rgb(220,220,220)";
                if (this.values && !this._valuesAreNumbers) {
                    for (let val of this.valuesIter()) {
                        this.drawTick(renderer, val, position);
                    }                    
                } else {
                    let space = 1;
                    let size = 3;

                    if (this.ticks === "major") {
                        this.drawTicks(renderer, space, position, -size, size, true);
                    } else if (this.ticks === "minor") {
                        let small_size = 2;
                        let small_space = space / 5;
                        this.drawTicks(renderer, space, position, -size, size, true);
                        this.drawTicks(renderer, small_space, position, -small_size, small_size, true);
                    } else if (this.ticks === "grid") {
                        if (this.direction === Directions.X) {
                            this.drawTicks(renderer, space, position, renderer.yAxis.min, renderer.yAxis.max, false);
                        } else {
                            this.drawTicks(renderer, space, position, renderer.xAxis.min, renderer.xAxis.max, false);
                        }
                    }
                }
            });
        }        
    }

    drawTick(renderer, value, position, sizeA, sizeB, skipTransform) {
        renderer.strokePath(() => {
            console.log(value, position, sizeA, sizeB, skipTransform);
            if (this.direction === "x") {
                if (!skipTransform) {
                    renderer.moveTo(value, position + sizeA);
                    renderer.lineTo(value, position + sizeB);
                } else {
                    renderer.translate(value, position, () => {
                        renderer.moveTo(0, sizeA, skipTransform);
                        renderer.lineTo(0, sizeB, skipTransform);
                    })
                }
            } else {
                if (!skipTransform) {
                    renderer.moveTo(position + sizeA, value);
                    renderer.lineTo(position + sizeB, value);
                } else {
                    renderer.translate(position, value, () => {
                        renderer.moveTo(sizeA, 0, skipTransform);
                        renderer.lineTo(sizeB, 0, skipTransform);
                    })
                }
            }
        })

        if (this.labels) {
            let txt = value;
            let textSize = renderer.measureText(txt);
            if (this.direction === "x") {
                renderer.translate(value, position, () => {
                    renderer.drawText(txt, -textSize.width / 2, this.fontSize * 1, true);
                })
            } else {
                renderer.translate(position, value, () => {
                    renderer.drawText(txt, -textSize.width - this.fontSize / 2, this.fontSize / 4, true);
                })
            }
        }
    }

    // TODO: This has too many arguments
    drawTicks(renderer, space, position, sizeA, sizeB, skipTransform) {
        let val = 0;
        while (val <= this.max) {
            if (val >= this.min) {
                val = Math.round(val * 10) / 10;
                this.drawTick(renderer, val + "", position, sizeA, sizeB, skipTransform);
                val += space;
            }
        }

        val = 0;
        while (val >= this.min) {
            val = Math.round(val * 10) / 10;
            this.drawTick(renderer, val + "", position, sizeA, sizeB, skipTransform);
            val -= space;
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
