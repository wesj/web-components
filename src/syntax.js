import HTMLParser from "./HTMLParser.js";

let frontRegex = /^\s*/;
function trimFrontWhitespace(lines) {
    while (lines.length) {
        if (lines[0].trim() === "") {
            lines.splice(0, 1);
        } else {
            break;
        }
    }

    while (lines.length) {
        if (lines[lines.length - 1].trim() === "") {
            lines.splice(lines.length - 1, 1);
        } else {
            break;
        }
    }

    let front = null;
    lines.forEach((line) => {
        let m = line.match(frontRegex);
        if (front === null || m[0].length < front.length) {
            front = m[0];
        }
    });
    lines = lines.map((line) => {
        return line.replace(front, "");
    });

    return lines;
}

export default class Syntax extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});

        const linkElem = document.createElement('link');
        linkElem.setAttribute('rel', 'stylesheet');
        linkElem.setAttribute('href', '../src/syntax.css');

        this.shadowRoot.append(linkElem);

        this.list = document.createElement("ul");
        this.shadowRoot.append(this.list);
    }

    connectedCallback() {
        let src = this.innerHTML;
        this.innerHTML = "";
        let lines = src.split(/[\r\n]+/);
        lines = trimFrontWhitespace(lines);
        let tokenizer = new HTMLParser();
        lines.forEach((line, index) => {
            // Ignore if the first and last line are empty
            if (index === 0 && line.trim() === "") {
                return;
            } else if (index === lines.length - 1 && line.trim() === "") {
                return;
            }

            let l = document.createElement("li");
            tokenizer.str = line;

            let next = tokenizer.next();
            while (next) {
                let span = document.createElement("span");
                span.className = next.className;
                span.textContent = next.value;
                l.appendChild(span);

                next = tokenizer.next();
            }

            this.list.appendChild(l);
        })
    }
}

if (!customElements.get('x-syntax')) {
    customElements.define('x-syntax', Syntax);
}
