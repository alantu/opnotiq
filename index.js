
/**
 * Module dependencies
 */

var ironMQ = require('iron_mq');
var extend = require('extend');


/**
 * Expose `queues()` as the module.
 */

module.exports = queues


/**
 * Create a queue helper with the given `options`
 *
 * Options:
 *    - `notifQueueName` name of your notifications queue. Default 'notifications'
 *    - `opQueueName` name of your operations queue. Default 'operations'
 *    _ `ironMQ`  IronMQ connection params
 *       - `token` IronMQ account token
 *       - `project_id` IronMQ project id
 *
 * @param {Object} options
 * @return {Type}
 * @api public
 */


function queues(options) {
  var ironConfig = options.ironMQ;
  var notifQueueName = options.notifQueueName || 'notifications';
  var opQueueName = options.opQueueName || 'operations';

  var imq = new ironMQ.Client(ironConfig);
  var notifQueue = imq.queue(notifQueueName);
  var opQueue = imq.queue(opQueueName);

  return {

    /**
     * Returns a new client instance for `notifications` queue
     */

    getNotificationsQueue: function() {
      return new ironMQ.Client(extend(ironConfig, { queue_name: notifQueueName }));
    },

    /**
     * Returns a new client instance for `notifications` queue
     */

    getOperationsQueue: function() {
      return new ironMQ.Client(extend(ironConfig, { queue_name: opQueueName }));
    },

    /**
     * Post a message in notification queue
     *
     * @param {String} name The notification name
     * @param {Array|String} recipients
     * @param {Object} options
     */

    postNotification: function(name, recipients, options) {
      var msg = {
        name: name,
        recipients: recipients,
        data: options
      };

      return thunkify(notifQueue.post)(JSON.stringify(msg));
    },

    /**
     * Post a message in notification queue
     *
     * @param {String} name The operation name
     * @param {Object} options
     */

    postOperation: function(name, options) {
      var msg = {
        name: name,
        data: options
      };

      //return thunkify(opQueue.post)(JSON.stringify(msg));
      opQueue.post(JSON.stringify(msg));
    }
  };
}
