

var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var locations = require('./locations.json');
// Initialize Discord Bot
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
  colorize: true
});

const SendMessage = (msg, cmd, channelID) => {
  logger.info(`Received Message: "${cmd}"`);
  bot.sendMessage({
    to: channelID,
    message: msg
  });
  logger.info(`Sent Message: "${msg}"`);
}

const GetRandomLocation = (loc) => {
  if (locations[loc]) {
    return locations[loc][Math.floor(Math.random() * (locations[loc].length + 1))];
  } else {
    return 'Location Not Found! :(';
  }
};

var bot = new Discord.Client({
  token: auth.token,
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
  if (message.substring(0, 1) == '!') {
    var args = message.substring(1).split(' ');
    var cmd = args[0].toLowerCase();

    args = args.splice(1);
    switch (cmd) {
      // !desert, !island
      case 'desert':
      case 'island':
        SendMessage(`Y'all should jump ${GetRandomLocation(cmd)}!`, cmd, channelID)
        break;
      default:
        break;
    }
  }
});

