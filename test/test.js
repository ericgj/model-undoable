var assert = require('assert')
  , Emitter = require('./emitter.js')
  , Rollback = require('../index.js');

function TestModel(){
  this.attrs = {};
  this.dirty = {};
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

TestModel.prototype.save = function(){
  console.log("save: %o", this);
  this.dirty = {};
  this.model.emit('save',this);
  return this;
}

Rollback(TestModel);


describe('model-rollback', function(){
  describe('rollback', function(){
    
    beforeEach( function(){
      this.subject = new TestModel;
    })

    it('should rollback', function(){
      var subject = this.subject;
      subject.set("one", 1);
      subject.set("two", 2);
      subject.set("three", 3);
      subject.set("three", 33);
      subject.set("two", 22);
      subject.set("one", 11);
      subject.rollback();
    })
      
  })
})



