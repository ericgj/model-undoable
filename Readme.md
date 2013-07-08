
# model-undoable

  Undo/redo behavior for component/model-ish classes/objects

## Installation

    $ component install ericgj/model-undoable

## Examples

For component/model, just `use` the plugin:

```javascript
  var undoable = require('model-undoable')
    , model    = require('model')

  var Person = model('person')
                 .attr('id')
                 .attr('name')
                 .attr('email')
                 .use(undoable);
```

Now your model instances have `undo`, `redo`, `undoAll`, `redoAll` methods.

  - `undo` and `redo` work as expected on individual model changes.

  - `undoAll` undoes all changes back to the last save. 

  - `redoAll` redoes all undone changes from the last save to the most current.

  - Model instances will also emit `undo` and `redo` events.

You can also mix it into model instances directly (or into similar objects that 
emit `change` events such as [react][react]-ified objects):

```javascript
  var undoable = require('model-undoable')

  var person = new Person();
  undoable(person);
```

## Motivation

Mainly I wrote it for `undoAll` for reverting all changes made in a reactive 
view. Obviously most browsers give you individual undo/redo.


## License

  MIT


[react]: https://github.com/timoxley/react

