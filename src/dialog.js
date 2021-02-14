export default class Dialog extends HTMLElement {
    dialog = null;

    constructor(options = {}) {
        super();

        this._shadow = this.attachShadow({mode: 'open'});

        this.dialog = document.createElement("dialog");
        this._shadow.appendChild(this.dialog);

        const slot = document.createElement("slot");
        this.dialog.appendChild(slot);

        const buttons = document.createElement("slot");
        buttons.setAttribute("id", "buttonsSlot");
        buttons.setAttribute("name", "buttons");
        buttons.classList.add("buttons");
        this.dialog.appendChild(buttons);

        const cancel = document.createElement("button");
        buttons.appendChild(cancel);
        cancel.textContent = options.cancelText || "Cancel";
        cancel.addEventListener("click", () => {
            const event = new CustomEvent('cancel', {
                bubbles: true,
                cancelable: true
            });
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
        this.dialog.appendChild(style);
        style.textContent = `
        :host {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
            z-index: 0;
            visibility: collapse;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        dialog {
            background-color: white;
            display: flex;
            padding: 10px;
            background-color: white;
            border: 1px solid gray;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
        }
        
        dialog > * {
            z-index: 1;
        }

        :host(.open) {
            visibility: visible;
        }
        
        dialog::backdrop {
            filter: blur(10);
        }

        .buttons {
            display: flex;
            flex-direction: row-reverse;
        }
        `;
    }

    show = () => {
        this.classList.add("open");
        this.setAttribute("open", true);
    }

    hide = () => {
        this.classList.remove("open");
        this.removeAttribute("open");
    }
}