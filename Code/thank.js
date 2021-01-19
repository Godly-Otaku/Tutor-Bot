const Discord = require("discord.js");
const { green } = require("../config.json");

module.exports = {
	name: 'thank',
	description: `Thank someone for helping you`,
	usage: '<user>',
	cooldown: 10,
	class: 'info',
	args: true,
	execute(msg, args, client, con, catchErr) {
		try {
			const user = msg.mentions.users.first();
			if (!user) return msg.channel.send(`You didn't mention a user to kick`).then(m => m.delete({ timeout: 5000 }));    //If the command mentions a user
			const member = msg.guild.member(user);
			if (!member) return msg.channel.send("That user isn't in this server").then(m => m.delete({ timeout: 5000 }));      //If the user is in the server
			const author = msg.author;

			con.query(`SELECT * FROM thanking WHERE user = ${author.id}`, (err, rows) => {
				if (err) return catchErr(err, msg, `${module.exports.name}.js`, "Dev");
				var thankerthanks;
				console.table(rows);
				if (rows < 1) {
					con.query(`INSERT INTO thanking (user, points, thanks) VALUES (${author.id}, 0, 0)`);
					thankerthanks = 0;
				} else {
					thankerthanks = rows[0].thanks;
				}
				con.query(`UPDATE thanking SET thanks = ${(thankerthanks + 1)} WHERE user = ${author.id}`);
			});
			con.query(`SELECT * FROM thanking WHERE user = ${user.id}`, (err, rows) => {
				if (err) return catchErr(err, msg, `${module.exports.name}.js`, "Dev");
				console.table(rows);
				if (rows < 1) {
					con.query(`INSERT INTO thanking (user, points, thanks) VALUES (${user.id}, 0, 0)`);
					tutorpoints = 0;
				} else {
					tutorpoints = rows[0].points;
				}
				con.query(`UPDATE thanking SET points = ${(tutorpoints + 10)} WHERE user = ${user.id}`);
			});
			let kickEmbed = new Discord.MessageEmbed()     //Sends a fancy display of execution information
				.setTitle(`You thanked ${user.username}`)
				.setTimestamp()
				.setColor(green)
			return msg.channel.send(kickEmbed);
		} catch (err) {
			catchErr(err, msg, `${module.exports.name}.js`, "Dev");
		}
	},
}