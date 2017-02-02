"use strict"; 

/*
  History structure
  {
    colour: "White" or "Black",
    x: x-position on board,
    y: y-position on board,
    pass: boolean if player is passing or not
  }
*/

class GameData {

  constructor(inGameID, inPlayerOne, inPlayerTwo, inHistory, inBoardSize, inGameType) {

    this.gameID = inGameID || "";
    this.playerOne = inPlayerOne || "";
    this.playerTwo = inPlayerTwo || "";
    this.history = inHistory || [];
    this.boardSize = inBoardSize || 9; //Added due to recommendation from Milestone 3
    this.gameType = inGameType || 'Hotseat';
    this.gameOver = false;
  }
}

module.exports = GameData;