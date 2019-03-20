var express = require('express');
var router = express.Router();
var events = require('./../controllers/events');

// Routes related to event
router.post('/', events.addEvent);

router.get('/', events.getAllEvents);

router.get('/actors/:actorID', events.getByActor);

module.exports = router;