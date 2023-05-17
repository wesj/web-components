function looseJsonParse(obj) {
    return Function('"use strict";return (' + obj + ')')();
}

function debounced(context, foo, time) {
    let timeout = null;
    return () => {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
        timeout = setTimeout(() => {
            foo.call(context);
        }, time)
    }
}

export class BasicAdapter {
    rows = 0;
    cols = 0;

    rowHeight(i) { return 0 }
    rowWidth(i) { return 0 }

    recycle(row, i, j) {
        row.textContent = i;
    }

    getItem(i) {
        let d = document.createElement("div");
        return d;
    }

    getEmpty() {
        let d = document.createElement("div");
        d.textContent = "No data";
        return d;
    }
}

export class ArrayAdapter extends BasicAdapter {
    constructor(data = []) {
        super();
        this.data = data || [];
        this.rows = data.length;
        this.cols = 1;
    }

    recycle(row, i, j) {
        row.textContent = this.data[i];
    }
}

export class GridAdapter extends BasicAdapter {
    constructor(data = [], options = {}) {
        super(0);
        this.options = {
            ...options
        };
        this.data = data || [];
        this.rows = data.length;
        if (options.showRowHeaders) { this.rows += 1; }
        this.columns = Object.keys(data[0] || {});
        this.cols = this.columns.length;
        if (options.showColHeaders) { this.cols += 1; }
    }

    recycle(row, i, j) {
        if (this.options.showColHeaders) { j -= 1; }
        if (this.options.showRowHeaders) { i -= 1; }

        if (j === -1) {
            if (i === -1) {
                row.textContent = "";
                row.classList.remove("data");
                row.classList.add("header");    
            } else {
                row.textContent = i + 1;
                row.classList.remove("data");
                row.classList.add("header");    
            }
        } else if (i === -1) {
            let column = this.columns[j];
            row.textContent = column;
            row.classList.remove("data");
            row.classList.add("header");    
        } else {
            let column = this.columns[j];
            row.textContent = this.data[i][column];
            row.classList.add("data");
            row.classList.remove("header");    
        }
    }
}

export class Recycler {
    recycled = [];
    recycle(node) {
        this.recycled.push(node);
        node.parentNode.removeChild(node);
    }

    getNode(adapter, i, j) {
        let newNode = this.recycled.pop();
        if (!newNode) {
            newNode = adapter.getItem(i, j);
        }
        return newNode;
    }

    findNode(i, j, root) {
        return root.querySelector("*[row='" + i + "'][col='" + j + "']")
    }
}

export class BaseLayout {
    first(top, left) {
        let h = this.rowHeight(0);
        let w = this.rowWidth(0);
        return [
            h > 0 ? Math.floor(top / h) : 0,
            w > 0 ? Math.floor(left / w) : 0,
        ]
    }

    totalHeight() { return 0; }
    totalWidth() { return 0; }

    rowWidth(i) {
        return 0;
    }

    rowHeight(i) {
        return 0;
    }

    layout() { }
    isOffscreen() { return true }

    refreshOptions(node) { }
}

export class GridLayout extends BaseLayout {
    h = 20
    w = 100

    constructor(options = {}) {
        super();
        this.stickyRows = options.stickyRows || [];
        this.stickyCols = options.stickyCols || [];
    }

    cacheSizes(adapter) {
        let row = adapter.getItem(0);
        adapter.recycle(row, 1 ,1);

        document.body.appendChild(row);
        let rect = row.getBoundingClientRect();
        this.h = rect.height || 20;
        this.w = 100;
        document.body.removeChild(row);
    }

    refreshOptions(node) {
    }

    totalHeight(adapter) {
        if (adapter.rows) {
            if (this.h === null || this.w === null) {
                this.cacheSizes(adapter);
            }
            
            return adapter.rows * this.h;
        }
        return 0;
    }

    totalWidth(adapter) {
        if (adapter.cols) {
            if (this.h === null || this.w === null) {
                this.cacheSizes(adapter);
            }

            return adapter.cols * this.w;
        }
        return 0;
    }

    rowWidth(i) {
        return this.w;
    }

    rowHeight(i) {
        return this.h;
    }

