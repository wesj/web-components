import GraphNode from "./graph_node.js";

export default class Annotation extends GraphNode {
    constructor() {
        super();
        this.style.position = "absolute";
    }
    get x() {
        let x = this.getAttribute("x");
        return parseFloat(x);
    }

    get y() {
        let x = this.getAttribute("y");
        return parseFloat(x);
    }

    render(renderer) {
        this.updatePosition(renderer, this.x, this.y);
    }

    updatePosition(renderer, x, y) {
        x = renderer.xAxis.toScreenCoords(x);
        y = renderer.yAxis.toScreenCoords(y);
        this.style.top = y;
        this.style.left = x;
    }
}
customElements.define("x-annotation", Annotation);
