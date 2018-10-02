//Must be called 'GameSpecific'
var GameSpecific = {};
//If undefined, will assume false
GameSpecific.usesLib = 'p5js';//'pixi';//could be:   'threejs', 'pixi', 'p5js', 'other'
GameSpecific.gameName = 'bigbutton';
GameSpecific.gameResURL = ServerAPI.baseURL_game + '?g=' + GameSpecific.gameName + '&n=';

//Below this are variables that are different for each game
//
//TO DO
//


//Must be called "GameSpecific.setupGame"
GameSpecific.setupGame = function(data){
	GameSpecific.gso = {};
	GameSpecific.gso.theClickCounter = -1;
	//P5J.goodToRemoveCanvas = false;
	P5J.instance = new p5(
    GameSpecific.myGameInP5JS,
    'roomContainerOne'
  );
};

//The function that contains your game
GameSpecific.myGameInP5JS = function(p){
	//Game variables specific to my game
	var x = 88;
	var y = 1;
	var lDown = false;
	var rDown = false;
	var img = null;

	p.setup = function(){
		p.createCanvas(
			document.getElementById('roomContainerOne').offsetWidth,
			document.getElementById('roomContainerOne').offsetHeight,
			p.P2D//or p.WEBGL
		);
		p.frameRate(35);
		var gg = function(){
			console.log('GOOD LOAD <3_<3');
		};
		var bb = function(){
			console.log('BAD LOAD >:(');
		};
		//Load an image
		//img = p.loadImage(GameSpecific.gameResURL + 'bunnyboy.jpg', gg, bb);
		//console.log(GameSpecific.gameResURL + 'bunnyboy.jpg');
	}
	p.draw = function() {
    p.background(0);
		if(lDown) x--;
		if(rDown) x++;
    p.fill(255);
    p.rect(x, y, 50, 50);
		p.text(GameSpecific.gso.theClickCounter, 300, 40);
		p.push();
			p.translate(p.mouseX, p.mouseY);
			p.rect(0, 0, 30, 30);
		p.pop();
		
		//When it is false, remove
		if(!Menu.graphicalJSLibrary_Animating){
			try{P5J.instance.remove();}catch(err){console.log(err);}
			p.remove();
		}
  };

	//Functions to handle events that are caught by the P5JS library
	p.windowResized = function(){
		p.resizeCanvas(
			document.getElementById('roomContainerOne').offsetWidth,
			document.getElementById('roomContainerOne').offsetHeight,
		);
	};
	p.keyPressed = function(){
		if(p.keyCode === p.LEFT_ARROW){
			lDown = true;
		}
		else if(p.keyCode === p.RIGHT_ARROW){
			rDown = true;
		}
		else if(p.keyCode === p.UP_ARROW){
			GameWindow.makeMove(
				{'val': 3},
				GameSpecific.receiveResponseFromServerAfterMakingMove
			);
		}
	};
	p.keyReleased = function(){
		if(p.keyCode === p.LEFT_ARROW){
			lDown = false;
		}
		else if(p.keyCode === p.RIGHT_ARROW){
			rDown = false;
		}
	};
};

//This function is called once new data is received from the server
//Update
GameSpecific.receiveNewGameStateData = function(data){
	GameSpecific.gso.theClickCounter = data.gameState.currentTable.cc;
};

//This function is called when the player requests a move to the server,
//and gets a response back, usually dont have to do anything in this
//function, if you dont need the user's game to be updated as soon as
//they make a move
GameSpecific.receiveResponseFromServerAfterMakingMove = function(data){
	//GameSpecific.receiveNewGameStateData(data);
	//console.log(JSON.stringify(data));
};

//This function only called once a second,
//and only when 'GameSpecific.usesLib' === 'other'
//'data' variable is from server
GameSpecific.animateHTML = function(data){
	//gameArea.innerHTML = inf;
};
