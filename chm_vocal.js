if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}
const Botkit = require('./lib/Botkit.js');
const controller = Botkit.slackbot({
});
const bot = controller.spawn({
    token: process.env.token
});

function start_rtm() {
    bot.startRTM(function(err,bot,payload) {
        if (err) {
            console.log('Failed to start RTM')
            return setTimeout(start_rtm, 60000);
        }
        console.log("RTM started!");
    });
}

controller.on('rtm_close', function(bot, err) {
        start_rtm();
});
start_rtm();

const chinese_map = new Map();
const english_map = new Map();

try {
    const fs = require('fs');
    const files = fs.readdirSync('src/');

    files.forEach(function (file) {
        const json = JSON.parse(fs.readFileSync('src/' + file, 'utf8'));
        chinese_map.set(json.word, json.reading);
        const string_list = file.split(/[_|\.]/);
        english_map.set(json.word, string_list[1]);
    });
}
catch (err) {
    console.error(err);
    process.exit(1);
}
const regexp_string = '(' + Array.from(chinese_map.keys()).join('|') + ')';
const regexp = new RegExp(regexp_string, 'g');
const target = 'direct_message,direct_mention,mention,ambient';

controller.hears(regexp, target, function(bot, message) {
    message.match.forEach(function(matched){
        bot.reply(message, '```' + matched + '(' + english_map.get(matched) +
                                       '):' + chinese_map.get(matched) + '```');
    });
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
