import Draggable from "./Draggable.js";

export default class TitleBar extends Draggable {
    title = null;
    constructor(owner) {
        super(owner);
        this.attachShadow({mode: 'open'});
        let slot = document.createElement("slot");

        let slot2 = document.createElement("slot");
        slot2.setAttribute("name", "buttons");
        this.buttons = document.createElement("div");
        this.buttons.setAttribute("part", "buttons");

        if (this.hasAttribute("buttons")) {
            this.setupButtons(this.getAttribute("buttons"));
        }
        this.buttons.append(slot2);

        const linkElem = document.createElement('link');
        linkElem.setAttribute('rel', 'stylesheet');
        linkElem.setAttribute('href', '../src/titlebar.css');

        this.shadowRoot.append(linkElem, slot, this.buttons);
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

    setupButtons(buttonStr) {
        let buttons = buttonStr.split(",").map(str => str.trim());
        if (buttons.indexOf("minimize") > -1) {
            if (!this.minimizeButton) {
                this.minimizeButton = document.createElement("button");
                this.minimizeButton.setAttribute("part", "button minimize");
                this.minimizeButton.classList.add("minimize");
                this.minimizeButton.textContent = "_";
                this.minimizeButton.addEventListener("click", () => {
                    let event = new Event("minimize");
                    this.dispatchEvent(event);
                    
                    if (this.hasAttribute("onminimize")) {
                        let attr = this.getAttribute("onminimize");
                        let fun = new Function("let event = arguments[0]; " + attr);
                        fun(event);
                    }
                });
                this.buttons.appendChild(this.minimizeButton);
            }
        } else if (this.minimizeButton) {
            this.buttons.removeChild(this.minimizeButton);
            this.minimizeButton = null;
        }

        if (buttons.indexOf("close") > -1) {
            if (!this.closeButton) {
                this.closeButton = document.createElement("button");
                this.closeButton.classList.add("close");
                this.closeButton.setAttribute("part", "button close");
                this.closeButton.textContent = "X";
                this.closeButton.addEventListener("click", () => {
                    let event = new Event("close");
                    this.dispatchEvent(event);
                });
                this.buttons.appendChild(this.closeButton);
            }
        } else if (this.closeButton) {
            this.buttons.removeChild(this.closeButton);
            this.closeButton = null;
        }
    }

    connectedCallback() {
        if (this.hasAttribute("buttons")) {
            this.setupButtons(this.getAttribute("buttons"));            
        }        
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "buttons") {
            this.setupButtons(newValue);
        } else if (name === "title") {
            this.title.textContent = newValue;
        } else if (name === "id") {
            this.id = newValue;
            this.onresize();
        } else if (name === "docked") {
            this.onresize();
        }
    }
}

customElements.define('x-titlebar', TitleBar);
