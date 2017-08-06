if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var fs = require('fs');
var vocal_map = new Map();

fs.readdir('src/', function(err, files) {
    if (err) throw err;

    files.forEach(function (file) {
        var json = JSON.parse(fs.readFileSync('src/' + file, 'utf8'));
        vocal_map.set(json.word, json.reading);
    });
});
var Botkit = require('./lib/Botkit.js');

var controller = Botkit.slackbot({
});

var bot = controller.spawn({
    token: process.env.token
}).startRTM();

controller.hears(['shutdown'], 'direct_message,direct_mention,mention', function(bot, message) {

    bot.startConversation(message, function(err, convo) {

        convo.ask('Are you sure you want me to shutdown?', [
            {
                pattern: bot.utterances.yes,
                callback: function(response, convo) {
                    convo.say('Bye!');
                    convo.next();
                    setTimeout(function() {
                        process.exit();
                    }, 3000);
                }
            },
        {
            pattern: bot.utterances.no,
            default: true,
            callback: function(response, convo) {
                convo.say('*Phew!*');
                convo.next();
            }
        }
        ]);
    });
});
var target = 'direct_message,direct_mention,mention,ambient';

controller.hears(['(.*)'], target, function(bot, message) {
    var text = message.text;

    vocal_map.forEach (function(value, key, map) {
        var reg = new RegExp(key);

        if (text.match(reg)) {
            bot.reply(message, '```' + key + ':' + value + '```');
        }
    });
});
