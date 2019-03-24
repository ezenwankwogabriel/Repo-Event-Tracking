const sqlite3 = require('sqlite3');
const Promise = require('bluebird');


let dao = {};
let db;

//create db
dao.createDb = () => {
    db = new sqlite3.Database("./database.sqlite3", (err) => { 
        if (err) { 
            console.log('Error when creating the database', err) 
        } else { 
            console.log('Database created!') 
            /* Put code to create table(s) here */
            dao.createTable(db);
        } 
    });
}; 

//close db
dao.closeDb = () => {
    db.close();
};

//create table
dao.createTable = (db) => {
    console.log("create database table");
    db.run("CREATE TABLE IF NOT EXISTS actors(id INTEGER PRIMARY KEY, login TEXT, avatar_url TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY, created_at TIMESTAMP, type TEXT, actor INTEGER, repo INTEGER, FOREIGN KEY (actor) REFERENCES actors(id), FOREIGN KEY (repo) REFERENCES repository(id))");
    db.run("CREATE TABLE IF NOT EXISTS repository(id INTEGER PRIMARY KEY, name TEXT, url TEXT)");
};

//run sql query
dao.run = (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err, data) {
        if (err) {
          console.log('Error running sql ' + sql)
          console.log(err)
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
};

//get sqlite data 
dao.get = (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, result) => {
        if (err) {
          console.log('Error running sql: ' + sql)
          console.log(err)
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
  };

//select all data for sqlite3 query
dao.all = (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) {
          console.log('Error running sql: ' + sql)
          console.log(err)
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  };



/* 
 * queries
 */
//create event
dao.createEvent = (table, fields, data) => {
    //data is an array containing type, repo and actor id;
    let sql = `INSERT INTO events (${fields}) VALUES(?, ?, ?, ?, ?)`;
    return dao.run(sql, data);
};

//create actor
dao.createActor = (table, fields, data) => {
    //data is an array containing type, repo and actor id;
    let sql = `INSERT INTO actors (${fields}) VALUES(?, ?, ?)`;
    return dao.run(sql, data);
};

//create repo
dao.createRepo= (table, fields, data) => {
    //data is an array containing type, repo and actor id;
    let sql = `INSERT INTO repository (${fields}) VALUES(?, ?, ?)`;
    return dao.run(sql, data);
};


//get all events by ascending order
dao.getEvents = () => {
    return dao.all(`
        SELECT events.id AS event_id, * FROM events 
        INNER JOIN actors on actors.id = events.actor 
        INNER JOIN repository on repository.id = events.repo 
        ORDER BY id ASC
    `);    
};

//get all events for actors()
dao.getActors = () => {
    return dao.all(`
        SELECT actors.*, count(events.id) as event_count, 
        max(created_at) as date from actors 
        inner join events on actors.id = events.actor 
        GROUP BY events.actor 
        order by event_count DESC, date DESC
    `);    
};

//get events by actor id
dao.getEventByActor = (id) => {
    let sql = `
                SELECT events.id AS event_id, * FROM events 
                INNER JOIN actors on actors.id = events.actor 
                INNER JOIN repository on repository.id = events.repo WHERE actor = ? 
                ORDER BY id ASC`;
    return dao.all(sql, [id]);
};

//return events for maximum streak calculation
dao.getEventStreak = () => {
    return dao.all(`
        SELECT events.id AS event_id, * FROM events 
        INNER JOIN actors on actors.id = events.actor 
        ORDER BY created_at ASC
    `)
}

//get events by id
//find event to check if it exists before creating a new record
dao.singleEvent = (id) => {
    let sql = 'SELECT * FROM events WHERE id = ?';
    return dao.get(sql, [id]);
};

//get all actor;
dao.allActors = () => {
    return dao.all('SELECT * FROM actors');
}

//get single actor
dao.singleActor = (id) => {
    let sql = 'SELECT * FROM actors WHERE id = ?';
    return dao.get(sql, [id]);
};

//get single repository
//get single actor
dao.singleRepo = (id) => {
    let sql = 'SELECT * FROM repository WHERE id = ?';
    return dao.get(sql, [id]);
};

//update actor url
dao.updateActorUrl = (data) => {
    console.log('updating', data.id)
    let sql = 'UPDATE actors SET avatar_url = ? WHERE id = ?';
    return dao.run(sql, [data.avatar_url, data.id]);
};

//delete event records
dao.eraseEvent = () => {
    let sql = 'DELETE FROM events';
    return dao.run(sql);
};

//delete repo records
dao.eraseRepository = () => {
    let sql = 'DELETE FROM repository';
    return dao.run(sql);
};

//delete actor records
dao.eraseActors = () => {
    let sql = 'DELETE FROM actors';
    return dao.run(sql);
}


module.exports = dao;