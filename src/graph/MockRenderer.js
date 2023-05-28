function Mock() {
    return new Proxy({
        called: {},
        gets: {},
        sets: {}
    }, {
        get: (target, prop, receiver) => {
            if (!target.gets[prop]) {
                target.gets[prop] = [];
            }
            target.gets[prop].push({
                receiver
            });
            
            let val = target.sets[prop];
            if (val) {
                return val[val.length - 1];
            }
            return undefined;
        },

        set: (obj, prop, value) => {
            // console.log("Set", prop, value);
            if (!obj.sets[prop]) {
                obj.sets[prop] = [];
            }
            obj.sets[prop].push(value);
            return true;
        }
    })
}

export let functionMock = (foo = () => {}) => {
    let calls = [];
    let fun = () => { return foo; };
    if (foo instanceof Function) {
        fun = foo;
    }
    let p = new Proxy(fun, {
        get: (target, prop, receiver) => {
            if (prop === "calls") {
                return calls;
            } 
            return undefined;
        },

        apply: function(target, thisArg, argumentsList) {
            calls.push(argumentsList);
            return fun.apply(null, argumentsList);
        }
    });
    return p;
}

export default Mock;