const fs = require('fs');
var express = require('express');
var app = express();
var path = require('path');
//(ADDING NEW GAME STEP 1)
//Server game scripts add the helpers to the "GameHelpers" array
//This game always at index = 0 (id is 0)
var MyGameHelper = require('./games/MyGame/MyGame_Server.js');
var MyBubblesHelper = require('./games/MyBubbles/MyBubbles_Server.js');
var GameHelpers = [];
GameHelpers.push(MyGameHelper);
GameHelpers.push(MyBubblesHelper);
console.log('Loaded ' + GameHelpers.length + ' GameHelper objects!');

//Game master helps with game operations
var GameMaster = require('./games/GameMaster.js');

//------------------
//SERVER H E L P E R
//------------------
var ServerHelper = {};
//The config
ServerHelper.config = {};
ServerHelper.config.logFile = 'log.txt';
ServerHelper.sessions = [];
ServerHelper.gameScripts = [];

ServerHelper.loadSessionInformation = function(){
	ServerHelper.sessions = [];
	var t = '' + fs.readFileSync(path.join(__dirname + '/server/sessions.txt'));
	var entries = t.split('\n');
	for(var i = 0;i < entries.length;i++){
		if(entries[i].length > 10){
			ServerHelper.sessions.push(JSON.parse(entries[i]));
		}
	}
};

ServerHelper.loadGameScripts = function(){
	ServerHelper.gameScripts = [];
	//(ADDING NEW GAME STEP 2) load in the client side js of MyGame to send over
	//0 = MyGame
	var gameOne = {};
	gameOne.name = 'MyGame';
	gameOne.script = '' + fs.readFileSync(path.join(__dirname + '/games/MyGame/MyGame_Client.js'));
	ServerHelper.gameScripts.push(gameOne);
	//1 = MyBubbles
	var gameTwo = {};
	gameTwo.name = 'MyBubbles';
	gameTwo.script = '' + fs.readFileSync(path.join(__dirname + '/games/MyBubbles/MyBubbles_Client.js'));
	ServerHelper.gameScripts.push(gameTwo);
};

ServerHelper.validSignature = function(sig){
	if(!sig) return -1;
	if(sig.length < 20) return -1;
	for(var i = 0;i < ServerHelper.sessions.length;i++){
		if(sig === ServerHelper.sessions[i].signature)
			return i;
	}
	return -1;
};

ServerHelper.getDateString = function(){
	var addZero = function(i){
		if(i < 10) i = "0" + i;
		return i;
	};
	var d = new Date();
	var m = d.getMonth() + 1;
	return d.getFullYear() + ":" + m + ":" + addZero(d.getDate()) +
		"///" + addZero(d.getHours()) + ":" + addZero(d.getMinutes()) +
		":" + addZero(d.getSeconds());
};
ServerHelper.log = function(entry){
	var timeS = ServerHelper.getDateString();
	//console.log(timeS);
	//console.log('\t' + entry);
	//fs.appendFile('./' + ServerHelper.config.logFile, timeS + '>' + entry + '\n', function(err){
	//	if(err) throw err;
	//});
};

//Load seesions that have been saved
ServerHelper.loadSessionInformation();
console.log('Loaded ' + ServerHelper.sessions.length + ' sessions on startup!');
//Load the game scripts into memory
ServerHelper.loadGameScripts();
console.log('Loaded ' + ServerHelper.gameScripts.length + ' game scripts!');
console.log('->Check game scripts equal game helpers:');
if(GameHelpers.length === ServerHelper.gameScripts.length) console.log('->YES!');
else console,log('===> NOOOOOOO!!!!');


