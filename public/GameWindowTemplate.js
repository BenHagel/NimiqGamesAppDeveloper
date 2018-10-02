var GameWindow = {};
//GameWindow.url = '';
//var TJS = {}; //ThreeJS
//var PIX = {}; //PixiJS
var P5J = {};//P5JS

GameWindow.startGame = function(usesLib){
  if(usesLib === 'threejs'){
    GameWindow.setupThreeJS();
    //Call the game specific setup stuff
    GameSpecific.setupGame();
    //Start animating
    GameWindow.animate3JS();
  }
  else if(usesLib === 'pixi'){
    GameWindow.setupPixi();
    //Call the game specific setup stuff
    GameSpecific.setupGame();
    //Start updating the pixi canvas
    GameSpecific.animatePixi();
  }
  else if(usesLib === 'p5js'){
    GameWindow.setupP5JS();
    //Call the game specific setup stuff
    GameSpecific.setupGame();
    //Start updating the pixi canvas
    //GameSpecific.animateP5JS(); <- NOT CALLED - embedded in setupGame^
  }
  else if(usesLib === 'other'){ //'other' falls into here
    GameWindow.setupOtherGraphicsLibrary();
    //Call the game specific setup stuff
    GameSpecific.setupGame();
    //Start updating graphical element
    //GameWindow.animateHTML(); <- NOT CALLED - this now updates once a second from serverAPI. calls
  }
  else{
    //error????????????/
    console.log('Undefined -usesLib- ?: ' + usesLib);
  }
};



GameWindow.setupP5JS = function(){

};
GameWindow.setupOtherGraphicsLibrary = function(){

};



/*
GameWindow.setupThreeJS = function(){
  //The dimensions
	TJS.w = document.getElementById('roomContainerOne').offsetWidth;
	TJS.h = document.getElementById('roomContainerOne').offsetHeight;
  //The camera
	TJS.camera = new THREE.PerspectiveCamera(70, TJS.w / TJS.h, 0.01, 10);
	TJS.camera.position.z = 1;
	//The Scene
	TJS.scene = new THREE.Scene();

	TJS.renderer = new THREE.WebGLRenderer({antialias: true});
	TJS.renderer.setSize(TJS.w, TJS.h);

	//Add the element fo the container
	TJS.renderer.domElement.setAttribute('id', 'canvasElementGeneratedByGraphicsLibrary');
	var elToAdd = document.getElementById('roomContainerOne');
	elToAdd.appendChild(TJS.renderer.domElement);
	Menu.graphicalJSLibrary_Animating = true;
	GameWindow.loadImages();
};

GameWindow.setupPixi = function(){
  var elToAdd = document.getElementById('roomContainerOne');
  elToAdd.innerHTML = '';
  PIX.app = new PIXI.Application(800, 600, {backgroundColor : 0x1099bb});
  PIX.app.view.setAttribute('id', 'canvasElementGeneratedByGraphicsLibrary');
  elToAdd.appendChild(PIX.app.view);
};


GameWindow.animate3JS = function(){
  animate();
  function animate() {
    var idOfFrame = requestAnimationFrame(animate);
    if(Menu.graphicalJSLibrary_Animating === false){
      cancelAnimationFrame(idOfFrame);
    }
    GameSpecific.animate3JS();

    //GameSpecific.mesh.rotation.x += 0.01;
    //GameSpecific.mesh.rotation.y += 0.02;

    TJS.renderer.render(TJS.scene, TJS.camera);
  }
};*/

GameWindow.dispatchDataToHTMLAnimator = function(data){
  //Animate apps
  if(GameSpecific.usesLib === 'p5js' ||
    GameSpecific.usesLib === 'threejs' ||
      GameSpecific.usesLib === 'pixi'){
    GameSpecific.receiveNewGameStateData(data);
  }
  //Just html apps
  else if(GameSpecific.usesLib === 'other'){
    GameSpecific.animateHTML(data);
  }
};

GameWindow.makeMove = function(data, callback){//data is a string
  ServerAPI.makeMove(data, callback);
};

/*
GameWindow.loadImage = function(img, ur){
	// instantiate a loader
	var loader = new THREE.ImageLoader();
	// load a image resource
	loader.load(
	// resource URL
	ur,
	// onLoad callback
	function (image) {
			// use the image, e.g. draw part of it on a canvas
		},
		// onProgress callback currently not supported
		undefined,
		// onError callback
		function () {
			console.error('An error happened.');
		}
	);
};

GameWindow.loadImages = function(data){
	//GameWindow.loadImage(GameSpecific.imageOne, 'http://localhost:1337/getres');
};
*/
