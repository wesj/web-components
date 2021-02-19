export class Builder {
    emptyView() { return null; }
    numberOfRows() { return 0; }
    viewTypeAt(i) { return 0; }
    viewAtIndex(i) { return null; }
}

export class Layout {
    expectedSizeAt(i, view) { return {width: 0, height: 0 }; }
    positionAt(i, view) { return {width: 0, height: 0 }; }
}

let log = console.log;
const DOWN = 1;
const UP = -1;

export default class List extends HTMLElement {
    constructor(builder, layout) {
        super();
        this.builder = builder;
        this.layout = layout;

        this._shadow = this.attachShadow({mode: "open"});
        this.list = document.createElement("ul");
        this.list.style.padding = 0;
        this.list.style.margin = 0;
        this.list.style.position = "relative";
        this.style.overflowY = "auto";
        this._shadow.appendChild(this.list);

        this.addEventListener("scroll", this.onscroll.bind(this));

        //this.slot = document.createElement("slot");
        //this.list.appendChild(this.slot);

        this._scrollOffset = 0;
        this._firstVisibleIndex = null;
        this._lastVisibleIndex = null;
        this._storedViews = {};
        this._visible = {};
        this._prevScroll = 0;

        this.buildList();
    }

    onscroll(event) {
        let dir = null;
        if (this.list.scrollTop >= this._prevScroll) {
            dir = DOWN;
        } else {
            dir = UP;
        }
        this._prevScroll = this.list.scrollTop;
        this.buildList(dir);
    }

    setup(builder, layout) {
        this.builder = builder;
        this.layout = layout;
        this.buildList();
    }

    getViewOfType(type, index) {
        if (!this._storedViews[type]) {
            this._storedViews[type] = [];
        }

        if (!this._storedViews[type].length > 0) {
            //log("Building new view of type", type);
            let realView = this.builder.viewAtIndex(index);
            realView.style.position = "absolute";
            realView.style.top = 0;
            realView.style.left = 0;
            this.list.appendChild(realView);
            return {
                view: realView,
                type
            };
        }

        let recycle = this._storedViews[type].pop();
        // console.log("Used Recycle", index, recycle);
        this.builder.viewAtIndex(index, recycle.view);
        return recycle;
    }

    connectedCallback() {
        this.buildList();
    }

    recycle(view, i) {
        this._storedViews[view.type].push(view);
        delete this._visible[i];
    }

    buildList(dir = DOWN) {
        if (!this.builder) {
            console.log("No builder");
            return;
        }

        if (!this.list.style.height) {
            let size = this.layout.listSize();
            this.list.style.height = size.height;
        }

        let h = 0;
        let first = null;
        let last = null;
        let start = this._firstVisibleIndex || 0;
        let end = this._lastVisibleIndex || this.builder.numberOfRows();
        if (dir === UP) {
            start = this._lastVisibleIndex;
            end = this._firstVisibleIndex - 1;
            h = this.clientHeight;
        }

        console.log("Measuring", start, end, h);
        for (let i = start; dir == DOWN ? i < end : i > end; i += dir) {
            console.log("Measuing", i, h);
            let type = this.builder.viewTypeAt(i);
            let view = this.getViewOfType(type, i);
            let expected = this.layout.expectedSizeAt(i, view);

            if (dir === DOWN) {
                if (first === null && h + expected.height > 0) {
                    first = i;
                } else if (last === null && h + expected.height > this.clientHeight) {
                    last = i;
                }
            } else {
                if (last === null && h + expected.height > this.clientHeight) {
                    first = i;
                } else if (first === null && h + expected.height > 0) {
                    last = i;
                }
            }
            this.recycle(view, i);

            if (first && last) {
                break;
            }

            h = h + expected.height * dir;
            if (h > this.clientHeight || h < 0) {
                break;
            }
        }

        /* Recycle unvisible views */
        console.log("Recycling");
        for (var i = this._firstVisibleIndex; i < this._lastVisibleIndex; i++) {
            if (i < first || i > last) {
                let view = this._visible[i];
                if (view) {
                    console.log("Recycling", i);
                    this.recycle(view, i);
                }
            }
        }

        console.log("Drawing", first, last);
        for (let i = first; i <= last; i++) {
            if (i < this._firstVisibleIndex || i > this._lastVisibleIndex) {
                console.log("Draw", i);
                let type = this.builder.viewTypeAt(i);
                let view = this.getViewOfType(type, i);
                this._visible[i] = view;
                let position = this.layout.positionAt(i, view.view);
                view.view.style.top = position.y;
            }
        }

        this._firstVisibleIndex = first;
        this._lastVisibleIndex = last;
    }
}