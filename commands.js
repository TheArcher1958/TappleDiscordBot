const Discord = require('discord.js');
var mysql = require('mysql');
const fetch = require('node-fetch');
const node = require('nodeactyl');

const host = "";
const username = "";
const password = "";

const Client2 = node.Client;

Client2.login('', '', (logged_in) => {
    if (logged_in == false) {
        console.log("Bot was not able to connect to the server!")
    }
});
const prefix = "!";
function parseMessage(message) {

    if(message.content.charAt(0) == prefix) {
        let args = message.content.slice(prefix.length).trim().split(" ")
        return args
    }
};

function sendEmbedMessage(message, color, textTitle, text, client) {

    message.channel.send({embed: {
            color: color,
            title: textTitle,
            description: text,
            timestamp: new Date(),
            footer: {
                icon_url: client.user.avatarURL,
                text: "© Tapple"
            }
        }
    });
}

function publishSuggestion(message, color, textTitle, text, client) {
    let suggestionsChannel = client.channels.get("673751672991776768");
    suggestionsChannel.send({embed: {
            color: color,
            title: textTitle,
            description: text,
            timestamp: new Date(),
            footer: {
                icon_url: message.author.avatarURL,
                text: message.author.tag
            }
        }

    }).then(embedMessage => {
        embedMessage.react('❌').then(() => embedMessage.react('✅'))


    });
}

function sendEventSuggestion(message, color, textTitle, text, client) {
    var allowedIDs = ["182582278097076224", "259745940972240896", "259152321508802561", "170964908752502784", "237025024920256522", "600782387726647379", "222557837253935107"]
    const filter = (reaction, user) => {
        return ['❌', '✅'].includes(reaction.emoji.name)  && allowedIDs.includes(user.id);
    };
        let suggestionBoxChannel = client.channels.get("673341982294147082");

        suggestionBoxChannel.send({embed: {
            color: color,
            author: {
                name: message.author.tag,
                icon_url: message.author.avatarURL
            },
            title: textTitle,
            description: text,
            timestamp: new Date(),
            footer: {
                icon_url: client.user.avatarURL,
                text: "© Tapple"
            }
        }

    }).then(embedMessage => {
            embedMessage.react('❌').then(() => embedMessage.react('✅').then(() =>{

            embedMessage.awaitReactions(filter, { max: 1, errors: ['time'] })
                .then(collected => {
                    const reaction = collected.first();

                    if (reaction.emoji.name === '❌') {
                        embedMessage.delete()
                    } else {
                        publishSuggestion(message, 15105570, "Suggestion", text, client);
                        embedMessage.delete()

                    }
                })
            }));
        });
}

