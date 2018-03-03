'use strict';

process.env.DEBUG = 'actions-on-google:*';

// We need the Assistant client for all the magic here
const Assistant = require('actions-on-google').DialogflowApp;
// To make our http request (a bit nicer)
const request = require('request');

// the actions we are supporting (get them from api.ai)
const ACTION_PRICE = 'price';
const ACTION_UNKNOWN = 'input.unknown';
const ACTION_WELCOME = 'input.welcome';

// The end-points to our api calls
const EXT_BITCOIN_API_URL = "https://blockchain.info";
const EXT_PRICE = "/q/24hrprice";

// [STARt]
const dialogflowFirebaseFulfillment = (req, res) => {
	const assistant = new Assistant({
		request: req,
		response: res
	});
	console.log('Request headers: ' + JSON.stringify(req.headers));
	console.log('Request body: ' + JSON.stringify(req.body));

	// Declare parameters name here
	//const COINS_PARAMETER = 'crypto_coins'; // create this in entities in Diagflow
	//let coin = assistant.getArgument(COINS_PARAMETER); 

	// write functions here to handle intents 
	function welcomeHandler(assistant) {
		console.log('** WELCOME' + ACTION_WELCOME);
		const msg = "Welcome! message here.";
		assistant.ask(msg);
	}
	
	function errorHandler(assistant) {
		console.log('** UNKNOWN' + ACTION_UNKNOWN);
		const msg = "Unknown Intents";
		assistant.tell(msg);
	}
    // Intent for price
	function priceHandler(assistant) { 
		console.log('** Handling action: ' + ACTION_PRICE);
		let requestURL = EXT_BITCOIN_API_URL + EXT_PRICE;
		request(requestURL, function(error, response) {
			if (error) {
				console.log("got an error: " + error);
				//next(error);
			} else {
				let body = JSON.parse(response.body);
				//let price = body[0][value-name];
                let price = body[0];
				logObject('the current coin price : ', price);
				// Respond to the user with the current price.
				const msg = "Right now the price is " + price + "What else would you like to know?";
				assistant.ask(msg);
			}
		});
	}

	// Fulfill total bitcoin action 
	
	// The Entry point to all our actions
	const actionMap = new Map();
	actionMap.set(ACTION_PRICE, priceHandler);
	actionMap.set(ACTION_UNKNOWN, errorHandler);
    actionMap.set(ACTION_WELCOME, welcomeHandler);

	assistant.handleRequest(actionMap);
};
//
// Pretty print objects for logging
//
function logObject(message, object) {
	console.log(message);
	console.log(JSON.parse(JSON.stringify(object)));
}
// [END CryptoCoin Info]
const functions = require('firebase-functions');
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(dialogflowFirebaseFulfillment);
