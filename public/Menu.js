var Menu = {};

Menu.screen = '';// <- not used atm
Menu.divs = ['homescreen', 'depositscreen', 'playscreen',
	'playscreen_single', 'playscreen_single_spinner',
	'aboutscreen', 'playscreen_versus_poker',
	'playscreen_tables'
];
//Deposit screen
Menu.walletStatus = 'not_confirmed';//'pending', 'confirmed'
Menu.userEnteredAddressIsInvalid = false;
Menu.depositSubmitButtonCoolDown = false;
//Notificatoins
Menu.notifQueue = [];
//Menu.notifLifeSpan = -1;//-1 means no notif is currently going
//Poker game
Menu.thisRoomID = '';
//Game scripts, and the html tags
Menu.game_script = {};
//Graphics Library
Menu.graphicalJSLibrary_Animating = true;

Menu.hideAllDivs = function(){
	for(var tt = 0;tt < Menu.divs.length;tt++)
		document.getElementById(Menu.divs[tt]).classList.add('hidden');
};

Menu.initer = function(){
	window.onbeforeunload = function(){
		return true;
	};
	window.addEventListener('resize', function(){
		try{
			if(GameSpecific){
				//THREEJS
				if(GameSpecific !== -1 && GameSpecific.usesLib === 'threejs'){//If the object that comes along with a loaded game is defined:

					TJS.w = document.getElementById('roomContainerOne').offsetWidth;
					TJS.h = document.getElementById('roomContainerOne').offsetHeight;

					//If the camera is defined
					if(TJS.camera){
						TJS.camera.aspect = TJS.w / TJS.h;
				    TJS.camera.updateProjectionMatrix();
					}

			    TJS.renderer.setSize(TJS.w, TJS.h);
				}
				//PIXI
				else if(GameSpecific !== -1 && GameSpecific.usesLib === 'pixi'){

				}
			}
		} catch(err){}
	}, false);


	if(Menu.landingScreen === 'poker'){
		//setTimeout(Menu.goToTableSelectionScreen, 50);
		Menu.goToTableSelectionScreen();
	}
	Menu.notifTicker();
};

Menu.notifTicker = function(){
	if(Menu.notifQueue.length > 0){//Make sure there is atleast one notif in the queue
		//If active
		if(Menu.notifQueue[0].active){
			Menu.notifQueue[0].time--;
			if(Menu.notifQueue[0].time < 0){//notif has no died (remove)
				Menu.notifQueue.shift();
				//Remove notif tag
				document.getElementById('notifArea').remove();
			}
		}
		else{
			//Make next message active
			Menu.notifQueue[0].active = true;
			var bodyTag = document.getElementsByTagName('BODY')[0];
			var notifTagElement = document.createElement('div');
			notifTagElement.setAttribute('id', 'notifArea');
			notifTagElement.classList.add("deposit-contents");
			notifTagElement.innerHTML = Menu.notifQueue[0].body;
			bodyTag.appendChild(notifTagElement);
		}
	}
	setTimeout(Menu.notifTicker, 1000);
};

Menu.addNotif = function(htmlMessage, lifeSpanInSeconds){
	//htmlMessage = {'body': 'Stop mining for Skypool...', 'time': 4} //4 seconds
	Menu.notifQueue.push({
		'body': htmlMessage,
		'time': lifeSpanInSeconds,
		'active': false
	});
};

Menu.goToHomeScreen = function(){
	Menu.hideAllDivs();
	document.getElementById('homescreen').classList.remove('hidden');
};

Menu.goToDepositScreen = function(){
	document.getElementById('depositInputArea').value = '';
	ServerAPI.leaveGame('gotodepositscreen');
	//Menu.addNotif('your balance is: ' + document.getElementById('actualNimBalance').innerText, 3);
};
Menu.updateDepositWarnings = function(){
	var warningImage = '<img src=\'style/warning.png\' height=\'16\' width=\'16\'>';
	var linkToSend = '<a href=\'https://safe.nimiq.com/#_request/NQ88-2H5H-8MMV-XA6G-7BNB-UBLE-QQ2P-8EGX-2D5C_\' target=\'_blank\'>' +
		'NQ88 2H5H 8MMV XA6G 7BNB UBLE QQ2P 8EGX 2D5C</a>';
	if(Menu.walletStatus === 'not_confirmed'){//'pending', 'confirmed'
		if(Menu.userEnteredAddressIsInvalid === true){
			document.getElementById('depositWarningsArea').innerHTML = warningImage +
				'  Submit your 36 character Nimiq address BEFORE closing your browser to receive your playable balance. (You just entered an INVALID address...)';
		}
		else{
			document.getElementById('depositWarningsArea').innerHTML =
				'Submit your 36 character Nimiq address BEFORE closing your browser to receive your playable balance.';
		}
	}
	else if(Menu.walletStatus === 'pending'){//'pending', 'confirmed'
		document.getElementById('depositWarningsArea').innerHTML =
			'Payouts will now be sent to your Nimiq address when this browser is closed.';
	}
	else if(Menu.walletStatus === 'confirmed'){//'pending', 'confirmed'
		document.getElementById('depositWarningsArea').innerHTML =
			'Your Nimiq address is assigned to this session.  To deposit more funds send Nimiq to this address: ' +
			linkToSend + '  ' +
			warningImage + ' WARNING: Refreshing this page will send your playable balance back to you, and invalidate this session!';
	}


};

