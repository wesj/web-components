export const ConsoleItemType = {
    error: 1,
    warning: 2,
    log: 3,
    info: 4,
    debug: 5
}

export class ConsoleItem extends HTMLElement {
    _sourceElt = null;
    constructor() {
        super();
        let shadow = this.attachShadow({mode: 'open'});

        let content = document.createElement("span");
        content.classList.add("content");
        shadow.appendChild(content);

        let icon = document.createElement("div");
        icon.classList.add("icon");
        content.appendChild(icon);

        let message = document.createElement("span");
        message.classList.add("message");
        let slot = document.createElement("slot");
        message.appendChild(slot);
        content.appendChild(message);

        this._sourceElt = document.createElement("span");
        this._sourceElt.classList.add("source");
        this._sourceElt.textContent = this.getAttribute("source");
        content.appendChild(this._sourceElt);

        let style = document.createElement("style");
        style.textContent = `
        :host {
            --console-row-height: 20px;
            --console-output-line-height: calc(14 / 11);
            --console-output-vertical-padding: 3px;
            --console-input-extra-padding: 2px;
            --console-inline-start-gutter: 32px;
            --console-icon-horizontal-offset: 1px;
            --console-warning-background: hsl(54, 100%, 92%);
            --console-warning-border: rgba(215, 182, 0, 0.28);
            --console-warning-color: #715100;
            --console-input-background: white;
            --console-message-background: white;
            --console-message-border: #f2f2f4;
            --console-message-color: #0c0c0d;
            --console-error-background: hsl(344, 73%, 97%);
            --console-error-border: rgba(215, 0, 34, 0.12);
            --console-error-color: #a4000f;
            --console-navigation-color: #0074e8;
            --console-navigation-border: #75baff;
            --console-indent-border-color: #0074e8;
            --console-repeat-bubble-background: #0074e8;
            --error-color: #a4000f;
            --console-output-color: #0c0c0d;
            border-bottom: 1px solid black;
        }
        .content {
            display: flex;
            align-items: flex-start;
            justify-content: stretch;
            margin-top: -1px;
            min-height: calc(var(--console-row-height) + 2px);
            border-top: 1px solid var(--console-message-border);
            border-bottom: 1px solid var(--console-message-border);
            font-size: var(--theme-code-font-size);
            line-height: var(--console-output-line-height);
            color: var(--console-message-color);
            background-color: var(--console-message-background);
        }
        :host([level="error"]) .content {
            color: var(--console-error-color);
            border-color: var(--console-error-border);
            background-color: var(--console-error-background);
        }
        :host([level="warn"]) .content {
            color: var(--console-warning-color);
            border-color: var(--console-warning-border);
            background-color: var(--console-warning-background);
        }
        .icon::before {
            content: "";
            display: inline-block;
            width: 2em;
            text-align: center;
        }
        :host([level="info"]) .icon::before {
            content: "🛈";
        }
        :host([level="warn"]) .icon::before {
            content: "⚠";
        }
        :host([level="error"]) .icon::before {
            content: "🛈";
        }
        .message {
            flex: 1;
        }
        .source {
            padding-right: 0.5em;
        }
        `;
        shadow.appendChild(style);
    }

    connectedCallback() {
        this._sourceElt.textContent = this.getAttribute("source");
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch(name) {
            case "source":
                this._sourceElt.textContent = newValue;
                break;
        }    
    }
}

export class Console extends HTMLElement {
    constructor() {
        super();
        let shadow = this.attachShadow({mode: 'open'});

        let toolbar = document.createElement("div");
        toolbar.classList.add("toolbar");
        shadow.appendChild(toolbar);

        let deleteButton = document.createElement("button");
        deleteButton.textContent = "Clear"
        toolbar.appendChild(deleteButton);

        let filter = document.createElement("input");
        filter.setAttribute("type", "search");
        filter.style.flex = 1;
        filter.setAttribute("placeholder", "Filter output");
        toolbar.appendChild(filter);

        Object.keys(ConsoleItemType).forEach((key) => {
            let input = document.createElement("input");
            input.setAttribute("type", "checkbox");
            input.setAttribute("value", key);
            input.textContent = key;
            toolbar.appendChild(input);
        });

        let settingsButton = document.createElement("button");
        settingsButton.textContent = "Settings"
        toolbar.appendChild(settingsButton);

        let ol = document.createElement("ol");
        shadow.appendChild(ol);

        let slot = document.createElement("slot");
        ol.appendChild(slot);

        let style = document.createElement("style");
        style.textContent = `
        .toolbar {
            border-bottom: 1px solid black;
            display: flex;
            align-items: center;
            justify-content: stretch;
        }
        ol {
            padding: 0;
            margin: 0;
            list-style-type: none;
        }
        ::slotted(*) {
            display: list-item;
        }
        `;
        shadow.appendChild(style);
    }
}

export default Console;