//------------------
//GAMES H E L P E R
//------------------
var GameHelper = {};
//0 is MyGame
//1 is ...
//(ADDING NEW GAME STEP 3) push() again, and then fs.readFileSync(server_whateverthegamecalled.txt)
//(ADDING NEW GAME STEP 4) add server_whateverthegamecalled.txt to /server/ to store the game states
GameHelper.games = [];
GameHelper.games.push([]);//MyGame
GameHelper.games.push([]);//MyBubbles
console.log('Loaded ' + GameHelper.games.length + ' game types!');
GameHelper.loadGamesInformation = function(){
	//Load big button
	var t = '' + fs.readFileSync(path.join(__dirname + '/server/games_mygame.txt'));
	var entries = t.split('\n');
	for(var i = 0;i < entries.length;i++){
		if(entries[i].length > 10){
			GameHelper.games[0].push(JSON.parse(entries[i]));
		}
	}
};
GameHelper.loadGamesInformation = function(){
	//Load my bubbles
	var t = '' + fs.readFileSync(path.join(__dirname + '/server/games_mybubbles.txt'));
	var entries = t.split('\n');
	for(var i = 0;i < entries.length;i++){
		if(entries[i].length > 10){
			GameHelper.games[1].push(JSON.parse(entries[i]));
		}
	}
};
//Same code as GameMaster._getListOfRooms() func //BAD practice
GameHelper.listAllGames = function(){
	var t = {};
	t.tables = [];
	for(var k = 0;k < GameHelper.games.length;k++){
		for(var j = 0;j < GameHelper.games[k].length;j++){
			t.tables.push({
				'p': GameHelper.games[k][j].pinned,
				'g': GameHelper.games[k][j].game,
				'plys': GameHelper.games[k][j].players.length + '/' + GameHelper.games[k][j].maxPlayers,
				'b': GameHelper.games[k][j].buyin,
				'm': GameHelper.games[k][j].mobile,
				'd': GameHelper.games[k][j].desc,
				'id': GameHelper.games[k][j].tableID
			});
		}
	}
	return t;
};
GameHelper.requestJoinGame = function(session, tid){
	var gameTypeIndex = -1;
	for(var k = 0;k < GameHelper.games.length;k++){
		for(var j = 0;j < GameHelper.games[k].length;j++){
			if(tid === GameHelper.games[k][j].tableID){
				gameTypeIndex = k;
				break;
			}
		}
	}

	if(gameTypeIndex !== -1){
		return {'gameScript': '' + ServerHelper.gameScripts[gameTypeIndex].script,
				'joinResponse': GameHelpers[gameTypeIndex].requestJoinGame(session, tid, GameHelper.games[gameTypeIndex]),
				'error': ''};
	}

	return {'error':'Room ID requested does not exist.'};
};

GameHelper.requestLeaveGame = function(session){
	if(session.currentGame !== -1){//if in a game
		return GameHelpers[session.currentGame].requestRemovePlayerFromGame(session, GameHelper.games[session.currentGame]);
	}
	return {'error': 'not a valid game to leave'};
};

GameHelper.makeMove = function(session, move){
	if(session.currentGame !== -1){//if in a game
		if(move.length < 200){
			return GameHelpers[session.currentGame].makeMove(
				session.signature,
				session.currentGameState.tableID,
				move,
				GameHelper.games[session.currentGame]
			);
		}
		else{
			return {'error': 'move is over 200 chars, too long to parse...'};
		}
	}
	return {'error': 'not a valid game to make move on'};
};

GameHelper.loadGamesInformation();
console.log('Loaded all active games!');










