const Discord = require("discord.js");
const { green } = require("../config.json");

module.exports = {
    name: 'rules',
    description: 'The laws of the land',
    usage: '',
    cooldown: 5,
    class: 'info',
    args: false,
    execute(msg) {
        let sicon = msg.guild.iconURL();
        let rules = new Discord.MessageEmbed()       //Sends a fancy display of execution information
            .setTitle("__**Rules**__")
            .setDescription("Not following these can lead to mute, kick, or ban")
            .setThumbnail(sicon)
            .setColor(green)
            .addField("Rule #1", "Be mindful and respectful of others. There is a difference between joking around and bullying someone.")
            .addField("Rule #2", `The chats names are pretty self-explanatory so go there for their respective purposes\
                       (NSFW goes in #nsfw, arguments go in #dissension, etc...)`)
            .addField("Rule #3", `If y\'all have any problems with anything or anyone, either mention the owner/admin or DM us personally.`)
            .addField("Rule #4", "Don't ask to be an admin or mod. I'll decide that on my own.")
            .addField("Rule #5", "Spamming will lead to getting muted or possibly banned. Decided at our own discretion.")
            .addField("Rule #6", "Doxing or obtaining personal information without consent will get you kicked immediately")
            .addField("Rule #7", "I'm pretty lenient with the rules so don't fuck it up for everyone. Follow them")
            .addField("Rule #8", "Remember that everyone is here to enjoy themselves. Have fun")
        return msg.channel.send(rules);
    },
};