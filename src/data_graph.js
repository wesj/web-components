import GraphNode from "./graph_node.js";

export default class LineGraph extends GraphNode {
    get points() {
        if (this._points) {
            return this._points;
        }

        this._points = JSON.parse(this.textContent);
        return this._points;
    }

    get radius() {
        let style = window.getComputedStyle(this);
        return parseFloat(style["border-radius"]) || 3;
    }

    get connectorLines() {
        if (this.hasAttribute("connectorLines")) {
            return this.getAttribute("connectorLines") !== "false";
        }
        return false;
    }

    drawDiscs(renderer, x, y) {
        renderer.fillPath((r) => {
            r.arc(x, y, this.radius, 0, Math.PI * 2, true);
        });
    }

    drawCircles(renderer, x, y) {
        renderer.strokePath((r) => {
            renderer.arc(x, y, this.radius, 0, Math.PI * 2, true);
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

    drawDiamonds(renderer, x, y, radius) {
        renderer.translate(x, y, () => {
            renderer.fillPath(() => {
                renderer.moveTo(-radius, 0)
                renderer.lineTo(0, radius);
                renderer.lineTo(radius, 0);
                renderer.lineTo(0, radius);
            });    
        });
    }

    drawLines(renderer, points) {
        if (this.fill) {
            renderer.save(() => {
                renderer.fillColor = this.fill;
                renderer.fillPath((r) => {
                    let prev = null;
                    for (const i of renderer.xAxis.valuesIter()) {
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

        if (this.color) {
            renderer.save(() => {
                renderer.strokeColor = this.color;
                renderer.lineWidth = this.lineWidth;
    
                renderer.strokePath((r) => {
                    let step = 0;
                    for (const i of renderer.xAxis.valuesIter()) {
                        if (step === 0) {
                            renderer.moveTo(i, points[i])
                        } else {
                            renderer.lineTo(i, points[i]);
                        }
                        step += 1;
                    }
                });
            });
        }
    }

    render(renderer) {
        let points = this.points;
        renderer.xAxis.values = Object.keys(points);

        if (this.connectorLines) {
            this.drawLines(renderer, points);
        }

        renderer.save(() => {
            renderer.strokeColor = this.color;
            renderer.fillColor = this.color;
            renderer.lineWidth = this.lineWidth;
                        
            let type = this.listStyleType;
            if (type === "diamond") {
                let radius = this.radius / 15;
                this.renderPoints(renderer, points, (x, y) => { this.drawDiamonds(renderer, x, y, radius); })
            } else if (type === "circle") {
                this.renderPoints(renderer, points, (x, y) => { this.drawCircles(renderer, x, y); })
            } else if (type === "square") {
                this.renderPoints(renderer, points, (x, y) => { this.drawSquares(renderer, x, y); })
            } else {
                this.renderPoints(renderer, points, (x, y) => { this.drawDiscs(renderer, x, y); })
            }
        });
    }
}
customElements.define("x-data", LineGraph);