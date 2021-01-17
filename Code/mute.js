const Discord = require("discord.js");
const { orange, reportchan } = require("../config.json");

module.exports = {
    name: 'mute',
    description: 'Mute a user from all text and voice chats',
    usage: '<user> (minutes optional)',
    cooldown: 5,
    class: 'moderation',
    args: true,
    execute(msg, args, client, con, catchErr) {
        try {
            const log = client.channels.cache.get(reportchan);
            if (!msg.member.hasPermission("MUTE_MEMBERS")) return;
            const user = msg.mentions.users.first();
            if (!user) return msg.channel.send(`You didn't mention the user to mute`).then(m => m.delete({ timeout: 5000 }))      //If the command mentions a user
            const member = msg.guild.member(user);
            if (!member) return msg.channel.send("That user isn't in this server").then(m => m.delete({ timeout: 5000 }))       //If the user is in the server
            if (member.hasPermission("MUTE_MEMBERS")) return msg.channel.send("You can't mute a moderator").then(m => m.delete({ timeout: 5000 }))
            let muterole = msg.guild.roles.cache.find(r => r.name === "muted");       //Creation of mute role
            let muted = member.roles.cache.find(r => r.name === "muted");
            if (muted) return msg.channel.send("That user is already muted").then(m => m.delete({ timeout: 5000 }))       //If the user is muted already
            if (!muterole) return msg.channel.send("Make a muted role").then(m => m.delete({ timeout: 5000 }))

            msg.guild.channels.cache.forEach(f => {
                f.updateOverwrite(muterole, {
                    SEND_MESSAGES: false,
                    READ_MESSAGE_HISTORY: false,
                    ADD_REACTIONS: false,
                    ATTACH_FILES: false,
                    MENTION_EVERYONE: false,
                    SPEAK: false
                })
            });
            if (!args[1]) {
                member.roles.add(muterole).then(async () => {
                    let uicon = user.displayAvatarURL();
                    let muteEmbed = new Discord.MessageEmbed()     //Sends a fancy display of execution information
                        .setTitle(`${user.tag} was muted`)
                        .setThumbnail(uicon)
                        .addField("__Muted by:__", msg.author.username)
                        .setTimestamp()
                        .setColor(orange)
                    return log.send(muteEmbed);
                }).catch(err => {
                    catchErr(err, msg, `${module.exports.name}.js`, "I don't have the permissions to mute that user");
                    return;
                });
            } else {
                let time = parseInt(args[1]);
                if (!time) return msg.channel.send("That isn't a valid time to mute someone");
                member.roles.add(muterole).then(() => {
                    let uicon = user.displayAvatarURL();
                    let muteEmbed = new Discord.MessageEmbed()     //Sends a fancy display of execution information
                        .setTitle(`${user.tag} was muted for ${time} minute(s)`)
                        .setThumbnail(uicon)
                        .addField("__Muted by:__", msg.author.username)
                        .setColor(orange)
                        .setTimestamp()
                    log.send(muteEmbed);
                    setTimeout(function () {
                        member.roles.remove(muterole, `Temporary mute expired.`);
                        unmuteEmbed = new Discord.MessageEmbed()       //Fancy display of execution information
                            .setTitle(`**${user.tag} was unmuted after a ${time} minute mute**`)
                            .setThumbnail(uicon)
                            .setColor(orange)
                            .setTimestamp()
                        log.send(unmuteEmbed);
                    }, 5000)
                }).catch(err => {
                    catchErr(err, msg, `${module.exports.name}.js`, "I don't have the permissions to mute that user");
                    return;
                });
            }
        } catch (err) {
            catchErr(err, msg, `${module.exports.name}.js`, "Dev");
            return;
        }
    },
}