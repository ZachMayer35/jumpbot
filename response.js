const locations = require("./resources/locations.json");
const messages = require("./resources/messages.json");
const logger = require('winston');
const util = require('util');
const Jimp = require('jimp');
Jimp.prototype.getBufferAsync = util.promisify(Jimp.prototype.getBuffer);


const MAP_SIZE = 490;
const MARK_SIZE = 50;
const MARK_OFFSET = MARK_SIZE / 2;

exports.GetMessage = (locations) => {
  if(!util.isArray(locations)){
    locations = [locations];
  }
  let locationString = '';
  const randIndex = Math.floor(Math.random() * (messages.length));
  const getPredicate = (i) => {
    if(i === locations.length - 1) {
      return '';
    } else if (locations.length > 2 && i === locations.length - 2){
      return ' or ';
    } else {
      return ', ';
    }
  };
  locations.forEach((location, i) => {
    locationString += `${location.name}${getPredicate(i)}`;
  });
  return messages[randIndex].replace('{0}', locationString);
};

exports.GetRandomLocation = (loc) => {
  if (locations[loc]) {
    return locations[loc][Math.floor(Math.random() * (locations[loc].length))];
  } else {
    return 'Location Not Found! :(';
  }
};

exports.GenerateImage = async function(locations, cmd) {
  if(!util.isArray(locations)){
    locations = [locations];
  }
  let map = await Jimp.read(`./resources/${cmd}.png`);
  map = map.resize(MAP_SIZE, MAP_SIZE);
  let mark = await Jimp.read(`./resources/mark.png`);
  mark = mark.resize(MARK_SIZE, MARK_SIZE).opacity(0.65)
  let composite;
  locations.forEach(location => {
    composite = map.composite(mark.rotate(Math.floor(Math.random() * (360))), location.x - MARK_OFFSET, location.y - MARK_OFFSET);
  });
  return await composite.getBufferAsync(Jimp.MIME_PNG);
}
