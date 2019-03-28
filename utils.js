
const dao = require('./db');

/** 
 * Function to check difference between two dates;
 * @param {date string} a- initial date for comparison
 * @param {date string} b- final date for comparison
 */
let dateDiffInDays = (a, b) =>  {
        // Discard the time and time-zone information.
        var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
        var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    
        return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
    };

module.exports = {
    /**
     * format event json
     * @param {Array} response- list of events
     * @param {function} callback- return callback
     */
    setEventJson: (response, callback) => {
        let result = [];
        if(!Array.isArray(response)){
            response = [response]
        }
        response.forEach((event) => {
            let data = {};
            data.id = event.event_id;
            data.type = event.type;
            data.actor = {
                id: event.actor,
                login: event.login,
                avatar_url: event.avatar_url
            },
            data.repo = {
                id: event.repo,
                name: event.name,
                url: event.url
            }        
            data.created_at = event.created_at;
            result.push(data);
        })
        callback(result);
    },

    /**
     * Verify Actor details are same
     * @param {Object} response- 
     * @param {function} callback- return callback
     */
    verifyActors : (response, sample, callback) => {
        let errors = '';
        let verify_login = sample.login === response.login? true : false;
        let verify_avatar_url  = sample.avatar_urlr === response.url? true : false;
        if(verify_login === false || verify_avatar_url === false) {
            errors = true;
        }
    
        if(errors === true) { 
            callback(errors);
        } else {
            callback(false, true);
        }
    },
    
    /**
     * Find actor by id, create if it doesnt exist
     * @param {Array} actor_array- list of actors
     * @param {function} next- return callback
     */
    findActor: (actor_array, next) => {
        //check if actor exists, create if it doesnt
        
        dao.singleActor(actor_array[0]).then(response => {
            if(response){
                //continue
                next();
            } else {
                //create actor
                dao.createActor('actors', ['id', 'login', 'avatar_url'], actor_array).then(actors => {
                    next();
                }).catch(err => {
                    console.log({ 'line 58': err, 'asdf': `${actor_array} ${response}`})
                })
            }  
        });
    },
    
    /**
     * Find repo by id, create if it doesnt exist
     * @param {Array} repo_array- list of repos
     * @param {function} next- return callback
     */
    findRepo: (repo_array, next) => {
        dao.singleRepo(repo_array[0]).then(response => {
            if(response) {
                next();
            } else {
                //create repo
                dao.createRepo('repository', ['id', 'name', 'url'], repo_array).then(repo => {
                    next();
                }).catch(err => {
                    console.log({'line 58': err})
                })
            }
        })
    },
    
    /**
     * map through and return events by single actors, noting the repetition counts for these actors;(remove_repo)
     * @param {Array} events- list of events
     * @param {function} next- return callback
     */
    eventsByActorCount: (events, next) => {
        let filtered_events = events.reduce((accumulator, current_value ) => {
            let return_event = {};
            //check for event index in current_value;
            let array_index = accumulator.find(value => value.event_id === current_value.event_id);
            if (!array_index) {
                //set actor_count to zero;
                accumulator.actor_count = 0;
                accumulator.push(current_value)
            } else {
                //increment actor count;
                let index = accumulator.indexOf(array_index);
                accumulator[index].actor_count += 1
            }
            return accumulator;
        }, []);
        next(filtered_events);
    },
    

    
    /**
     * Reduce actors ordered by maximum streak 
     * @param {Array} events- list of events
     * @param {function} next- return callback
     */
    groupByActors: (events, next) => {
                
        let grouped_events = events.reduce((accumulator, currentValue) => {
            let new_actor = {};
            //find event with accumulator id
            let actor = accumulator.find(single => single.id === currentValue.id);
            if (actor) {
                //check for consecutive login days;
                let difference = dateDiffInDays(new Date(actor.created_at), new Date(currentValue.created_at));
                if(difference === 1) {
                    actor.counting ++;
                    if(actor.counting > actor.count) {
                        actor.count = actor.counting;    
                    }
                } else {
                    actor.counting = 0;
                }
                
                actor.created_at = currentValue.created_at;
                return accumulator;
            } else {
                //add actor to accumulator
                new_actor.id = currentValue.id;
                new_actor.login = currentValue.login;
                new_actor.avatar_url = currentValue.avatar_url;
                new_actor.created_at = currentValue.created_at;
                new_actor.count = 1; //the max streak for each actor
                new_actor.counting = 1; //incremental streak used to set the final count
                accumulator.push(new_actor); 
                return accumulator;
            }
        }, []);
        
        let sorted_actors = grouped_events.sort(function (a, b) {
                //sort by max_streak
                if (a.count < b.count) return 1;
            	if (a.count > b.count) return -1;
            
            	// Sort by created_time
            	if(a.count === b.count) {
                	if (new Date(a.created_at).getTime() < new Date(b.created_at).getTime()) return 1;
                	if (new Date(a.created_at).getTime() > new Date(b.created_at).getTime()) return -1;
            	}
            
            	//sort by alphabetic login detial
            	if (a.login < b.login) return 1;
            	if (a.login > b.login) return -1;
            	
            });
            
        let formatted_actors = sorted_actors.filter(function(_actor) {
            delete(_actor.count);
            delete(_actor.counting);
            delete(_actor.event_id);
            delete(_actor.created_at);
            return _actor;
        })
        next(formatted_actors);
    },    
    
    /**
     * Return specified fields for actor    
     * @param {Array} events- list of events
     * @param {function} next- return callback
     */
    arrange_actors: (actors, next) => {
        let actor = [];
        actors.forEach((single_actor) => {
            let x = {};
            x.id = single_actor.id;
            x.login = single_actor.login;
            x.avatar_url = single_actor.avatar_url;
            actor.push(x);
        });
        next(actor)
    },
    
    
}