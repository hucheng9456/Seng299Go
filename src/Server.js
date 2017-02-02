"use strict"; 

var Game = require('./Game');
var Board = require('./Board');

class Server {
  
  constructor() {
    
    this.allGames = [];
  }
  
  createGame (player, boardsize, gametype, colour) { //Passing the player guids.

    // Force hotseat games to start playing as black
    const newGame = new Game(player, boardsize, gametype, gametype === "Hotseat" ? "Black" : colour);

    this.allGames.push(newGame);

    // Send the player a 'gameCreated' message with the game data
    player.socket.emit('gameCreated', newGame.gameData);

    return true;
  }

  // user becomes player 2
  joinGame(user, gameID) {

    let game = this.findGameById(gameID);

    if (!game) {

      user.socket.emit('failJoinGame', "Unable to find a game with that ID");

    } else if (game.gameData.gameOver) {

      user.socket.emit("failJoinGame", "Game has ended");

    } else {

      user.activeGame = gameID;
      game.addPlayer(user);

      return true;
    }

    return false;
  }

  findGameById(gameID) {

    return this.allGames.find(game => game.gameData.gameID === gameID || game.gameData.gameID.startsWith(gameID));
  }
  
  playMove (user, x, y, pass) {

  	var game = this.findGameById(user.activeGame);

    if (!game) {
      return;
    }

  	game.playMove(user, x, y, pass);
  }

  requestReplay(user, gameID) {

    var game = this.findGameById(gameID);

    if (!game) {
      user.socket.emit('failRequestReplay', "Unable to find a game with that ID");
    } else {

      user.activeReplay = gameID;

      user.socket.emit('showReplay', game.gameData);
    }
  }

  replayMove(user, index) {

    if (!user.activeReplay) {
      return;
    }

    let game = this.findGameById(user.activeReplay);

    if (!game) {
      return;
    }

    let gameData = game.gameData;

    let maxIndex = gameData.gameOver && gameData.history.length > 2 ? gameData.history.length - 2 : gameData.history.length;

    let _index = index < 0 ? 0 : (index > maxIndex ? maxIndex  : index);

    let board = new Board(gameData.history.slice(0, _index), gameData.boardSize);

    let blackPoints = 0;
    let whitePoints = 0;

    if (game.gameData.gameOver && maxIndex === _index) {
      blackPoints = game.countPoints(board.currentState, "Black");
      whitePoints = game.countPoints(board.currentState, "White");
    }

    user.socket.emit('showReplayState', board.currentState, _index, game.gameData.gameOver && maxIndex === _index, blackPoints, whitePoints);
  }

  reconnectGame(user, gameID) {

    var game = this.findGameById(gameID);

    if (!game) {
      return false;
    }

    if (game.gameOver) {
      return false;
    }

    console.log("rejoining game");

    let board = new Board(game.gameData.history, game.gameData.boardSize);
    let lastMove = game.gameData.history.length ? game.gameData.history[game.gameData.history.length - 1] : { colour: "Black", pass: false };

    // This logic isn't foolproof
    if (game.gameData.playerOne.id === user.id) {
      user.socket.emit('joinGame', game.gameData, game.gameData.playerOne, game.gameData.playerTwo);
      user.colour = game.gameData.playerOne.colour;
      game.playerOne = user;
    } else {
      user.socket.emit('joinGame', game.gameData, game.gameData.playerTwo, game.gameData.playerOne);
      user.colour = game.gameData.playerTwo.colour;
      game.playerTwo = user;
    }
    
    user.socket.emit('showBoard', board.currentState, lastMove.colour, lastMove.pass);

    user.activeGame = gameID;

    return true;
  }

  leaveGame(user, gameID) {

    var game = this.findGameById(gameID);

    if (!game) {
      return;
    }

    if (game.gameData.gameType === "Network") {

      if (game.gameData.playerOne.id === user.id) {

        // notify p2
		if (game.playerTwo && game.playerTwo.socket) {
		    game.playerTwo.socket.emit('showError', "Your opponent has left the game");
			game.playerTwo.activeGame = null;
		}
      } else {
        // notify p1
        game.playerOne.socket.emit('showError', "Your opponent has left the game");
        game.playerOne.activeGame;
      }

      game.doGameOver();
    }

    game.gameOver = true;

    user.socket.emit('showError', "You've left the game");
  }

  onDisconnected(user, gameID) {

    var game = this.findGameById(gameID);

    if (!game) {
      return;
    }

    if (game.gameData.gameType === "Network") {

      if (game.gameData.playerOne.id === user.id) {

        // notify p2
		if (game.playerTwo && game.playerTwo.socket) {
			game.playerTwo.socket.emit('showError', "Your opponent has disconnected");
		}
      } else {
        // notify p1
        game.playerOne.socket.emit('showError', "Your opponent has disconnected");
      }
    }  
  }
}

module.exports = Server;
