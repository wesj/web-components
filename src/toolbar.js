export default class Toolbar extends HTMLElement {
    constructor() {
        super()
        const linkElem = document.createElement('link');
        linkElem.setAttribute('rel', 'stylesheet');
        linkElem.setAttribute('href', '../src/toolbar.css');

        this.attachShadow({mode: 'open'});
        let slot = document.createElement("slot");
        this.shadowRoot.append(linkElem, slot);
    }
}
customElements.define('x-toolbar', Toolbar);