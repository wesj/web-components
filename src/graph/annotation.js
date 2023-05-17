import GraphNode from "./graph_node.js";

export default class Annotation extends GraphNode {
    constructor() {
        super();
        this.style.position = "absolute";
    }
    get x() {
        let x = this.getAttribute("x");
        if (x === "current") {
            return "current";
        }
        return parseFloat(x);
    }

    get y() {
        let x = this.getAttribute("y");
        if (x === "current") {
            return "current";
        }
        return parseFloat(x);
    }

    setup(graph) {
        if (this.x === "current" || this.y === "current") {
            graph.requestMousePosition();
        }
    }

    render(renderer) {
        let x = this.x === "current" ? renderer.currentX : this.x;
        let y = this.y === "current" ? renderer.currentY : this.y;
        this.updatePosition(renderer, x, y);
        this.updateText(renderer, x, y);
    }

    updatePosition(renderer, x, y) {
        x = renderer.xAxis.toScreenCoords(x);
        y = renderer.yAxis.toScreenCoords(y);
        this.style.top = y;
        this.style.left = x;
    }

    nodes = [];

    updateText(renderer, x, y, root) {
        if (this.nodes.length === 0) {
            root = root || this;
            // console.log("Update text", root, x, y);
            if (root.childNodes) {
                for (var i = 0; i < root.childNodes.length; i++) {
                    let child = root.childNodes[i];
                    if (child.nodeName === "#text") {
                        if (child.textContent.indexOf("{current.x}") > -1) {
                            this.nodes.push({
                                node: child,
                                original: child.textContent
                            });
                        }
                    } else {
                        this.updateText(renderer, x, y, child);
                    }
                }
            }
        }

        this.nodes.forEach((node) => {
            node.node.textContent = node.original.replace(/\{current\.x\}/, x)
                                                 .replace(/\{current\.y\}/, y);
        })
    }
}
customElements.define("x-annotation", Annotation);
