
// init project pkgs
const express = require('express');
const ApiAiAssistant = require('actions-on-google').DialogflowApp;
const bodyParser = require('body-parser');
const request = require('request');
const app = express();
const Map = require('es6-map');

app.use(bodyParser.json({type: 'application/json'}));
app.use(express.static('public'));


// Handle webhook requests
app.post('/', function(req, res, next) {
  logObject('Request headers: ', req.headers);
  logObject('Request body: ', req.body);
    
  // Instantiate a new API.AI assistant object.
  const assistant = new ApiAiAssistant({request: req, response: res});

  // Declare constants for your action and parameter names
  const ACTION_PRICE = 'price';
  
  // Declare parameters name here
  const COINS_PARAMETER = 'crypto_coins';

  let coin = assistant.getArgument(COINS_PARAMETER);    // type of coin
  
  const api_url ='https://api.coinmarketcap.com/v1/ticker/' ;
  
  // Create functions to handle intents here
  function priceHandler(assistant) {
    console.log('** Handling action: ' + ACTION_PRICE);
    let requestURL = api_url + encodeURIComponent(coin) ;
    request(requestURL, function(error, response) {
      if(error) {
        console.log("got an error: " + error);
        next(error);
      } else {        
        let body = JSON.parse(response.body);
        let price = body[0]['price'];
        
        logObject('the current coin price : ' , price);
        // Respond to the user with the current price.
				const msg = "Right now the price is" + price ;
				assistant.tell(msg);
				}
    });
  }

  
  // Add handler functions to the action router.
  let actionRouter = new Map();
  actionRouter.set(ACTION_PRICE, priceHandler);
  
  
  // Route requests to the proper handler functions via the action router.
  assistant.handleRequest(actionRouter);

});

//
// Handle errors
//
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Oppss... could not check the details !');
})

//
// Pretty print objects for logging
//
function logObject(message, object, options) {
  console.log(message);
  console.log(object, options);
}

//
// Listen for requests -- Start the party
//
let server = app.listen(process.env.PORT, function () {
  console.log('--> Our Webhook is listening on ' + JSON.stringify(server.address()));
});
  
