# Web COmponents
## JS Object printer

Creates a console like version of JS Objects, that can be expanded/shrunk.
<x-object>{"Hello": "world"}</x-object>
<script type="module">
  import {JSObject} from 'https://cdn.jsdelivr.net/gh/wesj/web-components@main/prettyPrint.js'
  customElements.define('x-object', JSObject);
</script>
### Usage
Import the web component and register it :)
```
import {JSObject} from './prettyPrint.js'
customElements.define('js-object', JSObject);
```
Then just use it in markup
```
<js-object>{"Hello": "World"}</js-object>
```
Creating instances in code:
```
let obj = new JSObject({Hello: "World"});
document.body.appendChild(obj);
```
JSObject supports a few CSS-theming properties:
<dl>
<dt>--number-color</dt>
<dd>The text color used for numbers</dd>
<dt>--bool-color</dt>
<dd>The text color used for booleans</dd>
<dt>--null-color</dt>
<dd>The text color used for null</dd>
<dt>--null-font</dt>
<dd>The font used for null</dd>
<dt>--undefined-color</dt>
<dd>The text color used for undefined</dd>
<dt>--undefined-font</dt>
<dd>The font used for undefined</dd>
<dt>--array-color</dt>
<dd>The text color used for arrays</dd>
<dt>--array-font</dt>
<dd>The font used for arrays</dd>
<dt>--object-color</dt>
<dd>The text color used for objects</dd>
<dt>--object-font</dt>
<dd>The font used for objects</dd>
<dt>--title-color</dt>
<dd>The text color used for titles (like "Array", "Class", or "Object" titles shown in front of items</dd>
<dt>--title-font</dt>
<dd>The font used for titles (like "Array", "Class", or "Object" titles shown in front of items</dd>
<dt>--deliminator-color</dt>
<dd>The text color used for deliminators (the ⬥, ⯈, or ⯆ characters used to denote rows)</dd>
<dt>--deliminator-color</dt>
<dd>The text color used for deliminators (the ⬥, ⯈, or ⯆ characters used to denote rows)</dd>
<dt>--deliminator-color</dt>
<dd>The font used for deliminators (the ⬥, ⯈, or ⯆ characters used to denote rows)</dd>
<dt>--deliminator-padding</dt>
<dd>The padding shown between deliminators and object values</dd>
<dt>--title-display</dt>
<dd>The display value used for titles (defaults to inline-block)</dd>
</dl>
