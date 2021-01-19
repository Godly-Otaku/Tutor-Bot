const Discord = require("discord.js");
const { darker_green } = require("../config.json");

module.exports = {
    name: 'leaderboard',
    description: `Show the best tutors`,
    usage: '',
    aliases: ['lb', 'lbd'],
    class: 'info',
    cooldown: 5,
    args: false,
    execute(msg, args, client, con, catchErr) {
        try {
            con.query(`SELECT * FROM thanking ORDER BY points`, (err, rows) => {
                if (err) return catchErr(err, msg, `${module.exports.name}.js`, "Dev")
                if (rows.length < 1) return msg.channel.send("Not enough people")
                let JSONroles = JSON.stringify(rows);
                let parsedRoles = JSON.parse(JSONroles);
                var rank = 1;
                try {
                    let currentIndex = 0
                    let pagetotal = Math.floor(parsedRoles.length / 5);
                    function generateEmbed(start) {
                        let current = parsedRoles.slice(start, 5 + start)
                        const embed = new Discord.MessageEmbed()
                            .setTitle(`__ ** ${msg.guild.name} 's Leaderboard**__`)
                            .setColor(darker_green)
                            .setThumbnail(msg.guild.iconURL())
                            .setFooter(`Page 1/${pagetotal + 1}`)
                        let finmsg = '';
                        current.forEach((row) => {
                            finmsg += `\n#${rank++} <@${row.user}> - Points: ${row.points}`;
                        })
                        embed.setDescription(finmsg)
                        return embed
                    }
                    const author = msg.author
                    msg.channel.send(generateEmbed(0)).then(message => {
                        // exit if there is only one page of guilds (no need for all of this)
                        if (parsedRoles.length <= 5) return
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
                            r.emoji.name === '⬅️' ? currentIndex -= 5 : currentIndex += 5;
                            rank = currentIndex + 1;
                            if (currentIndex < 0) {
                                currentIndex = 0;
                                rank = 1;
                                return;
                            }
                            if (currentIndex > parsedRoles.length) {
                                currentIndex -= 5;
                                return;
                            }
                            if (currentIndex === parsedRoles.length) return;
                            function generateEmbed2(start) {
                                let current = parsedRoles.slice(start, 5 + start)
                                const embed2 = new Discord.MessageEmbed()
                                    .setTitle(`__**${msg.guild.name}'s Leaderboard**__`)
                                    .setColor(darker_green)
                                    .setThumbnail(msg.guild.iconURL())
                                    .setFooter(`Page ${(start / 5) + 1}/${pagetotal + 1}`)
                                let finmsg = '';
                                current.forEach((row) => {
                                    finmsg += `\n#${rank++} <@${row.user}>  - Points: ${row.points}`;
                                })
                                embed2.setDescription(finmsg)
                                return embed2
                            }
                            message.reactions.cache.clear();
                            message.edit(generateEmbed2(currentIndex))
                        });
                    })
                } catch (err) {
                    gen.delete();
                    return catchErr(err, msg, `${module.exports.name}.js`, "Dev")
                }
            })
        } catch (err) {
            return catchErr(err, msg, `${module.exports.name}.js`, "Dev")
        }
    },
}