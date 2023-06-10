import Tabs, { Tab } from "../src/Tabs.js";
import Syntax from "../src/syntax.js";

export default class DemoSection extends HTMLElement {
    content = null;

    connectedCallback() {
        if (!this._inited_) {
            this._inited_ = true;
            this.content = this.content || this.innerHTML;

            let example = new Tab();
            example.setAttribute("title", "Example");
            while(this.firstChild) {
                example.appendChild(this.firstChild);
            }

            let code = new Tab();
            code.setAttribute("title", "Code");
            let syntax = new Syntax();
            syntax.innerHTML = example.innerHTML;
            code.appendChild(syntax);

            let tabs = new Tabs();
            tabs.appendChild(example);
            tabs.appendChild(code);

            this.appendChild(tabs);
        }
    }      
}

customElements.define('x-demo', DemoSection);