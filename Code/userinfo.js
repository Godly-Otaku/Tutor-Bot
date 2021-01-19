const Discord = require("discord.js");

module.exports = {
    name: 'userinfo',
    description: 'Show information on a user',
    aliases: ['uinfo', 'user'],
    usage: '<user>',
    cooldown: 3,
    class: 'info',
    args: false,
    execute(msg, args, client, con, catchErr) {
        try {
            let member = msg.mentions.members.first();
            let user = msg.mentions.users.first();
            if (member) {
                con.query(`SELECT * FROM offense WHERE user = ${user.id}`, (err, rows) => {
                    if (err) return catchErr(err, msg, `${module.exports.name}.js`, "Dev");
                    var reports;
                    if (rows < 1) {
                        con.query(`INSERT INTO offense (user, total) VALUES (${user.id}, 0)`);
                        reports = 0;
                    } else {
                        reports = rows[0].total;
                    }
                    let ucolor = member.roles.highest.color;      //The user's role's color
                    let umenicon = user.avatarURL();
                    let umenembed = new Discord.MessageEmbed()       //Sends a fancy display of execution information if the command isn't asking for help
                        .setTitle("__**User Information**__")
                        .setAuthor(user.username, umenicon)
                        .setColor(ucolor)
                        .setThumbnail(umenicon)
                        .addField("Username", user.username)
                        .addField("Created Account", `${user.createdAt.getMonth()}/${user.createdAt.getDate()}/${user.createdAt.getFullYear()}`)
                        .addField("User Joined", `${member.joinedAt.getMonth()}/${member.joinedAt.getDate()}/${member.joinedAt.getFullYear()}`)
                        .addField("Highest Role:", member.roles.highest.toString())
                        .addField("# of Roles", member.roles.cache.size)
                        .addField("Discord ID", member.id)
                        .addField("# of Reports", reports)
                    con.query(`UPDATE offense SET total = ${reports}`);
                    return msg.channel.send(umenembed);
                });
            } else {
                let author = msg.author;
                con.query(`SELECT * FROM offense WHERE user = ${author.id}`, (err, rows) => {
                    if (err) return catchErr(err, msg, `${module.exports.name}.js`, "Dev");
                    var reports;
                    if (rows < 1) {
                        con.query(`INSERT INTO offense (user, total) VALUES (${author.id}, 0)`);
                        reports = 0;
                    } else {
                        reports = rows[0].total;
                    }
                    let rcolor = msg.member.roles.highest.color;      //The user's role's color
                    let uicon = author.avatarURL();
                    let autembed = new Discord.MessageEmbed()       //Sends a fancy display of execution information if the command isn't asking for help
                        .setTitle("__**Your Information**__")
                        .setAuthor(author.username, uicon)
                        .setColor(rcolor)
                        .setThumbnail(uicon)
                        .addField("Username", author.username)
                        .addField("Created Account", `${author.createdAt.getMonth()}/${author.createdAt.getDate()}/${author.createdAt.getFullYear()}`)
                        .addField("You Joined", `${msg.member.joinedAt.getMonth()}/${msg.member.joinedAt.getDate()}/${msg.member.joinedAt.getFullYear()}`)
                        .addField("Highest Role:", msg.member.roles.highest.toString())
                        .addField("# of Roles", msg.member.roles.cache.size)
                        .addField("Discord ID", msg.member.id)
                        .addField("# of Reports", reports)
                    con.query(`UPDATE offense SET total = ${reports}`);
                    return msg.channel.send(autembed);
                });

            }
        } catch (err) {
            return catchErr(err, msg, `${module.exports.name}.js`, "Dev");
        }
    },
};