    isOffscreen(node, rect) {
        if (!node) return false;
        if (node.classList.contains("sticky")) {
            return false;
        }

        let top = rect.scrollTop;
        let maxHeight = rect.height;
        let bottom = top + maxHeight;

        let left = rect.scrollLeft;
        let maxWidth = rect.width;
        let right = left + maxWidth;

        let nodeTop = parseInt(node.style.top);
        let nodeLeft = parseInt(node.style.left);

        let nodeRect = node.getBoundingClientRect();

        if (nodeTop + nodeRect.height < top) return true;
        if (nodeTop > bottom)  return true;
        if (nodeLeft + nodeRect.width < left) return true;
        if (nodeLeft > right) return true;

        return false;
    } 
       
    layout(node, i, j, rect) {
        if (this.stickyRows.indexOf(i) > -1) {
            node.classList.add("sticky");
        }
        node.style.width = this.rowWidth(i);
        node.style.height = this.rowHeight(j);
        node.style.top = this.rowHeight(i) * i;
        node.style.left = this.rowWidth(j) * j;
    }
}

const Direction = {
    Vertical: 1,
    Horizontal: 2
}

export class LinearLayout extends BaseLayout {
    h = null;
    constructor(options = {}) {
        super();
        this.direction = options.direction === "horizontal" ? Direction.Horizontal : Direction.Vertical;
        this.sticky = [];
    }

    first(top, left) {
        let h = this.rowHeight(0);
        let w = this.rowWidth(0);
        if (this.direction === Direction.Vertical) {
            return [
                h > 0 ? Math.floor(top / h) : 0,
                w > 0 ? Math.floor(left / w) : 0,
            ]
        } else {
            return [
                w > 0 ? Math.floor(left / w) : 0,
                h > 0 ? Math.floor(top / h) : 0,
            ]
        }
    }

    refreshOptions(node) {
        if (node.hasAttribute("sticky")) {
            this.sticky = node.getAttribute("sticky").split(",").map(parseInt);
        } else {
            this.sticky = [];
        }
    }

    totalHeight(adapter) {
        if (this.h === null) {
            let row = adapter.getItem(0);
            adapter.recycle(row, 0, 0);

            document.body.appendChild(row);
            let rect = row.getBoundingClientRect();
            this.h = rect.height;
            this.w = 100;//rect.width;
            document.body.removeChild(row);
        }
        
        if (this.direction === Direction.Vertical) {
            return adapter.rows * this.h;
        } else {
            return this.h;
        }
    }

    totalWidth(adapter) {
        if (this.direction === Direction.Vertical) {
            return null;
        } else {
            return this.w * adapter.rows;
        }
    }

    rowHeight(i) {
        return this.h;
    }

    rowWidth(i) {
        return this.w;
    }

    isOffscreen(node, rect) {
        if (!node) return false;
        if (node.style.position === "sticky") {
            return false;
        }

        let top = rect.scrollTop;
        let maxHeight = rect.height;
        let bottom = top + maxHeight;
        let nodeTop = parseInt(node.style.top);

        if (nodeTop + this.rowHeight(0) < top) {
            return true;
        }

        if (nodeTop > bottom) {
            return true;
        }

        let left = rect.scrollLeft;
        let maxWidth = rect.width;
        let right = left + maxWidth;
        let nodeLeft = parseInt(node.style.left);
        if (nodeLeft + this.rowWidth(0) < left) {
            return true;
        }

        if (nodeLeft > right) {
            return true;
        }

        return false;
    } 
       
    layout(row, i, j, adapter) {
        if (this.direction === Direction.Vertical) {
            row.style.top = this.rowHeight(i) * i;
            if (this.sticky.indexOf(i) > -1) {
                row.style.position = "sticky";
                row.style.top = "0";
                row.style.zIndex = 1;
            }    
        } else {
            row.style.left = this.rowWidth(i) * i;
            row.style.display = "inline";
            if (this.sticky.indexOf(i) > -1) {
                row.style.position = "sticky";
                row.style.left = "0";
                row.style.top = "100";
                row.style.zIndex = 1;
            }    
        }
    }
}

class RecyclingNode {
    layout = null;
    adapter = null;
    node = null;
    constructor(node) {
        this.node = node;
    }

    recycleOffscreen(rect, layout, recycler) {
        for (var i = 0; i < this.node.childNodes.length; i++) {
            let child = this.node.childNodes[i];
            if (layout.isOffscreen(child, rect)) {
                recycler.recycle(child);
            }
        }
    }

