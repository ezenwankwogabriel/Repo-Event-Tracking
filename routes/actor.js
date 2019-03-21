var express = require('express');
var actors = require('./../controllers/actors');
var router = express.Router();

console.log('here');
// Routes related to actor.

router.get('/', actors.getAllActors);

router.put('/', actors.updateActor);

router.get('/single', actors.singleActor);

router.get('/streak', actors.getStreak)

module.exports = router;