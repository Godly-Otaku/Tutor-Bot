const Discord = require("discord.js");
const { prefix, darkgreen } = require("../config.json");

module.exports = {
    name: 'help',
    description: 'Show all my commands',
    aliases: ['commands', 'cmd'],
    usage: '[command name]',
    cooldown: 5,
    class: 'info',
    args: false,
    execute(msg, args, client, con, catchErr) {
        try {
            const { commands } = msg.client;
            if (!args.length) {
                let hembed = new Discord.MessageEmbed()        //Sends a fancy display of execution information
                    .setAuthor(client.user.username, client.user.avatarURL())
                    .setTitle("__**My Commands**__")
                    .setColor(darkgreen)
                    .setThumbnail(msg.guild.iconURL())
                    .setDescription(`**Info:** ${prefix}help info\n\
                                **Moderation:** ${prefix}help moderation\n\
                                **Fun:** ${prefix}help fun`)
                    .addField("For help with any of the other bots on the server", `Use ${prefix}botinfo <@bot>`)
                    .setFooter(`Use ${prefix}help all to get sent all my commands`)
                return msg.channel.send(hembed);
            }
            const name = args[0].toLowerCase();
            const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));
            const cmdarray = commands.array();
            const cmdwout = cmdarray.filter(c => c.class !== "devcmd")
            const classname = cmdarray.filter(c => c.class === name);
            function compare(a, b) {
                // Use toUpperCase() to ignore character casing
                const bandA = a.class
                const bandB = b.class

                let comparison = 0;
                if (bandA > bandB) {
                    comparison = 1;
                } else if (bandA < bandB) {
                    comparison = -1;
                }
                return comparison;
            }

            let classsort = cmdwout.sort(compare);
            if (name === "all") {
                try {
                    let currentIndex = 0
                    let pagetotal = Math.floor(classsort.length / 10) + 1
                    function generateEmbed(start) {
                        let current = classsort.slice(start, 10 + start)
                        const embed = new Discord.MessageEmbed()
                            .setTitle(`Here's a list of all my commands`)
                            .setColor(darkgreen)
                            .setThumbnail(msg.guild.iconURL())
                            .setFooter(`Page 1/${pagetotal}`)
                            .setAuthor(`${prefix}help <command> to get more info`)
                        let finmsg = '';
                        current.forEach((row) => {
                            if (row.class === "dev") return;
                            finmsg += `\n**${row.name}** ~ Class: ${row.class}`;
                        })
                        embed.setDescription(finmsg)
                        return embed
                    }
                    const author = msg.author
                    author.send(generateEmbed(0)).then(message => {
                        if (msg.channel.type === 'dm') return;
                        msg.reply('I\'ve sent you a DM with all my commands!');
                        // exit if there is only one page of guilds (no need for all of this)
                        if (classsort.length <= 10) return
                        // react with the right arrow (so that the user can click it) (left arrow isn't needed because it is the start)
                        message.react('⬅️')
                        message.react('➡️')
                        const collector = message.createReactionCollector(
                            // only collect left and right arrow reactions from the message author
                            (reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === author.id,
                            // time out after a minute
                            { time: 60000 }
                        )
                        collector.on('collect', r => {
                            r.emoji.name === '⬅️' ? currentIndex -= 10 : currentIndex += 10;
                            if (currentIndex < 0) {
                                currentIndex = 0;
                                return;
                            }
                            if (currentIndex > classsort.length) {
                                currentIndex -= 10;
                                return;
                            }
                            if (currentIndex === classsort.length) return;
                            function generateEmbed2(start) {
                                let current = classsort.slice(start, 10 + start)
                                const embed2 = new Discord.MessageEmbed()
                                    .setTitle(`Here's a list of all my commands`)
                                    .setColor(darkgreen)
                                    .setThumbnail(msg.guild.iconURL())
                                    .setAuthor(`${prefix}help <command> to get more info`)
                                    .setFooter(`Page ${(start / 10) + 1}/${pagetotal}`)
                                let finmsg = '';
                                current.forEach((row) => {
                                    if (row.class === "dev") return;
                                    finmsg += `\n**${row.name}** ~ Class: ${row.class}`;
                                })
                                embed2.setDescription(finmsg)
                                return embed2
                            }
                            message.reactions.cache.clear();
                            message.edit(generateEmbed2(currentIndex))
                        });
                    }).catch(err => {
                        return catchErr(err, msg, `${module.exports.name}.js`, 'It seems like I can\'t DM you!');
                    });
                } catch (err) {
                    gen.delete();
                    return catchErr(err, msg, `${module.exports.name}.js`, "Dev")
                }
            } else if (command) {
                if ((command.class === "devcmd") && (!msg.member.hasPermission("ADMINISTRATOR"))) return msg.channel.send("You are not worthy :pensive:");
                let cmdembed = new Discord.MessageEmbed()
                    .setTitle(`**Name:** ${command.name}`)
                    .setColor(darkgreen)
                    .setFooter(`Requested by ${msg.author.username}`, msg.author.avatarURL())
                if (!command.aliases) cmdembed.setDescription(`**Description:** ${command.description}\n\
                                                        **Usage:** ${prefix}${command.name} ${command.usage}\n\
                                                        **Class:** ${command.class}\n\
                                                        **Cooldown:** ${command.cooldown || 3} second(s)`)
                if (command.aliases) cmdembed.setDescription(`**Description:** ${command.description}\n\
                                                        **Aliases:** ${command.aliases.join(', ')}\n\
                                                        **Usage:** ${prefix}${command.name} ${command.usage}\n\
                                                        **Class:** ${command.class}\n\
                                                        **Cooldown:** ${command.cooldown || 3} second(s)`)
                if (command.class === "moderation") cmdembed.setAuthor("Requires moderator perms")
                return msg.channel.send(cmdembed);
            } else if (classname) {
                if (!classname.length) return;
                if ((name === "devcmd") && (!msg.member.hasPermission("ADMINISTRATOR"))) return msg.channel.send("You are not worthy :pensive:");
                let classlist = '';
                classname.forEach(c => {
                    classlist += `\n**${c.name}** ~ ${c.description}`
                })
                let classembed = new Discord.MessageEmbed()
                    .setTitle(`Here are the __${name}__ commands`)
                    .setColor(darkgreen)
                    .setDescription(classlist)
                    .setFooter(`Use ${prefix}help <command> to get more info on a command`, msg.author.avatarURL())
                    .setAuthor(client.user.username, client.user.avatarURL())
                    .setThumbnail(msg.guild.iconURL())
                if (name === "moderation") classembed.setAuthor("Requires moderator perms")
                return msg.channel.send(classembed)
            }
            if ((!args.length) && (!classname) && (!command)) return msg.reply('that\'s not a valid command!');
        } catch (err) {
            return catchErr(err, msg, `${module.exports.name}.js`, "Dev")
        }
    },
};