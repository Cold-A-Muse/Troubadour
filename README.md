# Troubadour
A data enhancement platform providing intuitive and accessible natural language processing (NLP). 

# Introduction
In order to boost the development of applications on the blockchain, iExec reserved a prize pool of $150,000 to be distributed among different dapp projects. The iExec Jury ran its due diligence processes on these projects, and has retained 15 winners of development grants including our project Troubadour which is a data enhancement platform providing intuitive and accessible natural language processing (NLP) solutions, as a solution to the information overload problem that unstructured data causes.

The application is currently in alpha so please be **careful** while using it. Not all failsafes have been implemented yet and you might **lose** your tokens. At the moment only the extracted entities of an selected text are displayed but more functionalities will be added in the future.

# Requirements
- Have node installed (which can be found [here](https://nodejs.org/en/))
- Have npm installed 
- Have react installed (by running ```npm install react``` in your terminal)
- Have the metamask plugin installed (which can be found [here](https://metamask.io/)) and a kovan wallet with some ETH and RLC in it available
- Work orders are available in the  [iexec marketplace](https://market.iex.ec/)

Run the following command in both the front-end and back-end folders to install the dependecies of Troubadour:

```
npm -i install
```
# Starting Front-end
Go to the front-end folder and run the following command to start the react-js front-end:
```
npm start
```
# Starting Back-end
Go to the back-end folder and run the following command to start the node.js back-end:
```
node app.js
```

# Running basic tasks
 
 1. Click the Browse… button in order to open a file select dialog on your local machine.
 
 2. Select a file of your desire. The file name should now be displayed in front of the Browse… button and a preview of the text should be displayed in the preview pane. **Note:** Troubadour currently only supports __.txt__ files. 
 
 3. Click the upload button and wait until a pay request pop-up by metamask appears.
 
 4. Approve the payment and wait until the text file has been processed  **Note:** Processing the text file might take up to 15 minutes or longer depending on how fast the PoCo algorithm approves the computation. You can follow the progress of the work order [here](https://explorer.iex.ec/kovan)
 
 5. After the work has been processed a sign request pop-up by metamask appears. This sign request is necessary to access the results NLP pipeline. After the signing the message the extracted entitites should become available in their corresponding sections.  

