
var has = Object.hasOwnProperty

module.exports = function(model){

  model.undoCommand = model.redoCommand = defaultSetter;

  model.on('change', function(instance,attr,val,prev){
    if (!instance._undoing){
      var cmd = { 
        undo: function(){ 
                model.undoCommand(instance,attr,prev); 
                if (has.call(model,'emit')) model.emit('undo',instance,attr,prev);
                if (has.call(instance,'emit')) instance.emit('undo',attr,prev);
              },
        redo: function(){ 
                model.redoCommand(instance,attr,val); 
                if (has.call(model,'emit')) model.emit('redo',instance,attr,val);
                if (has.call(instance,'emit')) instance.emit('redo',attr,val);
              }
      };
      (instance._cmds = instance._cmds || new CmdStack).push(cmd);
    }
  })

  model.on('save', function(instance){
    instance._cmds.reset();
  })

  model.prototype.undo = function(){
    withCommands(this, function(){
      this._cmds.undo();
    });
    return this;
  }

  model.prototype.redo = function(){
    withCommands(this, function(){
      this._cmds.redo();
    });
    return this;
  }

  model.prototype.undoAll = function(){
    withCommands(this, function(){
      this._cmds.undoAll();
      if (has.call(this,'dirty')) delete this.dirty;
    });
    return this;
  }

  model.prototype.redoAll = function(){
    withCommands(this, function(){
      this._cmds.redoAll();
    });
    return this;
  }

  return model;
}

// private

function withCommands(instance,fn){
  if (!instance._cmds) return;
  instance._undoing = true;
  fn.call(instance);
  instance._undoing = false;
}

function defaultSetter(instance,attr,val){
  return instance[attr](val);
}

function CmdStack(){
  this.reset();
}

CmdStack.prototype.reset = function(){
  this.resetDone();
  this.resetUndone();
}

CmdStack.prototype.resetUndone = function(){
  this.undone = [];
}

CmdStack.prototype.resetDone = function(){
  this.done = [];
}

CmdStack.prototype.push = function(cmd){
  this.done.push(cmd);
  this.resetUndone();
}

CmdStack.prototype.undoAll = function(){
  while (this.done.length) this.undo();
}

CmdStack.prototype.redoAll = function(){
  while (this.undone.length) this.redo();
}

CmdStack.prototype.undo = function(){
  var last = this.done.pop();
  if (last) {
    last.undo();
    this.undone.push( last );
  }
}

CmdStack.prototype.redo = function(){
  var last = this.undone.pop();
  if (last) {
    last.redo();
    this.done.push( last );
  }
}

