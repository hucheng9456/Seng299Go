"use strict";

const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;

class Database {

  constructor (port) {

    this.gameCache = [];

    this.collections = new Map();

    try {
      mongoClient.connect(`mongodb://localhost:${port}`, (err, db) => {
  		
  			this.database = db;
  		
  			if(err) {
  				console.log(err);
  				//process.exit();
  			} else {
  			
  				this.getCollection(db, "users", col => {
  					this.collections.set("users", col);
  				});
  				
  				this.getCollection(db, "games", col => {
  					this.collections.set("games", col);
  				});
  			}
  		});
  	} catch(err) {
  	
  	}
  }
  
	getCollection(db, name, cb) {
		
		db.collection(name, (err, col) => {
			
			if (err) {
				
				db.createCollection(name).then((err, res) => {
					
					cb(db.collection(name));
				});
			} else {
				cb(col);
			}
		});
	}
  
	addToCache(game) {
	
		this.gameCache.push(game);
	}
	
	removeFromCache(gameID) {
	
		let gameIndex = this.gameCache.findIndex(el => el.gameID === gameID);
		
		if (gameIndex !== -1) {
			
			this.gameCache.splice(gameIndex, 1);
		}
	}
  
  getGamesFromPlayer(userID, callback) {
	  
	this.collections.get("games").find({"userID":userID}).limit(1).next((err, doc) => {
	
		console.log(err);
		console.log(doc);
		
		callback(doc || { gameID ,});
	});
	  
  }
  
  loadAllGames(callback) {
	  this.collections.get("games").find({}).limit(1).next((err, doc) => {
	
		console.log(err);
		console.log(doc);
		
		let game = doc || { gameID };
		this.gameCache.push(game);
		
		callback(game);
	});
  }
  
  storeAllGames() {
	for (var i=0; i< this.gameCache.length; i++) {
		this.storeGame(this.gameCache[i]);
	}
  }
  
  loadUser(userID,callback) {
  
	if (this.collections.has("users")) {
		this.collections.get("users").find({userID}).limit(1).next((err, doc) => {
		
			console.log(err);
			console.log(doc);
			
			callback(doc || { userID, numGamesPlayed: 0,  });
		});
	} else {
		callback();
	}
  }
  
  saveUser(user) {
  
  	this.collections.get("users").save(
  		{"userID": user.userID, "fullName" : user.fullName, "numGamesPlayed" : user.numGamesPlayed}
  	)
  }
  
  removeGame() {
  }
  
  storeGame(game) {
	this.collections.get("games").save(
  		{"gameID": game.gameData.gameID , 
		"playerOne" : game.gameData.playerOne, 
		"playerTwo" : game.gameData.playerTwo,
		"history" : game.gameData.history,
		"boardSize" : game.gameData.boardSize,
		"gameType" : game.gameData.gameType
		}
  	)
  }
}

module.exports = Database;
