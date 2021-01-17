const Discord = require("discord.js");
const { red, reportchan } = require("../config.json");

module.exports = {
    name: 'ban',
    description: 'Smack down that mf ban hammer',
    usage: '<user> (reason optional)',
    cooldown: 5,
    class: 'moderation',
    args: true,
    execute(msg, args, client, con, catchErr) {
        const log = client.channels.cache.get(reportchan);
        if (!msg.member.hasPermission("BAN_MEMBERS")) return;
        const user = msg.mentions.users.first();
        if (!user) return msg.channel.send(`You didn't mention the user to ban`).then(m => m.delete({ timeout: 5000 }));      //If the command mentions a user
        const member = msg.guild.member(user);
        if (!member) return msg.channel.send("That user isn't in this server").then(m => m.delete({ timeout: 5000 }));    //If the user is in the server
        if (member.hasPermission("BAN_MEMBERS")) return msg.channel.send("You can't ban a moderator").then(m => m.delete({ timeout: 5000 }));
        if (!args[1]) {
            member.ban("Unknown").then(async () => {
                let uicon = user.displayAvatarURL();
                let banEmbed = new Discord.MessageEmbed()      //Sends a fancy display of execution information
                    .setTitle(`${user.tag} was banned`)
                    .setThumbnail(uicon)
                    .addField("__Banned by:__", msg.author.username)
                    .addField("__Banned in:__", msg.channel.name)
                    .setColor(red)
                return log.send(banEmbed);
            }).catch(err => {
                catchErr(err, msg, `${module.exports.name}.js`, "I don't have the permissions to ban that user");
                return;
            });
        } else {
            let reason = args.slice(1).join(" ");
            member.ban(reason).then(async () => {
                let uicon = user.displayAvatarURL();
                let banEmbed = new Discord.MessageEmbed()      //Sends a fancy display of execution information
                    .setTitle(`${user.tag} was banned`)
                    .setThumbnail(uicon)
                    .addField("__Banned by:__", msg.author.username)
                    .addField("__Banned in:__", msg.channel.name)
                    .addField("__Reason:__", reason)
                    .setColor(red)
                return log.send(banEmbed);
            }).catch(err => {
                catchErr(err, msg, `${module.exports.name}.js`, "I don't have the permissions to ban that user");
                return;
            });
        }
    },
}