export default class GraphNode extends HTMLElement {
    get color() {
        let style = window.getComputedStyle(this);
        return style.stroke !== "none" ? style.stroke :
               style.color !== "none" ? style.color : "black";
    }

    get backgroundColor() {
        let style = window.getComputedStyle(this);
        console.log(style.backgroundColor);
        return style.backgroundColor !== "rgba(0, 0, 0, 0)" ? style.backgroundColor : undefined;
    }

    get fill() {
        let style = window.getComputedStyle(this);
        return style.fill !== "rgb(0, 0, 0)" ? style.fill : undefined;
    }

    get lineWidth() {
        let style = window.getComputedStyle(this);
        return parseFloat(style["stroke-width"]) || 1;
    }

    get fontSize() {
        let style = window.getComputedStyle(this);
        return parseFloat(style["font-size"]) || 14;
    }

    get listStyleType() {
        let style = window.getComputedStyle(this);
        let t = style["list-style-type"];
        return t;
    }

    get borderRadius() {
        let style = window.getComputedStyle(this);
        return parseFloat(style["border-radius"]) || 0;
    }

    get borderColor() {
        let style = window.getComputedStyle(this);
        let t = style["border-top-color"];
        return t;
    }

    get borderWidth() {
        let style = window.getComputedStyle(this);
        return parseFloat(style["border-width"]) || 0;
    }
}