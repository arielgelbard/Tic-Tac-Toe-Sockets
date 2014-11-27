//==============================================
//    Chatroulette Tic Tac Toe: Server Side
//            By: Ariel Gelbard
//            November 20, 2014
//==============================================

// Require Native Node.js Libraries
var express = require('express'); //get express library
var app = express(); //declare express via app variable
var http = require('http'); //get http library
http = http.Server(app); //var http = require('http').Server(app) is the same thing as this line and the next;
var io = require('socket.io')(http); //get socket.io library
var games = []; //List of Game Rooms Running
var usernames = []; //List of Users with there wanted Username
var guest = 0; //username guest count variable
var filter = require('bad-words');
var customFilter = new filter.Factory({ placeHolder: '*'});
// Route our Assets
app.use('/assets/', express.static(__dirname + '/public/assets/')); //when a file is requested via the assets folder, redirect them to the public/assets folder

// Route our Home Page
app.get('/', function(req, res){ //when a file is requested via the main url
  res.sendFile(__dirname + '/public/index.html'); //redirect them to the public folder
});

// Handle Socket Connection
io.on('connection', function(socketer){ //when a user connects with the server
	console.log('\n\n'); //create new line characters to make it easier to read the current status of the game rooms
	console.log('New User Joined, Showing New Status of Rooms'); //notify server admin of this news
	addUsertoGame(socketer.id); //When User Connects to the Server, it gets added to a game via this function
	usernames.push([socketer.id, 'guest' + guest]); //add standard username to list
	io.to(socketer.id).emit('customUserNameRequestedSucess','guest'+guest);	
	guest = guest + 1; //append guest count variable to create new username
	var alreadyPlayedUsersList=[]; //list of users that they faced already

	//this function passes a userid in and tells the user if they have to wait or if they can begin playing
	function enableGameForPlayers(userSent){
		for (var i in games){ //goes through each game
			if (games[i].indexOf(userSent) !== -1){ //if the game contains the id (sent to this function via the userSent variable)
				var user = games[i].indexOf(userSent); //get the position where the users id is in the array
				var gameRoom = games[i]; //assign this variable the gameroom the id is currently in
				if(games[i].length == 1){ //if there is only one id in the gameroom
					//ERROR WITH THIS LINE?!
					io.to(gameRoom[user]).emit('questionStartYet', false, false); //tell the user the game has not started yet
					break; //exit for loop
				}
				else{ //if the game room has two players in it
					if (user == 1){ //if the users id is in position 1 in the game room
						io.to(gameRoom[0]).emit('questionStartYet', findUserId(userSent), true); //tell user game has began
						io.to(userSent).emit('questionStartYet', findUserId(gameRoom[0]), false); //tell user game has began
					}
					else{ //if the users id is in position 0 in the game room
						io.to(gameRoom[1]).emit('questionStartYet', findUserId(userSent), false); //tell user game has began
						io.to(userSent).emit('questionStartYet', findUserId(gameRoom[1]), true); //tell user game has began
					}
						io.to(gameRoom[1]).emit('addToAlreadyPlayedList', findUserId(userSent)); //tell user game has began
						io.to(userSent).emit('addToAlreadyPlayedList', findUserId(gameRoom[1])); //tell user game has began					
				}
			}
	  	}
	}

	enableGameForPlayers(socketer.id); //tells player if there is an opponent or not

	//When the client has picked a tile
	socketer.on('positionPicked', function(usersPositionPicked){  //the user told the server what position they picked
	  	for (var i in games){ //go through the rooms
	  		if (games[i].indexOf(socketer.id) == 0){ //if the users id is found in a game room
	  			var gameRoom = games[i]; //reference users game room in variable
	  			io.to(gameRoom[1]).emit('updatePositionPicked', usersPositionPicked); //tell other player that the opponent picked a tile
	  			break; //break out of for loop because the game room was found
	  		}
	  		else if (games[i].indexOf(socketer.id) == 1){ //if the users id is found in a game room
	  			var gameRoom = games[i]; //reference users game room in variable
	  			io.to(gameRoom[0]).emit('updatePositionPicked', usersPositionPicked); //tell other player that the opponent picked a tile
	  			break; //break out of for loop because the game room was found
	  		}
	  	}
	});

	//when the client leaves the website (disconnects)
	socketer.on('disconnect', function() { //when a user leaves the page for any reason. Procedure goes as follows: user 0 disconnects, 0 is removed from game room, user 1 is told and has controls disabled
		var opponent;
		for (var i in games){ //go through the rooms
			var user = games[i].indexOf(socketer.id); //get the position in the game room
			if (user !== -1){ //if the user exists in the game room
				//This Part Here is only for Users who have moved around to another game room
				if (games.length !== 0){ //if there is more then 1 user in a game room still
					var gameRoom = games[i]; //reference the game room that the user was found in
					if(gameRoom !== undefined){ //if the game room still exists
						if (user === 0){ //if the user that left had a position of 0 in the game room
							opponent=gameRoom[1]; //assign opponent to send off
						}
						else if (user === 1){ //if the user that left had a position of 1 in the game room
							opponent=gameRoom[0]; //assign opponent to send off
						}
						io.to(opponent).emit('questionStartYet', false, false); //tell other player that the user left and disable game board
					}		
				}
			  	removeUserFromGame(socketer.id,[]); //remove the player from the game room				
				enableGameForPlayers(opponent); //determine if other player has been moved to another room and can begin playing
			} 
	  	}
	  	for (var i in usernames){ //go through the username list
	  		var username = usernames[i]; //assign current username array to variable
	  		if (username[0] == socketer.id){ //once the id is found in the usernames list
	  			usernames.splice(i, 1); //delete username from list
	  			break; //exit for loop
	  		}
	  	}
	});

	//when user clicks next button
	socketer.on('nextPlayer', function() { //when a user leaves the page for any reason. Procedure goes as follows: user 0 disconnects, 0 is removed from game room, user 1 is told and has controls disabled
		console.log('\n\nnextPlayerInitiated');
		// console.log('USER THAT CLICKED IT:'+alreadyPlayedUsersList);
		// var opponent='';
		// for (var i in games){ //go through the rooms
		// 	var br=false;
		// 	var room=games[i];
		// 	var user = room.indexOf(socketer.id); //get the position in the game room
		// 	if (user !== -1){ //if the user exists in the game room
		// 		alreadyPlayedUsersList.push(room[0]);
		// 		var transferSucess=false;
		// 		var userInGameRoom=room[user];
		// 		for (var i in games){ //go through the rooms
		// 			var room2=games[i];
		// 			if (room2.length==1 && alreadyPlayedUsersList.indexOf(room2[0]) == -1){
		// 				room.splice(user, 1);
		// 				console.log("TRANSFER TRUE");
		// 				// if (room2.length==0){
		// 				// 	games.splice(i,1);
		// 				// }
		// 				room2.push(userInGameRoom);
		// 				io.to(room[0]).emit('addToAlreadyPlayedList', userInGameRoom); //tell other player that the user left and disable game board			

		// 				io.to(userInGameRoom).emit('questionStartYet', false, false); //tell other player that the user left and disable game board
		// 				io.to(room[0]).emit('questionStartYet', false, false); //tell other player that the user left and disable game board			
		// 				enableGameForPlayers(userInGameRoom);
		// 				br=true;
		// 				transferSucess=true;
		// 				break;
		// 			}

		// 		}
		// 		if (transferSucess==false){
		// 			games.push([userInGameRoom]);
		// 			console.log("TRANSFER FALSE");
		// 				// if (room.length==0){
		// 					// games.splice(room,1);
		// 				// }
		// 			io.to(room[0]).emit('addToAlreadyPlayedList', userInGameRoom); //tell other player that the user left and disable game board			

		// 			room.splice(user, 1);
		// 			io.to(room[0]).emit('questionStartYet', false, false); //tell other player that the user left and disable game board
		// 			io.to(room[0]).emit('questionStartYet', false, false); //tell other player that the user left and disable game board
		// 			br=true;
		// 		}
				
		// 	}	
		// 	if (br===true){
		// 		break;				
		// 	}
		// }
		console.log('\n\nnextPlayerCOMPLETED');
		checkStatus();
				//This Part Here is only for Users who have moved around to another game room
		// 		if (games.length !== 0){ //if there is more then 1 user in a game room still
		// 			var gameRoom = games[i]; //reference the game room that the user was found in
		// 			if(gameRoom !== undefined){ //if the game room still exists
		// 				if (user === 0){ //if the user that left had a position of 0 in the game room
		// 					opponent=gameRoom[1]; //assign opponent to send off
		// 				}
		// 				else if (user === 1){ //if the user that left had a position of 1 in the game room
		// 					opponent=gameRoom[0]; //assign opponent to send off
		// 				}
		// 			}
		// 		}
				
		// 	  	removeUserFromGame(socketer.id, alreadyPlayedUsersList); //remove the player from the game room				
		// 		enableGameForPlayers(opponent); //determine if other player has been moved to another room and can begin playing
		// 	} 
	 //  	}
	});

	socketer.on('initAddToAlreadyPlayedList', function(user) {
		// alreadyPlayedUsersList.push(user);
		console.log(alreadyPlayedUsersList);
	});

	//When the client requests a new username
	socketer.on('customUserNameRequested', function(wantedUsername) {
		var isItTaken = false; //variable established if inside the for loop the name has been taken
		for (var i in usernames){
			//checks to see if username was taken already
			if (usernames[i].indexOf(wantedUsername) !== -1){ //if the username is found in the username list
				io.to(socketer.id).emit('customUserNameRequestedTaken', wantedUsername); //tell client that requested it that the username was taken	
				isItTaken = true; //change variable indicating that username was taken
				break; //exit for loop
			}
		}
		if (isItTaken == false){ //if the username wasnt taken
			//Check if user already inputted a username and deletes it if they did
			for (var i in usernames){ //go through the username list
				var username = usernames[i]; //assign current username array to variable
		  		if (username[0] === socketer.id){ //find the clients id
		  			usernames.splice(i, 1); //remove the clients id from the username list
		  			break; //exit for loop
		  		}
			}
			usernames.push([socketer.id, wantedUsername]); //add username and client id to username list
			io.to(socketer.id).emit('customUserNameRequestedSucess', wantedUsername); //tell client the username was successfully changed
		  	for (var i in games){ //go through the rooms
		  		if (games[i].indexOf(socketer.id) == 0){ //if the users id is found in a game room
		  			var gameRoom=games[i]; //reference users game room in variable
		  			io.to(gameRoom[1]).emit('customUserNameRequestedAnswer', wantedUsername); //tell other player that the opponent picked a tile
		  			break; //break out of for loop because the game room was found
		  		}
		  		else if (games[i].indexOf(socketer.id) == 1){ //if the users id is found in a game room
		  			var gameRoom = games[i]; //reference users game room in variable
		  			io.to(gameRoom[0]).emit('customUserNameRequestedAnswer', wantedUsername); //tell other player that the opponent picked a tile
		  			break; //break out of for loop because the game room was found
		  		}
		  	}
			console.log('\n\nRefreshed List'); //log to server that list has been changed
			console.log(usernames); //log username list
		}
	});

	//Sending Chat Messages
	socketer.on('messageToOpponent', function(msg) {
	  	io.to(socketer.id).emit('messageClean', customFilter.clean(msg)); //clean message and send back to the client
	  	for (var i in games){ //go through the rooms
	  		if (games[i].indexOf(socketer.id) == 0){ //if the users id is found in a game room
	  			var gameRoom = games[i]; //reference users game room in variable
	  			io.to(gameRoom[1]).emit('messageToOpponentReply', customFilter.clean(msg)); //tell other player that the opponent picked a tile
	  			break; //break out of for loop because the game room was found
	  		}
	  		else if (games[i].indexOf(socketer.id) == 1){ //if the users id is found in a game room
	  			var gameRoom = games[i]; //reference users game room in variable
	  			io.to(gameRoom[0]).emit('messageToOpponentReply', customFilter.clean(msg)); //tell other player that the opponent picked a tile
	  			break; //break out of for loop because the game room was found
	  		}
	  	}		
	});

});

