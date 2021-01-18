const Discord = require("discord.js");
const client = new Discord.Client();
client.commands = new Discord.Collection();
const fs = require("fs");
const { token, sqlpass } = require("./token.json");
const { prefix, pink, crimson, devid, reportchan } = require("./config.json");
const wait = require('util').promisify(setTimeout);
const mysql = require("mysql");
const commandFiles = fs.readdirSync('./Code/').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./Code/${file}`);
    client.commands.set(command.name, command);
}
const cooldowns = new Discord.Collection();

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: sqlpass,
    database: "tutorclub",
    flags: '-SESSION_TRACK'
});
con.connect(err => {
    if (err) throw err;
    console.log("All commands loaded");
});
function catchErr(err, message, file, sendb) {
    const bruh = new Date(Date.now())
    fs.appendFile(`./Logs/Error/${bruh.getMonth() + 1}_${bruh.getDate()}_${bruh.getFullYear()}.txt`, `\n\n----------${bruh.toTimeString().slice(0, 8)}----------\n${file}\n${err.name}\n${err.message}\n${err.stack}\n\n#${message.channel.name}\n@${message.author.username}\n${message.author.id}`, (err) => {
        if (err) throw err;
    });
    let dev = client.users.cache.get(devid)
    let errembed = new Discord.MessageEmbed()
        .setTitle(`${bruh.toTimeString().slice(0, 8)} @ ${file}`)
        .setDescription(`\`${err.message}\n${err.stack}\`\n\n#${message.channel.name}\n<@${message.author.id}>`)
        .setThumbnail("https://i.pinimg.com/originals/e6/a8/44/e6a8448e291d3f3b4d4842fda7ba3c52.jpg")
        .setColor(crimson)
    dev.send(errembed)
    if (sendb === "None") return;
    else if (sendb === "Dev") return message.channel.send(`Oops something went wrong on our end! Contact the developer for assistance\n<@${devid}>`)
    else return message.channel.send(sendb)
}
client.on("ready", () => {
    console.log(`${client.user.username} is now online`);
    client.user.setActivity("my server", { type: "WATCHING", url: "https://discord.com/invite/SmQ8aEs3CV" });     //Sets what the bot is doing
    wait(1000)
});
client.on("message", async msg => {
    try {
        let author = msg.author;
        if (author.bot) return;     //Doesn't let the bot respond to itself
        const args = msg.content.slice(prefix.length).trim().split(/ +/g);      //Takes away the prefix and command to make the array 0 based. Equals everything after
        const commandName = args.shift().toLowerCase();     //The string directly after the prefix. No space allowed

        const command = client.commands.get(commandName)
            || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
        if (!command) return;
        if (!msg.content.startsWith(prefix)) return;

        if ((command.class === "devcmd") && (msg.author.id != '250072488929787924')) return msg.channel.send("You are not worthy :pensive:");
        if ((command.class === "admin") && (!msg.member.hasPermission("ADMINISTRATOR"))) return msg.channel.send("You are not worthy :pensive:");
        if ((command.class === "moderation") && (!msg.member.hasPermission("MANAGE_MESSAGES"))) return msg.channel.send("You are not worthy :pensive:");
        if (command.args && !args.length) {
            let reply = `You didn't provide any arguments, ${msg.author.username}!`;

            if (command.usage) {
                reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
            }

            return msg.channel.send(reply);
        }
        //Cooldown
        if (!cooldowns.has(command.name)) {
            cooldowns.set(command.name, new Discord.Collection());
        }
        const now = Date.now();
        const timestamps = cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || 3) * 1000;

        if (timestamps.has(msg.author.id)) {
            const expirationTime = timestamps.get(msg.author.id) + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return msg.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
            }
        }
        timestamps.set(msg.author.id, now);
        setTimeout(() => timestamps.delete(msg.author.id), cooldownAmount);
        try {
            command.execute(msg, args, client, con, catchErr, devid);
        } catch (error) {
            return catchErr(error, msg, "index.js", "Main file error");
        }
    } catch (error) {
        return catchErr(error, msg, "index.js", "Main file error");
    }
})
client.on("guildMemberAdd", async (newmem) => {
    if (newmem.guild.id != '799431639397826593') return;
    con.query(`INSERT INTO offense (user, total) VALUES (${newmem.id}, 0)`)
});
client.on("messageDelete", async oldmsg => {
    con.query(`SELECT * FROM lastdel`, (err, rows) => {
        if (rows[0].id != 0) return;

        if (oldmsg.author.bot == true) return;
        const logchan = client.channels.cache.get(reportchan);
        if (oldmsg.attachments.size > 0) {
            let oldimg = '';
            oldmsg.attachments.forEach((row) => {
                oldimg += `\n${row.proxyURL}`;
            })
            try {
                let delmsg = new Discord.MessageEmbed()
                    .setAuthor(oldmsg.author.username, oldmsg.author.avatarURL())
                    .setTitle(`**${oldmsg.author.username}'s** message was deleted`)
                    .setThumbnail("https://66.media.tumblr.com/7faf76a655814723d93f17aac4223adc/tumblr_p67vmb88qf1wctgsho1_250.jpg")
                    .setColor(pink)
                    .setTimestamp();
                logchan.send(delmsg);
                logchan.send(oldimg);
            } catch {
                let delmsg = new Discord.MessageEmbed()
                    .setAuthor(oldmsg.author.username, oldmsg.author.avatarURL())
                    .setTitle(`**${oldmsg.author.username}'s** message was deleted`)
                    .setThumbnail("https://66.media.tumblr.com/7faf76a655814723d93f17aac4223adc/tumblr_p67vmb88qf1wctgsho1_250.jpg")
                    .setColor(pink)
                    .setTimestamp()
                logchan.send(delmsg);
                logchan.send(oldimg);
            }
        } else {
            let delmsg = new Discord.MessageEmbed()
                .setAuthor(oldmsg.author.username, oldmsg.author.avatarURL())
                .setTitle(`**${oldmsg.author.username}'s** message was deleted`)
                .setThumbnail("https://66.media.tumblr.com/7faf76a655814723d93f17aac4223adc/tumblr_p67vmb88qf1wctgsho1_250.jpg")
                .setColor(pink)
                .setTimestamp()
            logchan.send(delmsg);
        }
    })
});
client.on("guildBanAdd", (guild, banmem) => {
    const logchan = client.channels.cache.get(reportchan);
    let banEmbed = new Discord.MessageEmbed()      //Sends a fancy display of execution information
        .setTitle(`**${banmem.username}** was banned`)
        .setAuthor(banmem.username, banmem.avatarURL())
        .setThumbnail("https://media2.giphy.com/media/WXgtdvFFbAYIU/source.gif")
        .setColor(pink)
        .setTimestamp()
    logchan.send(banEmbed);
});
client.on("guildBanRemove", (guild, unbanmem) => {
    const logchan = client.channels.cache.get(reportchan);
    let banEmbed = new Discord.MessageEmbed()      //Sends a fancy display of execution information
        .setTitle(`**${unbanmem.username}** was unbanned`)
        .setAuthor(unbanmem.username, unbanmem.avatarURL())
        .setThumbnail("http://38.media.tumblr.com/d9d99d3b8904a38f8108c7eecec1b766/tumblr_ncvx9wgMLi1se015qo1_500.gif")
        .setColor(pink)
        .setTimestamp()
    logchan.send(banEmbed);
});
client.on("debug", deb => {
    const bruh = new Date(Date.now())
    fs.appendFile(`./Logs/Debug/${bruh.getMonth() + 1}_${bruh.getDate()}_${bruh.getFullYear()}--Debug.txt`, `\n\n----------${bruh.toTimeString().slice(0, 8)}----------\n${deb}`, (err) => {
        if (err) throw err;
    });
})
client.login(token);        //Token for the bot to use this file