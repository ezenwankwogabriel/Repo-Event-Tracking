
const dao = require('./db');

let dateDiffInDays = (a, b) =>  {
        // Discard the time and time-zone information.
        var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
        var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    
        return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
    };

module.exports = {
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

    //verify actor values are same
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
    
    //map through and return events by single actors, noting the repetition counts for these actors;(remove_repo)
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
    
    //sort events;
    sortEventsByActorCount: (events, next) => {
        let events_by_actors_count = events.sort(function (a, b) {
            	// Sort by actor_ount
            	if (a.actors_count> b.actors_count) return 1;
            	if (a.actors_count< b.actors_count) return -1;
            	
            	//Sort by timestamp
            	if (a.created_at> b.created_at) return 1;
            	if (a.created_at< b.created_at) return -1;
            	
            	//Sort by alphabetic order of login
            	if (a.login> b.login) return 1;
            	if (a.login< b.login) return -1;
        });
        next(events_by_actors_count);
    },
    
    //group by actors
    groupByActors: (events, next) => {
        let grouped_events = events.reduce((accumulator, currentValue) => {
            //find event with accumulator id
            if(accumulator.hasOwnProperty(currentValue.actor)) {
                accumulator[currentValue.actor].push(currentValue);
            } else {
                accumulator[currentValue.actor] = [currentValue];
            }
            return accumulator; 
        }, {});
        next(grouped_events);
    },
    
    sortByTimeStamp: (events, next) => {
        for(let actor_id in events) {
            events[actor_id] = events[actor_id].sort(function (a, b) {
            	// Sort by actor_ount
            	if (a.created_at > b.created_at) return 1;
            	if (a.created_at< b.created_at) return -1;
            });
            
            //check for maximum streak;
            let actor = [];
            if(events[actor_id].length > 1) {
                for(let x = 0; x < events[actor_id].length; x++) {
                    //check difference, if 1, then is consecutive, else seen as a new start    
                    if(x < (events[actor_id].length -1)) {
                        let difference = dateDiffInDays(new Date(events[actor_id][x].created_at), new Date(events[actor_id][x+1].created_at));
                        if(difference === 1 && actor.length > 0) {
                            let lastIndex = actor.length -1;
                            actor[lastIndex].max_streak += 1;
                        } else {
                            events[actor_id][x].max_streak = 0;
                            actor.push(events[actor_id][x]);
                        }
                    }
                }
            } else {
                events[actor_id][0].max_streak = 0;
                actor.push(...events[actor_id])
            }
            events[actor_id] = actor;            
        };
        next(events);
    },  
    
    sortByMaxStreak: (actors, next) => {
        let actor_array = [];
        for(let i in actors) {
            let max = actors[i].reduce(function(prev, current) {
                return (prev.max_streak > current.max_streak) ? prev : current
            });            
            actor_array.push(max);
        };
        
        let sort_array = actor_array.sort(function (a, b) {
            
                //sort by max_streak
                if (a.max_streak > b.max_streak) return 1;
            	if (a.max_streak< b.max_streak) return -1;
            	
            	// Sort by actor_ount
            	if (a.created_at > b.created_at) return 1;
            	if (a.created_at< b.created_at) return -1;
            	
            	//sort by alphabetic login detial
            	if (a.login > b.login) return 1;
            	if (a.login< b.login) return -1;
            	
            	//sort by 
            });
        next(sort_array);
    },
    
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
    }
    
    
}