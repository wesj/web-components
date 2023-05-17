export default class Renderer {
    constructor(root) {
        this.root = document.createElement("canvas");

        let rect = root.getBoundingClientRect();
        let style = window.getComputedStyle(root);
        this.root.width = rect.width
            - parseFloat(style.borderLeftWidth) - parseFloat(style.borderRightWidth)
            - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
        this.root.height = rect.height
            - parseFloat(style.borderTopWidth) - parseFloat(style.borderBottomWidth)
            - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);

        this.ctx = this.root.getContext("2d");
    }
    
    toScreenCoords(x, y, skipTransform) {
        let x2 = this.xAxis.toScreenCoords(x, this.root.clientWidth, skipTransform);
        let y2 = this.yAxis.toScreenCoords(y, this.root.clientHeight, skipTransform);
        return [x2, y2];
    }

    fillRect(x, y, w, h, skipTransform) {
        let p = this.toScreenCoords(x, y, skipTransform);
        this.ctx.fillRect(p[0] - w/2, p[1] - h/2, w, h);
    }

    moveTo(x, y, skipTransform) {
        let p = this.toScreenCoords(x, y, skipTransform);
        this.ctx.moveTo(p[0], p[1]);
    }

    lineTo(x, y, skipTransform) {
        let p = this.toScreenCoords(x, y, skipTransform);
        this.ctx.lineTo(p[0], p[1]);
    }

    arc(x, y, r, startAngle, endAngle, skipTransform) {
        let p = this.toScreenCoords(x, y, skipTransform);
        this.ctx.arc(p[0], p[1], r, startAngle, endAngle);
    }

    drawText(txt, x, y, skipTransform) {
        let p = this.toScreenCoords(x, y, skipTransform);
        this.ctx.fillText(txt, p[0], p[1]);
    }

    measureText(txt) {
        return this.ctx.measureText(txt);
    }

    translate(x, y, callback, skipTransform) {
        let p = this.toScreenCoords(x, y, skipTransform);

        this.ctx.save();
        this.ctx.translate(p[0], p[1]);
        callback();
        this.ctx.restore();
    }

    fillPath(callback) {
        this.ctx.beginPath();
        callback();
        this.ctx.fill();
    }

    strokePath(callback) {
        this.ctx.beginPath();
        callback();
        this.ctx.stroke();
    }

    save(callback) {
        this.ctx.save();
        callback();
        this.ctx.restore();
    }

    set lineDash(vals) {
        this.ctx.setLineDash(vals);
    }

    set lineWidth(val) {
        this.ctx.lineWidth = val;
    }

    set fillColor(val) {
        this.ctx.fillStyle = val;
    }

    set strokeColor(val) {
        this.ctx.strokeStyle = val;
    }
}