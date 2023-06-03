import GraphNode from "./graph_node.js";

function drawDiscs(renderer, x, y, radius, skip) {
    renderer.fillPath(() => {
        renderer.arc(x, y, radius, 0, Math.PI * 2, skip);
    });
}

function drawCircles(renderer, x, y, radius, skip) {
    renderer.strokePath(() => {
        renderer.arc(x, y, radius, 0, Math.PI * 2, skip);
    });
}

function drawSquares(renderer, x, y, radius, skip) {
    let r = radius * Math.sqrt(2);
    renderer.translate(x, y, () => {
        renderer.fillRect(-r/2, -r/2, r, r, true);
    }, skip)
}

function drawDiamonds(renderer, x, y, radius, skip) {
    renderer.translate(x, y, () => {
        renderer.fillPath(() => {
            renderer.moveTo(-radius, 0, true)
            renderer.lineTo(0, radius, true);
            renderer.lineTo(radius, 0, true);
            renderer.lineTo(0, -radius, true);
            renderer.lineTo(-radius, 0, true);
        });    
    }, skip);
}



export class GraphPoint extends GraphNode {
    render(renderer, debug) {
        console.group("Draw point", this.x, this.y);
        let type = this.listStyleType;
        if (type === "diamond") {
            drawDiamonds(renderer, this.x, this.y, this.borderRadius);
        } else if (type === "circle") {
            drawCircles(renderer, this.x, this.y, this.borderRadius);
        } else if (type === "square") {
            drawSquares(renderer, this.x, this.y, this.borderRadius);
        } else if (type === "disc") {
            drawDiscs(renderer, this.x, this.y, this.borderRadius);
        }
        console.groupEnd();
    }

    _y = undefined
    get y() {
        if (this._y) {
            return this._y;
        }

        if (this.hasAttribute("y")) {
            try {
                this._y = parseFloat(this.getAttribute("y"));
            } catch(ex) {
                this._y = this.getAttribute("y");
            }
        } else {
            try {
                this._y = parseFloat(this.textContent);
            } catch(ex) {
                this._y = this.textContent;
            }    
        }

        return this._y;
    }
    set y(val) { this._y = val; }

    _x = undefined
    get x() {
        if (this._x) {
            return this._x;
        }

        if (this.hasAttribute("x")) {
            try {
                this._x = parseFloat(this.getAttribute("x"));
            } catch(ex) {
                this._x = this.getAttribute("x");
            }
        }
        return this._x;
    }
    set x(val) { this._x = val; }
 
    style = {};

    distanceTo(x, y) {
        let dx = this.x - x;
        let dy = this.y - y;
        return dx * dx + dy * dy;
    }
}
customElements.define("x-point", GraphPoint);

// Generating points from JSON
function numberToGraphPoint(num, x) {
    let point = new GraphPoint();
    point.y = num;
    point.x = x;
    return point;
}

function objectToGraphPoint(obj, x) {
    let point = new GraphPoint();
    point.y = obj.y;
    point.x = x || obj.x;
    // point.style = obj.style;
    return point;
}

function arrayToGraphPoints(data) {
    return data.map((d, index) => {
        if (d instanceof Object) {
            return objectToGraphPoint(d);
        } else {
            return numberToGraphPoint(d, index);
        }
    })
}

function objectToGraphPoints(data) {
    return Object.keys(data).map((x) => {
        let d = data[x];
        if (d instanceof Object) {
            return objectToGraphPoint(d, x);
        } else {
            return numberToGraphPoint(d, x);
        }
    })
}

function toGraphPoints(data) {
    if (Array.isArray(data)) {
        return arrayToGraphPoints(data);
    } else {
        return objectToGraphPoints(data);
    }
}

export default class LineGraph extends GraphNode {
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
        for (var i = 0; i < this.childNodes.length; i++) {
            let child = this.childNodes[i];
            if (child instanceof Text && child.textContent.trim()) {
                try {
                    let data = JSON.parse(child.textContent);
                    this._points = this._points.concat(toGraphPoints(data));
                    this._points.forEach((point) => {
                        this.shadow.appendChild(point);
                        point.setAttribute("style", "border-radius: " + this.borderRadius + "px");
                    });
                    index += this._points.length;
                } catch(ex) {
                    console.log("Can't parse", child.textContent, ex);
                }
            } else if (child instanceof GraphPoint) {
                if (!child.x) child.x = index;
                this._points.push(child);
                index += 1;
            }
        }

        this.style.display = "none";
        return this._points;
    }

    findNearest(x, y) {
        let point = null;
        let distance = Infinity;

        if (typeof x === "number") {
            this.points.forEach((pt) => {
                let d = pt.distanceTo(x, y);
                if (d < distance) {
                    distance = d;
                    point = pt;
                }
            });
        }

        return {
            point,
            distance
        };
    }

    getValueAt(i, points) {
        return points.find((point) => {
            return (point.x === i);
        }).y;
    }

    drawFill(renderer, points, debug) {
        if (this.backgroundColor) {
            console.group("Draw fill", this.id);
            renderer.save(() => {
                renderer.fillColor = this.backgroundColor;
                renderer.fillPath((r) => {
                    let prev = null;
                    renderer.moveTo(points[0].x, 0);
                    points.forEach((point) => {
                        renderer.lineTo(point.x, point.y);
                        prev = point;
                    });
                    renderer.lineTo(prev.x, 0);
                });
            });
            console.groupEnd();
        }
    }

    drawLines(renderer, points, debug) {
        if (this.borderWidth) {
            console.group("Draw lines", this.id);
            renderer.save(() => {
                renderer.strokeColor = this.borderColor;
                renderer.lineWidth = this.borderWidth;
    
                renderer.strokePath((r) => {
                    let started = false;
                    points.forEach((point) => {
                        if (!started) {
                            renderer.moveTo(point.x, point.y);
                        } else {
                            renderer.lineTo(point.x, point.y);
                        }
                        started = true;
                    });
                });
            });
            console.groupEnd();
        }
    }

    render(renderer, debug) {
        console.group("Line graph", this.id);
        let points = this.points;

        this.drawFill(renderer, points, debug);
        this.drawLines(renderer, points, debug);
        this.drawPoints(renderer, points, debug);
        console.groupEnd();
    }

    drawPoints(renderer, points) {
        renderer.save(() => {
            renderer.strokeColor = this.color;
            renderer.fillColor = this.color;
            renderer.lineWidth = this.borderWidth;

            points.forEach((point) => {
                point.render(renderer);
            })
        });
    }
}
customElements.define("x-data", LineGraph);