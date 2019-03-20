
const dao = require('./db');

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
        //check if repo exists, create if it doesnt
//        try{
//            var response = dao.singleRepo(repo_array)    
//        }
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
    }
}