import GraphNode from "./graph_node.js";

export default class LineGraph extends GraphNode {
    get points() {
        if (this._points) {
            return this._points;
        }

        try {
            this._points = JSON.parse(this.textContent);
            this.style.display = "none";
        } catch(ex) {
            console.error("Error parsing", ex, this.textContent);
        }
        return this._points;
    }

    get radius() {
        return this.borderRadius || 3;
    }

    get connectorLines() {
        if (this.hasAttribute("connectorLines")) {
            return this.getAttribute("connectorLines") !== "false";
        }
        return false;
    }

    findNearest(x, y) {
        let nearestX = null;
        let distance = null;

        if (typeof x === "number") {
            let keys = Object.keys(this.points);
            keys.forEach((key) => {
                let d = Math.abs(x - key);
                if (distance === null) {
                    distance = d;
                    nearestX = key;
                } else {
                    if (d < distance) {
                        nearestX = key;
                        distance = d;
                    }
                }
            });
        }

        let dx = nearestX - x;
        let dy = this.points[nearestX] - y;
        return {
            position: { x: nearestX, y: this.points[nearestX] },
            distance: dx * dx + dy * dy
        };
    }

    drawDiscs(renderer, x, y, radius, skip) {
        renderer.fillPath(() => {
            renderer.arc(x, y, radius, 0, Math.PI * 2, skip);
        });
    }

    drawCircles(renderer, x, y, radius, skip) {
        renderer.strokePath(() => {
            renderer.arc(x, y, radius, 0, Math.PI * 2, skip);
        });
    }

    getValueAt(i, points) {
        return points[i+1];
    }

    renderPoints(renderer, points, callback) {
        for (const i of renderer.xAxis.valuesIter()) {
            callback(i, points[i]);
        }
    }

    drawSquares(renderer, x, y, radius, skip) {
        let r = radius * Math.sqrt(2);
        renderer.translate(x, y, () => {
            renderer.fillRect(-r/2, -r/2, r, r, true);
        }, skip)
    }

    drawDiamonds(renderer, x, y, radius, skip) {
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

    drawFill(renderer, points, debug) {
        if (this.backgroundColor) {
            debug("       Draw fill", this.id);
            renderer.save(() => {
                renderer.fillColor = this.backgroundColor;
                renderer.fillPath((r) => {
                    let prev = null;
                    for (const i of renderer.xAxis.valuesIter()) {
                        if (points[i] === null) {
                            continue;
                        }

                        if (prev === null) {
                            renderer.moveTo(i, 0);
                        }

                        renderer.lineTo(i, points[i]);
                        prev = i;
                    }
                    renderer.lineTo(prev, 0);
                });
            });
        }
    }

    drawLines(renderer, points, debug) {
        if (this.borderWidth) {
            debug("       Draw lines", this.id);
            renderer.save(() => {
                renderer.strokeColor = this.borderColor;
                renderer.lineWidth = this.borderWidth;
    
                renderer.strokePath((r) => {
                    let started = false;
                    for (const i of renderer.xAxis.valuesIter()) {
                        if (points[i] === null) {
                            continue;
                        }

                        if (!started) {
                            renderer.moveTo(i, points[i]);
                            started = true;
                        } else {
                            renderer.lineTo(i, points[i]);
                        }
                    }
                });
            });
        }
    }

    render(renderer, debug) {
        debug("   Render lines");
        let points = this.points;

        this.drawFill(renderer, points, debug);
        this.drawLines(renderer, points, debug);

        this.drawPoints(renderer, points, debug);
    }

    drawPoints(renderer, points) {
        renderer.save(() => {
            console.log(this.color, this.style, getComputedStyle(this));
            renderer.strokeColor = this.color;
            renderer.fillColor = this.color;
            renderer.lineWidth = this.borderWidth;
                        
            let type = this.listStyleType;
            if (type === "diamond") {
                this.renderPoints(renderer, points, (x, y) => { this.drawDiamonds(renderer, x, y, this.radius); })
            } else if (type === "circle") {
                this.renderPoints(renderer, points, (x, y) => { this.drawCircles(renderer, x, y, this.radius); })
            } else if (type === "square") {
                this.renderPoints(renderer, points, (x, y) => { this.drawSquares(renderer, x, y, this.radius); })
            } else if (type === "disc") {
                this.renderPoints(renderer, points, (x, y) => { this.drawDiscs(renderer, x, y, this.radius); })
            }
        });
    }

    drawIndicator(renderer, width, height) {
        console.log("Draw indicator");
        renderer.save(() => {
            renderer.fillColor = this.color;
            renderer.strokeColor = this.color;
            renderer.lineWidth = this.borderWidth;

            let type = this.listStyleType;
            if (type === "diamond") {
                let radius = this.radius / 15;
                this.drawDiamonds(renderer, width, height, this.radius, true);
            } else if (type === "circle") {
                this.drawCircles(renderer, width, height, this.radius, true);
            } else if (type === "square") {
                this.drawSquares(renderer, width, height, this.radius, true);
            } else {
                this.drawDiscs(renderer, width, height, this.radius, true);
            }
        });
    }
}
customElements.define("x-data", LineGraph);