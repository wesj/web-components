import Draggable from "./Draggable.js";

export default class ResizableBox extends Draggable {
    onresize = () => { }
    constructor(options = {}) {
        super();

        this.id = options.id;
        this.attachShadow({mode: 'open'});

        this.onDrag = (x, y) => {
            this.style.left = x;
            this.style.top = y;
        }
        this.stopDrag = () => { this.moved() };

        let slot = document.createElement("slot");

        const linkElem = document.createElement('link');
        linkElem.setAttribute('rel', 'stylesheet');
        linkElem.setAttribute('href', '../src/window.css');
        this.shadowRoot.append(linkElem, slot);

        this.addResizers();
    }

    addResizers() {
        const addResizer = (position, onDrag) => {
            let draggable = new Draggable();
            position.split(/\s+/).forEach((p) => {
                draggable.classList.add(p);
            })
            draggable.classList.add("resizer");
            draggable.onDrag = (x, y) => {
                onDrag(x, y);
                this.moved();
            };
            draggable.stopDrag = () => {
                this.moved();
            }
            this.shadowRoot.appendChild(draggable);
            return draggable;
        }

        addResizer("top left", (x, y) => {
            this.resizeLeft(x);
            this.resizeTop(y);
        });
        addResizer("top", (x, y) => {
            this.resizeTop(y);
            this.moved();
        });
        addResizer("top right", (x, y) => {
            this.resizeRight(x);
            this.resizeTop(y);
        });
        addResizer("right", (x, y) => {
            this.resizeRight(x);
        });
        addResizer("bottom right", (x, y) => {
            this.resizeRight(x);
            this.resizeBottom(y);
        });
        addResizer("bottom", (x,y) => {
            this.resizeBottom(y);
        });
        addResizer("bottom left", (x, y) => {
            this.resizeLeft(x);
            this.resizeBottom(y);
        });
        addResizer("left", (x,y) => {
            this.resizeLeft(x);
        });        
    }

    resizeLeft(x) {
        const width = this.clientWidth;
        const left = this.offsetLeft;
        this.style.left = x;
        this.style.width = width + left - x;
    }

    resizeRight(x) {
        const width = this.clientWidth;
        const right = this.offsetLeft + width;
        this.style.width = width + x - right;
    }

    resizeTop(y) {
        const top = this.offsetTop;
        const height = this.clientHeight;
        this.style.top = y;
        this.style.height = height + top - y;
    }

    resizeBottom(y) {
        const height = this.clientHeight;
        const bottom = this.offsetTop + height;
        this.style.height = height + y - bottom;
    }

    moved() {
        this.onresize();
    }
}

customElements.define('x-resizable', ResizableBox);
