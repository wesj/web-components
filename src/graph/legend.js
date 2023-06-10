import GraphNode from "./graph_node.js";

export default class Legend extends GraphNode {
    render(renderer, debug) {
        debug.groupCollapsed("Draw legend (" + this.left.value + ", " + this.top.value + ")");
        let nodes = this.parentNode.querySelectorAll("x-bars[title], x-data[title]");
        let width = 0;
        let indicatorSize = 20;
        let padding = this.padding.value;
        renderer.font = this.font;
        let rowHeight = this.fontSize.value;

        nodes.forEach((node) => {
            let title = node.getAttribute("title");
            let measure = renderer.measureText(title);
            if (measure.width > width) {
                width = measure.width;
            }
        })

        renderer.translate(this.left.value, this.top.value, () => {
            let w = indicatorSize + width + 2.5 * padding;
            let h = nodes.length * rowHeight + 2 * padding;

            if (this.backgroundColor && this.backgroundColor !== "transparent") {
                renderer.fillColor = this.backgroundColor;
                renderer.fillRect(0, 0, w, h, true);
            }

            if (this.borderColor) {
                renderer.strokeColor = this.borderColor;
                renderer.strokeWidth = this.borderWidth.value;
                renderer.strokeRect(0, 0, w, h, true);
            }

            renderer.fillColor = this.color;
            nodes.forEach((node, index) => {
                let title = node.getAttribute("title");
                renderer.translate(padding, padding + index * rowHeight, () => {
                    renderer.drawText(title, indicatorSize + 0.5 * padding, rowHeight * 3/4, true);
                    if (node.drawIndicator) {
                        node.drawIndicator(renderer, indicatorSize, rowHeight);
                    }
                }, true)
            })    
        });
        debug.groupEnd();
    }
}
customElements.define("x-legend", Legend);