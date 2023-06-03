import Axis from "./axis.js";
import Renderer from "./renderer.js";

export default class Graph extends HTMLElement {
    constructor(renderer) {
        super();
        this.renderer = renderer || new Renderer(this);
        // this.appendChild(this.renderer.root);
        this.shadow = this.attachShadow({ mode: "closed" });
        this.shadow.appendChild(document.createElement("slot"));
        this.shadow.appendChild(this.renderer.root);

        this.observer = new MutationObserver((event) => {
            if (this.parentNode) {
                this.setNeedsRender();
            }
        });
        const config = { attributes: false, childList: true, subtree: false };
        this.observer.observe(this, config);

        this.eventToCanvasCoords = this.eventToCanvasCoords.bind(this);
    }

    eventToCanvasCoords(event, graph) {
        let box = this.getBoundingClientRect();
        let x = event.clientX - box.left;
        let y = event.clientY - box.top;

        let xaxis = this.getXAxisFor(graph);
        let yaxis = this.getYAxisFor(graph);
        return [
            xaxis.toCanvasCoords(x, box.width),
            yaxis.toCanvasCoords(y, box.height)
        ];
    }

    connectedCallback() {
        if (this.parentNode) {
            this.setNeedsRender();
        }
    }

    async setNeedsRender(debug) {
        if (!this._needsRender) {
            this._needsRender = new Promise((resolve, reject) => {
                window.requestAnimationFrame(() => {
                    this._needsRender = null;
                    this.setup();
                    this.render(console);
                    resolve();
                })                    
            })
        }
        return this._needsRender;
    }

