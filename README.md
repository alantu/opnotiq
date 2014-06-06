opnotiq
=======

[![Build Status](https://travis-ci.org/alantu/opnotiq.svg?branch=master)](http://travis-ci.org/alantu/opnotiq)

**opnotiq** is a component to handle actions against operations and notifications queues, a simple pattern we use for decoupling work load from API requests, for accepting operations via non-api calls (i.e through a GCM upstream message) and notify when it's done.


Usage
-----

```javascript
  var options = {
    ironMQ: {
      token: 'xxxxxxxx'
      project_id: 'xxxxxxxx'
    }
  }

  var queues = require('queues')(config);

  yield queues.postOperation('update-task', {
    // op specific data
  });


  yield queues.postNotification('attach-project', 9349, {
    // notification specific data
  });
```

