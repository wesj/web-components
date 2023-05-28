import GraphNode from "./graph_node.js";

export default class Legend extends GraphNode {
    get x() {
        return parseFloat(this.getAttribute("x"));
    }

    get y() {
        return parseFloat(this.getAttribute("y"));
    }

    render(renderer) {
        console.group("Draw legend");
        let nodes = this.parentNode.querySelectorAll("x-bar[title], x-data[title]");
        let width = 0;
        let indicatorSize = 20;
        let padding = this.padding;
        renderer.font = this.font;
        let rowHeight = this.fontSize * 1.5;
        nodes.forEach((node) => {
            let title = node.getAttribute("title");
            let measure = renderer.measureText(title);
            if (measure.width > width) {
                width = measure.width;
            }
        })

        renderer.translate(this.x, this.y, () => {
            if (this.backgroundColor) {
                renderer.fillColor = this.backgroundColor;
                console.log(this.backgroundColor);
            }
            renderer.strokeColor = this.borderColor;
            renderer.fillRect(  this.x, this.y, indicatorSize + width + 2.5 * padding, nodes.length * rowHeight + 2 * padding - rowHeight/2, true);
            renderer.strokeRect(this.x, this.y, indicatorSize + width + 2.5 * padding, nodes.length * rowHeight + 2 * padding - rowHeight/2, true);

            renderer.fillColor = this.color;
            nodes.forEach((node, index) => {
                let title = node.getAttribute("title");
                renderer.translate(padding, rowHeight/3 + padding + index * rowHeight, () => {
                    renderer.drawText(title, indicatorSize + 0.5 * padding, rowHeight / 2, true);
                    if (node.drawIndicator) {
                        node.drawIndicator(renderer, this.fontSize / 2, this.fontSize / 2);
                    }
                }, true)
            })    
        });
        console.groupEnd();
    }
}
customElements.define("x-legend", Legend);