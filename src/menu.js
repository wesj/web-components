
export default class Menu extends HTMLElement {
    title = null;
    content = null;
    constructor() {
        super();
        const linkElem = document.createElement('link');
        linkElem.setAttribute('rel', 'stylesheet');
        linkElem.setAttribute('href', '../src/menu.css');

        this.attachShadow({mode: 'open'});
        this.title = document.createElement("button");
        this.title.addEventListener("click", this);

        this.content = document.createElement("div");
        this.content.classList.add("menu");
        this.content.style.visibility = "hidden";
        let slot = document.createElement("slot");
        this.content.appendChild(slot);
        this.shadowRoot.append(linkElem, this.title, this.content);
    }

    connectedCallback() {
        if (this.hasAttribute("title")) {
            this.title.textContent = this.getAttribute("title");
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "title") {
            this.title.textContent = newValue;
        }
    }

    toggleMenu() {
        if (this.content.style.visibility === "hidden") {
            this.content.style.visibility = "visible"
            document.body.addEventListener("mouseup", this);
        } else {
            this.content.style.visibility = "hidden"
        }
    }

    handleEvent(event) {
        event.preventDefault();
        if (event.type === "click") {
            this.toggleMenu();
        } else if (event.type === "mouseup") {
            this.toggleMenu();
            document.body.removeEventListener("mouseup", this);
        }
    }
}

customElements.define('x-menu', Menu);