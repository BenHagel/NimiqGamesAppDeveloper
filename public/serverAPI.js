var ServerAPI = {};
ServerAPI.baseURL = 'http://localhost:1337/api';
ServerAPI.baseURL_game = 'http://localhost:1337/gameres';
//test ;)
ServerAPI.xmlRequest = function(type, req, to){
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(){
		if(this.readyState === 4 && this.status === 200){
			to(JSON.parse(this.response));
		}
	};

	xhr.open(type, ServerAPI.baseURL + req, true);
	xhr.send(null);
};

ServerAPI.updateBalanceAndWallet = function(mp){
	var updateNum = function(data){
		//if not a valid session signature
		if(data.no){
			Menu.addNotif(data.no, 2);
		}
		//If valid session
		else{
			//var formattedAddress
			if(data.address === '- - -'){ //server.js    //const EMPTY_NIM_ADDRESS = '- - -';
				document.getElementById('actualNimAddressValue').innerText = data.address;
			}
			else {
				document.getElementById('actualNimAddressValue').innerText =
					data.address.charAt(0) +
					data.address.charAt(1) +
					data.address.charAt(2) +
					data.address.charAt(3) + '...' +
					data.address.charAt(data.address.length-4) +
					data.address.charAt(data.address.length-3) +
					data.address.charAt(data.address.length-2) +
					data.address.charAt(data.address.length-1);
			}
			var val = Number(data.balance);/// 100000;
			if(val < 100000){
				var len = Math.log(val) * Math.LOG10E + 1 | 0;
				len = 5 - len;
				var strt = '0.';
				for(var u = 0;u < len;u++) strt += '0';
				document.getElementById('actualNimBalance').innerHTML = '<span style=\'font-size: 12px;color: black;\'>'+
					strt+'</span>';
				document.getElementById('actualNimBalance').innerHTML += val;
			}
			else{
				document.getElementById('actualNimBalance').innerHTML = val;
			}
			//Update title
			document.getElementsByTagName('title')[0].innerText = 'Nimiq Games | ' + val;
			//Update game
			if(data.currentGame !== -1){//data.currentGame === 0 || data.currentGame === 1)
				GameWindow.dispatchDataToHTMLAnimator(data);
			}
			//Footer stats
			document.getElementById('activeUsers').innerText = '  Active users: ' + data.numActiveUsers;
		}

	};
	var command = '?sig=' + Menu.signature;
	command += '&cmd=wallet_and_balance';
	command += '&mp=' + '0';
	command += '&add=v';
	ServerAPI.xmlRequest('POST', command, updateNum);
	setTimeout(ServerAPI.updateBalanceAndWallet, 1000);
};

ServerAPI.walletStatus = function(){
	var updateUserState = function(data){
		walletStatus = data.addressStatus;
	};
	var command = '?sig=' + Menu.signature;
	command += '&cmd=wallet_status';
	ServerAPI.xmlRequest('POST', command, updateUserState);
};

ServerAPI.loadAboutPage = function(){
	var updateAboutPage = function(data){
		document.getElementById('aboutContentDiv').innerHTML = data.page;
	};
	var command = '?sig=' + Menu.signature;
	command += '&cmd=about_page';
	ServerAPI.xmlRequest('POST', command, updateAboutPage);
};

ServerAPI.leaveGame = function(destination){
	var receiveGameEnd = function(data){
		if(data.st === -1){//if left succesfully
			Menu.pokerTableID = '';

			//Stop animation
			Menu.graphicalJSLibrary_Animating = false;
			//Determine if tag with game code exists, and if it does, remove it
			var elToRemove = document.getElementById('gameScriptIDCode');
			if(typeof(elToRemove) != 'undefined' && elToRemove != null){
				//Remove the graphic library options
				//TJS = {}; //ThreeJS
				//PIX = {}; //PixiJS
				//P5J = {};//P5JS
				//Remove the contents of the game field
				//document.getElementById('roomContainerOne').innerHTML = '';
				//Remove the actual tag that contains the game script '***_client.js'
				Menu.game_script.remove();
				console.log('elToRemove is being Removed (GAMES CRIPT CODE)');
			}


			//Determine if tag that contains the actual canvas is there, remove it
			var canvasToRemove = document.getElementById('canvasElementGeneratedByGraphicsLibrary');
			if(typeof(canvasToRemove) != 'undefined' && canvasToRemove != null){
				//Remove the actual tag
				canvasToRemove.remove();
				console.log('remove the caNVAS');
			}

			//Where to go after 'leaving' game
			if(destination === 'gotogameselection'){
				Menu.goToTableSelectionScreen();
			}
		}
		else{//failed for some reason
			Menu.addNotif('Error leaving game.', 3);
		}
	};
	var command = '?sig=' + Menu.signature;
	command += '&cmd=leave_game';
	ServerAPI.xmlRequest('POST', command, receiveGameEnd);
};

ServerAPI.requestAvailableGames = function(){
	var receiveAvailableRooms = function(data){
		Menu.updateGameTableListings(data);
	};
	var command = '?sig=' + Menu.signature;
	command += '&cmd=request_all_games';
	ServerAPI.xmlRequest('POST', command, receiveAvailableRooms);
};

ServerAPI.requestJoinRoom = function(id){
	var handleResponseOfJoinRequest = function(data){
		if(data.error === ''){
			if(data.joinResponse.error === ''){//no error load table layout
				Menu.goToPokerTable();/////////////////////HERE?
				//Menu.updatePokerTable(data.joinResponse.currentTable);
				Menu.thisRoomID = data.joinResponse.currentTable.tableID;
				//Start animation
				Menu.graphicalJSLibrary_Animating = true;
				//Add in game script
				//walletStatus = data.addressStatus
				Menu.game_script = document.createElement('script');
				Menu.game_script.setAttribute('type', 'text/javascript');
				Menu.game_script.setAttribute('hidden', 'true');
				Menu.game_script.setAttribute('id', 'gameScriptIDCode');
				//game_script_spinner.setAttribute('src', data.script);
				Menu.game_script.innerHTML = data.gameScript;
				document.getElementsByTagName('head')[0].appendChild(Menu.game_script);
				//Call the initer for this game, passing the specified library
				GameWindow.startGame(GameSpecific.usesLib);
			}
			else{//frickin error, send a notif
				//console.log('Error joining room!: ' + data.joinResponse.error);
				Menu.addNotif(data.joinResponse.error, 2);
				Menu.updateGameTableListings(data.joinResponse.newTables);
			}
		}
		else{
			Menu.addNotif(data.error, 2);
		}
	};
	var command = '?sig=' + Menu.signature;
	command += '&cmd=request_join_room';
	command += '&tableid=' + id;
	ServerAPI.xmlRequest('POST', command, handleResponseOfJoinRequest);
};

ServerAPI.requestResource = function(gameName, resName){
	var receiveFile = function(data){
		console.log('receivedFile?!??!??!?');
	};
	var command = '?sig=' + Menu.signature;
	command += '&cmd=request_resource';
	command += '&gn=' + gameName;//game name
	command += '&res=' + resName;
	ServerAPI.xmlRequest('POST', command, receiveFile);
};

ServerAPI.makeMove = function(move, callback){//move =
	var responseToMove = function(data){
		if(data.error === ''){
			callback(data);
		}
		//console.log(data.error + ': ' + data.answer);
		else{
			Menu.addNotif(data.error + ': ' + data.answer, 2);
		}
	};
	var command = '?sig=' + Menu.signature;
	command += '&cmd=make_move';
	command += '&move=' + JSON.stringify(move);
	ServerAPI.xmlRequest('POST', command, responseToMove);
};
