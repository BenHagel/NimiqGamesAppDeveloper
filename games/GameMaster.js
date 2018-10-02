function _updateGame(sessions, games){
	//update session info for players, remove dead players
	updateSessionInfoForPlayersAndRemoveDeadSessions(sessions, games);

	//Always have exactly one game open
	/*if(games.length < 1){
		var newGameBBGame = {};
		games.push(_createNewRoom());
	}
	else{
		games[0].counter++;
	}*/
}

function _createNewRoom(pin, game, maxP, buyin, mob, desc){
	var game = {
		'pinned': pin,
		'game': game,
		'players': [],
		'maxPlayers': maxP,
		'buyin': buyin,
		'mobile': mob,
		'counter': 0,
		'desc': desc,
		'tableID': 't' + Date.now() + 't' + ('' + Math.random()).split('.')[1]
	};
	//console.log(t);
	return game;
}

function _requestJoinGame(session, gameID, games, _gameIndexID){
	//Rules for joining a new game
	if(session && getGameByID(gameID, games) !== -1){
		//players < max, buyin, not already in it
		var game = games[getGameByID(gameID, games)];
		if(getPlayerBySig(session.signature, game) === -1 && game.players.length < game.maxPlayers && session.currentGame === -1){
			//Buyin with money
			if(session.playableBalance >= game.buyin){
				var buyinAmt = game.buyin;//Math.min(session.playableBalance, game.maxBuyin);
				var newSeatID = _addNewPlayerToRoom(session, game, buyinAmt);
				session.currentGame = _gameIndexID;//1=big button, 2=RPS
				session.currentGameState = {'tableID': gameID, 'seatID': newSeatID};
				return {'error':'', 'gameType': session.currentGame, 'currentTable': _getGameFromPOVOf(session, game)};
			}
			else{
				return {'error':'Not enough money for minimum buyin, or in another game already!', 'newTables':_getListOfRooms(games)};
			}
		}
		else{
			return {'error':'Already in game or too many players!', 'newTables':_getListOfRooms(games)};
		}
	}
	else{
		return {'error':'invalid!', 'newTables':_getListOfRooms(games)};
	}
}

function _getUpdateOfRoom(session, gameID, games, _gameIndexID){
	//console.log(gameID + ' ' + games.length);
	if(session.currentGame === _gameIndexID && getGameByID(gameID, games) !== -1){
		var gameIndex = getGameByID(gameID, games);
		if(gameIndex !== -1){
			//Is player a member of the table still?
			if(getPlayerBySig(session.signature, games[gameIndex]) !== -1){
				return {'error':'', 'currentTable': _getGameFromPOVOf(session, games[gameIndex]), 'gameIndex': gameIndex};
			}
			else{
				return {'error': 'not a member of this room anymore'};
			}
		}
		else{
			return {'error': 'invalid game id of ' + gameID};
		}
	}
	else{
		return {'error': 'not playing big button... ' + session.currentGame};
	}
}

function _addNewPlayerToRoom(session, game, buyinAmt){
	session.playableBalance -= buyinAmt;
	var tempSeatID = game.counter;
	game.players.push({
		'stack': buyinAmt,
		'seatID': tempSeatID,
		'signature': session.signature + '',
		'nimAddress': session.nimAddress,
		'nimAddressStatus': session.nimAddressStatus
	});
	game.counter++;
	//the event handler for first time joining
	if(game.players.length === 1){//The only guy in the room

	}
	return tempSeatID;
}

function _getGameFromPOVOf(session, game){
	var t = {};//table object to send to client from perspective of user: 'session'
	t.usersTableID = session.currentGameState.seatID;
	t.tableID = game.tableID;
	t.counter = game.counter;
	//add players
	t.players = [];
	for(var y = 0;y < game.players.length;y++){
		var playa = {
			'seatID': game.players[y].seatID,
			'stack': game.players[y].stack
		};
		if(game.players[y].signature === session.signature){
			playa.cardsHeld = game.players[y].cardsHeld;
		}
		t.players.push(playa);
	}
	return t;
}

