let dao = require('./../db');
const Promise = require('bluebird')

var getAllActors = (req, res) => {
    	dao.allActors().then(response => {
    	    console.log({response})
    	    res.status(201).end();
    	}).catch(err => {
    	    console.log(err);
    	    res.status(400).end();
    	})        
};

var updateActor = () => {

};

var getStreak = () => {

};


module.exports = {
	updateActor: updateActor,
	getAllActors: getAllActors,
	getStreak: getStreak
};

















