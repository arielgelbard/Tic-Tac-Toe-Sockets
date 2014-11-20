// Require Native Node.js Libraries
var express = require('express');
var app = express();
var http = require('http'); //var http = require('http').Server(app) is the same thing as this line and the next;
http=http.Server(app);
var io = require('socket.io')(http);
var games=[]; //List of Game Rooms Running
var usernames=[]; //List of Users with there wanted Username
var guest=0;
// Route our Assets
app.use('/assets/', express.static(__dirname + '/public/assets/')); //when a file requests 

// Route our Home Page
app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html'); //when browser requests server
});

// Handle Socket Connection
io.on('connection', function(socketer){ //when a user connects with the server
	console.log('\n\n\n'); //create new line characters to make it easier to read the current status of the game rooms
	console.log('New User Joined, Showing New Status of Rooms'); //notify server admin of this news
	addUsertoGame(socketer.id); //When User Connects to the Server, it gets added to a game via this function
	usernames.push([socketer.id,'guest'+guest]);
	guest=guest+1;
	console.log(usernames);
	function enableGameForPlayers(userSent){ //this function passes a userid in and tells the user if they have to wait or if they can begin playing
		for (var i in games){ //goes through each game
			if (games[i].indexOf(userSent)!==-1){ //if the game contains the id (sent to this function via the userSent variable)
				var user=games[i].indexOf(userSent); //get the position where the users id is in the array
				var gameRoom=games[i]; //assign this variable the gameroom the id is currently in
				if(games[i].length==1){ //if there is only one id in the gameroom
					io.to(gameRoom[user]).emit('questionStartYet',false,false); //tell the user the game has not started yet
					break; //exit for loop
				}
				else{ //if the game room has two players in it
					if (user==1){ //if the users id is in position 1 in the game room
						io.to(gameRoom[0]).emit('questionStartYet',findUserId(userSent),true); //tell user game has began
						io.to(userSent).emit('questionStartYet',findUserId(gameRoom[0]),false); //tell user game has began
					}
					else{ //if the users id is in position 0 in the game room
						io.to(gameRoom[1]).emit('questionStartYet',findUserId(userSent),false); //tell user game has began
						io.to(userSent).emit('questionStartYet',findUserId(gameRoom[1]),true); //tell user game has began
					}

				}
			}
	  	}
	}

	enableGameForPlayers(socketer.id); //tells player if there is an opponent or not



	socketer.on('positionPicked',function(usersPositionPicked){  //the user told the server what position they picked
	  	for (var i in games){ //go through the rooms
	  		if (games[i].indexOf(socketer.id)==0){ //if the users id is found in a game room
	  			var gameRoom=games[i]; //reference users game room in variable
	  			io.to(gameRoom[1]).emit('updatePositionPicked',usersPositionPicked); //tell other player that the opponent picked a tile
	  			break; //break out of for loop because the game room was found
	  		}
	  		else if (games[i].indexOf(socketer.id)==1){ //if the users id is found in a game room
	  			var gameRoom=games[i]; //reference users game room in variable
	  			io.to(gameRoom[0]).emit('updatePositionPicked',usersPositionPicked); //tell other player that the opponent picked a tile
	  			break; //break out of for loop because the game room was found
	  		}
	  	}
	});


	socketer.on('disconnect', function() { //when a user leaves the page for any reason. Procedure goes as follows: user 0 disconnects, 0 is removed from game room, user 1 is told and has controls disabled
		for (var i in games){ //go through the rooms
			var user=games[i].indexOf(socketer.id); //get the position in the game room
			if (user!==-1){ //if the user exists in the game room
			  	removeUserFromGame(socketer.id); //remove the player from the game room

				//This Part Here is only for Users who have moved around to another game room
				if (games.length!==0){ //if there is more then 1 user in a game room still
					var gameRoom=games[i]; //reference the game room that the user was found in
					if(gameRoom!==undefined){ //if the game room still exists
						if (user===0){ //if the user that left had a position of 0 in the game room
							io.to(gameRoom[1]).emit('questionStartYet',false,false); //tell other player that the user left and disable game board
							enableGameForPlayers(gameRoom[1]); //determine if other player has been moved to another room and can begin playing
						}
						else if (user===1){ //if the user that left had a position of 1 in the game room
							io.to(gameRoom[0]).emit('questionStartYet',false,false); //tell other player that the user left and disable game board
							 enableGameForPlayers(gameRoom[0]); //determine if other player has been moved to another room and can begin playing
						}

					}		

				}
			} 
	  	}
	  	for (var i in usernames){
	  		var username=usernames[i];
	  		if (username[0]==socketer.id){
	  			usernames.splice(i,1);
	  			console.log(usernames);
	  			break;
	  		}
	  	}
	});


	socketer.on('customUserNameRequested', function(wantedUsername) {
		var isItTaken=false;
		for (var i in usernames){
			//checks to see if username was taken already
			if (usernames[i].indexOf(wantedUsername)!==-1){
				io.to(socketer.id).emit('customUserNameRequestedTaken',wantedUsername);				
				isItTaken=true;
				break;
			}
		}
		if (isItTaken==false){
			//Check if user already inputted a username and deletes it if they did
			for (var i in usernames){
				var username=usernames[i];
		  		if (username[0]===socketer.id){
		  			usernames.splice(i,1);
		  			break;
		  		}
			}
			usernames.push([socketer.id,wantedUsername]);
			io.to(socketer.id).emit('customUserNameRequestedSucess',wantedUsername);
		  	for (var i in games){ //go through the rooms
		  		if (games[i].indexOf(socketer.id)==0){ //if the users id is found in a game room
		  			var gameRoom=games[i]; //reference users game room in variable
		  			io.to(gameRoom[1]).emit('customUserNameRequestedAnswer',wantedUsername); //tell other player that the opponent picked a tile
		  			break; //break out of for loop because the game room was found
		  		}
		  		else if (games[i].indexOf(socketer.id)==1){ //if the users id is found in a game room
		  			var gameRoom=games[i]; //reference users game room in variable
		  			io.to(gameRoom[0]).emit('customUserNameRequestedAnswer',wantedUsername); //tell other player that the opponent picked a tile
		  			break; //break out of for loop because the game room was found
		  		}
		  	}
			// io.to(socketer.id).emit('updatePositionPicked',usersPositionPicked);
			console.log('Refreshed List');
			console.log(usernames);
		}
	});


});