//Same code as index.js func: GameHelper.listAllGames() //BAD practice
function _getListOfRooms(games){
	var t = {};
	t.tables = [];
	for(var k = 0;k < games.length;k++){
		t.tables.push({
			'p': games[k].pinned,
			'g': games[k].game,
			'plys': games[k].players.length + '/' + games[k].maxPlayers,
			'b': games[k].buyin,
			'm': games[k].mobile,
			'd': games[k].desc,
			'id': games[k].tableID,
		});
	}
	return t;
}

function getGameByID(gameID, games){
	for(var g = 0;g < games.length;g++)
		if(games[g].tableID === gameID)
			return g;
	return -1;
}
function getPlayerBySig(signature, game){
	for(var g = 0;g < game.players.length;g++)
		if(game.players[g].signature === signature)
			return g;
	return -1;
}
function getPlayerBySeatID(game, sID){
	for(var g = 0;g < game.players.length;g++)
		if(game.players[g].seatID === sID)
			return g;
	return -1;
}
function validSignature(sessions, sig){
	if(!sig) return -1;
	if(sig.length < 20) return -1;
	for(var i = 0;i < sessions.length;i++){
		if(sig === sessions[i].signature)
			return i;
	}
	return -1;
}
function updateSessionInfoForPlayersAndRemoveDeadSessions(sessions, games){
	//Update the players session info (nim address confirmed or not)
	for(var i = 0;i < games.length;i++){
		for(var j = 0;j < games[i].players.length;j++){
			for(var k = 0;k < sessions.length;k++){
				//If player exists, update the info
				if(games[i].players[j].signature === sessions[k].signature){
					//'seatID': tempSeatID,
					games[i].players[j].signature = sessions[k].signature;
					games[i].players[j].nimAddress = sessions[k].nimAddress;
					games[i].players[j].nimAddressStatus = sessions[k].nimAddressStatus;
				}
			}
		}
	}

	//Delete players that have lost their sessions
	for(var i = 0;i < games.length;i++){
		var sessionsToKill = [];
		//go through all the players
		for(var j = games[i].players.length-1;j > -1;j--){
			var ind = -1;
			for(var k = 0;k < sessions.length;k++){
				if(games[i].players[j].signature === sessions[k].signature)
					ind = j;
			}
			if(ind === -1){
				playerLeftEvent(games[i].players[j], games[i]);
				games[i].players.splice(j, 1);//sessionsToKill.push(sessions[k]);
			}
		}
	}
}
function _requestRemovePlayerFromGame(session, games){
	var g = getGameByID(session.currentGameState.tableID, games);
	for(var j = 0;j < games[g].players.length;j++){
		if(session.signature === games[g].players[j].signature){
			playerLeftEvent(games[g].players[j], games[g]);
			session.playableBalance += games[g].players[j].stack;
			games[g].players.splice(j, 1);//////////////////////////////////////////////////////////////////////?
		}
	}
	return {'error': ''};
}

function _makeMove(signature, gameID, move, games){
	var r = {};
	r.answer = 'No answer element...';
	var gameIndex = getGameByID(gameID, games);
	if(gameIndex !== -1){
		var playerIndex = getPlayerBySig(signature, games[gameIndex]);
		if(playerIndex !== -1){
			r.error = '';//pokerMoveLogic(games[gameIndex], games[gameIndex].players[playerIndex], move, amt);
			r.answer = 'You have the right to make a move!';
			r.gameIndex = gameIndex;
		}
		else{
			r.error = 'Player not found in the room?'
		}
	}
	else{
		r.error = 'Invalid tableID not found?'
	}
	return r;
}

function playerLeftEvent(player, game){

}

module.exports = {
	_updateGame,
	_createNewRoom,
	_requestJoinGame,
	_getUpdateOfRoom,
	_requestRemovePlayerFromGame,
	_makeMove
};
