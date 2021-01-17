const Discord = require("discord.js");
const { red, reportchan } = require("../config.json");

module.exports = {
    name: 'kick',
    description: `What's the shape of Italy?`,
    usage: '<user> (reason optional)',
    cooldown: 5,
    class: 'moderation',
    args: true,
    execute(msg, args, client, con, catchErr) {
        const log = client.channels.cache.get(reportchan);
        if (!msg.member.hasPermission("KICK_MEMBERS")) return;
        const user = msg.mentions.users.first();
        if (!user) return msg.channel.send(`You didn't mention a user to kick`).then(m => m.delete({ timeout: 5000 }));    //If the command mentions a user
        const member = msg.guild.member(user);
        if (!member) return msg.channel.send("That user isn't in this server").then(m => m.delete({ timeout: 5000 }));      //If the user is in the server
        if (member.hasPermission("KICK_MEMBERS")) return msg.channel.send("You can't kick a moderator").then(m => m.delete({ timeout: 5000 }));
        if (!args[1]) {
            member.kick("Unknown").then(async () => {
                let uicon = user.displayAvatarURL();
                let kickEmbed = new Discord.MessageEmbed()     //Sends a fancy display of execution information
                    .setTitle(`${user.tag} was kicked`)
                    .setThumbnail(uicon)
                    .addField("__Kicked by:__", msg.author.username)
                    .addField("__Kicked in:__", msg.channel.name)
                    .setTimestamp()
                    .setColor(red)
                return log.send(kickEmbed);
            }).catch(err => {
                catchErr(err, msg, `${module.exports.name}.js`, "I don't have the permissions to kick that user");
                return;
            });
        } else {
            let reason = args.slice(1).join(" ");
            member.kick(reason).then(async () => {
                let uicon = user.displayAvatarURL();
                let kickEmbed = new Discord.MessageEmbed()     //Sends a fancy display of execution information
                    .setTitle(`${user.tag} was kicked`)
                    .setThumbnail(uicon)
                    .addField("__Kicked by:__", msg.author.username)
                    .addField("__Kicked in:__", msg.channel.name)
                    .addField("__Reason:__", reason)
                    .setTimestamp()
                    .setColor(red)
                return log.send(kickEmbed);
            }).catch(err => {
                catchErr(err, msg, `${module.exports.name}.js`, "I don't have the permissions to kick that user");
                return;
            });
        }
    },
}