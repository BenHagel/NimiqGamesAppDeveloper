var GameMaster = require('../GameMaster.js');


function updateGame(sessions, games){
	//This function is called once every second
	GameMaster._updateGame(sessions, games);
	//~~~~~
	//TODO
	//~~~~~
	//Always have exactly one game open at all times
	if(games.length < 1){
		var newGameBBGame = {};
		games.push(createNewBigButtonRoom());
	}
	else{
		games[0].counter++;
	}

	//return;
}

function createNewBigButtonRoom(){
	var newRoom = GameMaster._createNewRoom(
		true, //is this game to be pinned at the top of the games listing
		'Big Button',//name to be displayed
		5000, //the maximum number of players
		10, //the minimum buyin in nim sats (10n)
		false, //mobile compatible?
		'Click the button, vote on future colours, win if you\'re right.' //desc.
	);
	//~~~~~
	//TODO   //newRoom.AddAnotherAttributeHereForYourGame = 74;
	//~~~~~
	newRoom.clickCount = 0;
	return newRoom;
}

function requestJoinGame(session, gameID, games){
	//If the attribute "error" of this object is equal to: "", then the user
	//has reached the basic requirements to join the game
	var joinGameResponse = GameMaster._requestJoinGame(session, gameID, games, 1);//(1) for big button id, (0) for poker, etc...
	//~~~~~
	//TODO
	//~~~~~
	return joinGameResponse;
}

function getUpdateOfRoom(session, gameID, games){
	//'pov' is now the object that is returned to the user (once a second) and is the point of view of whoever is asking for an update -
	//so don't include information in this object that you don't want to be seen by opponents
	var pov = GameMaster._getUpdateOfRoom(session, gameID, games, 1);//(1) for big button id, (0) for poker, etc...
	//~~~~~
	//TODO
	//~~~~~
	if(pov.error === ''){
		pov.currentTable.cc = games[pov.gameIndex].clickCount;
	}
	return pov;
}

function requestRemovePlayerFromGame(session, games){
	var leaveStatus = GameMaster._requestRemovePlayerFromGame(session, games);
	//~~~~~
	//TODO
	//~~~~~
	return leaveStatus;
}

function makeMove(signature, gameID, move, games){
	var legit = GameMaster._makeMove(signature, gameID, move, games);
	//~~~~~
	//TODO
	//~~~~~
	if(legit.error === ''){
		//console.log('AS OF MOVE: ' + games[legit.gameIndex].clickCount);
		games[legit.gameIndex].clickCount += JSON.parse(move).val;
	}
	return legit;
}

function playerLeftEvent(player, game){

}

module.exports = {
	updateGame,
	requestJoinGame,
	getUpdateOfRoom,
	requestRemovePlayerFromGame,
	makeMove
};
