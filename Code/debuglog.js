const { MessageAttachment } = require("discord.js");

module.exports = {
    name: 'debuglog',
    description: 'Get debug logs',
    usage: '',
    cooldown: 10,
    class: 'devcmd',
    args: false,
    execute(msg, args, con, linkargs, client, catchErr) {
        const bruh = new Date(Date.now())
        if (!args[0]) {
            try {
                let data = new MessageAttachment(`./Logs/Debug/${bruh.getMonth() + 1}_${bruh.getDate()}_${bruh.getFullYear()}.txt`);
                msg.reply("Today's debug log", data);
            } catch (err) {
                return catchErr(err, msg, `${module.exports.name}.js`, "There isn't a debug log for today");
            }
        } else {
            try {
                let path = args[0];
                let data = new MessageAttachment(`./Logs/Debug/${path}.txt`);
                msg.reply(`${path}'s debug log`, data);
            } catch (err) {
                return catchErr(err, msg, `${module.exports.name}.js`, "There isn't a debug log for that day");
            }
        }
    },
}