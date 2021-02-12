function create(name, options = {}, children = []) {
    let n = document.createElement(name);
    let option;
    for (option in options) {
        switch(option) {
            case "text": n.textContent = options[option]; break;
            default: {
                if (option.startsWith("on")) {
                    n.addEventListener(option.substr(2), options[option]);
                } else {
                    n.setAttribute(option, options[option])
                }
            }
        }
    }

    children.forEach((child) => {
        n.appendChild(child);
    });
    return n;
}
let funRegex = /^function (\w*)(\([^\)]*\))/;
let classRegex = /^class (\w*)/;

let matchers = [
    { match: (x) => x === null, class: "null", toString: (x, options) => "null", toNode: simplePrint },
    { match: (x) => x === undefined, class: "undefined", toString: (x, options) => "undefined", toNode: simplePrint },
    { match: isString, class: "string", toString: (x, options) => "\"" + x + "\"", toNode: simplePrint },
    { match: isBoolean, class: "bool", toString: (x, options) => x + "", toNode: simplePrint },
    { match: isNumber, class: "number", toString: (x, options) => x + "", toNode: simplePrint },
    {
        match: isFunction,
        class: "function",
        toString: (obj, options) => {
            let match = obj.toString().match(funRegex);
            if (match) {
                return match[1] + match[2];
            };
            if (obj.name) return obj.name + "()";
            return "function()";
        },
        toNode: simplePrint
    },
    {
        match: Array.isArray,
        class: "array",
        title: (obj) => "Array ",
        detail: (obj) => "(" + obj.length + ") ",
        toString: (obj, options) => "[" + objToString(obj, options) + "]",
        toNode: prettyPrintObj
    },
    // This matches anything. Leave it at the bottom
    {
        match: () => true,
        class: "object",
        title: (obj) => {
            let match = obj.constructor.toString().match(funRegex);
            if (match) return match[1] + " ";
            match = obj.constructor.toString().match(classRegex);
            if (match) return match[1] + " ";
            return "Object ";
        },
        toString: (obj, options) => "{" + objToString(obj, options) + "}",
        toNode: prettyPrintObj
    }
]

function isObject(arg) {
    return Object.prototype.toString.call(arg).indexOf('Object') !== -1;
}

function isString(arg) {
    return typeof(arg) == "string" || arg instanceof String;
}

function isNumber(value) {
   return typeof value === 'number' && isFinite(value);
}

function isBoolean(value) {
    return typeof value === "boolean";
}

function isFunction(value) {
    return typeof value === "function";
}

function toggleCollapsed(obj, options) {
    if (!isExpandable(obj)) {
        return () => {}
    }
    return (event) => {
        event.stopPropagation();
        event.preventDefault();

        let t = event.target;
        while (t && t.nodeName !== "DT") {
            t = t.parentNode;
        }
        if (!t) return;

        // TODO: Dynamically generate the children
        if (!t.nextSibling || t.nextSibling.nodeName !== "DD") {
            let dd = create("dd", {}, [
                prettyPrint(obj, {isChild: true, ...options})
            ]);
            t.parentNode.insertBefore(dd, t.nextSibling);
        }
        t.classList.toggle("expanded");
    }
}

function objToString(obj, options = {}) {
    let maxLength = options.maxLength || 30;
    let txt = "";
    let keys = Object.keys(obj);
    if (keys.length == 0) {
        return obj.toString();
    }
    for (var i = 0; i < keys.length; i++) {
        let key = keys[i];
        let val = toString(obj[key], { maxLength: maxLength - txt.length });
        if (txt.length + val.length > maxLength) {
            txt += "…";
            break;
        } else {
            txt += key + ": " + val;
            if (i < keys.length - 1) txt += ", ";
        }
    }
    return txt;
}

function toString(obj, options = {}) {
    for (var i = 0; i < matchers.length; i++) {
        let matcher = matchers[i];
        if (matcher.match(obj)) return matcher.toString(obj, options);
    }
}

function simplePrint(obj, options) {
    for (var i = 0; i < matchers.length; i++) {
        let matcher = matchers[i];
        if (matcher.match(obj)) {
            return create("span", {
                class: "simplified " + matcher.class,
            }, [
                create("span", {
                    class: "title",
                    text: matcher.title ? matcher.title(obj) : ''
                }),
                create("span", {
                    class: "detail",
                    text: matcher.detail ? matcher.detail(obj) : ''
                }),
                create("span", {
                    class: "value",
                    text: matcher.toString(obj)
                })
            ]);
        }
    }
}

