let dao = require('./../db');
const Promise = require('bluebird');
const { verifyActors, setEventJson, eventsByActorCount, groupByActors, arrange_actors }  = require('./../utils')

/** 
 * Retrieve All Actors
 **/
var getAllActors = (req, res) => {
    //get all actors using sql query
    dao.getAllActors().then(events => {
        //return specified fields for actor
        arrange_actors(events, (actors) => {
            return res.status(200).json(actors)
        });   
};

/** 
 * Update An Actors
 **/
var updateActor = (req, res) => {
    //update url of actor;
    let actor = req.body;
    //find actor by id
    dao.singleActor(actor.id).then(response => {
        if(!response) {
            return res.status(404).end();
        }
        //verify the details are same with request body;
        verifyActors(response, actor, function(err, verified) {
            if(!err && verified) {
                dao.updateActorUrl(actor).then((respo) => {
                    return res.status(200).end();        
                }).catch(err => {
                    console.log({err});
                    return res.status(404).end();
                });                  
            } else {
                 return res.status(400).end();            
            }
        })
    }).catch(err => {
        console.log({err});
        return res.status(404).end();
    })
});

};

/** 
 * Return Actors by Maximum Streak
 **/
var getStreak = (req, res) => {
    //fetch all events order
    dao.getEventStreak().then(response => {
        //group by actors
        groupByActors(response, (grouped_events) => {
            return res.status(200).json(grouped_events);
        })        
    }).catch(err => {
        console.log({err});
        return res.status(404).end();
    })
};


module.exports = {
	updateActor: updateActor,
	getAllActors: getAllActors,
	getStreak: getStreak,
	singleActor: singleActor,
};

