function addUsertoGame(user){ 
	var userAlreadyAddedToGame=false; //declare variable to notify if user was added to an existing game room
	for (var i in games){ //go through the rooms
		if (games[i].length==1){
			userAlreadyAddedToGame=true;
			games[i].push(user);
			break;
		}
	}
	if (userAlreadyAddedToGame==false){ //if user wasn't added to an existing game room
		games.push([user]); //make a new game room
	}
	checkStatus(); //show server admin of what the game rooms look like
}

function removeUserFromGame(user){
	for (var i in games){ //go through the rooms
		var userInRoom=games[i].indexOf(user);
		if (userInRoom!==-1){
			games[i].splice(userInRoom,1);
			if (games[i].length==0){
				games.splice(i,1);
			}
			break;
		}
	}
	connectEachOther(); //execute this function to try and put user together with another user that are both in a game room by themselves
}

function connectEachOther(){
	var breakLoop=false;
	for (var i in games){ //go through the rooms
		if (games[i].length!==2){
			for (var i2 in games){ //go through the rooms again
				if (games[i2].length!==2&&i!==i2){
					breakLoop=true;
					games[i].push(games[i2][0]);
					//force reset of game board here for both parties
					games.splice(i2,1);
					break;
				}				
			}
		}
		if (breakLoop==true){
			break;
		}
	}
	console.log('\n\n\n'); //create new line characters to make it easier to read the current status of the game rooms
	console.log('NEED NEW STATUS');
	checkStatus(); //show server admin of what the game rooms look like
}

function checkStatus(){ //This function allows you to keep alerting an update on what the game rooms look like
	if (games.length==0){
		console.log('No One Playing Right Now');
	}
	for (var i in games){
		console.log('Game Room '+i+': '+games[i]);
	}	
}

// Start Server
http.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = http.address();
  console.log("Server started at", addr.address + ":" + addr.port);
});




function findUserId(user){
	var foundUser;
  	for (var i in usernames){
  		var username=usernames[i];
  		if (username[0]==user){
  			var userArray=usernames[i];
			foundUser=userArray[1];
  			break;
  		}
  	}
  	return foundUser;
}









  // socketer.on('',function(text){  //emit an update event that passes the text
  	  	// for (var i in games){
  	  	// 	if (games[i].indexOf(socketer.id)==0){
  	  	// 		var array=games[i];
  	  	// 		io.to(array[1]).emit('update',text);
  	  	// 		break;
  	  	// 	}
  	  	// 	else if (games[i].indexOf(socketer.id)==1){
  	  	// 		var array=games[i];
  	  	// 		io.to(array[0]).emit('update',text);
  	  	// 		break;
  	  	// 	}
  	  	// }
  	  	// io.emit('update',text); //server recieves message, and then sends it back out in a event called update
  // });



// }
  	  	// io.emit('update',text); //server recieves message, and then sends it back out in a event called update


  // console.log('A User Connected: %',socket);
 //  for (i = 0; i < pastMessages.length; i++) {
 //    	//io.in(socket).emit('update',pastMessages[i]);
 //    	io.to(socketer.id).emit('update',pastMessages[i]);
	// }

  // socketer.on('message',function(text){  //emit an update event that passes the text
  // 	console.log('Got disconnect2! '+socketer.id);
  // 	io.emit('update',text); //server recieves message, and then sends it back out in a event called update
  // 	pastMessages.push(text);
  // });






















//commands learned:
//sudo npm install -g gulp
//gulp   //this basically runs gulp, meaning it will compile jade files, less files, etc. (might have to use sudo)
//node server.js
//gulp watch // gulp watches to see if changes where made in any files