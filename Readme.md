
# model-undoable

  Undo/redo behavior for component/model-ish objects

## Installation

    $ component install ericgj/model-undoable

## Examples

Just `use` the plugin:

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


## Todo

You should also be able to use this library with any object that emits 
'change' events similar to component/model: e.g. [timoxley/react][react].


## License

  MIT


[react]: https://github.com/timoxley/react

