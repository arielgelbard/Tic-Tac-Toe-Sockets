//==============================================
//   Chatroulette Tic Tac Toe: Client Side
//            By: Ariel Gelbard
//            November 20, 2014
//==============================================

// var app = function(){

// Wait for DOM to Load
jQuery(function($) {

    // Create New Socket Connection using Socket.io
    var socket = io();

    //Create Reference to Board Background
    var boardBackground = document.getElementsByClassName("board")[0]; //reference for accessing the tic tac toe board

    function xTile () { //X Tile
        this.cssClass = "tileBackgroundX"; //Class to access Radial Background
        this.fontColor = "#A10000"; //Font Colour
        this.text = "x"; //Tile Name
    };

    function oTile () { //O Tile
        this.cssClass = "tileBackgroundO"; //Class to access Radial Background
        this.fontColor = "#002BE3"; //Font Colour
        this.text = 'o'; //Tile Name
    };

    function gTile () { //General Tile
        this.element = document.createElement('li'); //creates li element
        this.cssClass = "tileBackgroundG"; //Class to access Radial Background
        this.clickFunction = tileClicked; //Assigned Tile Function
    };

    //Generate Tic Tac Toe Spaces
    for (var i = 1; i<10; i++) { //create 9 tiles
        var templateTile = new gTile(); //make new template file
        var tile = templateTile.element; //create an li element
        tile.className = templateTile.cssClass; //Add background from css class
        tile.onclick = templateTile.clickFunction; //when a tile is clicked, tileClicked will be activated
        tile.i = i; //make tile a number
        if (i<7) {
            tile.style.borderBottom = "3px solid white"; //making the gameboard look like tiles by having diving lines
        }
        if (i === 3 ||  i === 6 ||  i === 9){ //if it is tiles 3, 6, or 9
            //Nothing Happens
        }
        else {
            tile.style.borderRight = "3px solid white"; //making the gameboard look like tiles by having diving lines
        }
        boardBackground.appendChild(tile); //add to board
    }

    //Makes Tic Tac Toe Game Responsive
    function responsiveGame () {
        if (window.innerWidth > 590){ //if the users browser is more then 590px wide, then:
            var tiles = document.getElementsByTagName("li"); //Grabs all the tiles that were made when the app was created
            for (var i = 0; i<tiles.length; i++) { //go through each tile
                    tiles[i].style.width = 190 + "px"; //adjust tiles width
                    tiles[i].style.height = 190 + "px"; //adjust tiles height
                    tiles[i].style.lineHeight = 180 + "px"; //adjust tiles line height
            }
            boardBackground.style.width = 590 + "px"; //adjust width and height of the boards background
        }
        else{
            var tiles = document.getElementsByTagName("li"); //Grabs all the tiles that were made when the app was created
            for (var i = 0;i<tiles.length; i++){ //go through each tile
                    tiles[i].style.width = (window.innerWidth / 3.2) + "px"; //adjust tiles width
                    tiles[i].style.height = (window.innerWidth / 3.2) + "px"; //adjust tiles height
                    tiles[i].style.lineHeight = ((window.innerWidth / 3.2) - 20) + "px"; //adjust tiles line height
            }
            boardBackground.style.width = ((window.innerWidth / 3.2) * 3) + 6 + 'px'; //adjust width and height of the boards background
        }
    }

    responsiveGame(); //call function to adjust dimensions for users browser

    //Listens to see if the window has been resizes
    window.addEventListener ("resize", function () {
        responsiveGame(); //Activates responsiveSize Class
    });

    //disables tiles from being clicked accidently
    function disableTiles(answer){
        var tiles = document.getElementsByTagName("li"); //reference all tiles
        for (var i = 0; i<tiles.length; i++){ //go through each tile
            tiles[i].onclick = null; //disable tile being clicked
        }
    }

    //This disables certain tiles that have already been clicked
    function disableCertainTiles(){ 
        var tiles = document.getElementsByTagName("li"); //reference all tiles
        for (var i = 0; i<tiles.length; i++){ //go through each tile
            if (x.indexOf(tiles[i].i) !== -1||o.indexOf(tiles[i].i) !== -1){ //if the tile has been clicked on by the opponent or client
                tiles[i].onclick = null; //disable click event
            }
            else{ //if the client or opponent did not click the tile
                tiles[i].onclick = tileClicked; //disable tile being clicked
            }
        }           
    }

    function resetWhosX(){ //determines which user should be x and which should be o
        resetBoard(); //reset board
        if (whosX == true){ //whoever is x
            whosX = false; //make them not x
            whosO = true; //make them o
            document.getElementById("status").innerText = "Opponent Goes First!"; //reset actual status text
            disableTiles(); //disable tiles from being clicked because client is starting
        }
        else if (whosO == true){ //whoever is o
            whosX = true; //make them not o
            whosO = false; //make them x
            document.getElementById("status").innerText = "You Go First!"; //reset actual status text
        } 
    }

    //Reset Tic Tac Toe Board
    function resetBoard () {
        // document.getElementById("status").style.cursor = "auto"; //reset cursor on status bar
        // document.getElementById("status").innerText = "BEGIN!"; //reset actual status text
        // document.getElementById("status").onclick = ''; //disable click functionality
        // document.getElementById("status").style.pointer = 'default'; //make pointer regualr again
        // document.getElementById("status").style.color = 'black'; //change color back to black
        var tiles = document.getElementsByTagName("li"); //reference all tiles
        var templateTile = new gTile(); //establishes new tile to grab attributes from
        for (var i=0; i<tiles.length; i++){ //loop through all tiles and reset
            tiles[i].innerText = ""; //reset value of tile
            tiles[i].className = templateTile.cssClass; //reset background of tile
            tiles[i].onclick = templateTile.clickFunction; //reset click event on tile
        }
        x = []; //clear tiles x player chose
        o = []; //clear tiles o player chose
        count = 1; //reset count
        turn = 0; //reset players turn
    }

    var postMessge=function(msg){ //post messages to the message box
        document.getElementById('messagePosted').innerHTML = document.getElementById('messagePosted').innerHTML+msg+'<br>'; //append message to the message box
        document.getElementById('messagePosted').scrollTop = document.getElementById('messagePosted').scrollHeight; //scroll to bottom of the messages box
    }
    
    //Tells user if there is a game to play or if there is no opponent
    socket.on('questionStartYet', function(opponent,whoBegins){
        resetBoard(); //reset game board
        disableTiles(); //disable tiles from being clicked
        if (opponent == false){ //if there is no opponent
            document.getElementById("status").innerHTML = "No Opponent Yet";
            document.getElementById('messagePosted').innerHTML ='';
            document.getElementById("opponentName").innerText = 'Opponent';
        }
        else{ //if there is an opponent
            postMessge("You are now facing: " + opponent); //tell user they are facing an opponent
            opponentUsername = opponent;
            document.getElementById("opponentName").innerText = opponent;
            if (whoBegins == true){ //if this client is the one who begins
                disableCertainTiles(); //disable tiles to start
                document.getElementById("status").innerText = "You get to Start! Begin!"; //alert user they can start
                whosX = true; //since they start, they are x
                whosO = false; //they are not o
            }
            else{ //if this client does not begin
                document.getElementById("status").innerText = "Opponent Starts!"; //alert user that the opponent is starting
                whosO = true; //since they don't start, they are o
                whosX = false; //they are not x
            }
        }
    });

    //Variables Needed
    var turn = 0; //Is is Xs or Os Turn?
    var count = 1; //Counts to see if all 9 spots have been filled
    var computerON = false; //can play with a friend or a computer
    // var gameBeganWithX = true; //holds value of true saying x started with player 1
    var x = []; //What Spots X has chosen during the game
    var o = []; //What Spots O has chosen during the game
    // var xScore = 0; //X's Current Score
    // var oScore = 0; //O's Current Score
    var myUsername; //puts this clients username in variable
    var opponentUsername; //puts opponents name in variable
    var whosX = 0; //determines who is x
    var whosO = 0; //determines who is o
    var myScore = 0; //keep current score of this client
    var opponentScore = 0; //keeps current score of the opponent
    var catsGameScore = 0; //keeps track of cats game score

    socket.on('updatePositionPicked', function(choice){ //when the opponent makes a move
        tileRecieved(choice); //tell the client that the opponent made a choice
    });

    var ifUserClickedTile=true; //variable to indicate which client clicked a tile
    function tileRecieved(tile){ //tell the client that the opponent made a choice
        var tiles = document.getElementsByTagName("li"); //reference all tiles
        for (var i = 0; i<tiles.length; i++){ //go through each tile
            if (tiles[i].i.toString() == tile.toString()){ //if the tile picked by the opponent matches the tile on the client
                ifUserClickedTile = false; //let next function know that the opponent clicked the tile
                disableCertainTiles(); //disable certain tiles clicked
                tiles[i].click(); //initiate click on tile that the opponent chose
                break; //exit for loop
            }
        }
    }

    //Tells opponent that the client picked a tile
    function emitAnswer(choice){
        socket.emit('positionPicked', choice); //pass message to server!
        disableCertainTiles(); //disable certain tiles clicked
    }

    //When Tile is Clicked
    function tileClicked() {
        var tileChosen = this; //make this variable the actual tile clicked
        if (ifUserClickedTile == false){ //if the opponent clicked the tile
            ifUserClickedTile = true; //change value back to allow current client to click tile
            disableCertainTiles(); //disable certain tiles
            document.getElementById("status").innerText = "Your Turn!";
        }
        else{ //if the client clicked a tile
            emitAnswer(tileChosen.i); //tell server to tell opponent that they picked a tile
            disableTiles(); //disable current client from picking anymore tiles
            document.getElementById("status").innerText = "Opponents Turn!"; //tell client that its the opponents turn to click
        }
        if(turn === 0){ //if its x's turn
            var tile = new xTile();
            tileChosen.className = tile.cssClass; //change background colour of tile
            tileChosen.style.color = tile.fontColor; //change text color of tile
            tileChosen.innerText = tile.text; //change inner text of tile to x
            turn = 1; //change turn to be o's next time
            x.push(this.i); //add value to x's array
        }
        else{ //if its o's turn
            var tile = new oTile();
            tileChosen.className = tile.cssClass; //change background colour of tile
            tileChosen.style.color = tile.fontColor; //change text color of tile
            tileChosen.innerText = tile.text; //change inner text of tile to o
            turn = 0; //change turn to be x's next time
            o.push(this.i); //add value to x's array
        }
        check(); //check to see who won, lost, or tied
    }

    //Check to see who won, lost, or tied
    function check(){
        var won = false; //Value changes to true if a player wins
        var combinations = [[1,2,3],[4,5,6],[7,8,9],[1,4,7],[2,5,8],[3,6,9],[1,5,9],[3,5,7]]; //holds all possible combinations that any opponent can do to win
        for (var i = 0; i<combinations.length; i++){ //loops through and checks to see if any oponent had a possible combination
            var selectedCombo = combinations[i]; //grabs one combination to check
            var numberOfTilesMatchedX = 0; //needed to see if any tiles match the selected combination for x
            var numberOfTilesMatchedO = 0; //needed to see if any tiles match the selected combination for o
            for (var j = 0; j<selectedCombo.length; j++){//loops through each selected combo number                                  //'combnations' was put here instead of 'selectedCombo'
                if(x.indexOf(selectedCombo[j]) !== -1){//if the number from the selected combo is the same as a number in x's chosen spots array
                    numberOfTilesMatchedX++; //total number of matched tiles increments by 1
                }
                if(o.indexOf(selectedCombo[j]) !== -1){ //if the number from the selected combo is the same as a number in o's chosen spots array
                    numberOfTilesMatchedO++; //total number of matched tiles increments by 1
                }       
            }
            var tiles = document.getElementsByTagName("li"); //reference tiles from board
            if (numberOfTilesMatchedX === 3){ //Check to see if X Player Won
                won = true; //change value to true because X player won    
                if (whosX == true){ //if the client is x
                    myScore = myScore + 1; //increase score by 1
                    document.getElementById("meScore").innerHTML = myScore; //readjust score board
                }
                else{ //if the opponent is o
                    opponentScore = opponentScore + 1; //increase score by 1
                     document.getElementById("oScore").innerHTML = opponentScore; //readjust score board
                }
                document.getElementById("status").innerHTML = "X Won! Rematch?"; //tell everyone that x won
                var t=setTimeout(function(){resetWhosX();},1000); //players swtich whoever is x and whoever is o
            }
            else if (numberOfTilesMatchedO === 3){ //Check to see if O Player Won
                won = true; //change value to true because O player won      
                if (whosX == true){ //if the client is x
                    myScore = myScore + 1; //increase score by 1
                     document.getElementById("meScore").innerHTML = myScore; //readjust score board
                }
                else{ //if the opponent is x
                    opponentScore = opponentScore + 1; //increase score by 1
                     document.getElementById("oScore").innerHTML = opponentScore; //readjust score board
                }
                document.getElementById("status").innerHTML = "O Won! Rematch?"; //tell everyone that o won
                var t=setTimeout(function(){resetWhosX();},1000); //players swtich whoever is x and whoever is o
            }
            if (numberOfTilesMatchedX === 3 || numberOfTilesMatchedO === 3) break; //if anybody won, exit out of for loop to avoid checking anymore combinations
        }
        if (count === 9 && won === false){ //if all tiles are selected and nobody has won then:
            catsGameScore = catsGameScore + 1; //increase catsgame score
            document.getElementById("catsScore").innerHTML = catsGameScore; //update scoreboard
            document.getElementById("status").innerHTML = "Cats Game!"; //tell users the status of the game
            resetWhosX(); //players swtich whoever is x and whoever is o
        }
        else if (won === false){ //if all tiles are not selected:
            count++; //increment the total number of tiles selected variable
        }
        // if (turn === 1 && won === false && count !== 9 && computerON === true) { //if user just selected a tile
        //     computerChoose(); //its the computer turn to select a tile
        // }
    }

    //Notify and Update NickNames
    $('#requestName').on('click',function(){ //when the request username button is clicked
        socket.emit('customUserNameRequested', $('#desiredUserName').val()); //pass desired username to server
    });

    socket.on('customUserNameRequestedAnswer', function(response){ //server tells client that opponent has changed there username
        postMessge(opponentUsername+ ' changed there name to: ' + response); //tell the client that the opponent changed there username
        opponentUsername=response;
        $('.opponent').val(response);
    });

    socket.on('customUserNameRequestedSucess', function(response){ //server tells client that username change was sucessful
        postMessge('Your name is: ' + response); //tell the user that there username has been switched
        myUsername=response;
    });
    socket.on('customUserNameRequestedTaken', function(response){ //server tells client that username has been taken
        postMessge('Sorry! Name Taken!'); //post message that the username has been taken
    });

    //Send Chatroom Messages
    $('#sendMessage').on('click',function(){ //when user clicks the send message button
        socket.emit('messageToOpponent', $('#message').val()); //send the opponent the message
        postMessge(myUsername + ': ' + $('#message').val()); //tell the user who sent the message there own message
        $('#message').val(''); //clear message box
    });

    socket.on('messageToOpponentReply', function(response){ //when the opponent sends a message
        postMessge(opponentUsername + ': ' + response);  //tell the user the opponents message
    });
});