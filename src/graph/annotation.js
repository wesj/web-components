import GraphNode from "./graph_node.js";

export default class Annotation extends GraphNode {
    constructor() {
        super();
        this.style.position = "absolute";
    }

    get x() {
        let x = this.getAttribute("x");
        return parseFloat(x) || x;
    }

    get y() {
        let y = this.getAttribute("y");
        return parseFloat(y) || y;
    }

    render(renderer) {
        this.updatePosition(renderer, this.x, this.y);
    }

    updatePosition(renderer, x, y) {
        let p = renderer.toScreenCoords(x, y);
        this.style.top = p[1];
        this.style.left = p[0];
    }
}
customElements.define("x-annotation", Annotation);
