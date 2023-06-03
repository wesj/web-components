import GraphNode from "./graph_node.js";

export default class FunctionGraph extends GraphNode {
    render(renderer) {
        console.groupCollapsed("Function", "#" + this.id, "=", this.textContent);
        let fun = (x) => {
            let y = 0;
            let text = "y = " + this.textContent + ";";
            return eval(text);
        }

        let vals = [];
        for (const x of renderer.xAxis.valuesIter()) {
            let v = fun(x);
            vals.push([x, v]);
        }

        if (vals.length == 0) {
            return;
        }

        if (this.backgroundColor) {
            renderer.save(() => {
                renderer.fillColor = this.backgroundColor;
                renderer.fillPath(() => {
                    renderer.moveTo(vals[0][0], 0);
                    vals.forEach((v) => {
                        renderer.lineTo(v[0], v[1]);
                    })
                    renderer.lineTo(vals[vals.length - 1][0], 0);
                })
            });
        }

        if (this.color) {
            renderer.save(() => {
                renderer.strokeColor = this.borderColor;
                renderer.lineWidth = this.borderWidth.value;
                renderer.strokePath(() => {
                    vals.forEach((v, i) => {
                        if (i === 0) {
                            renderer.moveTo(v[0], v[1]);
                        } else {
                            renderer.lineTo(v[0], v[1]);
                        }
                    })
                });
            });
        }
    }
}
customElements.define("x-function", FunctionGraph);