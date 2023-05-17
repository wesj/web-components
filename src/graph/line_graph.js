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

    drawDiscs(renderer, x, y) {
        renderer.fillPath(() => {
            renderer.arc(x, y, this.radius, 0, Math.PI * 2);
        });
    }

    drawCircles(renderer, x, y) {
        renderer.strokePath(() => {
            renderer.arc(x, y, this.radius, 0, Math.PI * 2);
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

    drawSquares(renderer, x, y) {
        let r = this.radius;
        renderer.fillRect(x, y, r, r);
    }

    drawDiamonds(renderer, x, y) {
        let radius = this.radius;
        renderer.translate(x, y, () => {
            renderer.fillPath(() => {
                renderer.moveTo(-radius, 0, true)
                renderer.lineTo(0, radius, true);
                renderer.lineTo(radius, 0, true);
                renderer.lineTo(0, -radius, true);
                renderer.lineTo(-radius, 0, true);
            });    
        });
    }

    drawFill(renderer, points) {
        if (this.backgroundColor) {
            console.log("       Draw fill", this.id);
            renderer.save(() => {
                renderer.fillColor = this.fill;
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

    drawLines(renderer, points) {
        if (this.borderWidth) {
            console.log("       Draw lines", this.id);
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

    render(renderer) {
        console.log("   Render lines");
        let points = this.points;

        this.drawFill(renderer, points);
        this.drawLines(renderer, points);

        this.drawPoints(renderer, points);
    }

    drawPoints(renderer, points) {
        renderer.save(() => {
            renderer.strokeColor = this.color;
            renderer.fillColor = this.color;
            renderer.lineWidth = this.lineWidth;
                        
            let type = this.listStyleType;
            if (type === "diamond") {
                this.renderPoints(renderer, points, (x, y) => { this.drawDiamonds(renderer, x, y); })
            } else if (type === "circle") {
                this.renderPoints(renderer, points, (x, y) => { this.drawCircles(renderer, x, y); })
            } else if (type === "square") {
                this.renderPoints(renderer, points, (x, y) => { this.drawSquares(renderer, x, y); })
            } else if (type === "disc") {
                this.renderPoints(renderer, points, (x, y) => { this.drawDiscs(renderer, x, y); })
            }
        });
    }
}
customElements.define("x-data", LineGraph);