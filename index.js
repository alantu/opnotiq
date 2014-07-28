
/**
 * Module dependencies
 */

var extend = require('extend');
var debug = require('debug')('opnotiq:index');


/**
 * Expose `opnotiq()` as the module.
 */

module.exports = opnotiq;


/**
 * Create an operation/notification messages helper
 *
 * Options:
 *    - `notifQueueName` name of your notifications queue. Default 'notifications'
 *    - `opQueueName` name of your operations queue. Default 'operations'
 *
 * @param {queues.Provider} provider - The queues provider
 * @param {Object} options
 * @return {Type}
 * @api public
 */


function opnotiq(provider, options) {
  options = options || {};
  var notifQueueName = options.notifQueueName || 'notifications';
  var opQueueName = options.opQueueName || 'operations';

  var notifQueue, opQueue;

  // for lazy queues

  function create(type, callback) {
    if (/^operation/i.test(type)) {
      if (!opQueue) {
        opQueue = provider.get(opQueueName);
        opQueue.on('connected', callback);

        opQueue.connect();
      } else {
        callback();
      }
    } else if (/^notification/i.test(type)) {
      if (!notifQueue) {
        notifQueue = provider.get(notifQueueName);
        notifQueue.on('connected', callback);

        notifQueue.connect();
      } else {
        callback();
      }
    }
  }

  // to extract data from msg and enabling easy removal

  function receive(queue, callback) {

    return function(msg) {
      debug('received msg..');

      function done() {
        debug('done, removing msg');
        queue.remove(msg);
      }

      var body = JSON.parse(msg.Body || '{}');
      callback(msg, done);
    };
  }

  return {

    /**
     * Set a handler for incoming operation/notification messages
     *
     * @param {String} type - The type of message to handle (operation | notification)
     * @param {Functiona} callback
     *
     */

    on: function(type, callback) {
      create(type, function() {
        if (/^operation/i.test(type)) {
          opQueue.on('message', receive(opQueue, callback));

          if (!opQueue.isStarted()) {
            opQueue.start();
          }
        } else if (/^notification/i.test(type)) {
          notifQueue.on('message', receive(notifQueue, callback));
          if (!notifQueue.isStarted()) {
            notifQueue.start();
          }
        }
      });
    },

    /**
     * Post a message in notification queue
     *
     * @param {String} name The notification name
     * @param {Array|String} recipients
     * @param {Object} data
     * @param {Function} callback
     *
     */

    postNotification: function(name, recipients, data, callback) {
      create('notifications', function() {
        var msg = {
          name: name,
          recipients: recipients,
          data: data
        };

        notifQueue.post(msg, callback);
      });

    },


    /**
     * Post a message in operation queue
     *
     * @param {String} name The operation name
     * @param {Object} data
     * @param {Function} callback
     */

    postOperation: function(name, data, callback) {
      create('operations', function() {
        var msg = {
          name: name,
          data: data
        };

        opQueue.post(msg, callback);
      });
    }
  };
}
