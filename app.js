// Taimi Bot
// Example code
const Discord = require('discord.js');
const bot = new Discord.Client();

const token = 'mytoken'; // Don't commit the token to Github!
const prefix = '/';
const jsonf = require('./responses.json');


//const wiki = require('wikijs');


bot.on('ready', () => {
    console.log('Taimi Bot is ready!');
    bot.user.setGame("/taimihelp");
});

bot.on('message', msg => {
    // Stop early if message was sent by another bot
    if (msg.author.bot) return;
    let limitResults = 5; // For limiting search results
	
    if (msg.mentions.users.exists('id', bot.user.id) && (msg.content.search("ping") >= 0)) {
        msg.reply("pong~");
        return;
    }
	if (msg.content.startsWith(prefix)) {
		var str = msg.content.slice(1);
		if (str === 'wiki') {
			msg.reply("Please use this format to search: `/wiki <query>`");
			return;
		}
		if (jsonf.hasOwnProperty(str)) {
			// Respond to simple commands in json file
			msg.reply(jsonf[str]);
			return;
		}
	}
	if (msg.content.startsWith(prefix + 'wiki ')) {
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
	else if (msg.content.startsWith('>')) {
	    // >Green text
	    if (!(msg.content.includes('{') && msg.content.includes('}'))) {
	        // Since this will use css code blocks, ignore actual css, which curly brackets indicate
            msg.channel.sendMessage(
	            msg.author + ": " + '\n' +
                "```css" + '\n' +
                msg.content + '\n' +
                "```");
	        msg.delete()
            .catch(console.error);
	    }
	}
	else if (msg.content.startsWith(prefix + 'trans ') || msg.content.startsWith(prefix + 'translate ')) {
	    // Translation
	    var firstSpace = msg.content.indexOf(' ');
	    var noPrefix = msg.content.slice(firstSpace + 1);
	    // msg.content = /trans (langA)>en translate me plox!
	    // noPrefix = (langA)>en translate me plox!
	    var secondSpace = noPrefix.trim().indexOf(' ');
	    var options
	    if (secondSpace > 0) {
	        options = noPrefix.slice(0, secondSpace);
	    } else {
	        options = "";
	    }
	    var text = noPrefix.slice(secondSpace + 1);
	    var langA;
	    var langB;
	    // options = (langA)>en
        // some debugging stuff
	    //console.log("options = " + options);
	    //console.log("text = " + text);
        if (options.length > 0) {
            var langs = options.split('>');
            langA = langs[0];
            langB = langs[1];
            
        } else {
            // requires unicode UTF-8 to display kana properly
            msg.reply("ERROR: Please use this syntax to translate:" + '\n' +
                        "```(/trans OR /translate) (OPTIONAL:langA)>langB text-to-translate" + '\n' +
                        "for example: /trans ja>en こんにちは皆さん！Taimibotです！```");
            return;
        }
        if (langA.length <= 0) {
            langA = "auto";
        }
        //console.log("langA = " + langA + " , langB = " + langB);
        var translate = require('google-translate-api');
        // why is there no option to disable autocorrect language ???
	    translate(text, {from: langA, to: langB}).then(res => {
	        msg.channel.sendMessage(res.from.language.iso + "> " + res.text);
	        //console.log(res.text);
	        //console.log(res.from.text.autoCorrected);
	        //=> false
	        //console.log(res.from.text.value);
	        //=> I [speak] Dutch!
	        //console.log(res.from.text.didYouMean);
	        //=> true
	        //console.log(res.from.language.didYouMean);
        }).catch(err => {
            msg.reply(err);
        });
	}
	else if (msg.content.startsWith(prefix + 'roll ')) {
	    // Dice roll
	    const max = 100;
	    var str = msg.content.slice(6);
	    var error = "Roll Error: Please specify a [2-" + max + "] sided die to roll.";
	    if (str.length > 0) {
	        var dnum = parseInt(str, 10);
	        if (!isNaN(dnum) && (dnum > 1 && dnum <= max)) {
	            var roll = Math.floor((Math.random() * dnum) + 1);
	            //var user = msg.author.mention();
	            var result = msg.author + " rolled " + roll + " on a " + dnum + " sided die.";
	            console.log(result);
	            msg.channel.sendMessage(result);
	        } else {
	            console.log(error);
	            msg.channel.sendMessage(error);
	        }
	    } else {
	        console.log(error);
	        msg.channel.sendMessage(error);
	    }
	}
});

function getCommand(cmd) {
}

bot.login(token); // TaimiBot token