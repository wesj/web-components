let tests = [];
export let registerTest = function(test) {
    tests.push(test);    
}
export class Assert {
    passes = 0
    fails = 0;
    finish() {
        console.log("Passed", this.passes, "Failed", this.fails, "Total", this.passes + this.fails);
    }
    pass(a, b, text) {
        console.log(text, a, "===", b);
        this.passes += 1;
    }
    fail(a, b, text) {
        console.error(text, a, "!==", b);
        this.fails += 1;
    }

    is(a, b, name) {
        if (a instanceof Array && b instanceof Array) {
            this.is(a.length, b.length, name + ".length");
            a.forEach((i, index) => {
                this.is(i, b[index], name + "[" + index + "]");
            })
        } else {
            if (a === b) {
                this.pass(a, b, name);
                return true;
            } else {
                this.fail(a, b, name);
                return false;
            }
        }
    }
}

export let runTests = function () {
    let assert = new Assert();
    tests.forEach((t) => { t(assert); })
    assert.finish();
}

function keypress(event) {
    if (event.key === "t") {
        runTests();
    }
}

export let setupTests = function () {
    window.addEventListener("keypress", keypress);
}

function start() {
    setupTests();
}
window.addEventListener("load", start);