async function executeCommand(args, message, client, donatorRooms) {

    if (prefix == "!") {
        if (["ta", "togglealerts", "suggest", "create", "linkmc", "playerinfo", "discordinfo", "servercount", "playercount", "discordcount","ip","links", "joke"].indexOf(args[0]) != -1){
            if (!message.member.hasPermission(['BAN_MEMBERS'])) {


                if (message.channel.id != "627581997962756157") {
                    message.delete();
                    message.author.send({
                        embed: {
                            color: 15105570,
                            title: "Wrong Channel!",
                            description: "Command sent in the wrong channel!\nPlease send it again in the correct channel.",

                            timestamp: new Date(),
                            footer: {
                                icon_url: client.user.avatarURL,
                                text: "© Tapple"
                            }
                        }
                    });
                    return
                } 
            }
        } else if (["ban","unban","bans"].indexOf(args[0]) != -1) {
            if (message.channel.id != "673342285903167498") {
                message.delete();
                message.author.send({
                    embed: {
                        color: 15105570,
                        title: "Wrong Channel!",
                        description: "Command sent in the wrong channel!\nPlease send it again in the correct channel.",

                        timestamp: new Date(),
                        footer: {
                            icon_url: client.user.avatarURL,
                            text: "© Tapple"
                        }
                    }
                });
                return
            }
        }
        if (args[0] == "togglealerts" || args[0] == "ta") {
            if (message.member.roles.has("673341440956563456")) {

                message.member.removeRole(message.guild.roles.get("673341440956563456"));
                sendEmbedMessage(message, 15105570, "Toggle Role", "You have been removed from the Events role.", client)

            } else {
                message.member.addRole(message.guild.roles.get("673341440956563456"));
                sendEmbedMessage(message, 15105570, "Toggle Role", "You have been added to the Events role.", client)
            }
        } else if (args[0] == "ban") {

            let userIsTag = true;
            if (message.member.hasPermission(['BAN_MEMBERS'])) {
                if(args[1] == undefined) {
                    sendEmbedMessage(message, 15105570, "Ban User", "You need to tell me who to ban! Check !help if you don't know how.", client);
                } else {
                    let user = message.mentions.users.first(); // returns the user object if an user mention exists

                    if (!user) {
                        try {

                            user = message.guild.members.get(String(args[1]));
                            user = user.user;
                            userIsTag = false
                        } catch (error) {
                            sendEmbedMessage(message, 15105570, "Ban User", "Couldn\'t get a Discord user with this userID: " + args[1], client);
                            return
                        }
                    }
                    if (user === message.author) return sendEmbedMessage(message, 15105570, "Ban User", "You can\'t ban yourself!", client); // Check if the user mention or the entered userID is the message author himsmelf

                    if (userIsTag == false) {
                        if (message.guild.members.get(String(args[1])).bannable != true) {
                            return sendEmbedMessage(message, 15105570, "Ban User", "You don\'t have permission to ban that user!", client)
                        }
                    } else {
                        if (message.member.bannable != true) {
                            return sendEmbedMessage(message, 15105570, "Ban User", "You don\'t have permission to ban that user!", client)
                        }
                    }

                    if (args.length == 3) {
                        if (/^\d+$/.test(args[2])) {
                            let days = (args[2]);

                            message.guild.ban(user, {days: days, reason: ""})
                                .then(user => sendEmbedMessage(message, 15105570, "Ban User", `Banned ${user.tag || user.id || user} for ${days} days from ${message.guild}`, client))
                                .catch(console.error);
                        }
                    } else if (args.length == 2) {
                        message.guild.ban(String(user.id))
                            .then(user => sendEmbedMessage(message, 15105570, "Ban User", `Banned ${user.tag || user.id || user} from ${message.guild}`, client))
                            .catch(console.error);
                    } else {
                        return sendEmbedMessage(message, 15105570, "Ban User", `Incorrect ban format!`, client)
                    }
                }
            } else {
                sendEmbedMessage(message, 15105570, "Ban User", "You don\'t have permission for that command!", client);

            }
        } else if (args[0] == "unban") {

            if (message.member.hasPermission(['BAN_MEMBERS'])) {
                if (args[1] == "" || args[1] == " " || args[1] == undefined) {
                    return sendEmbedMessage(message, 15105570, "Unban User", "Please specify who to unban.\nUse !help if you don't know how.", client);

                } else {
                    try {
                        const banList = await message.guild.fetchBans();

                        const bannedUser = banList.find(user => user.id === args[1]);
                        if (args[1] === message.author.id) return sendEmbedMessage(message, 15105570, "Unban User", "You can\'t unban yourself!", client); // Check if the user mention or the entered userID is the message author himsmelf
                        if (bannedUser) {
                            message.guild.unban(String(args[1]))
                                .then(user => sendEmbedMessage(message, 15105570, "Unban User", `Unbanned ${user.username} from ${message.guild}`, client))
                                .catch(console.error);
                        } else return sendEmbedMessage(message, 15105570, "Unban User", "That user is not banned!", client);
                    } catch (err) {
                        console.error(err);
                    }
                }
            } else {
                sendEmbedMessage(message, 15105570, "Ban User", "You don\'t have permission for that command!", client);
            }

        } else if (args[0] == "bans") {
            if (message.member.hasPermission(['BAN_MEMBERS'])) {

                message.guild.fetchBans()
                    .then(bans => {
                        let userTags = bans.map(user => user.tag).join('\n');

                        // Make sure if the list is too long to fit in one message, you cut it off appropriately.
                        if (userTags.length >= 1950) userTags = `${userTags.slice(0, 1948)}...`;
                        let userIDs = bans.map(user => user.id).join('\n');

                        // Make sure if the list is too long to fit in one message, you cut it off appropriately.
                        if (userIDs.length >= 1950) userIDs = `${userIDs.slice(0, 1948)}...`;


                        sendEmbedMessage(message, 15105570, `This guild has ${bans.size} bans`, `Server bans:\n ${userTags} ${userIDs}`, client)
                    })
                    .catch(console.error);
            } else {
                sendEmbedMessage(message, 15105570, "Ban List", "You don\'t have permission for that command!", client);

            }
        } else if (args[0] == "suggest") {
            if (args[1] == "" || args[1] == " " || args[1] == undefined) {
                sendEmbedMessage(message, 15105570, "Suggestion", "Could not identify the suggestion. \nPlease make sure to use the correct format specified in !help.", client);

            } else {
                let theSuggestion = message.content.slice(9); // - Get the suggestion text not the command
                sendEmbedMessage(message, 15105570, "Suggestion", "Thank you for your suggestion! It has been sent to the staff team to be reviewed.", client);
                sendEventSuggestion(message, 15105570, "Suggestion", theSuggestion, client);
                // - add reactions with tap actions
            }
        } else if (args[0] === "create") {
            if (!message.member.roles.some(role => ["Apple", "Apple+", "God Apple", "Web Developer", "Owner", "Developer", "Creator", "Moderator", "Trial Moderator", "Builder"].includes(role.name))) {
                const embed = new Discord.RichEmbed()
                    .setTitle(`🙅‍♀️ Oops! This command is for donators only.`)
                    .setColor('#f54842')
                    .setDescription('You can become a donator by purchasing [a rank from our store.](https://store.tapple.world)');
                return message.channel.send(embed);
            }

            var proceed = true;
            if (args[1] == "room") {
                donatorRooms.forEach(item => {
                    if (item["author"] == message.author) {
                        const embed = new Discord.RichEmbed()
                            .setTitle(`❌ You already have a room active!`)
                            .setColor(15105570)
                            .setFooter('Quitting room creator', message.guild.iconURL);

                        proceed = false;
                        return message.channel.send(embed);

                    }

                });
                if (proceed) {
                    const embed = new Discord.RichEmbed()
                        .setTitle(`🏠 Create a donator room`)
                        .setColor('#f54842')
                        .setDescription('To get started, how many people do you want maximum in your room?')
                        .setFooter('Reply with a number from 1 to 99.', message.guild.iconURL);
                    message.channel.send(embed);

                    await message.channel.awaitMessages(reply => reply.author.id != client.user.id && reply.author.id == message.author.id, {
                        maxMatches: 1,
                        time: 10000,
                        errors: ['time']
                    }).then(reply => {
                        if (isNaN(reply.first().content) == false) {
                            if (parseInt(reply.first().content) >= 100) {
                                const embed = new Discord.RichEmbed()
                                    .setTitle(`❌  Room maximum must be below 100.`)
                                    .setColor(15105570)
                                    .setFooter('Quitting room creator', message.guild.iconURL);
                                return message.channel.send(embed);
                            }

                            if (Math.sign(parseInt(reply.first().content)) !== 1) {
                                const embed = new Discord.RichEmbed()
                                    .setTitle(`❌  Room maximum must be below 100 and above 0.`)
                                    .setColor(15105570)
                                    .setFooter('Quitting room creator', message.guild.iconURL)
                                return message.channel.send(embed);
                            }

                            const limit = reply.first().content;
                            const channelID = Math.floor(Math.random() * 16777215).toString(16);


                            message.guild.createChannel(`${message.author.username}'s Room`, {
                                type: 'voice',
                                userLimit: limit
                            }).then(channel => {

                                donatorRooms.add({
                                    channelID: channel.id,
                                    expires: Date.now() + 300000,
                                    guild: message.guild,
                                    author: message.author
                                });

                                let category = message.guild.channels.find(c => c.name == "Donator Rooms" && c.type == "category");

                                if (!category) throw new Error("Category channel does not exist");
                                channel.setParent(category.id);

                                const embed = new Discord.RichEmbed()
                                    .setTitle(`✅  Room created`)
                                    .setColor(15105570);
                                message.channel.send(embed);
                            })

                        } else {
                            const embed = new Discord.RichEmbed()
                                .setTitle(`❓ That doesn't look like a number.`)
                                .setColor(15105570)
                                .setFooter('Quitting room creator', message.guild.iconURL);
                            message.channel.send(embed);
                        }
                    }).catch(reason => {
                        if (reason.length == undefined) {
                            const embed = new Discord.RichEmbed()
                                .setTitle(`🛑 Room creation expired`)
                                .setColor(15105570)
                                .setFooter('Quitting room creator', message.guild.iconURL);
                            message.channel.send(embed);
                        } else {
                            const embed = new Discord.RichEmbed()
                                .setTitle(`❌ An error occoured`)
                                .setDescription(`\`\`\`${reason}\`\`\``)
                                .setColor(15105570)
                                .setFooter('Quitting room creator', message.guild.iconURL);
                            message.channel.send(embed);
                        }
                    })
                }
            } else {
                const embed = new Discord.RichEmbed()
                    .setTitle(`❓ Subcommand does not exist`)
                    .setColor(15105570)
                    .setDescription('Try one of these instead: `create`');
                message.channel.send(embed);
            }


        } else if (args[0] == "linkmc") {
            var rankList = {
                "default" : "649634655439421470",
                "none" : "649634655439421470",
                "apple" : "630253199470886932",
                "appleplus" : "630371107618291712",
                "godapple" : "630360663696605195",
                "group.default": "649634655439421470",
                "group.apple": "630253199470886932",
                "group.appleplus": "630371107618291712",
                "group.godapple": "630360663696605195",
                "group.creator" : "641124651853938689",
                "creator" : "641124651853938689"

            };
            if (args[1] == "" || args[1] == " " || args[1] == undefined) {
                sendEmbedMessage(message, 15105570, "LinkMC", "Correct usage: \n" + "!linkmc " + String.fromCharCode(60) + "token" + String.fromCharCode(62) + "\n" + "Use the command /linkmc in game to receive a token. This will be able to link your Discord to your Minecraft account.", client);
            } else {
                checkForExistingLinkAndUpdate(message.author.id, args[1])
            }
        } else if (args[0] == "help") {
            message.delete();
            if (message.member.hasPermission(['BAN_MEMBERS'])) {
                message.author.send({
                    embed: {
                        color: 15105570,
                        title: "Help",
                        description: "!togglealerts **»** Toggles the \"Events\" role to receive notifications. \n\n" +
                             "!linkmc " + String.fromCharCode(60) + "token" + String.fromCharCode(62) + " **»** Links your discord account to your Minecraft account. Get a token with /linkmc in-game!\n\n" +
                             "!playerinfo " + String.fromCharCode(60) + "discord tag" + String.fromCharCode(62) + " **»** Displays information about the users Minecraft account if it is linked with !linkmc.\n\n" +
                             "!discordinfo " + String.fromCharCode(60) + "uuid" + String.fromCharCode(62) + " **»** Displays information about a users Discord account if it is linked with !linkmc.\n\n" +
                             "!servercount **»** Displays the current number of connected players to tapple.world.\n\n" +
                             "!discordcount **»** Displays the current number of users in the Tapple Discord.\n\n" +
                             "!ip **»** Displays the ip to the Tapple Server.\n\n" +
                             "!links **»** Displays some useful links pertaining to the server.\n\n" +
                             "!joke **»** Displays a joke. Most likely a very cringy one...\n\n" +
                             "!suggest " + String.fromCharCode(60) + "suggestion" + String.fromCharCode(62) + " **»** Sends your suggestion to be reviewed by staff members. If it is accepted to be a good suggestion, players will be able to vote on it in #suggestions.\n\n" +
                             "!create room **»** Begins the process of creating your own temporary voice channel.\n\n" +
                             "!ban " + String.fromCharCode(60) + "user tag or id" + String.fromCharCode(62) + " **»** Bans players from the server, including an option for tempbans. Time to ban is in days only. \n" +
                             "(ex. !ban @The_Archer#1958 5)\n\n" +
                             "!bans **»** Lists all banned users from the discord server.\n\n" +
                             "!clear " + String.fromCharCode(60) + "number of messages to delete" + String.fromCharCode(62) + " **»** Deletes previous messages in the channel you send the command in.\n\n\nCreated by The_Archer#1958. Dm me if you have any questions.",
                        timestamp: new Date(),
                        footer: {
                            icon_url: client.user.avatarURL,
                            text: "© Tapple"
                        }
                    }
                });
            } else {
                message.author.send({
                    embed: {
                        color: 15105570,
                        title: "Help",
                        description: "!togglealerts **»** Toggles the \"Events\" role to receive notifications. \n\n" +
                            "!linkmc " + String.fromCharCode(60) + "token" + String.fromCharCode(62) + " **»** Links your discord account to your Minecraft account. Get a token with /linkmc in-game!\n\n" +
                            "!playerinfo " + String.fromCharCode(60) + "discord tag" + String.fromCharCode(62) + " **»** Displays information about the users Minecraft account if it is linked with !linkmc.\n\n" +
                            "!discordinfo " + String.fromCharCode(60) + "uuid" + String.fromCharCode(62) + " **»** Displays information about a users Discord account if it is linked with !linkmc.\n\n" +
                            "!servercount **»** Displays the current number of connected players to tapple.world.\n\n" +
                            "!discordcount **»** Displays the current number of users in the Tapple Discord.\n\n" +
                            "!ip **»** Displays the ip to the Tapple Server.\n\n" +
                            "!links **»** Displays some useful links pertaining to the server..\n\n" +
                            "!joke **»** Displays a joke. Most likely a very cringy one...\n\n" +
                            "!suggest " + String.fromCharCode(60) + "suggestion" + String.fromCharCode(62) + " **»** Sends your suggestion to be reviewed by staff members. If it is accepted to be a good suggestion, players will be able to vote on it in #suggestions.\n\n" +
                            "!create room **»** Begins the process of creating your own temporary voice channel. Must be a donator to use this command.\n\n\nCreated by The_Archer#1958. Dm me if you have any questions.",
                        timestamp: new Date(),
                        footer: {
                            icon_url: client.user.avatarURL,
                            text: "© Tapple"
                        }
                    }
                });
            }
        } else if (args[0] == "playerinfo") {
            if (args[1] == "" || args[1] == " " || args[1] == undefined) {
                checkForExistingLink(message.author.id, message.author);
            } else {

                let user = message.mentions.users.first();
                if (user != undefined) {
                    checkForExistingLink(user.id, user);
                } else {
                    message.channel.send({
                        embed: {
                            title: "Player Information",
                            color: 15105570,
                            description: "Could not find a discord user with that tag.",
                            timestamp: new Date(),
                            footer: {
                                icon_url: client.user.avatarURL,
                                text: "© Tapple"
                            }
                        }
                    });
                }
            }

        } else if (args[0] == "discordinfo") {
            if (args[1] == "" || args[1] == " " || args[1] == undefined) {
                message.channel.send({
                    embed: {
                        title: "User Information",
                        color: 15105570,
                        description: "You need to specify the uuid of the player you want to query.",
                        timestamp: new Date(),
                        footer: {
                            icon_url: client.user.avatarURL,
                            text: "© Tapple"
                        }
                    }
                });
            } else {

                checkIfLinked(args[1]);

            }

        } else if (args[0] == "servercount" || args[0] == "playercount") {
            const {players, online} = await fetch('https://api.mcsrvstat.us/2/tapple.world').then(response => response.json());
            if (online == false) {
                message.channel.send({
                    embed: {
                        title: "Server Player Count",
                        description: "Tapple.world is currently offline.",
                        color: 15105570,
                        timestamp: new Date(),
                        footer: {
                            icon_url: client.user.avatarURL,
                            text: "© Tapple"
                        }
                    }
                });
            } else {

                message.channel.send({
                    embed: {
                        title: "Server Player Count",
                        description: "Online Players: " + players["online"] + " / " + players["max"],
                        color: 15105570,
                        timestamp: new Date(),
                        footer: {
                            icon_url: client.user.avatarURL,
                            text: "© Tapple"
                        }
                    }
                });
            }
        } else if (args[0] == "joke") {
            const {setup, delivery} = await fetch('https://sv443.net/jokeapi/v2/joke/Miscellaneous?blacklistFlags=nsfw,religious,political,racist,sexist').then(response => response.json());
            message.channel.send({
                embed: {
                    title: "Cringy Joke",
                    description: setup + "\n\n" + delivery,
                    color: 15105570,
                    timestamp: new Date(),
                    footer: {
                        icon_url: client.user.avatarURL,
                        text: "© Tapple"
                    }
                }
            });
        } else if (args[0] == "cpu") {
            if (message.member.hasPermission(['BAN_MEMBERS'])) {


                Client2.getCPUUsage('0feae57e').then(response => {
                    /** See the JSON object below
                     * to see what response returns.
                     */
                    message.channel.send({
                        embed: {
                            title: "Bot CPU Usage",
                            description: (parseFloat(response['current']) / parseFloat(response['limit'])) * 100 + "%",
                            color: 15105570,
                            timestamp: new Date(),
                            footer: {
                                icon_url: client.user.avatarURL,
                                text: "© Tapple"
                            }
                        }
                    });
                }).catch((error) => {
                    throw error;
                });
            }
        } else if (args[0] == "ram") {
            if (message.member.hasPermission(['BAN_MEMBERS'])) {


                Client2.getRAMUsage('0feae57e').then(response => {
                    /** See the JSON object below
                     * to see what response returns.
                     */
                    message.channel.send({
                        embed: {
                            title: "Bot RAM Usage",
                            description: (parseFloat(response['current']) / parseFloat(response['limit'])) * 100 + "%",
                            color: 15105570,
                            timestamp: new Date(),
                            footer: {
                                icon_url: client.user.avatarURL,
                                text: "© Tapple"
                            }
                        }
                    });
                }).catch((error) => {
                    throw error;
                });
            }
        } else if (args[0] == "restart") {
            if (message.member.hasPermission(['BAN_MEMBERS'])) {
                message.channel.send({
                        embed: {
                            title: "Restart Bot",
                            description: "Started the restart process.\nThe restart should complete in ~20 seconds.",
                            color: 15105570,
                            timestamp: new Date(),
                            footer: {
                                icon_url: client.user.avatarURL,
                                text: "© Tapple"
                            }
                        }
                    });
                Client2.restartServer("0feae57e").then((response) => {
                    
                }).catch((error) => {
                    console.log(error);
                });

            }
        
        } else if (args[0] == "ip") {
            message.channel.send({
                embed: {
                    title: "IP: tapple.world",
                    color: 15105570,
                    timestamp: new Date(),
                    footer: {
                        icon_url: client.user.avatarURL,
                        text: "© Tapple"
                    }
                }
            });
        } else if (args[0] == "discordcount") {
            message.channel.send({
                embed: {
                    title: "Discord User Count: " + message.guild.members.size,
                    description: "" + message.guild.members.size - message.guild.members.filter(member => !member.user.bot).size + " of those users are bots.",
                    color: 15105570,
                    timestamp: new Date(),
                    footer: {
                        icon_url: client.user.avatarURL,
                        text: "© Tapple"
                    }
                }
            });
        } else if (args[0] == "links") {
            message.channel.send({
                embed: {
                    title: "Tapple Links",
                    description: "Twitter ➢ https://twitter.com/OfficialTapple\n" +
                        "Permanent Discord Link ➢ https://invite.gg/tapple\n" +
                        "Website ➢ https://tapple.world/\n" +
                        "Forums ➢ https://tapple.world/forums\n" +
                        "Store ➢ https://store.tapple.world/\n" +
                        "Events Calendar ➢ https://tapple.world/events\n" +
                        "Applications ➢ https://tapple.world/forums/applications.11/\n" +
                        "TapL's YouTube ➢ http://bit.ly/taplyoutube",
                    color: 15105570,
                    timestamp: new Date(),
                    footer: {
                        icon_url: client.user.avatarURL,
                        text: "© Tapple"
                    }
                }
            });
        
        } else if (args[0] == "clear") {
            if (message.member.hasPermission(['BAN_MEMBERS'])) {
                if (/^\d+$/.test(args[1])) {
                    var amountToDelete = parseInt(args[1]);
                    let channel = message.channel; // <-- your pre-filled channel variable
                    channel.fetchMessages({limit: amountToDelete + 1}).then(messages => {
                        messages.deleteAll()
                    })
                        .catch(console.error);
                } else {
                    message.author.send({
                        embed: {
                            color: 15105570,
                            title: "Clear",
                            description: "Invalid parameters! Use !help for the correct format.",

                            timestamp: new Date(),
                            footer: {
                                icon_url: client.user.avatarURL,
                                text: "© Tapple"
                            }
                        }
                    });
                }
            } else {
                sendEmbedMessage(message, 15105570, "Clear", "You don\'t have permission for that command!", client);
            }
        }
        else if (args[0] == "specialCommand44"){
            if(message.author.id == "237025024920256522") {
                message.delete();
                var x = 0;
                var colors = ['#8585ff', '#fff681', '#a073fd', '#fd73b9', '#5cf51b', '#f53f1b', '#f5b41b', '#1b2af5'];
                var role = message.guild.roles.find(role => role.id === "619340300782927892"); 
                function colorSwap() {
                    role.edit({
                        color: colors[x]
                    });
                    console.log("Changed webdev role color to " + colors[x])
                    x += 1;
                    if (x > colors.length - 1) {
                        x = 0;
                    }
                }

                okTimer = setInterval(colorSwap, 5000);
            }


        } else if (args[0] == "specialCommand45") {
            if (message.author.id == "237025024920256522") {
                message.delete();
                clearInterval(okTimer);
            }
        } else if (args[0] == "specialCommand46"){
            if(message.author.id == "182582278097076224" || message.author.id == "222557837253935107" || message.author.id == "237025024920256522") {
                message.delete();
                var x = 0;
                var colors2 = ['#8585ff', '#fff681', '#a073fd', '#fd73b9', '#5cf51b', '#f53f1b', '#f5b41b', '#1b2af5', '#5ef0ff', '#edc600'];
                var role = message.guild.roles.find(role => role.id === "617934378940629013"); 
                function colorSwap2() {
                    role.edit({
                        color: colors2[x]
                    });
                    console.log("Changed owner role color to " + colors2[x])
                    x += 1;
                    if (x > colors2.length - 1) {
                        x = 0;
                    }
                }
    
                okTimer2 = setInterval(colorSwap2, 5000);
            }
    
    
        } else if (args[0] == "specialCommand47") {
            if(message.author.id == "182582278097076224" || message.author.id == "222557837253935107" || message.author.id == "237025024920256522") {
                message.delete();
                clearInterval(okTimer2);
            }
        } else if (args[0] == "specialCommand48") {
            if(message.author.id == "182582278097076224" || message.author.id == "222557837253935107" || message.author.id == "237025024920256522") {
                message.delete();
                var y = 0;
                var aName = ['The_Archer', '=The_Archer=', '-=The_Archer=-']
                
                function nameSwap() {
                    message.guild.members.get("237025024920256522").setNickname(aName[y]);
                    y += 1;
                    if (y > aName.length - 1) {
                        y = 0;
                    }
                }
                okTimer3 = setInterval(nameSwap, 5000);

            }
        } else if (args[0] == "specialCommand49") {
            if(message.author.id == "182582278097076224" || message.author.id == "222557837253935107" || message.author.id == "237025024920256522") {
                message.delete();
                clearInterval(okTimer3);
            }
        } else if (args[0] == "offenses") {
            if (message.member.hasPermission(['BAN_MEMBERS'])) {
    
                function returnMember(member) {
                    return message.guild.members.find(m => m.user.tag === member)
                }
                if(args[1] == undefined) {
                    message.channel.send({
                        embed: {
                            title: "Infractions",
                            description: "Please supply a user tag to search for!",
                            color: 15105570,
                            timestamp: new Date(),
                            footer: {
                                icon_url: client.user.avatarURL,
                                text: "© Tapple"
                            }
                        }
                    });
                    return
                }
                var theMember = returnMember(args[1]);
                if (theMember != null) {
                    getInfractionsFromMember(theMember, message)
                } else {
                    message.channel.send({
                        embed: {
                            title: "Infractions",
                            description: "Unable to find user: " + args[1] ,
                            color: 15105570,
                            timestamp: new Date(),
                            footer: {
                                icon_url: client.user.avatarURL,
                                text: "© Tapple"
                            }
                        }
                    });
                }
            }
        } else if (args[0] == "updateRole") {
            var memberHighestRole = 0;
            var rankList = [
                "649634655439421470",
                "630253199470886932",
                "630371107618291712",
                "630360663696605195"
            ];
            message.member.roles.forEach(role => {
                var newIndexFound = rankList.indexOf(role.id);
                if(newIndexFound > memberHighestRole) {
                    memberHighestRole = newIndexFound
                }
            });
            console.log("Highest Role " + memberHighestRole);

            checkForHigherRankAndUpdate(message.member.id, rankList[memberHighestRole]);
        }
    }



    function getInfractionsFromMember(member, message) {
        var errorMessage = "";
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
                    message.channel.send({
                        embed: {
                            title: "Infractions",
                            description: "That member has no infractions.",
                            color: 15105570,
                            timestamp: new Date(),
                            footer: {
                                icon_url: client.user.avatarURL,
                                text: "© Tapple"
                            }
                        }
                    });
                } else {
    
    
                    con.query('SELECT offences FROM discordOffences WHERE discordID=' + mysql.escape(member.id), function (err, result, fields) {
                        if (err) throw err;
                        var offences = result[0]['offences'];
                        var dateJoined = message.member.joinedAt;
                        var dateString = dateJoined.getUTCFullYear() + "/" +
                            ("0" + (dateJoined.getUTCMonth()+1)).slice(-2) + "/" +
                            ("0" + dateJoined.getUTCDate()).slice(-2);
                        message.channel.send({
                            embed: {
                                title: "Infractions",
                                description: message.member.user.tag + " has " + offences + " infractions.\nRole: " + message.member.highestRole.name + "\nJoin date: " + dateString,
                                color: 15105570,
                                timestamp: new Date(),
                                footer: {
                                    icon_url: client.user.avatarURL,
                                    text: "© Tapple"
                                }
                            }
                        });
                    });
                }
            });
        });
    }



    function checkIfLinked(uuid) {

        var con = mysql.createConnection({
            host: host,
            user: username,
            password: password,
            database: "",
            port: 25060
        });

        con.connect(function (err) {
            if (err) throw err;
            con.query('SELECT discordID FROM accounts WHERE uuid=' + mysql.escape(uuid), function (err, result, fields) {
                if (err) throw err;

                if (result.length == 0) {
                    message.channel.send({
                        embed: {
                            title: "User Information",
                            color: 15105570,
                            description: "Could not find a Minecraft player with that uuid.\nPlease make sure the account is linked and try again later.",
                            timestamp: new Date(),
                            footer: {
                                icon_url: client.user.avatarURL,
                                text: "© Tapple"
                            }
                        }
                    });
                } else {
                    var user = client.fetchUser(result[0]['discordID']).then(user => {
                        message.channel.send({
                            embed: {
                                title: "User Information",
                                color: 15105570,
                                description: "Discord Tag: " + String(user.tag) + "\nDiscord ID: " + String(result[0]['discordID']),
                                timestamp: new Date(),
                                footer: {
                                    icon_url: client.user.avatarURL,
                                    text: "© Tapple"
                                }
                            }
                        });
                    });
                }
            });
        });
    }



