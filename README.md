//==============================================
//    Chatroulette Tic Tac Toe: Read Me
//            By: Ariel Gelbard
//            November 20, 2014
//==============================================

Thanks for downloading and taking an interest in using and looking at my Tic Tac Toe Chat Roulette.

Technologies Included:
//==============================================
I have used node.js as the server because it is very flexiable in many ways. We can program a server javascript which can allow us to create endless possibilities. In this case, playing tic tac toe with anyone you meet.

I have used the express framework for node.js because it will easily allow us to work with page and asset redirects quickly.

I have used the sockets.io framework because it allows users to interact with each other in real time. In this app you can chat, have nickname changes, challenge new opponents, and making moves accordingly all in real time.

I have used the bad-words extention because this will avoid users from sending prophanity to each other when chatting to each other in the app.

I have used gulp because it easily allows anyone to easily (in this case) re-compile pre-processed code. Developers can easily add useful plugins to modify how code is generated.



Installation Instructions:
//==============================================
//==============================================

How to run the Application (server):
//==============================================

1) Download node.js from nodejs.org and install it

2) After it is installed, open the terminal and type ‘cd’.

3) After typing in ‘cd’, drag and drop the ‘tic-tac-toe-sockets’ folder that you downloaded into the terminal window (ex. http://media.24ways.org/2013/coyier/drag-folder.gif). Hit enter on the keyboard. (now you are in the folder.)

4) Type in ‘npm install’ and hit enter. Please wait a few minutes for the modules to download and install.

5) Now that the modules have installed, type ‘node server.js’ and hit the 'return' key to run the app.

6) The terminal will reply a message back to you indicating what the url is. Now copy the link, minimize terminal, and type the link into your web browser (ex. chrome, firefox, internet explorer, etc.). 

	-while interacting with the app, node will log any changes that are made in the server in the terminal.

7) To shut down the tic tac toe application, open up the minimized terminal. Now hit control and c at the same time on your keyboard.


Building HTML & CSS Instructions:
//==============================================

1) Repeat steps 1-4 from the section above called 'How to run the Application'. If you have done the previous steps from the section above, move onto step #2.

2) Type in ‘gulp’ and hit enter. 

	-You will see some messages appear in regards to what gulp has processed based on the paramters set in 'gulpfile.js'.