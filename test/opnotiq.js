var assert = require('assert');
var queues = require('queues');
var Emitter = require('event-emitter');


describe('opnotiq', function() {
  var sandbox, opnotiq, fakeQueue, mockQueue, fakeProvider, mockProvider;

  beforeEach(function () {
      sandbox = require('sinon').sandbox.create();
      fakeQueue = {
        connect: function(options) {
          this.emit('connected');
        },
        post: function(msg, callback) {
          callback();
        },
        remove: function(msgId, callback){
          callback();
        }
      };

      Emitter(fakeQueue);

      fakeProvider = {
        get: function(name) {
          return fakeQueue;
        }
      };

      opnotiq = require('../')(fakeProvider);

      mockQueue = sandbox.mock(fakeQueue);
      mockProvider = sandbox.mock(fakeProvider);

  });

  afterEach(function () {
      sandbox.restore();
  });

  it('should post operation', function(done) {
    var mockName = 'mockOp';
    var mockData = { foo: 'bar' };
    var mockCallback = function(){};
    var expectedMsg = {
      name: mockName,
      data: mockData
    };

    mockQueue.expects('post').withArgs(expectedMsg, mockCallback).once();

    opnotiq.postOperation(mockName, mockData, mockCallback);

    sandbox.verify();
    done();
  });

  it('should post notification', function(done) {
    var mockName = 'mockOp';
    var mockRecipients = "mockRecipients";
    var mockData = { foo: 'bar' };
    var mockCallback = function(){};
    var expectedMsg = {
      name: mockName,
      recipients: mockRecipients,
      data: mockData
    }

    mockQueue.expects('post').withArgs(expectedMsg, mockCallback).once();

    opnotiq.postNotification(mockName, mockRecipients, mockData, mockCallback);

    sandbox.verify();
    done();
  });

  it('should handle operation', function(done) {
    var mockCallback = sandbox.spy();
    var mockData = { id: 'mock', data: '{ "foo": "bar" }'};

    opnotiq.on('operation', mockCallback);

    fakeQueue.emit('message', mockData);

    assert(mockCallback.calledOnce)
    done();
  });

  it('should handle notification', function(done) {
    var mockCallback = sandbox.spy();
    var mockData = { id: 'mock', data: '{ "foo": "bar" }'};

    opnotiq.on('notification', mockCallback);

    fakeQueue.emit('message', mockData);

    assert(mockCallback.calledOnce)
    done();
  });
});
