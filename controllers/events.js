let dao = require('./../db');
const Promise = require('bluebird');
const { setEventJson, findActor, findRepo }  = require('./../utils')

/** 
 * Get All Events
 */
var getAllEvents = (req, res) => {
    //fetch events from db;
    dao.getEvents().then(response => {
        //arrange the events to required format
        setEventJson(response, (result) => {
            return res.status(200).json(result);
        });
    }).catch(err => {
        console.log({err});
        return res.status(400).end();
    })
};


/** 
 * Create An Events
 */
var addEvent = (req, res) => {
    let data = req.body;
    //check if event exists previously
    dao.singleEvent(data.id).then( single => {
        if(single) {
            return res.status(400).end();
        } else {

            //check if actor exists, create if it doesnt;
            let actor_array = Object.values(data.actor);
            findActor(actor_array, () => {
                //check if repo exists, create if it doesnt;
                let repo_array = Object.values(data.repo);
                findRepo(repo_array, () => {                    
                    //create event
                    data.actor = data.actor.id;
                    data.repo = data.repo.id;
                    let event_array = Object.values(data);
                    dao.createEvent('events', ['id', 'type', 'actor', 'repo', 'created_at'], event_array).then(response => {
                        return res.status(201).end();
                    }).catch(err => {
                        console.log('error creating event' + err);
                    });            
                })                                    
            })
        }
    }).catch(err => {
        console.log('error fetching single event on creation', err);
        return res.status(400)
    })
};

/** 
 * Get Events filtered by Actors ID
 */
var getByActor = (req, res) => {
    let actor_id = req.params.actorID;
    //fetch events by actor id
    dao.getEventByActor(actor_id).then(response => {
        if(response.length > 0) {
            //format events to required object state
            setEventJson(response, (result) => {
                return res.status(200).json(result);
            })  
        } else {
            return res.status(404).end();
        }
    }).catch(err => {
        console.log({err});
        return res.status(404).end();
    })
};

/** 
 * Erase All Events, Repos and Actors
 */
var eraseEvents = (req, res) => {
    //erase events
    dao.eraseEvent().then(response => {
        //erase repos
        dao.eraseRepository().then(() => {
            //erase actors
            dao.eraseActors().then(() => {
                return res.status(200).end()
            })
        })
    })
};

module.exports = {
	getAllEvents: getAllEvents,
	addEvent: addEvent,
	getByActor: getByActor,
	eraseEvents: eraseEvents,
};