export class Testing {
    passes = 0
    fails = 0;

    constructor(logger) {
        this.logger = logger;
    }

    finish() {
        this.logger.log("Passed", this.passes, "Failed", this.fails, "Total", this.passes + this.fails);
    }

    pass(a, operation, b, text) {
        this.logger.log(text, a, operation, b);
        this.passes += 1;
    }

    fail(a, operation, b, text) {
        this.logger.error(text, a, operation, b);
        this.fails += 1;
    }

    isnot(a, b, name) {
        if (!this.areObjectsEqual(a, b)) {
            this.pass(a, "!==", b, name);
            return true;
        } else {
            this.fail(a, "!==", b, name);
            return false;
        }
    }

    is(a, b, name) {
        if (this.areObjectsEqual(a, b)) {
            this.pass(a, "===", b, name);
            return true;
        } else {
            this.fail(a, "===", b, name);
            return false;
        }
    }

    areObjectsEqual(obj1, obj2) {
        if (obj1 === null || obj2 === null) {
            return obj1 === obj2;
        }

        if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
            // Compare non-object values using strict equality
            return obj1 === obj2;
        }
      
        // Check if the objects have the same number of properties
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        if (keys1.length !== keys2.length) {
          return false;
        }
      
        // Check if the objects have the same property names
        if (!keys1.every(key => keys2.includes(key))) {
          return false;
        }
      
        // Check if the property values are equal
        for (const key of keys1) {
          const value1 = obj1[key];
          const value2 = obj2[key];
      
          // Recursively compare nested objects
          if (typeof value1 === 'object' && typeof value2 === 'object') {
            if (!this.areObjectsEqual(value1, value2)) {
              return false;
            }
          } else if (value1 !== value2) {
            return false;
          }
        }
      
        // The objects are equal
        return true;
      }

    runNext(testCopy) {
        return new Promise(async (resolve, reject) => {
            let t = testCopy.pop();
            this.logger.group(t.name);
            await t.test(this);
            this.logger.groupEnd();
            resolve();
        })
    }

    async run(tests) {
        while(tests.length > 0) {
            try {
                await this.runNext(tests);
            } catch(ex) {
                this.logger.error("Error running", ex);
                break;
            }
        }
    }
}

if (window.registerTests) {
    registerTests("testing.js", async (registerTest) => {
        registerTest("booleans", (t) => {
            t.is(true, true, "Equal");
            t.isnot(true, false, "Not equal");
        });

        registerTest("array", (t) => {
            t.is([1,2,3,4], [1,2,3,4], "Equal");
            t.isnot([1,2,3,4], [1,2,3,5], "Not equal");
        });

        registerTest("numbers", (t) => {
            let foo = 1234;
            let bar = 2345;
            t.is(foo, foo, "Equal");
            t.isnot(foo, bar, "Not equal");
        });

        registerTest("object", (t) => {
            let foo = {"bar": 1234, "baz": false};
            let bar = {"bar": 1234, "baz": true};
            t.is(foo, foo, "Equal");
            t.isnot(foo, bar, "Not equal");
        });
    });
}