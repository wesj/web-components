import GraphNode from "./graph_node.js";

export default class BarGraph extends GraphNode {
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

        // this._points.push(null);
        return this._points;
    }

    getValueAt(i, points) {
        return points[i+1];
    }

    get spacing() {
        return 0.2;
    }

    get width() {
        if (this.hasAttribute("width")) {
            return parseFloat(this.getAttribute("width"));
        }

        if (this.parentNode) {
            let nodes = this.parentNode.querySelectorAll("x-bar");
            return (1 - this.spacing) / nodes.length;
        }

        return 1;
    }

    get offset() {
        if (this.hasAttribute("offset")) {
            return parseFloat(this.getAttribute("offset"));
        }
        let nodes = this.parentNode.querySelectorAll("x-bar");
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i] === this) return this.width * i;
        }
        return 0;
    }

    drawBars(renderer, points, debug) {
        console.group("Draw bars " + this.id);
        renderer.save(() => {
            let w = this.width;
            let offset = this.offset;
            renderer.fillColor = this.backgroundColor;
            renderer.strokeColor = this.borderColor;
            renderer.lineWidth = this.borderWidth;

            for (const i of renderer.xAxis.valuesIter()) {
                // This is a mess :( To make this graph work with labeled data sets, we can't mix
                // i (which might be a string) with offsets and numbers. Once we've translated though
                // Trying to draw using the coords we have doesn't work anymore (because some of the transform)
                // is inside the renderer, and some of it is here. I think we need to move the offset out of this
                // axis node to fix it, but for now we basically move to drawing in exact coords here.
                renderer.translate(i, null, () => {
                    let x1 = renderer.xAxis.toScreenCoords(offset, renderer.root.clientWidth);
                    let x2 = renderer.xAxis.toScreenCoords(offset + w, renderer.root.clientWidth);
                    let y1 = renderer.yAxis.toScreenCoords(0, renderer.root.clientHeight);
                    let y2 = renderer.yAxis.toScreenCoords(points[i], renderer.root.clientHeight);
                    renderer.fillRect(x1, y1, x2 - x1, y2 - y1, true);
                    renderer.strokeRect(x1, y1, x2 - x1, y2 - y1, true);
                });
            }
        });
        console.groupEnd();
    }

    drawIndicator(renderer, width, height) {
        renderer.save(() => {
            renderer.fillColor = this.backgroundColor;
            renderer.strokeColor = this.borderColor;
            renderer.lineWidth = this.borderWidth;
            renderer.fillRect(0, 0, width * 2, height * 2, true);
            renderer.strokeRect(0, 0, width * 2, height * 2, true);
        });
    }

    render(renderer, debug) {
        console.group("Render bars");
        let points = this.points;

        this.drawBars(renderer, points, debug);
        console.groupEnd();
    }
}

customElements.define("x-bar", BarGraph);