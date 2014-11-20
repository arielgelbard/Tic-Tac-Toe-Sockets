
// // Wait for DOM to Load
jQuery(function($) {

//===========================================
//       Responsive Tic Tac Toe Script
//            By: Ariel Gelbard
//            October 16, 2014
//==============================================
// Create New Socket Connection using Socket.io
var socket = io();
//Tic Tac Toe Application
// var app = function(){
// var logIt=document.getElementById("options").innerHTML;
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
    for (var i=1; i<10; i++) {
        var templateTile = new gTile();
        var tile = templateTile.element; //create an li element
        tile.className = templateTile.cssClass; //Add background from css class
        tile.onclick = templateTile.clickFunction; //when a tile is clicked, tileClicked will be activated
        tile.i = i; //make tile a number
        if (i<7) {
            tile.style.borderBottom = "3px solid white"; //making the gameboard look like tiles by having diving lines
        }
        if (i===3 || 
            i===6 || 
            i===9){
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
            for (var i = 0; i < tiles.length; i++) { //go through each tile
                    tiles[i].style.width = 190 + "px"; //adjust tiles width
                    tiles[i].style.height = 190 + "px"; //adjust tiles height
                    tiles[i].style.lineHeight = 180 + "px"; //adjust tiles line height
            }
            boardBackground.style.width = 590 + "px"; //adjust width and height of the boards background
        }
        else{
            var tiles = document.getElementsByTagName("li"); //Grabs all the tiles that were made when the app was created
            for (var i = 0;i<tiles.length;i++){ //go through each tile
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
        if (answer===true){
            for (var i=0; i<tiles.length; i++){ //go through each tile
                tiles[i].onclick = null; //disable tile being clicked
            }
        }
        else{
            for (var i=0; i<tiles.length; i++){ //go through each tile
                tiles[i].onclick = tileClicked; //disable tile being clicked
            }        
            disableCertainTiles();
        }
    }

    function disableCertainTiles(){
        var tiles = document.getElementsByTagName("li"); //reference all tiles
        for (var i=0; i<tiles.length; i++){ //go through each tile
            if (x.indexOf(tiles[i].i)!==-1||o.indexOf(tiles[i].i)!==-1){
                tiles[i].onclick = null;
            }
            else{
                tiles[i].onclick = tileClicked; //disable tile being clicked
            }
        }           
    }

    function resetWhosX(){
        resetBoard();
        if (whosX==true){
            whosX=false;
            whosO=true;
            disableTiles(true);
        }
        else if (whosO==true){
            whosX=true;
            whosO=false;
        } 
    }

    //Reset Tic Tac Toe Board
    function resetBoard () {
        document.getElementById("status").style.cursor = "auto"; //reset cursor on status bar
        document.getElementById("status").innerText = "BEGIN!"; //reset actual status text
        document.getElementById("status").onclick = '';
        document.getElementById("status").style.pointer = 'default';
        document.getElementById("status").style.color = 'black';
        var tiles = document.getElementsByTagName("li"); //reference all tiles
        var templateTile = new gTile(); //establishes new tile to grab attributes from
        for (var i=0; i < tiles.length; i++){ //loop through all tiles and reset
            tiles[i].innerText = ""; //reset value of tile
            tiles[i].className = templateTile.cssClass; //reset background of tile
            tiles[i].onclick = templateTile.clickFunction; //reset click event on tile
        }
        x = []; //clear tiles x player chose
        o = []; //clear tiles o player chose
        count = 1; //reset count
        turn = 0; //reset players turn
    }

    function resetGame(){

    }

    var postMessge=function(msg){
        document.getElementById('messagePosted').innerHTML=document.getElementById('messagePosted').innerHTML+msg+'<br>';
        document.getElementById('messagePosted').scrollTop = document.getElementById('messagePosted').scrollHeight;
    }
    

    socket.on('questionStartYet', function(opponent,whoBegins){
        resetBoard();
        disableTiles(true);
        if (opponent==false){
            postMessge("<h6>No Opponent Yet</h6>");
        }
        else{
            postMessge("<h6>You are now facing:"+opponent+'</h6>');
            // document.getElementById("options").innerHTML =informed;
            if (whoBegins==true){
                disableTiles(false);
                document.getElementById("status").innerText = "You get to Start! Begin!";
                // document.getElementById("options").innerHTML='You Begin the Game!';
                whosX=true;
                whosO=false;
            }
            else{
                document.getElementById("status").innerText = "Opponent Starts!";
                whosO=true;
                whosX=false;
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
    var myUsername;
    var opponentUsername;
    var whosX=0;
    var whosO=0;
    var myScore=0;
    var opponentScore=0;
    var catsGameScore=0;














































    socket.on('updatePositionPicked', function(choice){
            tileRecieved(choice);
            // document.getElementById("options").innerText = msg+document.getElementById("options").innerText; //change the text and alert the user
    });


    var ifUserClickedTile=true;

    function tileRecieved(tile){
        var tiles = document.getElementsByTagName("li"); //reference all tiles
        for (var i=0; i<tiles.length; i++){ //go through each tile
            if (tiles[i].i.toString()==tile.toString()){
                ifUserClickedTile=false;
                disableCertainTiles();
                tiles[i].click();
                // document.getElementById("options").innerHTML = 'sent off: '+tiles[i].i+'</br>'+document.getElementById("options").innerHTML; //change the text and alert the user
                break;
            }
        }
    }

    function emitAnswer(choice){
        socket.emit('positionPicked', choice); //pass message to server!
    }

    //When Tile is Clicked
    function tileClicked() {
        var tileChosen = this;
        if (ifUserClickedTile==false){
            ifUserClickedTile=true;
            document.getElementById("status").innerText = "Your Turn!";
        }
        else{
            emitAnswer(tileChosen.i);
            disableTiles(true);
            document.getElementById("status").innerText = "Opponents Turn!";
        }
        if(turn === 0){ //if its x's turn
            var tile = new xTile();
            tileChosen.className = tile.cssClass; //change background colour of tile
            tileChosen.style.color = tile.fontColor; //change text color of tile
            tileChosen.innerText = tile.text; //change inner text of tile to x
            turn = 1; //change turn to be o's next time
            x.push(this.i); //add value to x's array
            // document.getElementById("status").innerText = "Its O's Turn! Deciding..."; //alert user of status
        }
        else{ //if its o's turn
            var tile = new oTile();
            tileChosen.className = tile.cssClass; //change background colour of tile
            tileChosen.style.color = tile.fontColor; //change text color of tile
            tileChosen.innerText = tile.text; //change inner text of tile to o
            turn = 0; //change turn to be x's next time
            o.push(this.i); //add value to x's array
            // document.getElementById("status").innerText = "Its X's Turn!"; //alert user of status
            // disableTiles(false);
        }
        check(); //check to see who won, lost, or tied
    }

    //Check to see who won, lost, or tied
    function check(){
        var won = false; //Value changes to true if a player wins
        var combinations = [[1,2,3],[4,5,6],[7,8,9],[1,4,7],[2,5,8],[3,6,9],[1,5,9],[3,5,7]]; //holds all possible combinations that any opponent can do to win
        for (var i = 0; i < combinations.length; i++){ //loops through and checks to see if any oponent had a possible combination
            var selectedCombo=combinations[i]; //grabs one combination to check
            var numberOfTilesMatchedX = 0; //needed to see if any tiles match the selected combination for x
            var numberOfTilesMatchedO = 0; //needed to see if any tiles match the selected combination for o
            for (var j=0; j<selectedCombo.length; j++){//loops through each selected combo number                                  //'combnations' was put here instead of 'selectedCombo'
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
                if (whosX==true){
                    myScore=myScore+1;
                    document.getElementById("meScore").innerHTML=myScore;
                }
                else{
                    opponentScore=opponentScore+1;
                     document.getElementById("oScore").innerHTML=opponentScore;
                }
                document.getElementById("options").innerHTML="X Won! Play Again?";
                resetWhosX();
            }
            else if (numberOfTilesMatchedO === 3){ //Check to see if O Player Won
                won = true; //change value to true because O player won      
                if (whosX==true){
                    myScore=myScore+1;
                     document.getElementById("meScore").innerHTML=myScore;
                }
                else{
                    opponentScore=opponentScore+1;
                     document.getElementById("oScore").innerHTML=opponentScore;
                }
                document.getElementById("options").innerHTML="O Won! Play Again?";
                resetWhosX();
            }
            if (numberOfTilesMatchedX === 3 || numberOfTilesMatchedO === 3) break; //if anybody won, exit out of for loop to avoid checking anymore combinations
       
        }

        if (count === 9 && won === false){ //if all tiles are selected and nobody has won then:
            catsGameScore=catsGameScore+1;
            document.getElementById("catsScore").innerHTML=catsGameScore;
            document.getElementById("options").innerHTML="Cats Game! Play Again?";
            resetWhosX();
        }
        else if (won === false){ //if all tiles are not selected:
            count++; //increment the total number of tiles selected variable
            disableCertainTiles();
        }

        // if (turn === 1 && won === false && count !== 9 && computerON === true) { //if user just selected a tile
        //     computerChoose(); //its the computer turn to select a tile
        // }

    }



    //Notify and Update NickNames
    $('#requestName').on('click',function(){
        socket.emit('customUserNameRequested', $('#desiredUserName').val());
    });

    socket.on('customUserNameRequestedAnswer', function(response){
        postMessge('user changed there name to:'+response);
            // document.getElementById("options").innerText = msg+document.getElementById("options").innerText; //change the text and alert the user
    });

    socket.on('customUserNameRequestedSucess', function(response){
        postMessge('you have changed your name to:'+response);
        $('#desiredUserName').val('');
            // document.getElementById("options").innerText = msg+document.getElementById("options").innerText; //change the text and alert the user
    });
    socket.on('customUserNameRequestedTaken', function(response){
        postMessge('Sorry! Name Taken!');
            // document.getElementById("options").innerText = msg+document.getElementById("options").innerText; //change the text and alert the user
    });


    //Send Chatroom Messages
    $('#sendMessage').on('click',function(){
        socket.emit('messageToOpponent', $('#message').val());
        $('#message').val('');
    });

    socket.on('messageToOpponentReply', function(response){
        postMessge(response);
    });

});





    // //The computer makes a decision of which tile to choose. This is where the megmax algorithm would be applied
    // function computerChoose () { 
    //     var choosing = 0; //temporary variable for loop
    //     while (choosing < 1) { //computer checks to see if spot has been taken already
    //         var choseNumber = Math.floor((Math.random() * 8) + 1); //selects a random spot the computer wants to go
    //         if (x.indexOf(choseNumber) == -1 && 
    //             o.indexOf(choseNumber) == -1){ //if spot hasn't been taken
    //             var temp = document.getElementsByTagName("li"); //select tiles from board
    //             var time = setTimeout(function(){ //Delay computer choice
    //                 disableTiles(false); //the computer has to choose an enabled tile, so we have to enable it
    //                 temp[choseNumber-1].onclick(); //the computer simulates a click for the chosen spot
    //                 window.clearTimeout(time); //Clear timeout
    //             },800);
    //             choosing = 3; //change variable number to exit out of loop
    //         }
    //     }
    // }

    //Option to play with a friend or the computer
    // function options () {
    //     if (computerON === false){ //if the computerON is not enabled:
    //         computerON = true; //allow the user to play with a computer
    //         document.getElementById("options").innerText = "playing with a computer"; //change the text and alert the user
    //     }
    //     else{
    //         computerON = false; //allow the user to play with a friend
    //         document.getElementById("options").innerText = "playing with a friend"; //change the text and alert the user
    //     }
    //     resetBoard(); //reset board because player is choosing an option
    // }

    // document.getElementById("options").onclick = options; //clickable link to change if player wants to play against a friend or the computer
    // options(); //activate computer on start
    // options();
// }

// app(); //Initiate App




                // won = true; //change value to true because X player won
                // document.getElementById("status").innerText = "X Won! Play Again?"; //change status to alert user
                // document.getElementById("status").onclick = resetBoard; //make status clickable to allow the user to start another game
                // document.getElementById("status").style.color = "#A10000";
                // // xScore=xScore+1;
                // // document.getElementById("xScore").innerText = xScore; //increment x's score by 1
                // document.getElementById("status").style.cursor = "pointer"; //make the status look clickable by making it a pointer when hovered over. This is for UX
                // for (var i=0; i<tiles.length; i++){ //go through each tile
                //     tiles[i].onclick=null; //disable tile being clicked
                // }



                // document.getElementById("status").innerText = "O Won! Play Again?"; //change status to alert user
                // document.getElementById("status").onclick = resetBoard;//make status clickable to allow the user to start another game
                // document.getElementById("status").style.color = "#002BE3";
                // // oScore=oScore+1;
                // // document.getElementById("oScore").innerText = oScore;  //increment o's score by 1
                // document.getElementById("status").style.cursor = "pointer"; //make the status look clickable by making it a pointer when hovered over. This is for UX
                // for (var i=0; i<tiles.length; i++){ //go through each tile
                //     tiles[i].onclick=null; //disable tile being clicked
                // } 


            // document.getElementById("status").innerText = "Its a Tie! Play Again?"; //alert user that it was a tie
            // document.getElementById("status").onclick = resetBoard; //make status message clickable
            // document.getElementById("status").style.cursor = "pointer"; //make the status look clickable by making it a pointer when hovered over. This is for UX


//     //Send a message to the server
//     $('a').on('click',function(){
//      var text=$('input').val();
//      socket.emit('message', text); //pass message to server!
//     });

//     //listening from server for the update in this socket
//     //Recieve Update Event from the server
    // socket.on('update', function(msg){
    //  $('.messages').append(msg);
    // });
        // document.getElementById("options").innerText = "playing with a friend"; //change the text and alert the user



// emitAnswer('test');

        // document.getElementById("options").innerText = msg+document.getElementById("options").innerText; //change the text and alert the user






