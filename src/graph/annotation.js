import GraphNode from "./graph_node.js";

export default class Annotation extends GraphNode {
    constructor() {
        super();
        this.style.position = "absolute";
    }
    get x() {
        let x = this.getAttribute("x");
        if (x === "current") {
            return Infinity;
        }
        return parseFloat(x);
    }

    get y() {
        let x = this.getAttribute("y");
        if (x === "current") {
            return Infinity;
        }
        return parseFloat(x);
    }

    render(renderer) {
        let x = renderer.xAxis.toScreenCoords(this.x);
        let y = renderer.yAxis.toScreenCoords(this.y);
        this.style.top = y;
        this.style.left = x;
    }
}
customElements.define("x-annotation", Annotation);