//-------------------
//S E R V E R
//-------------------
//Helper Functions
function formatPackageToSendOver(req, res, ip, specialURL){
	//Detect if mobile
	var isMobile = /mobile/i.test(req.headers['user-agent']);
	//Write the new session object that has to be checked now...
	var ns = {}; //New Session object to create
	ns.startTime = Date.now();
	ns.lastActive = ns.startTime;
	ns.lastActiveUserRequest = ns.startTime;
		var temp = '' + Math.random();
		temp = temp.split('.')[1];
	ns.signature = 'nq' + temp + 'u' + ns.startTime;
	ns.nimAddress = '- - -';
	ns.nimAddressStatus = '-?-?-';
	ns.isMobileUser = isMobile;
	ns.playableBalance = 0.0;//0.0;
	ns.currentGame = -1; //-1 is no game, 0 is poker game, 1 is big button
	ns.currentGameState = {}; //are all the values that comprise the user's current game (for single player games only)
	ServerHelper.sessions.push(ns);
	//Write the instructions that will be executed by Navigator upon arrival
	var inst = "function Navigator_arrival() {";
	//if(val === '') val = 'home';//no val is either 'home', 'leaderboards', 'about', or 'play'
	if(isMobile) inst += 'Menu.isMobileUser=true;';
	else inst += 'Menu.isMobileUser=false;';
	inst += 'Menu.signature=\'' + ns.signature + '\';';
	inst += 'document.getElementById(\'activeUsers\').innerText = \'  Active users: \' + ' + ServerHelper.sessions.length + ';';
	inst += 'ServerAPI.updateBalanceAndWallet();';
	inst += 'Menu.landingScreen=\'normal\';';
	inst += 'Menu.initer();';
	inst += '}';
	fs.writeFile(path.join(__dirname + '/public/Navigator.js'), inst, 'utf-8', function(err){
		if(err){
			ServerHelper.log('ERROR writing Navigator.js! >:(');
			return ServerHelper.log(err);
		}
		res.sendFile(path.join(__dirname + '/index.html'));
		ServerHelper.log(specialURL + ' to: ' + ip);
	});
}
//-------------------
//MIDDLEWARE
//-------------------
//Middleware for just the normal page loading
function homepageMiddleware(req, res, specialURL){
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	formatPackageToSendOver(req, res, ip, specialURL);
}
//Send an INVALID response
function sendInvalid(req, res){
	res.json({'no':'Invalid session, please refresh browser.'});//, 'address': '%$&X!*^#'});
}
//Handle api requests (only gets here if the sig was valid)
function handleApi(req, res, id){
	if(req.query.cmd === 'wallet_and_balance'){
		var val = Number(req.query.mp);
		//at most 1 query ever 1.1 seconds
		if(Date.now() - ServerHelper.sessions[id].lastActiveUserRequest > 900)
			ServerHelper.sessions[id].playableBalance +=
			 Math.floor(30 + Math.random()*15);
		ServerHelper.sessions[id].lastActiveUserRequest = Date.now();
		//Get update of game
		var t = {};
		t.address = ServerHelper.sessions[id].nimAddress;
		t.balance = ServerHelper.sessions[id].playableBalance;
		t.addressStatus = ServerHelper.sessions[id].nimAddressStatus;
		t.numActiveUsers = ServerHelper.sessions.length;
		t.currentGame = ServerHelper.sessions[id].currentGame;
		//console.log('')
		if(ServerHelper.sessions[id].currentGame !== -1) t.gameState = GameHelpers[t.currentGame].getUpdateOfRoom(
			ServerHelper.sessions[id],
			ServerHelper.sessions[id].currentGameState.tableID + '',
			GameHelper.games[t.currentGame]);
		else
			t.gameState = {'error': 'You are not part of any game.'};
		res.json(t);
	}
	else if(req.query.cmd === 'leave_game'){
		var t = {};
		var leaveStatus = GameHelper.requestLeaveGame(ServerHelper.sessions[id]);
		ServerHelper.sessions[id].currentGame = -1;
		ServerHelper.sessions[id].currentGameState = {};
		t.st = ServerHelper.sessions[id].currentGame;
		t.leaveStatus = leaveStatus;
		res.json(t);
	}
	else if(req.query.cmd === 'request_all_games'){
		res.json(GameHelper.listAllGames());
	}
	else if(req.query.cmd === 'make_move'){
		res.json(GameHelper.makeMove(ServerHelper.sessions[id], req.query.move));
	}
	else if(req.query.cmd === 'request_join_room'){
		res.json(GameHelper.requestJoinGame(ServerHelper.sessions[id], req.query.tableid));
	}
	else{
		sendInvalid(res, res);
	}
}
function handleResourceRequest(req, res){
	var urL = '/res/' + req.query.g + '/' + req.query.n;
	if(urL.includes('./')){//to prevent requests that move UP in the directory
		res.sendFile(path.join(__dirname + '/res/x.png'));
	}
	else{
		res.sendFile(path.join(__dirname + urL));
	}
}

