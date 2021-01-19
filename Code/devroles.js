const Discord = require("discord.js");
const { prefix, darker_green } = require("../config.json");

module.exports = {
    name: 'devroles',
    description: `Show the tutoring roles`,
    usage: '',
    aliases: ['devr'],
    class: 'info',
    cooldown: 5,
    args: false,
    async execute(msg, args, client, con, catchErr) {
        try {
            con.query(`SELECT * FROM roles`, async (err, rows) => {
                if (err) return catchErr(err, msg, `${module.exports.name}.js`, "Dev")
                if (rows.length < 1) return msg.channel.send("Not enough people")
                let JSONroles = JSON.stringify(rows);
                let parsedRoles = JSON.parse(JSONroles);
                var counter = 0;
                const embed = new Discord.MessageEmbed()
                    .setTitle(`__Tutoring Roles_`)
                    .setColor(darker_green)
                    .setThumbnail(msg.guild.iconURL())
                    .setFooter(`Example command: ${prefix}role Math`)
                let finmsg = '';
                parsedRoles.forEach((row) => {
                    if (counter % 2 == 0)
                        finmsg += `\n<@${row.name}>`;
                    else
                        finmsg += `<@${row.name}>`;
                    counter++;
                })
                embed.setDescription(finmsg)
                msg.channel.send(embed);
                con.query(`UPDATE lastdel SET id = ${msg.author.lastMessageID}`);
                await msg.author.lastMessage.delete({ timeout: 100 });
                await setTimeout(() => {
                    con.query(`UPDATE lastdel SET id = 0`);
                }, 1000)
            })
        } catch (err) {
            return catchErr(err, msg, `${module.exports.name}.js`, "Dev")
        }
    },
} //Create mock environment for testing (roles in server, database table)