import Tabs, { Tab } from "../src/Tabs.js";
import Syntax from "../src/syntax.js";

export default class DemoSection extends HTMLElement {
    content = null;

    connectedCallback() {
        this.content = this.content || this.innerHTML;
        this.innerHTML = 
        `<x-tabs>
            <x-tab title="Example" class="example">
            `
            + this.content +
            `
            </x-tab>
            <x-tab title="Code">
                <x-syntax>
                `
                + this.content +
                `
                </x-syntax>
            </x-tab>
        `;
    }      
}

customElements.define('x-demo', DemoSection);