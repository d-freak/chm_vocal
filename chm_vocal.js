if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}
var Botkit = require('./lib/Botkit.js');

var controller = Botkit.slackbot({
});

var bot = controller.spawn({
    token: process.env.token
}).startRTM();
var vocal_map = new Map();

try {
    var fs = require('fs');
    var files = fs.readdirSync('src/');

    files.forEach(function (file) {
        var json = JSON.parse(fs.readFileSync('src/' + file, 'utf8'));
        vocal_map.set(json.word, json.reading);
    });
}
catch (err) {
    console.error(err);
    process.exit(1);
}
var regexp_string = '('

for (var key of vocal_map.keys()) {
  regexp_string += key + '|'
}
regexp_string = regexp_string.replace(/\|$/, ')');
var regexp = new RegExp(regexp_string, 'g');
var target = 'direct_message,direct_mention,mention,ambient';

controller.hears(regexp, target, function(bot, message) {
    for (var matched of message.match) {
        bot.reply(message, '```' + matched + ':' + vocal_map.get(matched) + '```');
    }
});

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
