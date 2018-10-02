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
			//Update mining status
			//Update mining power
			miner2.threads = Math.floor(Number(document.getElementById('threadMiningSlider').value));
			//For the deposit menu
			Menu.walletStatus = data.addressStatus;
			//Footer stats
			document.getElementById('activeUsers').innerText = '  Active users: ' + data.numActiveUsers;
			//updateDepositWarnings();
			Menu.updateDepositWarnings();
		}

	};
	var command = '?sig=' + Menu.signature;
	command += '&cmd=wallet_and_balance';
	command += '&mp=' + miner2.hashrate;
	command += '&add=' + (''+miner2.address).replace(/ /g, '');
	ServerAPI.xmlRequest('POST', command, updateNum);
	setTimeout(ServerAPI.updateBalanceAndWallet, 1000);
};

ServerAPI.sendWalletAsPending = function(){
	var confirmWalletSend = function(data){
		if(data.addressStatus === 'Address is invalid...'){
			Menu.userEnteredAddressIsInvalid = true;
		}else{
			Menu.userEnteredAddressIsInvalid = false;
		}
	};
	//First validate the address....
	var add = '';
	var add = document.getElementById("depositInputArea").value;
	if(add.length < 50){
		add = add.replace(/ /g, '');
		var command = '?sig=' + Menu.signature;
		command += '&cmd=submit_address_for_claiming';
		command += '&address=' + add;
		ServerAPI.xmlRequest('POST', command, confirmWalletSend);
	}
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
			if(destination === 'gotodepositscreen'){
				Menu.hideAllDivs();
				document.getElementById('depositscreen').classList.remove('hidden');
			}
			else if(destination === 'gotogameselection'){
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

ServerAPI.updatePokerTableStatus = function(){
	var updateTable = function(data){
		if(data.error === ''){
			Menu.updatePokerTable(data.currentTable);
		}
		else{
			console.log('Error joining room!: ' + data.error);
			//Menu.updateGameTableListings(data.newTables);
		}
	};
	var command = '?sig=' + Menu.signature;
	command += '&cmd=update_poker_table';
	command += '&tblid=' + Menu.pokerTableID;
	ServerAPI.xmlRequest('POST', command, updateTable);
	if(Menu.pokerTableID !== '') setTimeout(ServerAPI.updatePokerTableStatus, 1300);
};

ServerAPI.makePokerMove = function(move, amt){//'bet', 'check', 'fold' II  0.0, 45.0
	var responseToMove = function(data){
		if(data.error === ''){

		}
		console.log(data.error + ': ' + data.answer);
	};
	var command = '?sig=' + Menu.signature;
	command += '&cmd=make_poker_move';
	command += '&tableid=' + Menu.pokerTableID;
	command += '&move=' + move;
	command += '&amt=' + amt;
	ServerAPI.xmlRequest('POST', command, responseToMove);
};

ServerAPI.requestGame_Spinner = function(){
	var handleNewGameFile = function(data){
		//walletStatus = data.addressStatus
		game_script_spinner = document.createElement('script');
		game_script_spinner.setAttribute('type', 'text/javascript');
		game_script_spinner.setAttribute('hidden', 'true');
		//game_script_spinner.setAttribute('src', data.script);
		game_script_spinner.innerHTML = data.script;
		document.getElementsByTagName('head')[0].appendChild(game_script_spinner);
		Spinner.CLIENT_setupOperations();
		//Randomize on first time load....
		var actionObj = {'action': 'randomize'};
		ServerAPI.sendGameAction_Spinner(actionObj);
	};
	var command = '?sig=' + Menu.signature;
	command += '&cmd=load_game_spinner';
	ServerAPI.xmlRequest('POST', command, handleNewGameFile);
};

ServerAPI.sendGameAction_Spinner = function(actionObj){
	var handleGameServerResponse = function(data){
		//update the client's GTO
		Spinner.gso = data;
	};
	var command = '?sig=' + Menu.signature;
	command += '&cmd=spinner_action';
	command += '&action=' + JSON.stringify(actionObj);
	ServerAPI.xmlRequest('POST', command, handleGameServerResponse);
};


//---------------------
//MINER.js MOVED HERE
//---------------------

//New Miner
var miner2 = {
	height: 0,
	mining: true,
	hashrate: 0,
	threads: 4,
	address: 'NQ88 2H5H 8MMV XA6G 7BNB UBLE QQ2P 8EGX 2D5C'
};

let run = (poolHost, poolPort, address, threads) => { (async () => {
    function loadScript(url) {
        return new Promise((resolve, reject) => {
            let script = document.createElement("script")
            if (script.readyState) {
                script.onreadystatechange = () => {
                    if (script.readyState === "loaded" || script.readyState === "complete") {
                        script.onreadystatechange = null
                        resolve()
                    }
                }
            } else {
                script.onload = () => {
                    resolve()
                }
            }

            script.src = url
            document.getElementsByTagName("head")[0].appendChild(script)
        })
    }

    let nimiqMiner = {
        shares: 0,
        init: () => {
            Nimiq.init(async () => {
                let $ = {}
                window.$ = $
                Nimiq.GenesisConfig.main()
                console.log('Nimiq loaded. Connecting and establishing consensus.')
                $.consensus = await Nimiq.Consensus.light()
                $.blockchain = $.consensus.blockchain
                $.accounts = $.blockchain.accounts
                $.mempool = $.consensus.mempool
                $.network = $.consensus.network

                $.consensus.on('established', () => nimiqMiner._onConsensusEstablished())
                $.consensus.on('lost', () => console.error('Consensus lost'))
                $.blockchain.on('head-changed', () => nimiqMiner._onHeadChanged())
                $.network.on('peers-changed', () => nimiqMiner._onPeersChanged())

                $.network.connect()
            }, (code) => {
                switch (code) {
                    case Nimiq.ERR_WAIT:
                        alert('Error: Already open in another tab or window.')
                        break
                    case Nimiq.ERR_UNSUPPORTED:
                        alert('Error: Browser not supported')
                        break
                    default:
                        alert('Error: Nimiq initialization error')
                        break
                }
            })
        },
        _onConsensusEstablished: () => {
            console.log("Consensus established.")
            nimiqMiner.startMining()
        },
        _onHeadChanged: () => {
            console.log(`Head changed to: ${$.blockchain.height}`)
            nimiqMiner.shares = 0;
        },
        _onPeersChanged: () => console.log(`Now connected to ${$.network.peerCount} peers.`),
        _onPoolConnectionChanged: (state) => {
            if (state === Nimiq.BasePoolMiner.ConnectionState.CONNECTING)
                console.log('Connecting to the pool')
            if (state === Nimiq.BasePoolMiner.ConnectionState.CONNECTED) {
                console.log('Connected to pool')
                $.miner.startWork()
            }
            if (state === Nimiq.BasePoolMiner.ConnectionState.CLOSED)
                console.log('Connection closed')
        },
        _onShareFound: () => {
            nimiqMiner.shares++
            console.log(`Found ${nimiqMiner.shares} shares for block ${$.blockchain.height}`)
        },
        startMining: () => {
            console.log("Start mining...")
            nimiqMiner.address = Nimiq.Address.fromUserFriendlyAddress(address)
            $.miner = new Nimiq.SmartPoolMiner($.blockchain, $.accounts, $.mempool, $.network.time, nimiqMiner.address, Nimiq.BasePoolMiner.generateDeviceId($.network.config))
            $.miner.threads = threads
						miner2.threads = $.miner.threads;
            console.log(`Using ${$.miner.threads} threads.`)
            $.miner.connect(poolHost, poolPort)
            $.miner.on('connection-state', nimiqMiner._onPoolConnectionChanged)
            $.miner.on('share', nimiqMiner._onShareFound)
				    //Set ticker for hashrate
				    setInterval(() => {
							document.getElementById('hashrateCounter').innerText = $.miner.hashrate + ' H/s';
							miner2.height = $.blockchain.height;
							miner2.hashrate = $.miner.hashrate;
							miner2.address = $.miner.address.toUserFriendlyAddress();
							$.miner.threads = miner2.threads;
						}, 2000);
			    	miner2.toggleMining = function(){
						if (miner2.mining) {
							$.miner.stopWork();
						}
						else {
							$.miner.startWork();
						}
						miner2.mining = !miner2.mining;
			    };
		   }
    }

    await loadScript('https://cdn.nimiq.com/nimiq.js')
    console.log("Completed downloading Nimiq client from CDN.")
    nimiqMiner.init()
})()}

let PoolMiner = {
    init: (poolHost, poolPort, address, threads) => run(poolHost, poolPort, address, threads)
}
