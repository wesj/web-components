export default class Renderer {
    constructor(root) {
        this.root = document.createElement("canvas");

        let rect = root.getBoundingClientRect();
        let style = window.getComputedStyle(root);
        this.width = this.root.width = rect.width
            - parseFloat(style.borderLeftWidth) - parseFloat(style.borderRightWidth)
            - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
        this.height = this.root.height = rect.height
            - parseFloat(style.borderTopWidth) - parseFloat(style.borderBottomWidth)
            - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);

        this.ctx = this.root.getContext("2d");
    }
    
    toScreenCoords(x, y, skipTransform) {
        let x2 = this.xAxis.toScreenCoords(x, this.width, skipTransform);
        let y2 = this.yAxis.toScreenCoords(y, this.height, skipTransform);
        if (x === null) x2 = 0;
        if (y === null) y2 = 0;
        return [x2, y2];
    }

    fillRect(x, y, w, h, skipTransform) {
        let p = this.toScreenCoords(x, y, skipTransform);
        let p2 = this.toScreenCoords(x + w, y + h, skipTransform);
        w = p2[0] - p[0];
        h = p2[1] - p[1];
        // console.log("fillrect", p, p2);
        this.ctx.fillRect(p[0], p[1], w, h);
    }

    squircle(x, y, width, height, cornerRadius) {
        var radius = cornerRadius * 0.55; // Adjust the value to control the squircle effect
        ctx.beginPath();
        ctx.moveTo(x + cornerRadius, y);
        ctx.lineTo(x + width - cornerRadius, y);
        ctx.bezierCurveTo(x + width - radius, y, x + width, y + radius, x + width, y + cornerRadius);
        ctx.lineTo(x + width, y + height - cornerRadius);
        ctx.bezierCurveTo(x + width, y + height - radius, x + width - radius, y + height, x + width - cornerRadius, y + height);
        ctx.lineTo(x + cornerRadius, y + height);
        ctx.bezierCurveTo(x + radius, y + height, x, y + height - radius, x, y + height - cornerRadius);
        ctx.lineTo(x, y + cornerRadius);
        ctx.bezierCurveTo(x, y + radius, x + radius, y, x + cornerRadius, y);
        ctx.closePath();
        ctx.stroke();
    }

    roundedRect(x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.stroke();
    }

    strokeRect(x, y, w, h, skipTransform) {
        let p = this.toScreenCoords(x, y, skipTransform);
        let p2 = this.toScreenCoords(x + w, y + h, skipTransform);
        w = p2[0] - p[0];
        h = p2[1] - p[1];
        this.ctx.strokeRect(p[0], p[1], w, h);
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

    set font(val) {
        this.ctx.font = val;
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