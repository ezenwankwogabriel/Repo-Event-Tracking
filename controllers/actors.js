let dao = require('./../db');
const Promise = require('bluebird');
const { verifyActors, setEventJson, eventsByActorCount, sortEventsByActorCount, sortByTimestamp, sortByAlphaLogin, groupByActors, sortByTimeStamp, sortByMaxStreak, arrange_actors }  = require('./../utils')

      
var getAllActors = (req, res) => {
    //get all events
    dao.getEventsActors().then(events => {
        //map through and return events by single actors, noting the repetition counts for these actors;(remove_repo)
        eventsByActorCount(events, (events_by_actor) => {
            //sort in descending order by the max number of actors
            sortEventsByActorCount(events_by_actor, (events_des) => {
                //format actor
                setEventJson(events_des, (event) => {
                    return res.status(200).json(event)
                })
                
            }) 
        })
    })     
};

var singleActor = (req, res) => {
  dao.singleActor(2790311).then(response => {
      res.status(200).json(response)
  }).catch(err => {
      res.status(400).end()
  })
};

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
                    return res.status(201).end();        
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
};

var getStreak = (req, res) => {
    //max streak(total no of consecutive days an actor has pushed an event to the system);
//sort by timestamp 
//order by timestamp for events with same no of streak, order by timestamp of latest event
//order by alpha login

//sort and group actors
//find max streak
//order by max streak
    //fetch all events order
    dao.getEventStreak().then(response => {
        //group by actors
        groupByActors(response, (grouped_events) => {
            //check for consecutive days (streak)
            sortByTimeStamp(grouped_events, (consecutive_events) => {
                //sort actor by max no of streak in descending order
                sortByMaxStreak(consecutive_events, (sort_array) => {
                    //filter and return events by streak return array actors by no of max streak
                    arrange_actors(sort_array, (final) => {
                        return res.status(200).json(final)
                    })
                })
            })
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

















