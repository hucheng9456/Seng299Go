"use strict";

class Board {

  // THIS BUILDS THE BOARD STATE BY EXECUTING THE MOVES IN TURN.
  // HISTORY IS COPIED OVER, and CURRENT STATE IS BUILT.

  // @param: A valid history object, or no parameter to create a blank state
  constructor (inHistory, inSize){

    // Array of moves, rather than linked list, due to milestone 3 feedback.
    this.history = inHistory || [];
    this.size = inSize;

    // Create an empty board
    this.currentState = new Array(inSize);

    for (var i = 0; i < inSize; i++) {
      this.currentState[i] = new Array(inSize);

      for (var j = 0; j < inSize; j++) {
      this.currentState[i][j] = 0;
      }
    }

    //build the board array
    for (var i = 0; i < this.history.length; i++) {
    
      if (!this.history[i].pass) {
      
        // Recreate board state from history
        this.playMove(this.history[i].x, this.history[i].y, this.history[i].colour);
      }
    }
  }
  
  //now plays moves
  playMove(x, y, colour) {

    this.currentState[x][y] = colour;
    
    this.checkCaptures(x, y, colour);
  }
  
  // Return a state that the AI can use
  convertToInteger() {

    let state = new Array(this.size);

    for (var i = 0; i < this.currentState.length; i++) {

      state[i] = new Array(this.size);

      for (var j = 0; j < this.currentState[i].length; j++) {

        if (this.currentState[i][j] === "Black") {
          state[i][j] = 1;
        }
        else if (this.currentState[i][j] === "White") {
          state[i][j] = 2;
        }
        else {
          state[i][j] = 0;
        }
      }
    }

    return state;
  }

  //incolour is the colour of the move.
  checkCaptures(x, y, inColour) {

    var captures = 0;

    if (x >= 0 && x < this.size && y >= 0 && y < this.size) {
      const oppColour = inColour === "White" ? "Black" : "White";

      captures += this._checkCaptures(x-1, y, oppColour); 
      captures += this._checkCaptures(x, y-1, oppColour);
      captures += this._checkCaptures(x+1, y, oppColour);
      captures += this._checkCaptures(x, y+1, oppColour);
    }

    return captures;
  }

  //inColour is the colour of the pieces to be taken.
  _checkCaptures(x, y, inColour) {
  
    if (x >= 0 && x < this.size && y >= 0 && y < this.size) {

      //if this is true there are liberties.
      if (this.checkLiberties(x, y, inColour) === false) {

        return this._doCapture(x, y, inColour);
      }
    }

    return 0;
  }

  _doCapture(x, y, inColour) {

    var captures = 0;

    if (x >= 0 && x < this.size && y >= 0 && y < this.size && this.currentState[x][y] === inColour) {

      this.currentState[x][y] = 0;
      captures++;
      //console.log("capture at", x, y);

      captures += this._doCapture(x+1, y, inColour);
      captures += this._doCapture(x, y+1, inColour);
      captures += this._doCapture(x-1, y, inColour);
      captures += this._doCapture(x, y-1, inColour);
    }

    return captures;
  }
 

  //returns true if there are liberties (when liberty value is false).
  checkLiberties(x, y, inColour) {

    // create empty board to keep track of which spots have been tested
    let testBoard = new Array(this.size);

    for (var i = 0; i < this.size; i++) {
      testBoard[i] = new Array(this.size);

      for (var j = 0; j < this.size; j++) {
      testBoard[i][j] = 0;
      }
    }

    testBoard[x][y] = 1;

    //console.log(x, y, inColour, "checking liberties");

    let liberty = this._checkLiberties(testBoard, x-1, y, inColour) === false && 
      this._checkLiberties(testBoard, x, y-1, inColour) === false &&
      this._checkLiberties(testBoard, x+1, y, inColour) === false &&
      this._checkLiberties(testBoard, x, y+1, inColour) === false;

    //console.log(x, y, inColour, "finished liberties", !liberty);

    //if the spot is not empty return false, if there are no liberties, return false.
    return !liberty;	
  }

  //incolour is the colour of the move.
	// returns true if there's a liberty.
  _checkLiberties(testBoard, x, y, inColour) {

    if (x < 0 || y > this.size - 1 || y < 0 || x > this.size - 1) {
      //console.log(x, y, inColour, "outside board");
      return false;
    }

    //check the current spot.
    if (this.currentState[x][y] === 0) {
      //console.log(this.currentState);
      //console.log(x, y, inColour, "board unoccupied");
      return true;
    }

    if (testBoard[x][y] === 1) {
      //console.log(x, y, inColour, "already tested");
      return false;
    }

    if (this.currentState[x][y] === (inColour === "White" ? "Black" : "White")) {
      //console.log(x, y, inColour, "opposite colour");
      return false;
    }
    
    testBoard[x][y] = 1;
    
    // If each of the 4 directions have no liberty, then the stone can't be placed there
    let hasLiberty = this._checkLiberties(testBoard, x-1, y, inColour) === true ||  
      this._checkLiberties(testBoard, x, y-1, inColour) === true || 
      this._checkLiberties(testBoard, x+1, y, inColour) === true || 
      this._checkLiberties(testBoard, x, y+1, inColour) === true;

      //console.log(x, y, inColour, "has liberty", hasLiberty);

    return hasLiberty;
  }	 
}

module.exports = Board;