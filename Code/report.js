const Discord = require("discord.js");
const { green, orange, red, reportchan } = require("../config.json");

module.exports = {
    name: 'report',
    description: 'Report a user for breaking the rules',
    usage: '<user> (reason optional)',
    cooldown: 2,
    class: 'info',
    args: false,
    async execute(msg, args, client, con) {
        const log = client.channels.cache.get(reportchan);
        const user = msg.mentions.users.first();
        if (!user) return;
        const member = msg.guild.member(user);
        if (!member) return msg.channel.send("That user isn't in this server").then(m => m.delete({ timeout: 3000 }));      //If the user is in the server
        let uicon = user.displayAvatarURL();
        con.query(`SELECT * FROM offense WHERE user = ${user.id}`, async (err, rows) => {
            if (err) return catchErr(err, msg, `${module.exports.name}.js`, "Dev");
            var reports;
            if (rows < 1) {
                con.query(`INSERT INTO offense (user, total) VALUES (${user.id}, 0)`);
                reports = 0;
            } else {
                reports = rows[0].total;
            }
            reports += 1;
            var color;
            if (reports === 1) color = green;
            else if (reports === 2) color = orange;
            else color = red;
            let report = new Discord.MessageEmbed()     //Sends a fancy display of execution information
                .setAuthor("Report", uicon)
                .setDescription(`**>> Member:** ${user}
                    **>> Reported by:** ${msg.author}
                    **>> Reported in:**   ${msg.channel.name}
                    **>> # of Reports:**    ${reports}`)
                .setColor(color)
                .setTimestamp()
            if (args[1]) {
                let reason = args.slice(1).join(" ");
                report.addField("__Reason:__", reason)
            }
            con.query(`UPDATE lastdel SET id = ${msg.author.lastMessageID}`);
            await msg.author.lastMessage.delete({ timeout: 100 });
            await setTimeout(() => {
                con.query(`UPDATE lastdel SET id = 0`);
            }, 1000)
            log.send(report);
            if (reports >= 3) log.send(`<@295736849685807108>`);
            con.query(`UPDATE offense SET total = ${reports}`);
        })
    },
}