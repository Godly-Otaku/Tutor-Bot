const Discord = require("discord.js");
const { green, reportchan } = require("../config.json");

module.exports = {
    name: 'unmute',
    description: 'Unmute a user from all text and voice chats',
    usage: '<user>',
    cooldown: 5,
    class: 'moderation',
    args: true,
    execute(msg, args, client, con, catchErr) {
        try {
            const log = client.channels.cache.get(reportchan);
            if (!msg.member.hasPermission("MUTE_MEMBERS")) return;
            const user = msg.mentions.users.first();
            if (!user) return msg.channel.send(`You didn't mention the user to unmute`).then(m => m.delete({ timeout: 5000 }));      //If the command mentions a user
            const member = msg.guild.member(user);
            if (!member) return msg.channel.send("That user isn't in this server").then(m => m.delete({ timeout: 5000 }));       //If the user is in the server
            let muted = member.roles.cache.find(r => r.name === "muted");
            if (!muted) return msg.channel.send("That user isn't muted").then(m => m.delete({ timeout: 5000 }));       //If the user is muted already
            member.roles.remove(muted).then(() => {
                let uicon = user.displayAvatarURL();
                unmuteEmbed = new Discord.MessageEmbed()       //Fancy display of execution information
                    .setTitle(`${user.tag} was unmuted`)
                    .setThumbnail(uicon)
                    .addField("__Unmuted by:__", msg.author.username)
                    .setTimestamp()
                    .setColor(green)
                return log.send(unmuteEmbed);
            }).catch(err => {
                catchErr(err, msg, `${module.exports.name}.js`, "I don't have the permissions to unmute that user");
                return;
            });
        } catch (err) {
            return catchErr(err, msg, `${module.exports.name}.js`, "Dev");
        }
    },
}