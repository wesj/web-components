export class Tab extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});

        const linkElem = document.createElement('link');
        linkElem.setAttribute('rel', 'stylesheet');
        linkElem.setAttribute('href', '../src/tab.css');

        let content = document.createElement("slot");
        this.shadowRoot.append(linkElem, content);
    }
}

function replaceText(node, template, value) {
    if (node.nodeName === "#text") {
        node.textContent = node.textContent.replace(template, value);
    }

    for (var i = 0; i < node.childNodes.length; i++) {
        replaceText(node.childNodes[i], template, value);
    }
}

function clearSelected(node) {
    node.classList.remove("selected");
    let part = node.getAttribute("part") || "";
    if (part.indexOf("selected") !== -1) {
        part = part.replace("selected", "");
        node.setAttribute("part", part);
    }
}

function setSelected(node) {
    node.classList.add("selected");
    let part = node.getAttribute("part") || "";
    if (part.indexOf("selected") === -1) {
        part += " selected";
        node.setAttribute("part", part);
    }
}

export default class Tabs extends HTMLElement {
    set selectedIndex(val) {
        let s = this.querySelector(":scope > .selected");
        let t = this.tabs.querySelectorAll(":scope > .selected");
        if (s) {
            clearSelected(s);
            let blurEvent = new Event("blur", {});
            s.dispatchEvent(blurEvent);
        }
        if (t) { t.forEach(clearSelected) }
        
        setSelected(this.children[val]);
        let tabNodes = this.tabs.querySelectorAll("[index=\"" + val + "\"]");
        for (var i = 0; i < tabNodes.length; i++) {
            setSelected(tabNodes[i]);
        }

        let focusEvent = new Event("focus", {});
        this.children[val].dispatchEvent(focusEvent);
    }

    constructor() {
        super();
        this.attachShadow({mode: 'open'});

        const linkElem = document.createElement('link');
        linkElem.setAttribute('rel', 'stylesheet');
        linkElem.setAttribute('href', '../src/tabs.css');

        this.tabs = document.createElement("ul");
        this.tabs.setAttribute("part", "tabs");
        this.tabs.classList.add("tabs");
        this.tabs.style.flexDirection = this.style.flexDirection == "row" ? "column" : "row";
        let content = document.createElement("slot");
        this.shadowRoot.append(linkElem, this.tabs, content);

        let tabs = this.querySelectorAll(":scope > x-tab");
        let foundSelected = false;
        let t;
        if (this.hasAttribute("tab-template")) {
            t = document.getElementById(this.getAttribute("tab-template")).content;
        } else {
            t = new DocumentFragment()
            var li = document.createElement("li");
            li.classList = "tab";
            li.setAttribute("part", "tab");
            li.textContent = "{title}";
            t.appendChild(li);
        }

        for (let i = 0; i < tabs.length; i++) {
            let tab = tabs[i];
            if (tab.classList.contains("selected")) {
                foundSelected = true;
            }

            let tabNode = t.cloneNode(true);
            for (var j = 0; j < tabNode.childNodes.length; j++) {
                if (tabNode.childNodes[j].setAttribute) {
                    tabNode.childNodes[j].setAttribute("index", i);
                }
                tabNode.childNodes[j].addEventListener("click", (e) => {
                    this.selectedIndex = i;
                });    
            }
            replaceText(tabNode, "{title}", tab.getAttribute("title"));
            this.tabs.appendChild(tabNode);

        }

        if (!foundSelected) {
            this.selectedIndex = 0;
        }
    }
}

customElements.define('x-tabs', Tabs);
customElements.define('x-tab', Tab);