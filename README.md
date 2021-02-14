# web-components
Little web components I wrote for my own use at home. These are all self-contained files with no external dependencies. I just use fonts for icons where possible.

## console.js
A small log-viewer basically. Designed to mimick the browser's JS console. Exports two components 'Console' and 'ConsoleItem' for showing inside the console.
```
import {Console, ConsoleItem} from './Console.js'
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

Console items have two supported attribute:
<dl>
<dt>`level`</dt>
<dd>The level of logging. Will control the default color and display. Supports four values. `error`, `info`, `debug`, and `warn`.</dd>
<dt>`source`</dt>
<dd>The location where the log is from. Will be shown on the right hand side</dd>
</dl>
Any content inside the tag will be rendered as the message's body.

## dialog.js
A wrapper around an html dialog. I think this is probably only needed because of FF's lack of css `::background` support, but... I use it anyway. Adds two little buttons by default as well, Ok and Cancel.
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
### Events
Supports two events, `confirm` and `cancel` for when the default "Ok" or `Cancel` buttons are tapped.
```
<x-dialog id="myDialog" oncommit="console.log('commit')" oncancel="console.log('cancel')" >
    <div>Here is some text in this dialog</div>
</x-dialog>
```
Calling preventDefault on either event will prevent hiding the dialog.
### Slots
You can add custom buttons using the `buttons` slot:
```
<x-dialog id="myDialog">
    <div>Here is some text in this dialog</div>
    <button slot="buttons" onclick="document.querySelector('#myDialog').hide()">Extra</button>
</x-dialog>
``` 
Note that clicking any custom buttons won't automatically hide the dialog. You have to handle that yourself.
## prettyPrint.js
Pretty prints a JS-Object. Exports a `prettyPrint` function that generates a DOM for you, as well as `JSObject` class that does the same as a web-component.
```
import {JSObject} from './prettyPrint.js'
customElements.define('js-object', JSObject);
```
Then just use it in markup
```
<js-object>{"Hello": "World"}</js-object>
```