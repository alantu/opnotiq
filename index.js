
/**
 * Module dependencies
 */

var extend = require('extend');


/**
 * Expose `opnotiq()` as the module.
 */

module.exports = opnotiq


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

  function create(type) {
    if (/^operation/i.test(type)) {
      opQueue = opQueue || provider.get(opQueueName);
    } else if (/^notification/i.test(type)) {
      notifQueue = notifQueue || provider.get(notifQueueName);
    }
  }

  // to extract data from msg and enabling easy removal

  function receive(queue, callback) {
    return function(msg) {
      function done() {
        queue.remove(msg.id);
      };

      var body = JSON.parse(msg.body || '{}');
      callback(body, done);
    }
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
      create(type);

      if (/^operation/i.test(type)) {
        opQueue.on('message', receive(opQueue, callback));
        opQueue.connect();
      } else if (/^notification/i.test(type)) {
        notifQueue.on('message', receive(notifQueue, callback));
        notifQueue.connect();
      }
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
      create('notifications');

      var msg = {
        name: name,
        recipients: recipients,
        data: data
      };

      notifQueue.post(msg, callback);
    },


    /**
     * Post a message in operation queue
     *
     * @param {String} name The operation name
     * @param {Object} data
     * @param {Function} callback
     */

    postOperation: function(name, data, callback) {
      create('operations');

      var msg = {
        name: name,
        data: data
      };

      opQueue.post(msg, callback);
    }
  };
}
