export default class Dialog extends HTMLElement {
    dialog = null;

    constructor(options = {}) {
        super();

        this._shadow = this.attachShadow({mode: 'open'});

        this.dialog = document.createElement("dialog");
        this._shadow.appendChild(this.dialog);

        const content = document.createElement("div");
        content.classList.add("dialogContent");
        this.dialog.appendChild(content);

        const slot = document.createElement("slot");
        content.appendChild(slot);

        const buttons = document.createElement("slot");
        buttons.classList.add("buttons");
        content.appendChild(buttons);

        const cancel = document.createElement("button");
        buttons.appendChild(cancel);
        cancel.textContent = options.cancelText || "Cancel";
        cancel.addEventListener("click", () => {
            const event = new CustomEvent('cancel', {
                bubbles: true,
                cancelable: true
            });
            console.log(this.attributes, this.hasAttribute("oncancel"));
            if (this.hasAttribute("oncancel")) {
                let f = new Function("event", '"use strict";' + this.getAttribute("oncancel"));
                f(event);
                if (event.defaultPrevented) {
                    return;
                }
            }
            this.dispatchEvent(event);
            if (!event.defaultPrevented) {
                this.hide();
            }
        });

        const commit = document.createElement("button");
        buttons.appendChild(commit);
        commit.textContent = options.commitText || "OK";
        commit.addEventListener("click", async () => {
            const event = new CustomEvent('commit', {
                bubbles: true,
                cancelable: true
            });
            if (this.hasAttribute("oncommit")) {
                let f = new Function("event", '"use strict";' + this.getAttribute("oncommit"));
                f(event);
                if (event.defaultPrevented) {
                    return;
                }
            }
            this.dispatchEvent(event);
            if (!event.defaultPrevented) {
                this.hide();
            }
        });

        const style = document.createElement("style");
        content.appendChild(style);
        style.textContent = `
        dialog {
            visibility: collapse;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;;
        }
        
        dialog.open {
            visibility: visible;
        }
        
        .dialogContent {
            padding: 10px;
            background-color: white;
            border: 1px solid gray;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
        }

        .dialogContent::backdrop {
            filter: blur(10);
        }

        .buttons {
            display: flex;
            flex-direction: row-reverse;
        }
        dialog::background {
            filter: blur(10);
        }
        `;
    }

    show = () => {
        this.dialog.classList.add("open");
        this.dialog.setAttribute("open", true);
    }

    hide = () => {
        this.dialog.classList.remove("open");
        this.dialog.removeAttribute("open");
    }
}