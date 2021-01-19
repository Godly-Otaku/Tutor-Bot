const Discord = require("discord.js");
const { green, orange, red, reportchan } = require("../config.json");

module.exports = {
    name: 'role',
    description: 'Get a subject role for tutoring',
    usage: '<role>',
    cooldown: 2,
    class: 'info',
    args: true,
    async execute(msg, args, client, con, catchErr) {
        try {
            let input = args[0];
            let foundRole = msg.guild.roles.cache.find(r => r.name === `${input}`)
            if (!foundRole) return msg.channel.send(`Sorry I couldn't find the role: "${input}"\nPlease enter the name exactly as listed`)
            //make sure role is one of the tutor roles; database?; just using arrays in file?
            //ask about specific roles for tutoring
            msg.member.roles.add(foundRole).then(() => {
                let confirm = new Discord.MessageEmbed()
                    .setDescription(`__**Successfully added the**__ ${foundRole} __**role**__
                You will be pinged when someone needs help with this subject`)
                    .setColor(foundRole.color)
                    .setAuthor(msg.author.username, msg.author.avatarURL())
                msg.channel.send(confirm).then(m => m.delete({ timeout: 50000 }))
            })
            con.query(`UPDATE lastdel SET id = ${msg.author.lastMessageID}`);
            await msg.author.lastMessage.delete({ timeout: 100 });
            await setTimeout(() => {
                con.query(`UPDATE lastdel SET id = 0`);
            }, 1000)
        } catch (err) {
            return catchErr(err, msg, `${module.exports.name}.js`, "Dev");
        }
    },
}