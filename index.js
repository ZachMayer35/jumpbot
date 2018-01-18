
require('dotenv').config();
const Discord = require('discord.io');
const logger = require('winston');
const response = require('./response');
const jpeg = require('jpeg-js');
const fs = require('fs');
const Jimp = require('jimp');

logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
  colorize: true
});

const SendAttachment = async function(msg, cmd, channelID) {
  logger.info(`Received Message: "${cmd}"`);
  let mapPromise = Jimp.read(`./resources/${cmd}.png`);
  let markPromise = Jimp.read(`./resources/mark.png`);
  let composite = Promise.all([mapPromise, markPromise]).then((images) => {
    let map = images[0];
    let mapDimensions = {h: map.bitmap.height, w: map.bitmap.width};
    let mark = images[1];
    mark.resize(50, Jimp.AUTO).opacity(0.65);
    return map.composite(mark, msg.x - 25, msg.y - 25);
  });

  composite.then((comp) => {
    comp.getBuffer(Jimp.MIME_PNG, (err, imageBuffer) => {
      bot.uploadFile({
        to: channelID,
        file: imageBuffer,
        filename: `${cmd}.png`,
        message: msg.message
      }, (err, response) => {
        if (!err) {
          logger.info(`Sent Attachment: "${cmd}.jpg"`);
          logger.info(`Sent Message: "${msg.message}"`);
          logger.info(response);
        } else {
          logger.error(err);
        }
      });
    });
  });
}

if(!process.env.DISCORD_AUTH){
  logger.error('NO DISCORD_AUTH ENVIRONMENT VAR SET');
  return;
};

// Initialize Discord Bot
var bot = new Discord.Client({
  token: process.env.DISCORD_AUTH,
  autorun: true
});
logger.info('Connecting...');

bot.on('debug', logger.debug);

bot.on('ready', function (evt) {
  logger.info('Connected!');
  logger.info(`Logged in as ${bot.username} - (${bot.id})`);
});

bot.on('message', function (user, userID, channelID, message, evt) {
  // Our bot needs to know if it will execute a command
  // It will listen for messages that will start with `!`
  if (message.startsWith(`<@${bot.id}>`)) {
    const args = message.toLowerCase().split(' ').map(w => w.replace(/\W+/g, ''));
    let cmd = args.find((word) => word === 'island' || word === 'desert' || word === 'erangel' || word === 'miramar');
    switch (cmd) {
      case 'erangel':
        cmd = 'island';
        SendAttachment(response.GetResponseMessage(cmd), cmd, channelID);
        break;
      case 'miramar':
        cmd = 'desert';
        SendAttachment(response.GetResponseMessage(cmd), cmd, channelID);
        break;
      case 'desert':
      case 'island':
        SendAttachment(response.GetResponseMessage(cmd), cmd, channelID);
        break;
      default:
        logger.info(`Received message: ${message}, but didn't find a command (${cmd})`);
        logger.info(args);
        break;
    }
  }
});
