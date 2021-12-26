export default class MenuSeparator extends HTMLElement {
    constructor() {
        super();
        const linkElem = document.createElement('link');
        linkElem.setAttribute('rel', 'stylesheet');
        linkElem.setAttribute('href', '../src/menuitem.css');

        this.attachShadow({mode: 'open'});
        let hr = document.createElement("hr");
        this.shadowRoot.append(linkElem, hr);
    }
}

customElements.define('x-menuseparator', MenuSeparator);