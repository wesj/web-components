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
            if (nodes[i] === this) return this.spacing / 2 + this.width * i;
        }
        return this.spacing / 2;
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
                renderer.translate(i, null, () => {
                    // Because of weird coordinate system issues, we basically have to do
                    // all the coordinate system transforms here for this to work.
                    let p1 = renderer.toScreenCoords(offset, 0, offset+w);
                    let p2 = renderer.xAxis.toScreenCoords(offset + w, points[i]);
                    renderer.fillRect(p1[0], p1[1], p2[0] - p1[0], p2[1] - p1[1], true);
                    renderer.strokeRect(p1[0], p1[1], p2[0] - p1[0], p2[1] - p1[1], true);
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