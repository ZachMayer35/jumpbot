const Jimp = require('jimp');

module.exports = class Messenger {
  constructor(bot, logger) {
    if(!bot){
      throw new Error("Messenger intialized without a bot!");
    }
    if(!logger){
      throw new Error("Messenger intialized without a logger!");
    }
    this.bot = bot;
    this.logger = logger;
  }
  SendMessage (message, to) {
    const {bot, logger} = this;
    return bot.sendMessageAsync({
      to,
      message
    }).then((response) => {
      logger.info(`Sent Message: "${message}"`);
    }).catch((err) => {
      logger.error(err);
    });
  }
  SendAttachment (message, file, filename, to) {
    const {bot, logger} = this;
    return bot.uploadFileAsync({
      to,
      file,
      message,
      filename,
    }).then((response) => {
      logger.info(`Sent Attachment: "${filename}" with message: "${message}"`);
    }).catch((err) => {
      logger.error(err);
    });
  }
};
