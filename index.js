

module.exports = function(model){

  model.on('change', function(instance,attr,val,prev){
    instance._rev = instance._rev || {};
    instance._rev[attr] = instance._rev[attr] || prev;
  })

  model.on('save', function(instance){
    instance._rev = {};
    instance._fwd = {};
  })

  model.prototype.rollback = function(){
    if (!this._rev) return this;
    this._fwd = this._fwd || {};
    for (var attr in this._rev){
      this._fwd[attr] = this[attr]();
      this[attr](this._rev[attr]);
    }
    return this;
  }

  model.prototype.rollforward = function(){
    if (!this._fwd) return this;
    for (var attr in this._fwd){
      this[attr](this._fwd[attr]);
    }
    return this;
  }

  return model;
}

// private

// not used

function CmdStack(){
  this.reset();
}

CmdStack.prototype.reset = function(){
  this.done = [];
  this.undone = [];
}

CmdStack.prototype.push = function(cmd){
  this.done.push(cmd);
}

CmdStack.prototype.undoAll = function(){
  for (var i=0;i<this.done.length;++i) this.undo();
}

CmdStack.prototype.redoAll = function(){
  for (var i=0;i<this.undone.length;++i) this.redo();
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

