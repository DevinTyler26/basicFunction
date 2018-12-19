/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills
 * nodejs skill development kit.
 * This sample supports multiple lauguages. (en-US, en-GB, de-DE).
 * The Intent Schema, Custom Slots and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-fact
 **/

"use strict";
const Alexa = require("alexa-sdk");
const yelp = require("yelp-fusion");
const client = yelp.client(process.env.apiKey);

//=========================================================================================================================================
//TODO: The items below this comment need your attention.
//=========================================================================================================================================

//Replace with your app ID (OPTIONAL).  You can find this value at the top of your skill's page on http://developer.amazon.com.
//Make sure to enclose your value in quotes, like this: const APP_ID = 'amzn1.ask.skill.bb4045e6-b3e8-4133-b650-72923c5980f1';
const APP_ID = undefined;

const SKILL_NAME = "Space Facts";
const GET_FACT_MESSAGE = "Here's your fact: ";
const HELP_MESSAGE =
  "You can say tell me a space fact, or, you can say exit... What can I help you with?";
const HELP_REPROMPT = "What can I help you with?";
const STOP_MESSAGE = "Goodbye!";

//=========================================================================================================================================
//TODO: Replace this data with your own.  You can find translations of this data at http://github.com/alexa/skill-sample-node-js-fact/data
const greetings = [
  "Hey! If you are pretty indecisive, you can ask things like, find a place to eat in Seattle.",
  "Hello! If you know they type of food you want to eat, you can ask things like, find a burger place to eat in Seattle.",
  "Hello! You can leave all the decision making up to us, just ask find me a place in Bellevue",
  "Hey! You can be very direct, just ask find me an ice cream place to eat in Redmond."
];

//=========================================================================================================================================
//Editing anything below this line might break your skill.
//=========================================================================================================================================
function buildHandlers(event) {
  var handlers = {
    LaunchRequest: function() {
      const greetingsIndex = Math.floor(Math.random() * greetings.length);
      const randomGreeting = greetings[greetingsIndex];
      const speechOutput = randomGreeting;
      this.response.cardRenderer(SKILL_NAME, randomGreeting);
      this.response.speak(speechOutput);
      this.emit(":responseReady");

      // this.emit('GetNewFactIntent');
    },
    findRestaurant: function() {
      let myLocation = event.request.intent.slots.city.value;
      // let term;
      // if (event.request.intent.slots.place.value) {
      //   term = event.request.intent.slots.place.value;
      // }

      const search = {
        // term,
        radius: 10000,
        limit: 50,
        open_now: true,
        category: "food,All",
        location: myLocation
      };

      console.log(search);

      // // if (myLocation) {
      // //   search.location = myLocation;
      // // } else {
      // //   search.location = getLocation(event);
      // // }
      client
        .search(search)
        .then(response => {
          let clientResponse = response.jsonBody.businesses;
          let len = clientResponse.length;
          if (len === 0) {
            console.log("No Locations");
            return;
          }
          let choice = Math.floor(Math.random() * (len + 1));
          let miles = parseInt(clientResponse[choice].distance * 0.00062137);
          let rating = clientResponse[choice].rating;
          let res = `How about trying ${
            clientResponse[choice].name
          }. It is ${miles} miles away from your location given, is currently open and has ${rating} out of 5 stars.`;
          this.response.cardRenderer(res);
          this.response.speak(res);
          this.emit(":responseReady");
        })
        .catch(e => {
          console.log(e);
        });
    },
    "AMAZON.HelpIntent": function() {
      const speechOutput = HELP_MESSAGE;
      const reprompt = HELP_REPROMPT;

      this.response.speak(speechOutput).listen(reprompt);
      this.emit(":responseReady");
    },
    "AMAZON.CancelIntent": function() {
      this.response.speak(STOP_MESSAGE);
      this.emit(":responseReady");
    },
    "AMAZON.StopIntent": function() {
      this.response.speak(STOP_MESSAGE);
      this.emit(":responseReady");
    }
  };

  return handlers;
}

exports.handler = function(event, context, callback) {
  const alexa = Alexa.handler(event, context, callback);
  alexa.APP_ID = APP_ID;
  alexa.registerHandlers(buildHandlers(event));
  alexa.execute();
};
