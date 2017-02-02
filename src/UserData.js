class UserData {

  constructor(inUserID, inFullName, inEmail, inNumPlayed, inActiveGames) {

    this.userID = inUserID || "";
    this.fullName = inFullName || "";
    this.email = inEmail || ""; // Google+ doesn't give us an email. We'll need to remove this
    this.numGamesPlayed = inNumPlayed || 0;
    this.activeGames = inActiveGames || [];
  }
}

module.exports = UserData;