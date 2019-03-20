let dao = require('./../db');
const Promise = require('bluebird');
const { setEventJson, findActor, findRepo }  = require('./../utils')

//get all events
var getAllEvents = (req, res) => {
    dao.getEvents().then(response => {
        setEventJson(response, (result) => {
            return res.status(201).json(result);
        });
    }).catch(err => {
        console.log({err});
        return res.status(400).end();
    })
};


//create event
var addEvent = (req, res) => {
//    let data = req.body;
    let data = {
  "id":4055191679,
  "type":"PushEvent",
  "actor":{
    "id":2790311,
    "login":"daniel33",
    "avatar_url":"https://avatars.com/2790311"
  },
  "repo":{
    "id":352806,
    "name":"johnbolton/exercitationem",
    "url":"https://github.com/johnbolton/exercitationem"
  },
  "created_at":"2015-10-03 06:13:31"
}
    dao.singleEvent(data.id).then( single => {
        if(single) {
            return res.status(400).end();
        } else {

            let actor_array = Object.values(data.actor);
            //check if actor exists, create if it doesnt;
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

//get event by actor id 
var getByActor = (req, res) => {
    let actor_id = req.params.actorID;
    console.log({actor_id})
    dao.getEventByActor(actor_id).then(response => {
        if(response.length > 0) {
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

var eraseEvents = (req, res) => {
    dao.eraseEvent().then(response => {
        return res.status(200).end();
    })
};

module.exports = {
	getAllEvents: getAllEvents,
	addEvent: addEvent,
	getByActor: getByActor,
	eraseEvents: eraseEvents,
};