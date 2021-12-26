
export default class Draggable extends HTMLElement {
    offset = [0,0]
    startDrag = () => { };
    onDrag = (x,y) => { };
    stopDrag = () => { };

    constructor(moving) {
        super();
        this.addEventListener("mousedown", this);
    }

    handleEvent = (event) => {
        switch (event.type) {
            case "mousedown": this.startMove(event); break;
            case "mouseup": this.endMove(event); break;
            case "mousemove": this.move(event); break;
        }
    }

    startMove = (event) => {
        this.offset = [event.layerX, event.layerY];
        window.addEventListener("mouseup", this);
        window.addEventListener("mousemove", this);
        this.startDrag();
    }

    move = (event) => {
        this.onDrag(event.clientX - this.offset[0],
                    event.clientY - this.offset[1])
    }

    endMove = (event) => {
        window.removeEventListener("mouseup", this);
        window.removeEventListener("mousemove", this);
        this.stopDrag();
    }

    connectedCallback() {
        if (this.hasAttribute("ondrag")) {
            let attr = this.getAttribute("ondrag");
            this.onDrag = new Function("let x = arguments[0]; let y = arguments[1]; " + attr);
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "ondrag") {
            this.onDrag = new Function("let x = arguments[0]; let y = arguments[1]; " + newValue);
        }
    }
}
customElements.define('x-draggable', Draggable);
