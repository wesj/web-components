import Draggable from "./Draggable.js";
import TitleBar from "./titlebar.js";

export default class Window extends HTMLElement {
    title = null
    storage = null
    id = Math.random()
    onresize = () => { }
    constructor(options = {}) {
        super();

        this.id = options.id;
        this.attachShadow({mode: 'open'});

        this.title = new TitleBar(this);
        this.title.classList.add("titlebar");
        this.title.setAttribute("buttons", "minimize,close");
        this.title.textContent = options.title;
        this.title.onDrag = (x, y) => {
            this.style.left = x;
            this.style.top = y;
        }
        this.title.addEventListener("minimize", () => {
        });
    
        this.title.addEventListener("close", () => {
            this.parentElement.removeChild(this);
        });
        this.title.stopDrag = () => { this.moved() };

        this.content = document.createElement("div");
        this.content.classList.add("content");
        let slot = document.createElement("slot");
        this.content.appendChild(slot);

        const linkElem = document.createElement('link');
        linkElem.setAttribute('rel', 'stylesheet');
        linkElem.setAttribute('href', '../src/window.css');
        this.shadowRoot.append(linkElem, this.title, this.content);

        this.addResizers();
        // this.addScrollbars();

        this.addEventListener("click", () => {
            var event = new CustomEvent("activateWindow", {
                bubbles: true,
                cancelable: true,
            });
            this.dispatchEvent(event);
        })
    }

    addScrollbars() {
        this.bottomScrollbar = new Draggable();
        this.bottomScrollbar.classList.add("scrollbar");
        this.bottomScrollbar.classList.add("bottom");
        this.bottomScrollbar.style.width = this.clientWidth / this.content.scrollWidth * this.clientWidth;
        this.bottomScrollbar.onDrag = (x, y) => {
            let l = x - this.offsetLeft;
            this.bottomScrollbar.style.left = Math.max(5, Math.min(this.clientWidth - 30, l));
        };
        this.bottomScrollbar.stopDrag = () => { };

        this.topScrollbar = new Draggable();
        this.topScrollbar.style.height = this.clientHeight / this.content.scrollHeight * this.clientHeight;
        this.topScrollbar.classList.add("scrollbar");
        this.topScrollbar.classList.add("right");
        this.topScrollbar.onDrag = (x, y) => {
            let r = y - this.offsetTop;
            this.topScrollbar.style.top = Math.max(5, Math.min(this.clientHeight - 55, r));
        };
        this.topScrollbar.stopDrag = () => { };

        this.content.append(this.bottomScrollbar, this.topScrollbar);
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

    connectedCallback() {
        if (this.hasAttribute("title")) {
            this.title.textContent = this.getAttribute("title");
        }

        if (this.hasAttribute("id")) {
            this.id = this.getAttribute("id");
            this.onresize();
        }

        if (this.hasAttribute("docked")) {
            this.onresize();
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "title") {
            this.title.textContent = newValue;
        } else if (name === "id") {
            this.id = newValue;
            this.onresize();
        } else if (name === "docked") {
            this.onresize();
        }
    }
}

customElements.define('x-window', Window);
