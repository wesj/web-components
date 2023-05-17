import Draggable from "./Draggable.js";

export class Timeline extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});

        const linkElem = document.createElement('link');
        linkElem.setAttribute('rel', 'stylesheet');
        linkElem.setAttribute('href', '../src/timeline.css');

        this.content = document.createElement("slot");

        let tickMarks = document.createElement("x-track");
        tickMarks.setAttribute("class", "markers");
        for (var i = 0; i < 10; i++) {
            let d = document.createElement("div");
            d.textContent = i;
            d.style.position = "absolute";
            d.style.left = ((i+1) * 160) + "px";
            tickMarks.appendChild(d);
        }

        let currentTime = new Draggable();
        currentTime.setAttribute("class", "current-time");
        currentTime.onDrag = (x, y) => { currentTime.style.left = x; }

        this.addEventListener("click", (event) => {
            if (event.target.nodeName === "X-TRACK") {
                this.selected = event.target;
            }
        });

        this.shadowRoot.append(linkElem, currentTime, tickMarks, this.content);
    }

    draw(root) {
        let tracks = this.childNodes;
        tracks.forEach((track) => {
            if (track.draw) {
                track.draw(root, 4);
            }
        })
    }

    get selected() {
        return this.querySelector(".selected");
    }

    set selected(val) {
        let current = this.selected;
        if (current) {
            current.classList.remove("selected");
        }
        if (val) {
            val.classList.add("selected");
        }
    }
}

export class Track extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});

        const linkElem = document.createElement('link');
        linkElem.setAttribute('rel', 'stylesheet');
        linkElem.setAttribute('href', '../src/track.css');

        let content = document.createElement("slot");
        this.shadowRoot.append(linkElem, content);
    }
    draw(root, time) { }
    startDrag(x, y) { }
    onDrag(x, y) { }
    endDrag(x, y) { }
}

export class CanvasTrack extends Track {
    get content() {
        return this.canvas;
    }

    constructor() {
        super();
    }

    draw(root, time) {
        if (!this.canvas) {
            this.canvas = document.createElement("canvas");
            this.ctx = this.canvas.getContext("2d");
            this.canvas.width = root.clientWidth;
            this.canvas.height = root.clientHeight;
            root.appendChild(this.canvas);
        }

        this.sceneGraph.forEach((item) => {
            item.draw(this.ctx, time);
        })
    }

    // selectedTool = new BoxTool();

    sceneGraph = [
        new Box({
            x: [
                { time: 0, value: 0 },
                { time: 5, value: 0.5 },
            ],
            stops: [
                { time: 0, y: 0, x: 0, width: .1, height: .1, background: "red" },
                { time: 5, y: .5, x: .5, width: .25, height: .25, background: "blue" }
            ]
        })
    ]

    startDrag(x, y) {
    }
    onDrag(x, y) {
    }
    endDrag(x, y) {
    }
}

class Box {
    constructor(options) {
        this.stops = options.stops;
    }

    draw(ctx, time) {
        let prev = null;
        let next = null;
        for (var i = 0; i < this.stops.length; i++) {
            let stop = this.stops[i];
            if (stop.time > time) {
                next = stop;
                break;
            }
            prev = stop;
        }

        if (next === null || prev.time === time) {
            next = prev;
        }

        let dt = next.time - prev.time;
        if (dt !== 0) {
            dt = (time - prev.time) / dt;
        }
        let dx = next.x - prev.x;
        let dy = next.x - prev.x;
        let dw = next.width - prev.width;
        let dh = next.height - prev.height;

        ctx.fillStyle  = prev.background;
        ctx.fillRect(
            (prev.x + dx * dt) * ctx.canvas.clientWidth,
            (prev.y + dy * dt) * ctx.canvas.clientHeight,
            (prev.width + dw * dt) * ctx.canvas.clientWidth,
            (prev.height + dh * dt) * ctx.canvas.clientHeight);
    }
}

customElements.define("x-timeline", Timeline);
customElements.define("x-track", Track);
customElements.define("x-canvastrack", CanvasTrack);
