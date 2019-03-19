let dao = require('./../db');
const Promise = require('bluebird')

var getAllEvents = (req, res) => {
    dao.getEvents().then(response => {
        let data = {};
        data.created_at = response.created_at;
        data.type = response.type;
        data.actor = {
            id: response.actor,
            login: response.login,
            avatar_url: response.avatar_url
        },
        data.repo = {
            id: response.repo,
            name: response.name,
            url: response.url
        }
        
        return res.status(201).json(data);
    }).catch(err => {
        console.log({err});
        return res.status(400).end();
    })
};

var addEvent = (req, res) => {
    let _data = {
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
    };
    let data = req.body || _data;
    dao.singleEvent(data.id).then( single => {
        console.log({single});
        if(single) {
            return res.status(400).end();
        } else {
            //create actor
            let actor_array = Object.values(data.actor);
            dao.createActor('actors', ['id', 'login', 'avatar_url' ], actor_array).then(actors => {
                //create repo
                let repo_array = Object.values(data.repo);
                dao.createRepo('repository',  ['id', 'name', 'url' ], repo_array).then(repo => {
                    //create event;
                    data.actor = data.actor.id;
                    data.repo = data.repo.id;
                    let event_array = Object.values(data);
                    dao.createEvent('events', ['id', 'type', 'actor', 'repo', 'created_at'], event_array).then(response => {
                        return res.status(201).end();
                    }).catch(err => {
                        console.log('error creating event' + err);
                    });            
                }).catch(err => {
                    console.log('error creating repo' + err)
                })              
                
            }).catch(err => {
                console.log('error creating actor', err)
            })
        }
    }).catch(err => {
        console.log('error fetching single event on creation', err);
        return res.status(400)
    })
};


var getByActor = () => {

};


var eraseEvents = () => {

};

module.exports = {
	getAllEvents: getAllEvents,
	addEvent: addEvent,
	getByActor: getByActor,
	eraseEvents: eraseEvents
};

















