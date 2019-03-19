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

dao.closeDb = () => {
    db.close();
};

dao.createTable = (db) => {
    console.log("create database table");
    db.run("CREATE TABLE IF NOT EXISTS actors(id INTEGER PRIMARY KEY AUTOINCREMENT, login TEXT, avatar_url TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TIMESTAMP, type TEXT, actor INTEGER, repo INTEGER, FOREIGN KEY (actor) REFERENCES actors(id), FOREIGN KEY (repo) REFERENCES repository(id))");
    db.run("CREATE TABLE IF NOT EXISTS repository(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, url TEXT)");
};

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

dao.all = (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) {
          console.log('Error running sql: ' + sql)
          console.log(err)
          reject(err)
        } else {
            console.log('fetched data', rows)
          resolve(rows)
        }
      })
    })
  };



/* 
 * queries
 */
//create
dao.createEvent = (table, fields, data) => {
    //data is an array containing type, repo and actor id;
    let sql = `INSERT INTO events (${fields}) VALUES(?, ?, ?, ?, ?)`;
    return dao.run(sql, data);
};

dao.createActor = (table, fields, data) => {
    //data is an array containing type, repo and actor id;
    let sql = `INSERT INTO actors (${fields}) VALUES(?, ?, ?)`;
    return dao.run(sql, data);
};

dao.createRepo= (table, fields, data) => {
    //data is an array containing type, repo and actor id;
    let sql = `INSERT INTO repository (${fields}) VALUES(?, ?, ?)`;
    return dao.run(sql, data);
};


//get all events by ascending order
dao.getEvents = () => {
    return dao.all('SELECT * FROM events INNER JOIN actors on actors.id = events.actor INNER JOIN repository on repository.id = events.repo ORDER BY id ASC ')    
};

//get events by actor id
dao.getEventByActor = (id) => {
    let sql = 'SELECT * FROM events WHERE actor = ?';
    return dao.all(sql, [id]);
};

//get events by id
//find event to check if it exists before creating a new record
dao.singleEvent = (id) => {
    let sql = 'SELECT * FROM events WHERE id = ?';
    return dao.get(sql, [id]);
};

//get all actor;
dao.allActors = () => {
    console.log('actors fetching')
    return dao.all('SELECT * FROM actors');
}

//get single actor
dao.singleActor = (id) => {
    let sql = 'SELECT * FROM actors WHERE id = ?';
    dao.get(sql, [id]);
};

//actor records ordered by the total number of events

//actor records ordered by the maximum streak



dao.updateActorUrl = (data) => {
    let sql = 'UPDATE actors SET avatar_url = ? WHERE id = ?';
    dao.run(sql, [data.avatar_url, data.id]);
};

//get actors

//delete erase
dao.erase = () => {
    let sql = 'DROP TABLE addresses';
    dao.run(sql);
};





//read = () => {
//    console.log("Read data from contacts");
//    db.all("SELECT rowid AS id, name FROM contacts", function(err, rows) {
//        rows.forEach(function (row) {
//            console.log(row.id + ": " + row.name);
//        });
//    });
//}

//db.close();
//dao.createDb
module.exports = dao;