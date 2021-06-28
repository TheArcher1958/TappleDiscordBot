const Discord = require('discord.js');
const Commands = require('./commands.js');
var mysql = require('mysql');

const host = "";
const username = "";
const password = "";
const client = new Discord.Client();

client.on('ready', () => {
    console.log("Connected as " + client.user.tag);
    client.user.setActivity('tapple.world  |  !help',{
        type: 'PLAYING' //Sets activity. Uses "WATCHING" "STREAMING" "PLAYING
    }).catch(console.error);


});


const donatorRooms = new Set();



setInterval(() => {
    // Donator rooms job
    donatorRooms.forEach(item => {
        if(item.expires > Date.now()) return;
        item.guild.channels.forEach(channel => {
            if(channel.type !== 'voice') return;
            if(channel.id == item.channelID) {
                if(channel.members.some(member => member.id == item.author.id) == false) {
                    donatorRooms.delete(item);
                    channel.delete();

                    const embed = new Discord.RichEmbed()
                        .setTitle(`🗑  Your room was closed due to inactivity after 5 minutes.`)
                        .setColor('#f54842');
                    item.author.send(embed);
                }
            }
        })
    })
}, 300000);

const seperateWords = [""]
const badWords = ["bad words go here"];
client.on('message', (receivedMessage) => {

    if (receivedMessage.author == client.user) {
        return
    }


    for(var i in badWords) {
        if(receivedMessage.content.includes(badWords[i])) {
            receivedMessage.delete();
            addInfractionToMember(receivedMessage.member, receivedMessage)
            break
            return
        }
    }
    let splited = receivedMessage.content.split(" ");
    for(var i in seperateWords) {
        for(var y in splited) {
            if(seperateWords[i] == splited[y]) {
                receivedMessage.delete()
                addInfractionToMember(receivedMessage.member, receivedMessage)
                break
                return
            }
        }
    }


    if (receivedMessage.content.charAt(0) == "!") {
        Commands.executeCommand(Commands.parseMessage(receivedMessage), receivedMessage, client, donatorRooms);
    }


});






function addInfractionToMember(member, message) {
    var con = mysql.createConnection({
        host: host,
        user: username,
        password: password,
        database: "",
        port: 25060
    });

    con.connect(function (err) {
        if (err) throw err;
        con.query('SELECT * FROM discordOffences WHERE discordID=' + mysql.escape(member.id), function (err, result, fields) {
            if (err) throw err;

            if (result.length == 0) {
                con.query("INSERT INTO discordOffences (discordID, offences) VALUES (" + mysql.escape(member.id) + ", 1)" , function (err, result, fields) {
                    if (err) throw err;
                    var offences = 1;
                    let badWordsChannel = client.channels.get("673340911027093545");
                    badWordsChannel.send({embed: {
                            color: 15105570,
                            title: "Bad Words Logs",
                            description: "Offender: " + message.author + "\n\nMessage Sent: " + message.content + "\n\nChannel sent in: " + client.channels.get(message.channel.id) + "\n\nOffenses: " + offenes,
                            timestamp: new Date(),
                            footer: {
                                icon_url: client.user.avatarURL,
                                text: "© Tapple"
                            }
                        }

                    });
                });
            } else {
                var offences2 = result[0]['offences'] + 1;

                con.query('UPDATE discordOffences SET offences=offences+1 WHERE discordID=' + mysql.escape(member.id), function (err, result, fields) {
                    if (err) throw err;
                    let badWordsChannel = client.channels.get("673340911027093545");
                    badWordsChannel.send({embed: {
                            color: 15105570,
                            title: "Bad Words Logs",
                            description: "Offender: " + message.author + "\n\nMessage Sent: " + message.content + "\n\nChannel sent in: " + client.channels.get(message.channel.id) + "\n\nOffenses: " + offences2,
                            timestamp: new Date(),
                            footer: {
                                icon_url: client.user.avatarURL,
                                text: "© Tapple"
                            }
                        }

                    });
                });

            }

            if(result.length != 0) {
                var offences = result[0]['offences'] + 1;

            } else {
                var offences = 1;

            }

            message.author.send({
                embed: {
                    color: 15105570,
                    title: "Infraction Detection",
                    description: "We have detected an unwelcome message from you.\nYou have " + offences + " infractions. Too many will lead to a punishment.\n\nMessage Content: " + message.content,
                    timestamp: new Date(),
                    footer: {
                        icon_url: client.user.avatarURL,
                        text: "© Tapple"
                    }
                }
            })
        });
    });

}




client.on('guildMemberAdd', async member => {
    let myRole = member.guild.roles.get("673341440956563456"); // Events Role
    member.addRole(myRole).catch(console.error); // - Give user Events role.
});


client.login("TOKEN GOES HERE");