Menu.depositSubmitClicked = function(){
	if(Menu.depositSubmitButtonCoolDown){
		//Send out warning to the message queue
	}
	else{
		Menu.depositSubmitButtonCoolDown = true;
		var cont = document.getElementById('depositSubmitSpinnerLoader');
		cont.classList.remove('hidden');
		var reInstateHidden = function(){
			var cont2 = document.getElementById('depositSubmitSpinnerLoader');
			cont2.classList.add('hidden');
			Menu.depositSubmitButtonCoolDown = false;
		};
		setTimeout(reInstateHidden, 5000);
		ServerAPI.sendWalletAsPending();
	}
};

Menu.goToPlayScreen = function(){
	Menu.hideAllDivs();
	document.getElementById('playscreen').classList.remove('hidden');
};

Menu.goToSinglePlayScreen = function(){
	Menu.hideAllDivs();
	document.getElementById('playscreen_single').classList.remove('hidden');
};

Menu.goToVersusPlayScreen = function(){
	Menu.hideAllDivs();
	document.getElementById('playscreen_versus').classList.remove('hidden');
};

Menu.goToTableSelectionScreen = function(){
	ServerAPI.requestAvailableGames();
	Menu.hideAllDivs();
	document.getElementById('playscreen_versus_poker').classList.remove('hidden');
};

Menu.updateGameTableListings = function(data){
	//make new table element
	var tableContainer = document.getElementById('tableOfPokerRoomsContainer');
	tableContainer.innerHTML = '';
	var tableForPokerRooms = document.createElement('table');
	tableForPokerRooms.className = 'table-for-poker-table-listings';
	var headers = document.createElement('tr');
	var h0 = document.createElement('th');//
	h0.innerText = '   ';
	var h1 = document.createElement('th');//
	h1.innerText = 'Game';
	var h2 = document.createElement('th');//
	h2.innerText = 'Players';
	var h4 = document.createElement('th');//
	h4.innerText = 'Buyin';
	var h4_1 = document.createElement('th');//
	h4_1.innerText = 'Mobile';
	var h3 = document.createElement('th');//
	h3.innerText = 'Desc.';
	headers.appendChild(h0);
	headers.appendChild(h1);
	headers.appendChild(h2);
	headers.appendChild(h4);
	headers.appendChild(h4_1);
	headers.appendChild(h3);
	tableForPokerRooms.appendChild(headers);
	//Add rows
	for(var j = 0;j < data.tables.length;j++){
		var pokerRoomEntry = document.createElement('tr');
		pokerRoomEntry.className = 'entry-for-poker-table';
		pokerRoomEntry.setAttribute('onclick', 'ServerAPI.requestJoinRoom(\'' + data.tables[j].id + '\')');
		var hh0 = document.createElement('td');
		if(data.tables[j].p) hh0.innerHTML = '<img src=\'style/pin.png\'>';
		else hh0.innerHTML = '<a href=\'javascript:void(0)\'>' + '' + '</a>';
		var hh1 = document.createElement('td');
		hh1.innerHTML = '<a href=\'javascript:void(0)\'>' + data.tables[j].g + '</a>';
		var hh2 = document.createElement('td');
		hh2.innerHTML = '<a href=\'javascript:void(0)\'>' + data.tables[j].plys + '</a>';
		var hh4 = document.createElement('td');
		hh4.innerHTML = '<a href=\'javascript:void(0)\'>' + data.tables[j].b + '</a>';
		var hh4_1 = document.createElement('td');
		hh4_1.innerHTML = '<a href=\'javascript:void(0)\'>' + data.tables[j].m + '</a>';
		var hh3 = document.createElement('td');
		hh3.innerHTML = '<a href=\'javascript:void(0)\'>' + data.tables[j].d + '</a>';
		pokerRoomEntry.appendChild(hh0);
		pokerRoomEntry.appendChild(hh1);
		pokerRoomEntry.appendChild(hh2);
		pokerRoomEntry.appendChild(hh4);
		pokerRoomEntry.appendChild(hh4_1);
		pokerRoomEntry.appendChild(hh3);
		tableForPokerRooms.appendChild(pokerRoomEntry);
	}
	//Add table to the container
	tableContainer.appendChild(tableForPokerRooms);
};

//GO TO THE room
Menu.goToPokerTable = function(){
	Menu.hideAllDivs();
	document.getElementById('playscreen_tables').classList.remove('hidden');
};

Menu.leaveGameAndGoBackToSelection = function(){
	ServerAPI.leaveGame('gotogameselection');
};

Menu.updateGameRoom = function(t){
	var pokerTable = document.getElementById('roomContainerOne');
	//pokerTable.innerHTML = '';

	//pokerTable.appendChild(tableSeats);
};

Menu.goToAboutScreen = function(){
	ServerAPI.loadAboutPage();
	Menu.hideAllDivs();
	document.getElementById('aboutscreen').classList.remove('hidden');
};