function getNonEnumerableProperties(obj) {
    var enum_and_nonenum = Object.getOwnPropertyNames(obj);
    var enum_only = Object.keys(obj);
    var nonenum_only = enum_and_nonenum.filter(function(key) {
        var indexInEnum = enum_only.indexOf(key);
        return indexInEnum == -1;
    });
}

function isExpandable(obj) {
    return isObject(obj) || Array.isArray(obj);
}

function prettyPrintObj(obj, options) {
    let keys = Object.getOwnPropertyNames(obj);

    return create("dl", {}, keys.reduce((vals, key) => {
        let val = obj[key];

        vals.push(create("dt", {
            class: isExpandable(val) ? "row expandable" : "row",
            onclick: toggleCollapsed(val, options)
        }, [
            create("span", {class: "key", text: key + ": "}),
            create("span", {
                class: "superSimplified",
                text:"{…}" // TODO: This should just be simplePrint with length 0
            }),
            simplePrint(val, options)
        ]));

        return vals;
    }, []))
}

export default function prettyPrint(obj, options = {}) {
    if (!options.isChild) {
        return create("dl", {}, [
            create("dt", {
                class: isExpandable(obj) ? "expandable" : "",
                onclick: toggleCollapsed(obj, options)    
            }, [
                create("span", {class: "superSimplified", text: "{…}" }),
                simplePrint(obj, {isChild: true, ...options})
            ]),
        ]);
    }

    for (var i = 0; i < matchers.length; i++) {
        let matcher = matchers[i];
        if (matcher.match(obj)) {
            return matcher.toNode(obj, options);
        }
    }
}

export class JSObject extends HTMLElement {
    set obj(val) {
        this._obj = val;
        let node = prettyPrint(val, this._options);
        this._shadow.innerHTML = "";
        this._shadow.appendChild(node);
        this.updateStyle();
    }

    get obj() {
        return this._obj;
    }

    updateStyle = () => {
        let style = document.createElement("style");
        style.textContent = `
        dl,
        dt {
            list-style-type: none;
            padding: 0;
            margin: 0; 
        }
        
        dd {
            margin-inline-start: 2em;
        }
        
        dt {
            max-height: 1.5em;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        
        dt > .simplified { display: inline-block; }
        dt > .superSimplified { display: none; }
        
        dt::before {
            content: var(--deliminator, "⬥");
            font: var(--deliminator-font, 0.75em sans-serif);
            color: var(--deliminator-color, #BBB);
            padding-right: var(--deliminator-padding, 5px);
        }
        
        dt.expandable {
            cursor: pointer;
        }
        dt.expandable:hover {
            background-color: rgba(0,0,0,0.05);
        }
        dt.expandable::before {
            content: var(--deliminator-expand, "⯈");
        }
        
        dt.expandable.expanded::before {
            content: var(--deliminator-collapse, "⯆");
        }
        
        dt.expandable.expanded > .superSimplified {
            display: inline-block;
        }

        dt.expandable.expanded > .simplified {
            display: none;
        }
        
        dt.expanded {
            max-height: none;
        }
        
        dt:not(.expandable) + dd { display: none; }
        
        dt.expandable.expanded + dd {
            display: block;
        }
        
        dt.expandable + dd {
            display: none;
        }
        
        .superSimplified,
        .simplified {
            opacity: 0.5;
            max-height: 1.5em;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .null {
            color: var(--null-color);
            font: var(--null-font);
        }
        .undefined {
            color: var(--undefined-color);
            font: var(--undefined-font);
        }
        .bool {
            color: var(--bool-color);
            font: var(--bool-font);
        }
        .number {
            color: var(--number-color);
            font: var(--number-font);
        }
        .object {
            color: var(--object-color);
            font: var(--object-font);
        }
        .array {
            color: var(--array-color);
            font: var(--array-font);
        }
        .key {
            color: var(--key-color);
            font: var(--key-font);
        }
        .title {
            display: var(--title-display, "inline");
            color: var(--title-color);
            font: var(--title-font);
        }
        .detail {
            display: var(--detail-display, "inline");
            color: var(--detail-color);
            font: var(--detail-font);
        }
        `
        this._shadow.appendChild(style);
    }

    constructor(obj, options) {
        super();
        this._options = options;
        this._shadow = this.attachShadow({mode: 'open'});
        try {
            this.obj = obj || JSON.parse(this.textContent);
        } catch(ex) {
            this.obj = "Invalid JSON: " + ex;
        }
    }
}
