export default class MenuItem extends HTMLElement {
    constructor() {
        super();
        const linkElem = document.createElement('link');
        linkElem.setAttribute('rel', 'stylesheet');
        linkElem.setAttribute('href', '../src/menuitem.css');

        this.attachShadow({mode: 'open'});
        let button = document.createElement("button");
        let slot = document.createElement("slot");
        button.appendChild(slot);
        this.shadowRoot.append(linkElem, button);
    }
}

customElements.define('x-menuitem', MenuItem);