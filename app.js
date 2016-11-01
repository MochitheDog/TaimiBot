// Taimi Bot
// Example code
const Discord = require('discord.js');
const bot = new Discord.Client();

const token = 'MYTOKEN'; // Don't commit the token to Github!
const prefix = 't.';
const jsonf = require('./responses.json');
//const wiki = require('wikijs');


bot.on('ready', () => {
    console.log('Taimi Bot is ready!');
});

bot.on('message', msg => {
    // Stop early if message was sent by another bot
    if (msg.author.bot) return;
    let limitResults = 5; // For limiting search results

    if (msg.content === 'ping') {
        // Ping-pong
        msg.reply("pong");
    } else if (jsonf.hasOwnProperty(msg.content)) {
        // Respond to simple commands in json file
        msg.reply(jsonf[msg.content]);
    } else if (msg.content.startsWith('/wiki ')) {
        // GW2 Wiki search
        var wiki = require('wikijs');
        var str = msg.content.slice(6); // slice prefix from search terms
        str = str.trim(); // trim remaining whitespace off both ends of str
        // If only one word in search term, capitalize it
        var capitalize = str.charAt(0).toUpperCase();
        str = capitalize + str.slice(1);
        wiki().search(str, limitResults).then(function (data) {
            console.log("search results for " + str + ": " + data.results + " " + data.results.length);
            var i;
            var url;
            
            if (data.results.length >= 1) {
                if ((i = data.results.indexOf(str)) > 0) {
                    //console.log("found an exact match for search at index = " + i);
                } else {
                    i = 0; // Take first result
                }
                wiki().page(data.results[i]).then(function (page) {
                    //url = page.raw.fullurl;
                    console.log(page);
                    if (page.raw.hasOwnProperty('redirect')) {
                        // Handle redirect pages
                        wiki().page(data.results[i]).then(page => page.links().then(function (results) {
                            console.log(results.length);
                            wiki().page(results[0]).then(function (page) {
                                //console.log(page.raw.fullurl);
                                msg.channel.sendMessage(page.raw.fullurl);
                            });
                        }));
                    } else { // No redirects 
                        //console.log(page.raw.fullurl);
                        msg.channel.sendMessage(page.raw.fullurl);
                    }
                    //console.log(url); // says 'undefined' for some reason
                    //msg.channel.sendMessage(url);
                });
            } else {
                msg.channel.sendMessage("No articles found.");
                return;
            }
        }, function (err) {
                msg.channel.sendMessage(err);
        });
    }
});

function getCommand(cmd) {
}

bot.login(token); // TaimiBot token