//Specify static loading
app.use(express.static('public'));

//Initial loading (just to anyone, generating token)
app.get('/',      function(req, res){homepageMiddleware(req, res, 'nrml');});

//For the api (maybe for the games too...?)
app.post('/api', function(req, res){
	res.header('Access-Control-Allow-Origin', '*');//'http://www.nimiqgames.ca/');
	res.header('Access-Control-Allow-Methods', 'POST');
	var sessionID = ServerHelper.validSignature(req.query.sig);
	if(sessionID !== -1){
		//ServerHelper.log('valid: ' + req.query.sig + ' cmd: ' + req.query.cmd);
		handleApi(req, res, sessionID);
	}
	else{
		//ServerHelper.log('invalid signature >:(');
		sendInvalid(res, res);
	}
});
app.get('/gameres', function(req, res){
	//BlockchainTalker.sendTransaction('NQ09 APUA T4PX 2C07 R21L 0780 CNT3 ET53 BT1J', 111);
	res.header('Access-Control-Allow-Origin', '*');//'http://www.nimiqgames.ca/');
	res.header('Access-Control-Allow-Methods', 'GET');
	//res.sendFile(path.join(__dirname + '/res/bigbutton/bunnyboy.jpg'));
	handleResourceRequest(req, res);
});










//------------------
//Concurrent operations
//------------------
//Other Critical Server operations, update game states - emulate the database functionality
function periodicallySaveSessionInfoToDisc() {
	//UPDATE SESSION INFO HERE
	var currDate = Date.now();
	var newSessions = [];
	for(var j = 0;j < ServerHelper.sessions.length;j++) {
		if(currDate - ServerHelper.sessions[j].lastActiveUserRequest < 30000){ //30 secs
			newSessions.push(ServerHelper.sessions[j]);
		}
	}
	ServerHelper.sessions = newSessions;
	//////////////////////////
	var sessionInfo = '';
	for(var i = 0;i < ServerHelper.sessions.length;i++){
		sessionInfo += JSON.stringify(ServerHelper.sessions[i]) + '\n';
	}
	setTimeout(
		function(){
			fs.writeFile('./server/sessions.txt', sessionInfo, function(err){
				//if(err) ServerHelper.log('error savin sessions...');
				//else ServerHelper.log('Saved ' + ServerHelper.sessions.length + ' sessions.');
			});
			periodicallySaveSessionInfoToDisc();
		}, 5000);

}
periodicallySaveSessionInfoToDisc();
console.log('Session ticker running! (once every 5 seconds)');


//(ADDING NEW GAME STEP 9) periodically write to disc - make sure
//the .txt files match wherever you write to
//Periodically check on poker games and save them to the disc
function periodicallySaveAndUpdateGamesToDisc(){
	//UPDATE poker session here
	for(var p = 0;p < GameHelpers.length;p++){
		GameHelpers[p].updateGame(ServerHelper.sessions, GameHelper.games[p]);
	}

	//Write big button sessions to disc
	var gameInfoMyGame = '';
	for(var i = 0;i < GameHelper.games[0].length;i++){
		gameInfoMyGame += JSON.stringify(GameHelper.games[0][i]) + '\n';
	}
	//Write my bubbles to disc
	var gameInfoMyBubbles = '';
	for(var i = 0;i < GameHelper.games[1].length;i++){
		gameInfoMyBubbles += JSON.stringify(GameHelper.games[1][i]) + '\n';
	}
	setTimeout(
		function(){
			fs.writeFile('./server/games_mygame.txt', gameInfoMyGame, function(err){});
			fs.writeFile('./server/games_mybubbles.txt', gameInfoMyBubbles, function(err){});
			periodicallySaveAndUpdateGamesToDisc();
		}, 1000);
}
periodicallySaveAndUpdateGamesToDisc();
console.log('Game ticker running! (once every 1 second)');

app.listen(1337);
console.log('Express server listening...');
