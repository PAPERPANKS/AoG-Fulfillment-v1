'use strict';

process.env.DEBUG = 'actions-on-google:*';

// We need the Assistant client for all the magic here
const Assistant = require('actions-on-google').DialogflowApp;
// To make our http request (a bit nicer)
const request = require('request');

// the actions we are supporting (get them from api.ai)
const ACTION_PRICE = 'price'; //add this in Intents section in Dialogflow

// The end-points to our api calls
const api_url = "https://api.coinmarketcap.com/v1/ticker/";

// main
const dialogflowFirebaseFulfillment = (req, res) => {
	const assistant = new Assistant({
		request: req,
		response: res
	});
	console.log('Request headers: ' + JSON.stringify(req.headers));
	console.log('Request body: ' + JSON.stringify(req.body));

	//Declare parameters name here
	const COINS_PARAMETER = 'crypto_coins'; // add this in entities in Diagflow
	let coin = assistant.getArgument(COINS_PARAMETER); 

    // write functions here to handle intents 
    
    // Intent for price
	function priceHandler(assistant) { 
		console.log('** Handling action: ' + ACTION_PRICE);
		let requestURL = api_url + encodeURIComponent(coin);
		request(requestURL, function(error, response) {
			if (error) {
				console.log("got an error: " + error);
			} else {
				let body = JSON.parse(response.body);
				let price = body[0]['price_usd'];
                
				logObject('logging price : ', price);
				// Respond to the user with the current price.
				const msg = "Right now the price is $ " + price ;
				assistant.tell(msg);
			}
		});
	}
	
	// The Entry point to all our actions
	const actionMap = new Map();
	actionMap.set(ACTION_PRICE, priceHandler);

	assistant.handleRequest(actionMap);
};
//
// Pretty print objects for logging
//
function logObject(message, object) {
	console.log(message);
	console.log(JSON.parse(JSON.stringify(object)));
}

const functions = require('firebase-functions');
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(dialogflowFirebaseFulfillment);
