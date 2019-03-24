var express = require('express');
var router = express.Router();
var events = require('./../controllers/events');

// Route related to delete events

router.delete('/', events.eraseEvents);

module.exports = router;