import Renderer from "./renderer.js";
import Axis from "./axis.js";
import Annotation from "./annotation.js";

export default class Graph extends HTMLElement {
    constructor() {
        super();
        // const shadow = this.attachShadow({ mode: "open" });
        this.renderer = new Renderer(this);
        console.log("Construct");
        this.appendChild(this.renderer.root);

        this.observer = new MutationObserver((event) => {
            this.setNeedsRender();
        });
        const config = { attributes: false, childList: true, subtree: false };
        this.observer.observe(this, config);
    }

    connectedCallback() {
        this.setNeedsRender();
    }

    setNeedsRender() {
        if (!this._needsRender) {
            this._needsRender = true;
            window.requestAnimationFrame(() => {
                this._needsRender = false;
                this.setup();
                this.render();
            })
        }
    }

    requestMousePosition() {
        if (!this.mouse) {
            this.mouse = true;
            this.addEventListener("mousemove", (event) => {
                this.mouseMove(event);
            });
        }
    }

    mouseMove(event) {
        let box = this.getBoundingClientRect();
        let x = event.clientX - box.left;
        let y = event.clientY - box.top;
        x = this.renderer.xAxis.toCanvasCoords(x, this.clientWidth);
        y = this.renderer.yAxis.toCanvasCoords(y, this.clientHeight);

        let nearest = null;
        for (var i = 0; i < this.childNodes.length; i++) {
            let child = this.childNodes[i];
            if (child.findNearest) {
                let near = child.findNearest(x, y);
                if (near) {
                    if (!nearest || near.distance < nearest.distance) {
                        nearest = near;
                    }
                }
            }
        }

        if (nearest) {
            this.renderer.currentX = nearest.position.x;
            this.renderer.currentY = nearest.position.y;

            for (var i = 0; i < this.childNodes.length; i++) {
                let child = this.childNodes[i];
                if (child instanceof Annotation) {
                    child.render(this.renderer);
                }
            }
        }
    }

    setup() {
        for (var i = 0; i < this.childNodes.length; i++) {
            let child = this.childNodes[i];
            if (!(child instanceof Axis) && child.render) {
                let x = this.getXAxisFor(child);
                let y = this.getYAxisFor(child);
                x.setup(child);
                y.setup(child, x.values);
            }

            if (child.setup) {
                child.setup(this);
            }
        }
    }

    render() {
        console.log("Render", this.id);
        this.drawYAxis();
        this.drawXAxis();
        this.renderChildren();
    }

    getXAxisFor(child) {
        if (child.hasAttribute("xAxis")) {
            let name = child.getAttribute("xAxis");
            let a = this.querySelector("x-axis[direction='x']#" + name);
            if (a) {
                return a;   
            }
            console.error("Could not find an x axis named", name);
        }
        return this.xAxis[0];
    }

    getYAxisFor(child) {
        if (child.hasAttribute("yAxis")) {
            let name = child.getAttribute("yAxis");
            let a = this.querySelector("x-axis[direction='y']#" + name);
            if (a) {
                return a;   
            }
            console.error("Could not find an y axis named", name);
        }
        return this.yAxis[0];
    }

    renderChildren() {
        for (var i = 0; i < this.childNodes.length; i++) {
            let child = this.childNodes[i];
            if (child.render && !(child instanceof Axis)) {
                this.renderer.xAxis = this.getXAxisFor(child);
                this.renderer.yAxis = this.getYAxisFor(child);
                child.render(this.renderer);
            }
        }
    }

    drawYAxis() {
        let xAxis = this.xAxis[0];
        this.yAxis.forEach((axis) => {
            this.renderer.xAxis = xAxis;
            this.renderer.yAxis = axis;
            axis.render(this.renderer);
        })
    }

    get yAxis() {
        if (!this._yAxis) {
            this._yAxis = this.querySelectorAll("x-axis[direction='y'], y-axis");
            if (!this._yAxis || this._yAxis.length == 0) {
                let axis = new Axis();
                axis.setAttribute("direction", "y");
                this._yAxis = [axis];
            }
        }
        return this._yAxis;
    } 

    get xAxis() {
        if (!this._xAxis) {
            this._xAxis = this.querySelectorAll("x-axis[direction='x'], x-axis:not(direction)");
            if (!this._xAxis || this._xAxis.length == 0) {
                let axis = new Axis();
                axis.setAttribute("direction", "x");
                this._xAxis = [axis];
            }
        }
        return this._xAxis;
    } 

    drawXAxis() {
        let yAxis = this.yAxis[0];
        this.xAxis.forEach((axis) => {
            this.renderer.xAxis = axis;
            this.renderer.yAxis = yAxis;
            axis.render(this.renderer);
        })
    }
}
customElements.define("x-graph", Graph);