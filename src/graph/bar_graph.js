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
        this._points.push(null);
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
        let nodes = this.parentNode.querySelectorAll("x-bar");
        return (1 - this.spacing) / nodes.length;
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

    drawBars(renderer, points) {
        console.log("       Draw bars", this.id);
        renderer.save(() => {
            let w = this.width;
            let offset = this.offset;
            let spacing = this.spacing;
            renderer.fillColor = this.backgroundColor;
            renderer.strokeColor = this.borderColor;
            renderer.lineWidth = this.borderWidth;
            for (const i of renderer.xAxis.valuesIter()) {
                renderer.fillRect(spacing/ 2 + offset + i + w/2, 0 + points[i]/2, w - this.padding, points[i]);
                renderer.strokeRect(spacing/ 2 + offset + i + w/2, 0 + points[i]/2, w - this.padding, points[i]);
            }
        });
    }

    render(renderer) {
        console.log("   Render bars");
        let points = this.points;

        this.drawBars(renderer, points);
    }
}

customElements.define("x-bar", BarGraph);