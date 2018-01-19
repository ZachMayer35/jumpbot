
require('dotenv').config();
const util = require('util');
const Discord = require('discord.io');
const logger = require('winston');
const response = require('./response');
const express = require('express');
const Messenger = require('./messenger');
const MIME_PNG = require('jimp').MIME_PNG;

const app = express();
const port = process.env.PORT || 5000;
app.listen(port, () => {
  logger.info(`Webapp Bound to ${port}`);
});
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
  colorize: true
});
if(!process.env.DISCORD_AUTH){
  logger.error('NO DISCORD_AUTH ENVIRONMENT VAR SET');
  return;
};

const CMD_MAP = new Map([
  ['erangel', 'island'],
  ['miramar', 'desert'],
  ['island', 'island'],
  ['desert', 'desert']
]);
const MAX_COUNT = process.env.MAX_COUNT || 5;

Discord.Client.prototype.sendMessageAsync = util.promisify(Discord.Client.prototype.sendMessage);
Discord.Client.prototype.uploadFileAsync = util.promisify(Discord.Client.prototype.uploadFile);

// Initialize Discord Bot
logger.info('Connecting...');
let bot = new Discord.Client({
  token: process.env.DISCORD_AUTH,
  autorun: true
});
bot.on('debug', logger.debug);
bot.on('ready', (evt) => {
  logger.info('Connected!');
  logger.info(`Logged in as ${bot.username} - (${bot.id})`);
});

const messenger = new Messenger(bot, logger);

bot.on('message', async function(user, userID, channelID, message, evt) {
  if (message.startsWith(`<@${bot.id}>`)) {
    if(message.length > 200) {
      try {
        messenger.SendMessage('tl;dr', channelID);
      } catch(ex) {
        logger.error(ex);
      }
      return;
    }
    
    const args = bot.fixMessage(message).toLowerCase().split(' ').map(w => w.replace(/\W+/g, ''));
    let cmd = args.find((word) => CMD_MAP.has(word));
    let count = args.find((word) => !isNaN(parseInt(word))) || 1;
    if(cmd) {
      logger.info(`Received Message: "${bot.fixMessage(message)}"`);
      logger.info(`Received Command: "${cmd}"`);
      logger.info(`Received Count: "${count}"`);
      cmd = CMD_MAP.get(cmd);
      if(count && count > MAX_COUNT){
        count = MAX_COUNT;
        messenger.SendMessage(`You ask too much! I can't do more than ${MAX_COUNT}...`, channelID);
      }
      try{
        let locations = new Set();
        while(locations.size < count){
          let location = response.GetRandomLocation(cmd);
          if(locations.has(location.name)){ break; }
          logger.info(`Generated Location: "${location.name}"`);
          locations.add(location);
        }
        locations = Array.from(locations);
        const composite = await response.GenerateImage(locations, cmd);
        const message = response.GetMessage(locations);
        messenger.SendAttachment(message, composite, `${cmd}.png`, channelID);
      } catch(ex) {
        logger.error(ex);
      }
    } else {
      logger.info(`Received message: ${message}, but didn't find a command.`);
    }
  }
});


if(process.env.HEROKU_DYNO){
  // pings server every 15 minutes to prevent dynos from sleeping
  setInterval(() => {
    http.get(process.env.HEROKU_DYNO);
  }, 900000);
}