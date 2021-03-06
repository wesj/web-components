# Web COmponents
## JS Object printer

Creates a console like version of JS Objects, that can be expanded/shrunk.
### Markup:
<x-object>{
  "Hello": "world",
  "array": [1,2,3,4],
  "deep": {
    "nullProperty": null
  }
}</x-object>
### Code:
<div id="complex-demo"></div>
<script type="module">
  import {JSObject} from 'https://cdn.jsdelivr.net/gh/wesj/web-components@main/src/prettyPrint.js'
  customElements.define('x-object', JSObject);
  class Class { foo = "bar" }
  let obj = new JSObject({
    Hello: "World",
    date: new Date(),
    obj: new Class(),
    foo: function(a, b, c) { }
  });
  document.querySelector("#complex-demo").appendChild(obj);
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
The shadow dom produced looks like a definition list:
```
<dl>
  <dt class="expandable">
    <!-- Shown when the item is expanded --!>
    <span class="superSimplified">{…}</span>
    <!-- Shown when the item is collapsed --!>
    <span class="simplified object">
      <span class="title">Object </span>
      <!-- Shows details like the length of an array --!>
      <span class="detail"></span>
      <!-- Shown when the row is collapsed --!>
      <span class="value">{Hello: "world"}</span>
    </span>
  </dt>
  <dd>
    <dl>
      <dt class="row">
        <span class="key">Hello: </span>
        <span class="superSimplified">{…}</span>
        <span class="simplified string">
          <span class="title"></span>
          <span class="detail"></span>
          <span class="value">"world"</span>
        </span>
      </dt>
      <!-- This is never generated since this item can't be expanded --!>
      <dd></dd>
    </dl>
  </dd>
</dl>
```
The markup version only uses `JSON.parse` which may cause issues with some fields or key types. You can also create instances in code:
```
let obj = new JSObject({
  Hello: "World",
  date: new Date(),
  foo: function() { }
});
document.body.appendChild(obj);
```
### Theming
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

## Console
<x-console>
  <x-consoleitem level="info" source="here.html" >This is info</x-consoleitem>
  <x-consoleitem level="error" source="here.html">This is an error</x-consoleitem>
  <x-consoleitem level="warn" source="here.html">This is a warning</x-consoleitem>
  <x-consoleitem level="debug" source="here.html">This is debug</x-consoleitem>
</x-console>
<script type="module">
  import {Console, ConsoleItem} from 'https://cdn.jsdelivr.net/gh/wesj/web-components@main/src/console.js';
  customElements.define('x-console', Console);
  customElements.define('x-consoleitem', ConsoleItem);
</script>
### Usage
Import the web component and register it :) It exports two objects, Console and ConsoleItem. Console is the wrapper for individual ConsoleItems.
```
import {Console, ConsoleItem} from './console.js'
customElements.define('x-console', Console);
customElements.define('x-consoleitem', ConsoleItem);
```
Then just use it in markup
```
<x-console>
  <x-consoleitem level="info" source="here.html" >This is info</x-consoleitem>
  <x-consoleitem level="error" source="here.html">This is an error</x-consoleitem>
  <x-consoleitem level="warn" source="here.html">This is a warning</x-consoleitem>
  <x-consoleitem level="debug" source="here.html">This is debug</x-consoleitem>
</x-console>
```
## Dialog
<x-dialog id="myDialog" oncommit="console.log('commit')" oncancel="console.log('cancel')" >
    <div>Here is some text in this dialog</div>
</x-dialog>
<button onclick="document.querySelector('#myDialog').show()">Show Dialog</button>
<script type="module">
import Dialog from 'https://cdn.jsdelivr.net/gh/wesj/web-components@main/src/dialog.js';
customElements.define('x-dialog', Dialog);
</script>
### Usage
Import the web component and register it :) It exports a single Dialog class.
```
import Dialog from './dialog.js';
customElements.define('x-dialog', Dialog);
```
Then just use it in markup
```
<x-dialog id="myDialog" oncommit="console.log('commit')" oncancel="console.log('cancel')" >
    <div>Here is some text in this dialog</div>
</x-dialog>
<button onclick="document.querySelector('#myDialog').show()">Show Dialog</button>
```