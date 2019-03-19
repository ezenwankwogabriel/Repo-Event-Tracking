var express = require('express');
var actors = require('./../controllers/actors');
var router = express.Router();

console.log('here');
// Routes related to actor.

router.get('/', actors.getAllActors);

module.exports = router;