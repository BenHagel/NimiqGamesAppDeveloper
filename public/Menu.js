var Menu = {};

Menu.screen = '';// <- not used atm
Menu.divs = ['playscreen_versus_poker', 'playscreen_tables'
];
//Notificatoins
Menu.notifQueue = [];
// game
Menu.thisRoomID = '';
//Game scripts, and the html tags
Menu.game_script = {};
//Graphics Library
Menu.graphicalJSLibrary_Animating = true;

Menu.hideAllDivs = function(){
	for(var tt = 0;tt < Menu.divs.length;tt++)
		document.getElementById(Menu.divs[tt]).classList.add('hidden');
};

Menu.goToHomeScreen = function(){
	Menu.addNotif('Disabled for app dev environment', 2);
};
Menu.leaveGameAndGoBackToSelection = function(){
	ServerAPI.leaveGame('gotogameselection');
};

Menu.initer = function(){
	window.onbeforeunload = function(){
		return true;
	};
	window.addEventListener('resize', function(){}, false);
	Menu.notifTicker();
	Menu.goToTableSelectionScreen();
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
