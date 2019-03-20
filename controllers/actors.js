let dao = require('./../db');
const Promise = require('bluebird');
const { verifyActors }  = require('./../utils')

var getAllActors = (req, res) => {
    	dao.allActors().then(response => {
    	    res.status(201).end();
    	}).catch(err => {
    	    console.log(err);
    	    res.status(400).end();
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
        //if response, verify the details are same with request body;
        
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

var getStreak = () => {

};


module.exports = {
	updateActor: updateActor,
	getAllActors: getAllActors,
	getStreak: getStreak,
	singleActor: singleActor,
};

















