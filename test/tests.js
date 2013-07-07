var assert = require('assert')
  , Emitter = require('component-emitter')
  , Rollback = require('model-rollback');

function TestModel(){
  this.attrs = {};
  this.dirty = {};
  return Emitter(this);
}

Emitter(TestModel);
TestModel.prototype.model = TestModel;

TestModel.prototype.set = function(attr,val){
  var prev = this.attrs[attr];
  this.dirty[attr] = val;
  this.attrs[attr] = val;
  this.model.emit('change',this,attr,val,prev);
  return this;
}

TestModel.prototype.get = function(attr){
  return this.attrs[attr];
}

TestModel.prototype.one = function(val){
  if (arguments.length == 0){
    return this.get("one");
  } else {
    return this.set("one",val);
  }
}

TestModel.prototype.two = function(val){
  if (arguments.length == 0){
    return this.get("two");
  } else {
    return this.set("two",val);
  }
}

TestModel.prototype.three = function(val){
  if (arguments.length == 0){
    return this.get("three");
  } else {
    return this.set("three",val);
  }
}

TestModel.prototype.save = function(){
  console.log("save: %o", this);
  this.dirty = {};
  this.model.emit('save',this);
  return this;
}

Rollback(TestModel);


describe('model-rollback', function(){
  describe('undo', function(){
    
    beforeEach( function(){
      this.subject = new TestModel();
      this.subject.on('undo', function(attr,val){ 
        console.log("undo: %s %s", attr,val); 
      });
      this.subject.on('redo', function(attr,val){ 
        console.log("redo: %s %s", attr,val); 
      });
    })

    // todo: spy on undo event
    it('should do nothing at point zero', function(){
      var subject = this.subject;
      subject.undo();
      var exp = undefined, act = subject.get("one");
      assert.equal(exp,act,"was " + act + " not " + exp);
    })

    it('should undo to point zero', function(){
      var subject = this.subject;
      subject.set("one", 1);
      subject.undo();
      var exp = undefined, act = subject.get("one");
      assert.equal(exp,act,"was " + act + " not " + exp);
    })

    it('should undo once', function(){
      var subject = this.subject;
      subject.set("one", 1);
      subject.set("one", 11);
      subject.set("one", 111);
      subject.undo();
      var exp = 11, act = subject.get("one");
      assert.equal(exp,act,"was " + act + " not " + exp);
    })

    it('should undo twice', function(){
      var subject = this.subject;
      subject.set("one", 1);
      subject.set("two", 2);
      subject.set("one", 11);
      subject.set("two", 22);
      subject.undo();
      subject.undo();
      var exp = 1, act = subject.get("one");
      assert.equal(exp,act,"was " + act + " not " + exp);
      exp = 2; act = subject.get("two");
      assert.equal(exp,act,"was " + act + " not " + exp);
    })

    it('should undo three times', function(){
      var subject = this.subject;
      subject.set("one", 1);
      subject.set("one", 11);
      subject.set("two", 2);
      subject.set("two", 22);
      subject.set("two", 222);
      subject.set("one", 111);
      subject.undo();
      subject.undo();
      subject.undo();
      var exp = 11, act = subject.get("one");
      assert.equal(exp,act,"was " + act + " not " + exp);
      exp = 2; act = subject.get("two");
      assert.equal(exp,act,"was " + act + " not " + exp);
    })

    it('should undo only back to the last save point', function(){
      var subject = this.subject;
      subject.set("one", 1);
      subject.set("two", 2);
      subject.set("one", 11);
      subject.save();
      subject.set("two", 22);
      subject.undo();
      subject.undo();
      var exp = 11, act = subject.get("one");
      assert.equal(exp,act,"was " + act + " not " + exp);
      exp = 2; act = subject.get("two");
      assert.equal(exp,act,"was " + act + " not " + exp);
    })

    it('should undoAll', function(){
      var subject = this.subject;
      subject.set("one", 1);
      subject.set("one", 11);
      subject.set("one", 111);
      subject.undoAll();
      var exp = undefined, act = subject.get("one");
      assert.equal(exp,act,"was " + act + " not " + exp);
      exp = undefined; act = subject.dirty;
      assert.equal(exp,act,"was " + act + " not " + exp);
    })
      
  })

  describe('redo', function(){
    
    beforeEach( function(){
      this.subject = new TestModel();
      this.subject.on('undo', function(attr,val){ 
        console.log("undo: %s back to %s", attr,val); 
      });
      this.subject.on('redo', function(attr,val){ 
        console.log("redo: %s forward to %s", attr,val); 
      });
    })

    // todo: spy on redo event
    it('should do nothing at point zero', function(){
      var subject = this.subject;
      subject.redo();
    })

    it('should redo up to the latest change', function(){
      var subject = this.subject;
      subject.set("one", 1);
      subject.redo();
      subject.redo();
      var exp = 1, act = subject.get("one");
      assert.equal(exp,act,"was " + act + " not " + exp);
    })

    it('should undo and then redo once', function(){
      var subject = this.subject;
      subject.set("one", 1);
      subject.set("one", 11);
      subject.set("one", 111);
      subject.undo();
      subject.redo();
      var exp = 111, act = subject.get("one");
      assert.equal(exp,act,"was " + act + " not " + exp);
    })

    it('should undo and then redo twice', function(){
      var subject = this.subject;
      subject.set("one", 1);
      subject.set("two", 2);
      subject.set("one", 11);
      subject.set("two", 22);
      subject.undo();
      subject.undo();
      subject.redo();
      subject.redo();
      var exp = 11, act = subject.get("one");
      assert.equal(exp,act,"was " + act + " not " + exp);
      exp = 22; act = subject.get("two");
      assert.equal(exp,act,"was " + act + " not " + exp);
    })

    it('should undo and redo three times in no particular order', function(){
      var subject = this.subject;
      subject.set("one", 1);
      subject.set("one", 11);
      subject.set("two", 2);
      subject.set("two", 22);
      subject.set("two", 222);
      subject.set("one", 111);
      subject.set("one", 1111);
      subject.set("two", 2222);
      subject.undo();
      subject.undo();
      subject.redo();
      subject.redo();
      subject.undo();
      subject.redo();
      var exp = 1111, act = subject.get("one");
      assert.equal(exp,act,"was " + act + " not " + exp);
      exp = 2222; act = subject.get("two");
      assert.equal(exp,act,"was " + act + " not " + exp);
    })

    // todo: spy on redo event
    it('should do nothing if change made after undo', function(){
      var subject = this.subject;
      subject.set("one", 1);
      subject.set("one", 11);
      subject.set("one", 111);
      subject.undo();
      subject.set("one", 1111);
      subject.redo();
      var exp = 1111, act = subject.get("one");
      assert.equal(exp,act,"was " + act + " not " + exp);
    })


  })
})