    refreshContent(rect, adapter, layout, recycler) {
        if (adapter.rows === 0 || adapter.cols === 0) {
            this.node.innerHTML = "";
            let empty = adapter.getEmpty();
            this.node.appendChild(empty);
            return;
        }

        this.recycleOffscreen(rect, layout, recycler);

        this.node.style.height = layout.totalHeight(adapter) || "100%";
        this.node.style.width = layout.totalWidth(adapter) || "100%";

        let first = layout.first(rect.scrollTop, rect.scrollLeft);
        for (var i = first[0]; i < adapter.rows; i++) {
            let newRow = null;
            for (var j = first[1]; j < adapter.cols; j++) {
                if (recycler.findNode(i, j, this.node)) {
                    continue;
                }

                newRow = recycler.getNode(adapter, i, j);
                newRow.classList.add("cell");
                
                adapter.recycle(newRow, i, j);
                newRow.setAttribute("row", i);
                newRow.setAttribute("col", j);
                layout.layout(newRow, i, j, rect);

                // If this column isn't visibile, jump to the next row
                if (layout.isOffscreen(newRow, rect)) {
                    break;
                }

                this.node.appendChild(newRow);
            }

            // If the first item in this row isn't visible, we're probably done?
            if (newRow && j === first[1] && layout.isOffscreen(newRow, rect)) {
                break;
            }
        }
    }
}

export default class List extends HTMLElement {
    data = null;
    adapter = new BasicAdapter(0);
    layout = new LinearLayout();
    recycler = new Recycler();
    innerNode = null;

    constructor() {
        super();
        const linkElem = document.createElement('link');
        linkElem.setAttribute('rel', 'stylesheet');
        linkElem.setAttribute('href', '../src/list.css');

        this.innerNode = document.createElement("div");
        this.innerNode.classList.add("cells");
        this.innerNode.style.position = "relative";
        this.recyclingNode = new RecyclingNode(this.innerNode);
        
        let debRefresh = debounced(this, this.refreshContent, 0);
        this.addEventListener("scroll", (event) => {
            debRefresh();
        })

        // :( This layout stuff should be in our layout controller probably...
        this.headers = document.createElement("slot");
        this.rowHeaders = this.querySelectorAll("x-header[position='left'], x-header[position='right']");
        this.colHeaders = this.querySelectorAll("x-header[position='top'], x-header[position='bottom']");
        this.colHeaders.forEach((header) => {
            header.adapter = new ArrayAdapter(this.adapter.keys);
        })

        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(this.innerNode, linkElem, this.headers);
    }

    refreshContent() {
        let rect = {
            height: this.height,
            width: this.width,
            scrollTop: this.scrollTop,
            scrollLeft: this.scrollLeft
        };

        this.recyclingNode.refreshContent(rect, this.adapter, this.layout, this.recycler);
        /*
        if (this.rowHeaders) {
            this.rowHeaders.forEach((header) => {
                header.recyclingNode.refreshContent(rect, this.adapter, this.layout, this.recycler);
            });
        }
        */
    }

    connectedCallback() {
        window.addEventListener("load", () => {
            let rect = this.getBoundingClientRect();
            this.height = rect.height;
            this.width = rect.width;
            if (this.hasAttribute("adapter")) {
                this.adapter = looseJsonParse(this.getAttribute("adapter"));
                if (!this.adapter) {
                    console.error("Invalid adapter name", this.getAttribute("adapter"));
                }
            } else {
                this.adapter = new BasicAdapter();
            }

            if (this.hasAttribute("layout")) {
                this.layout = looseJsonParse(this.getAttribute("layout"));
                if (!this.layout) {
                    console.error("Invalid layout name", this.getAttribute("layout"));
                }
            } else {
                this.layout = new LinearLayout();
            }

            this.layout.refreshOptions(this);

            this.refreshContent();    
        });
    }

    attributeChangedCallback(name, oldValue, newValue) {
    }
}

export class Header extends HTMLElement {
    constructor() {
        super();
        const linkElem = document.createElement('link');
        linkElem.setAttribute('rel', 'stylesheet');
        linkElem.setAttribute('href', '../src/header.css');

        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(linkElem);

        this.recyclingNode = new RecyclingNode(this);
    }
}

customElements.define('x-list', List);
customElements.define('x-header', Header);