    getNearestPoint(x, y) {
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

        return nearest;
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

    getOffset() {
        let left = 20;
        let right = 20;
        let top = 20;
        let bottom = 20;

        return { left, right, top, bottom };
    }

    render(debug) {
        debug && debug.group("Render " + this.id);
        let offset = this.getOffset();
        this.renderer.xAxis = this.xAxis[0];
        this.renderer.yAxis = this.yAxis[0];

        this.renderer.translate(offset.left, offset.top, () => {
            let style = window.getComputedStyle(this);
            this.renderer.height = this.clientHeight - offset.top - offset.bottom - parseInt(style.paddingTop) - parseInt(style.paddingBottom);
            this.renderer.width = this.clientWidth - offset.left - offset.right - parseInt(style.paddingLeft) - parseInt(style.paddingRight);
            this.renderChildren(debug);    
        }, true);

        debug && debug.groupEnd();
    }

    getXAxisFor(child) {
        if (child.nodeName === "X-AXIS" && child.direction === "x") {
            return child;
        }

        if (child.hasAttribute("xAxis")) {
            let name = child.getAttribute("xAxis");
            let a = this.querySelector("x-axis[direction='x']#" + name);
            if (a) {
                return a;   
            }
            throw "Could not find an x axis named: " + name;
        }
        return this.xAxis[0];
    }

    getYAxisFor(child) {
        if (child.nodeName === "X-AXIS" && child.direction === "y" || child.nodeName === "Y-AXIS") {
            return child;
        }

        if (child.hasAttribute("yAxis")) {
            let name = child.getAttribute("yAxis");
            let a = this.querySelector("y-axis#" + name + ", x-axis[direction='y']#" + name);
            if (a) {
                return a;   
            }
            throw "Could not find an y axis named: " + name;
        }
        return this.yAxis[0];
    }

    renderChildren(debug) {
        for (var i = 0; i < this.childNodes.length; i++) {
            let child = this.childNodes[i];
            if (child.render) { // && !(child instanceof Axis)) {
                this.renderer.xAxis = this.getXAxisFor(child);
                this.renderer.yAxis = this.getYAxisFor(child);
                child.render(this.renderer, debug);
            }
        }
    }

    set yAxis(val) {
        this._yAxis = val;
    }

    get yAxis() {
        if (!this._yAxis) {
            this._yAxis = this.querySelectorAll("x-axis[direction='y'], y-axis");
            if (!this._yAxis || this._yAxis.length == 0) {
                let axis = new Axis();
                axis.setAttribute("direction", "y");
                this.shadow.appendChild(axis);
                this._yAxis = [axis];
            }
        }
        return this._yAxis;
    }

    set xAxis(val) {
        this._xAxis = val;
    }

    get xAxis() {
        if (!this._xAxis) {
            this._xAxis = this.querySelectorAll("x-axis[direction='x'], x-axis:not(direction)");
            if (!this._xAxis || this._xAxis.length == 0) {
                let axis = new Axis();
                axis.setAttribute("direction", "x");
                this.shadow.appendChild(axis);
                this._xAxis = [axis];
            }
        }
        return this._xAxis;
    }
}

customElements.define("x-graph", Graph);
if (window.registerTests) {
    registerTests("graph.js", async (register) => {
        register("constructor", async (t) => {
            let Mock = await import("./MockRenderer.js");
            let mock = Mock.default;
            mock.root = document.createElement("div");

            let g = new Graph(mock);
            t.is(true, true, "Constructor worked");
        });

        register("eventToCanvasCoords", async (t) => {
            // Before
            let Mock = await import("./MockRenderer.js");
            let renderer = Mock.default();
            renderer.root = document.createElement("div");

            let g = new Graph(renderer);
            document.body.appendChild(g);
            g.style = "display: block; width: 100px; height: 200px;";
            let r = g.getBoundingClientRect();

            let xAxis = Mock.default();
            xAxis.toCanvasCoords = Mock.functionMock((x, width) => { return 20; });
            xAxis.render = Mock.functionMock(() => {});
            g.xAxis = [xAxis];

            let yAxis = Mock.default();
            yAxis.toCanvasCoords = Mock.functionMock(() => { return 30; });
            yAxis.render = Mock.functionMock(() => {});
            g.yAxis = [yAxis];

            // Given
            let coords = g.eventToCanvasCoords({ clientX: 10, clientY: 10}, document.createElement("div"));

            // Expect
            t.is(coords, [20,30], "Coords");
            t.is(xAxis.toCanvasCoords.calls.length, 1, "xAxis.toCanvasCoords called");
            t.is(yAxis.toCanvasCoords.calls.length, 1, "xAxis.toCanvasCoords called");

            // Cleanup
            document.body.removeChild(g);
        });

        register("setNeedsRender", async (t) => {
            let Mock = await import("./MockRenderer.js");
            let renderer = Mock.default();
            renderer.root = document.createElement("div");
            renderer.save = Mock.functionMock((cb) => { cb(); });
            renderer.strokePath = Mock.functionMock((cb) => { cb(); });
            renderer.moveTo = Mock.functionMock();
            renderer.lineTo = Mock.functionMock();
            renderer.measureText = Mock.functionMock(() => 14);
            renderer.translate = Mock.functionMock((x,y,cb,skip) => { cb(); });
            renderer.drawText = Mock.functionMock();
            let g = new Graph(renderer);

            await g.setNeedsRender();

            t.is(renderer.save.calls.length, 4, "Save was called 4 times");
            t.is(renderer.strokePath.calls.length, 4, "Save was called 4 times");
            t.is(renderer.moveTo.calls.length, 4, "moveTo was called 4 times");
            t.is(renderer.lineTo.calls.length, 4, "lineTo was called 4 times");
            t.is(renderer.measureText.calls.length, 2, "measureText was called");
            t.is(renderer.translate.calls.length, 2, "translate was called");
            t.is(renderer.drawText.calls.length, 2, "drawText was called");
        });

        register("getNearestPoint", async (t) => {
            let Mock = await import("./MockRenderer.js");
            let renderer = Mock.default();
            renderer.root = document.createElement("div");

            let g = new Graph(renderer);

            let expected = {
                position: { x: 2, y: 2 },
                distance: 8
            };
            let line = document.createElement("div");
            line.findNearest = Mock.functionMock(expected);
            g.appendChild(line);

            let expected2 = {
                position: { x: 1, y: 1 },
                distance: 2
            };
            let line2 = document.createElement("div");
            line2.findNearest = Mock.functionMock(expected2);
            g.appendChild(line2);

            let nearest = g.getNearestPoint(2, 2);
            t.is(nearest, expected2, "Nearest");
            t.is(line2.findNearest.calls.length, 1, "node.findNearest");
            t.is(line2.findNearest.calls[0], [2, 2], "node.findNearest");
            t.is(line.findNearest.calls.length, 1, "node.findNearest");
            t.is(line.findNearest.calls[0], [2, 2], "node.findNearest");
        });

        register("setup", async (t) => {
            let Mock = await import("./MockRenderer.js");
            let renderer = Mock.default();
            renderer.root = document.createElement("div");
            let axis = Mock.default();
            axis.setup = Mock.functionMock();

            let g = new Graph(renderer);
            g.xAxis = [axis];

            let line = document.createElement("div");
            line.setup = Mock.functionMock();
            g.appendChild(line);

            let line2 = document.createElement("div");
            line2.setup = Mock.functionMock();
            line2.render = Mock.functionMock();
            g.appendChild(line2);

            g.setup();

            t.is(axis.setup.calls.length, 1, "Axis Setup calls");
            t.is(line2.setup.calls.length, 1, "Line2 Setup calls");
            t.is(line2.render.calls.length, 0, "Line2 Render calls");
            t.is(line.setup.calls.length, 1, "Line Setup calls");
        });

        register("render", async (t) => {
            let Mock = await import("./MockRenderer.js");
            let renderer = Mock.default();
            renderer.root = document.createElement("div");
            renderer.save = Mock.functionMock((cb) => { cb(); });
            renderer.strokePath = Mock.functionMock((cb) => { cb(); });
            renderer.moveTo = Mock.functionMock();
            renderer.lineTo = Mock.functionMock();
            renderer.measureText = Mock.functionMock(() => 14);
            renderer.translate = Mock.functionMock((x,y,cb,skip) => { cb(); });
            renderer.drawText = Mock.functionMock();

            let g = new Graph(renderer);
            g.render();

            t.is(renderer.save.calls.length, 4, "Save was called 4 times");
            t.is(renderer.strokePath.calls.length, 4, "Save was called 4 times");
            t.is(renderer.moveTo.calls.length, 4, "moveTo was called 4 times");
            t.is(renderer.lineTo.calls.length, 4, "lineTo was called 4 times");
            t.is(renderer.measureText.calls.length, 2, "measureText was called");
            t.is(renderer.translate.calls.length, 2, "translate was called");
            t.is(renderer.drawText.calls.length, 2, "drawText was called");
        })

        register("getXAxisFor", async (t) => {
            let Mock = await import("./MockRenderer.js");
            let renderer = Mock.default();
            renderer.root = document.createElement("div");
            let expected = Mock.default();

            let g = new Graph(renderer);
            g.xAxis = [expected];

            // Default axis
            let node = document.createElement("div");
            let axis = g.getXAxisFor(node);
            t.is(axis, axis, "Axis match");

            // Invalid axis
            try {
                node.setAttribute("xAxis", "foo");
                axis = g.getXAxisFor(node);
                t.is(true, false, "Invalid axis should throw");
            } catch(ex) {
                t.is(true, true, ex);
            }

            // Valid axis
            expected = document.createElement("x-axis");
            expected.setAttribute("direction", "x");
            expected.id = "foo";
            g.appendChild(expected);
            axis = g.getXAxisFor(node);
            t.is(expected, axis, "Found axis");
        });

        register("getYAxisFor", async (t) => {
            let Mock = await import("./MockRenderer.js");
            let renderer = Mock.default();
            renderer.root = document.createElement("div");
            let expected = document.createElement("x-axis");
            expected.setAttribute("direction", "y");

            let g = new Graph(renderer);
            g.yAxis = [expected];

            // Default axis
            let node = document.createElement("div");
            let axis = g.getYAxisFor(node);
            t.is(axis, axis, "Axis match");

            // Invalid axis
            try {
                node.setAttribute("yAxis", "foo");
                axis = g.getYAxisFor(node);
                t.is(true, false, "Invalid axis should throw");
            } catch(ex) {
                t.is(true, true, ex);
            }

            // Valid axis
            expected.id = "foo";
            g.appendChild(expected);
            axis = g.getYAxisFor(node);
            t.is(expected, axis, "Found axis");
        });
    });
}