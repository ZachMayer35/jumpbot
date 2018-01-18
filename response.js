const locations = require("./resources/locations.json");
const messages = require("./resources/messages.json");
const logger = require('winston');

const GetMessage = (location) => {
  const randIndex = Math.floor(Math.random() * (messages.length));
  logger.info(`Message Index: ${randIndex}`);
  return {...location, 
          message: messages[randIndex].replace('{0}', location.name)};
};

const GetRandomLocation = (loc) => {
  if (locations[loc]) {
    return locations[loc][Math.floor(Math.random() * (locations[loc].length))];
  } else {
    return 'Location Not Found! :(';
  }
};

exports.GetResponseMessage = (cmd) => {
  return GetMessage(GetRandomLocation(cmd));
}