//checkForExistingLink

    function checkForExistingLink(discordID, user) {
        var rankList2 = {
            "default" : "Non :P",
            "none" : "Non :P",
            "apple" : "Apple",
            "appleplus" : "Apple+",
            "godapple" : "God Apple",
            "webdev" : "Web Developer",
            "builder" : "Builder",
            "creator" : "Creator",
            "mod" : "Mod",
            "trialmod" : "Trial-Mod",
            "dev" : "Developer",
            "owner" : "Owner"
        };
        var con = mysql.createConnection({
            host: host,
            user: username,
            password: password,
            database: "",
            port: 25060
        });

        con.connect(function (err) {
            if (err) throw err;
            con.query('SELECT uuid, rank FROM accounts WHERE discordID=' + mysql.escape(discordID), function (err, result, fields) {
                if (err) throw err;

                if (result.length == 0) {
                    message.channel.send({embed: {
                            title: "Player Information",
                            color: 15105570,
                            description: "The account " + user.tag + " is not linked!\nPlease try again later.",
                            timestamp: new Date(),
                            footer: {
                                icon_url: client.user.avatarURL,
                                text: "© Tapple"
                            }
                        }
                    });
                } else {
                    var uuid = result[0]['uuid'];
                    var rank = result[0]['rank'];


                    var con = mysql.createConnection({
                        host: host,
                        user: username,
                        password: password,
                        database: "tapple_mcserver"
                    });

                    con.connect(function (err) {
                        if (err) throw err;
                        con.query('SELECT name FROM playerInfo WHERE uuid=' + mysql.escape(uuid), function (err, result, fields) {
                            if (err) throw err;
                            if (result.length == 0) {
                                message.channel.send({embed: {
                                        title: "Player Information",
                                        color: 15105570,
                                        description: "Your account is not linked!\nPlease link your account and then try again.",
                                        timestamp: new Date(),
                                        footer: {
                                            icon_url: client.user.avatarURL,
                                            text: "© Tapple"
                                        }
                                    }
                                });
                            }  else {
                                message.channel.send({ embed: {
                                        title: "Player Information",
                                        color: 15105570,
                                        thumbnail: {
                                            url: "https://crafatar.com/avatars/" + uuid + "?size=40"
                                        },
                                        description: "Username: " + result[0]['name'] + "\nRank: " + rankList2[rank],
                                        timestamp: new Date(),

                                        footer: {
                                            icon_url: client.user.avatarURL,
                                            text: "© Tapple"
                                        }
                                    }
                                });
                            }
                        });
                    });
                }
            });
        });
    }





    function checkForExistingLinkAndUpdate(discordID, token) {
        var errorMessage = "";
        var con = mysql.createConnection({
            host: host,
            user: username,
            password: password,
            database: "",
            port: 25060
        });

        con.connect(function (err) {
            if (err) throw err;
            con.query('SELECT * FROM `accounts` WHERE discordID=' + mysql.escape(discordID), function (err, result, fields) {
                if (err) throw err;

                if (result.length == 0) {
                    con.query('SELECT `discordID` FROM `accounts` WHERE token=' + mysql.escape(token), function (err, result, fields) {
                        if (err) throw err;
                        if (result.length == 0) {
                            errorMessage = "The provided token is invalid!";
                            return sendEmbedMessage(message, 15105570, "LinkMC", errorMessage, client);
                        } else if (result[0]['discordID'] == " " || result[0]['discordID'] == "") {

                            con.query('UPDATE `accounts` SET discordID=' + discordID + ' WHERE token=' + mysql.escape(token), function (err, result, fields) {
                                if (err) throw err;
                                con.query('SELECT `rank` FROM `accounts` WHERE discordID=' + mysql.escape(discordID), function (err, result, fields) {
                                    if (err) throw err;
                                    var rank = result[0]['rank'];
                                    if(rankList['rank'] == "") {
                                        message.delete();
                                        sendEmbedMessage(message, 15105570, "LinkMC", "Accounts successfully linked!", client);
                                    } else {
                                        message.delete();
                                        message.member.addRole(message.guild.roles.get(rankList[rank]));
                                        sendEmbedMessage(message, 15105570, "LinkMC", "Accounts successfully linked!", client);
                                    }
                                });
                            });
                        } else {
                            message.delete();
                            errorMessage = "The provided token is already used by another account!";
                            return sendEmbedMessage(message, 15105570, "LinkMC", errorMessage, client);
                        }
                    });
                } else {
                    message.delete();
                    errorMessage = "Your Discord account is already linked!";
                    return sendEmbedMessage(message, 15105570, "LinkMC", errorMessage, client);
                }
            });
        });

    }
    
    function checkForHigherRankAndUpdate(discordID, currentRank) {
        const lpRankArray = ["group.default","group.apple","group.appleplus", "group.godapple", "group.creator"];

        var rankList2 = {
            
            "group.default": "649634655439421470",
            "group.apple": "630253199470886932",
            "group.appleplus": "630371107618291712",
            "group.godapple": "630360663696605195",
            "group.creator" : "641124651853938689",
        };
        var highestRankIndex = 0;

        var errorMessage = "";
        var con = mysql.createConnection({
            host: host,
            user: username,
            password: password,
            database: "",
            port: 25060
        });

        con.connect(function (err) {
            if (err) throw err;
            con.query('SELECT `uuid` FROM `accounts` WHERE discordID=' + mysql.escape(discordID), function (err, result, fields) {
                if (err) throw err;
                if (result.length > 0) { //Found data
                    var uuid = result[0]['uuid'];
                    console.log('uuid ' + uuid);

                    var con2 = mysql.createConnection({
                        host: host,
                        user: username,
                        password: password,
                        database: "",
                        port: 25060
                    });

                    con2.connect(function (err) {
                        if (err) throw err;
                        con2.query('SELECT `permission` FROM `luckperms_user_permissions` WHERE uuid=' + mysql.escape(uuid), function (err, result, fields) {
                            if (err) throw err;
                            if (result.length > 0) { //Found data
                                result.forEach( rank => {

                                    var indexFound = lpRankArray.indexOf(rank.permission);
                                    if(indexFound > highestRankIndex) {
                                        highestRankIndex = indexFound
                                    }
                                });
                                console.log('highest rank index ' + highestRankIndex);
                                if(currentRank == rankList2[lpRankArray[highestRankIndex]] || rankList2[lpRankArray[highestRankIndex]] == "649634655439421470") {
                                    sendEmbedMessage(message, 15105570, "LinkMC", `You already have the highest role for your rank!`, client);
                                } else {
                                    if(currentRank == "649634655439421470") {
                                        
                                    } else {
                                        message.member.removeRole(currentRank);
                                    }
                                    message.member.addRole(rankList2[lpRankArray[highestRankIndex]]);
                                    sendEmbedMessage(message, 15105570, "LinkMC", "Your role has been updated!", client);
                                }
                            } else {
                                errorMessage = "There was a problem connecting to your account. Please contact The_Archer#1958 with this code: 400lp";
                                sendEmbedMessage(message, 15105570, "LinkMC", errorMessage, client);
                            }
                        });
                    });



                } else {
                    errorMessage = "Your account is not linked! Please contact The_Archer#1958 if you think there is a problem.";
                    sendEmbedMessage(message, 15105570, "LinkMC", errorMessage, client);
                }
            });
        });

    }


}

module.exports.parseMessage = parseMessage;
module.exports.prefix = prefix;
module.exports.executeCommand = executeCommand;