//Game Room Database Functionality
//Add User To Game Room
function addUsertoGame(user){ 
	var userAlreadyAddedToGame = false; //declare variable to notify if user was added to an existing game room
	for (var i in games){ //go through the rooms
		if (games[i].length == 1){ //if there is a game room with one user
			userAlreadyAddedToGame = true; //indicate user was added to a room
			games[i].push(user); //add user to room
			break; //exit for loop
		}
	}
	if (userAlreadyAddedToGame == false){ //if user wasn't added to an existing game room
		games.push([user]); //make a new game room
	}
	checkStatus(); //show server admin of what the game rooms look like
}

//Delete User from Game Room
function removeUserFromGame(user){
	for (var i in games){ //go through the rooms
		var userInRoom = games[i].indexOf(user); //assign specific room
		if (userInRoom !== -1){ //if the user exists in the game room
			games[i].splice(userInRoom, 1);//remove user from game room
			if (games[i].length == 0){ //if the game room is empty
				games.splice(i, 1); //delete game room
			}
			break; //exit for loop
		}
	}
	connectEachOther(); //execute this function to try and put user together with another user that are both in a game room by themselves
}

//Merge Game Rooms Together
function connectEachOther(){
	var breakLoop = false;
	for (var i in games){ //go through the rooms
		if (games[i].length !== 2){ //if a game room doesn't contain two players
			for (var i2 in games){ //go through the rooms again
				var player = games[i]; //
				if (games[i2].length !== 2 && i !== i2){ //if the game room doesn't contain two players and is not the same empty game room as before and if the player hasnt played them before
					breakLoop = true; //enable the outside for loop to exit
					games[i].push(games[i2][0]); //put the user in the second game room into the first game room
					games.splice(i2, 1); //delete the other game room
					break; //exit for loop
				}				
			}
		}
		if (breakLoop == true){ //if break outside loop is true
			break; //exit outside for loop
		}
	}
	console.log('\n\n'); //create new line characters to make it easier to read the current status of the game rooms
	checkStatus(); //show server admin of what the game rooms look like
}

//Logs the Status of the Game Rooms on the Server
function checkStatus(){ //This function allows you to keep alerting an update on what the game rooms look like
	if (games.length == 0){ //if no one is playing games on the server
		console.log('No One Playing Right Now'); //logs that no one is on the server
	}
	for (var i in games){ //go through each game rooms
		console.log('Game Room ' + i + ': ' + games[i]); //log game room
	}	
}

//Finds Users Socket ID
function findUserId(user){
	var foundUser; //declare variable to return back
  	for (var i in usernames){ //go through usernames list
  		var username = usernames[i]; //assign username to variable
  		if (username[0] == user){ //if the user id was found in the object
  			var userArray = usernames[i]; //assign username list object
			foundUser = userArray[1]; //assign found user from the list object
  			break; //exit for loop
  		}
  	}
  	return foundUser; //return the user that was found in the game list
}

// Start Server
http.listen(process.env.PORT || 3000, process.env.IP || '0.0.0.0', function(){ //listen for gets at the certain ip address
  var addr = http.address(); //assign ip address object to variable
  console.log('Server started at', addr.address + ':' + addr.port); //log objects ip address and port to server admin
});