Nimiq Games - App Developer Environment
-------------------
Published by: Benjamin Hagel on October 2, 2018
-------------------
https://github.com/BenHagel/NimiqGamesAppDeveloper


How to setup the server:
-------------------
The local server is just a NodeJS application that uses the "express" framework.  To start the server, go to the root directory of the repo and assuming you have Node installed, type: 
"node server"

If there are errors, you may not have the library, so type:
"npm install"

By default the server is running on port 1337, so to access the test environment go to your web browser and visit the url:
"localhost:1337"


How to make a game:
------------------
(More details + tutorial video coming)
To make a game modify the files inside "games/MyGame/" folder.
Resources for the game are located in the "res/mygame/" folder.