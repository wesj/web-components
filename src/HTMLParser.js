class Token {
    value = "";
    append(c) {
        this.value += c;
    }

    regex = /./
    accepts(c) {
        return (this.value + c).match(this.regex) !== null;
    }
}

class Bracket extends Token {
    className = "bracket";
    regex = /^(<|<\/|>)$/;
    create() { return new Bracket(); }
}

class Equals extends Token {
    className = "equals";
    regex = /^=$/;
    create() { return new Equals(); }
}

class WhiteSpace extends Token {
    className = "whitespace";
    regex = /^\s+$/;
    create() { return new WhiteSpace(); }
}

class Word extends Token {
    className = "other";
    regex = /^[^<>=\s]+$/;
    create() { return new Word(); }
}

class HTMLTokenizer {
    constructor() {
        this.index = 0;
        this.current = null;
    }

    tokens = [
        new Bracket(),
        new Word(),
        new WhiteSpace(),
        new Equals()
    ]

    set str(val) {
        this._str = val;
        this.index = 0;
        this.current = null;
    }

    findNode(c) {
        for (var i = 0; i < this.tokens.length; i++) {
            let token = this.tokens[i];
            if (token.accepts(c)) {
                return token.create();
            }
        }
    }

    next() {
        if (!this._str || this.index >= this._str.length) {
            return null;
        }

        let c = this._str[this.index];
        if (!this.current) {
            this.current = this.findNode(c);
        }

        while (this.current && this.current.accepts(c)) {
            this.current.append(c);
            this.index++;

            if (this.index >= this._str.length) {
                break;
            }
            c = this._str[this.index];
        }

        let current = this.current;
        this.current = null;
        return current;
    }
}

const ParserState = {
    Unknown: 0,
    StartNode: 1,
    EndNode: 2,
    Attributes: 3,
    AttributeName: 4,
    AttributeValue: 5,
    Text: 6,
    Comment: 7,
}

export default class HTMLParser {
    tokenizer = new HTMLTokenizer()
    prev = null;
    state = [ParserState.Unknown];

    set str(val) {
        this.tokenizer.str = val;
    }

    get currentState() {
        if (this.state.length > 0) {
            return this.state[this.state.length - 1];
        }
        return ParserState.Unknown;
    }

    set currentState(val) {
        if (this.state.length > 0) {
            this.state[this.state.length - 1] = val;
            return;
        }
        this.state[0] = val;
    }

    next() {
        let token = this.tokenizer.next();
        if (token instanceof Bracket) {
            if (token.value == "<") {
                this.state.push(ParserState.StartNode);
            } else if (token.value == "</") {
                this.state.push(ParserState.EndNode);
            } else if (token.value == ">") {
                this.state.pop();
            }
        } else if (token instanceof Word) {
            if (this.currentState === ParserState.StartNode) {
                token.className = "nodeName";
                this.currentState = ParserState.Attributes;
            } else if (this.currentState === ParserState.EndNode) {
                token.className = "nodeName";
            } else if (this.currentState === ParserState.Attributes) {
                token.className = "attributeName";
            } else if (this.currentState === ParserState.AttributeValue) {
                token.className = "attributeValue";
                this.currentState = ParserState.Attributes;
            }
        } else if (token instanceof Equals) {
            if (this.currentState === ParserState.Attributes) {
                this.currentState = ParserState.AttributeValue;
            }
        }
        return token;
    }
}