export default class Icon extends HTMLElement {
    title = null;
    img = null;

    constructor() {
        super();

        this.attachShadow({mode: 'open'});
        const linkElem = document.createElement('link');
        linkElem.setAttribute('rel', 'stylesheet');
        linkElem.setAttribute('href', 'ui/icon.css'); 
       
        let container = document.createElement("div");
        container.setAttribute("class", "container");

        this.img = document.createElement("img");
        this.img.setAttribute("class", "img");
        this.img.setAttribute("src", this.getAttribute("src"));
        container.appendChild(this.img);

        this.title = document.createElement("div");
        this.title.setAttribute("class", "title");
        this.title.textContent = this.getAttribute("title");
        container.appendChild(this.title);

        this.shadowRoot.append(linkElem, container);
    }

    connectedCallback() {
        if (this.hasAttribute("title")) {
            this.title.textContent = this.getAttribute("title");
        }
        
        if (this.hasAttribute("src")) {
            this.img.setAttribute("src", this.getAttribute("src"));
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "title") {
            this.title.textContent = newValue;
        } else if (name === "src") {
            this.img.setAttribute("src", newValue);
        }
    }
}

customElements.define('x-icon', Icon);