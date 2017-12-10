/**
 * Initializes the bot
 */
"use strict";

const Telegram = require('telegram-node-bot');
const {TelegramBaseController, TextCommand} = Telegram;

const {getDailyChart, getWeeklyChart} = require('../api/database');

const commands = [
    new TextCommand('/daily', 'dailyHandler'),
    new TextCommand('/weekly', 'weeklyHandler')
];

function generatePhrase(user) {
    return "Check out what " + user + " posted:";
}

function postTracks($, tracks, timePhrase) {
    $.sendMessage("Check out these phat tRaX y'all have posted "+timePhrase+"!");
    tracks.forEach((trackMessage) => {
        const optionalArgs = {
            chat_id: trackMessage.chatId,
            reply_to_message_id: trackMessage.messageId,
            disable_notification: true
        };
        const user = trackMessage.username ? '@' + trackMessage.username : 'y\'all';
        const phrase = generatePhrase(user);
        $.sendMessage(phrase, optionalArgs );
    });
}

class ChartController extends TelegramBaseController {
    daily($) {

        return getDailyChart($.message.chat.id)
            .then((tracks) => {
                postTracks($, tracks, 'in the last day')
            })
            .catch((error) => {
                $.sendMessage("Uh... Actually, something fucked up. Sorry.");
            });
    }

    weekly($) {
        return getWeeklyChart($.message.chat.id)
            .then((tracks) => {
                postTracks($, tracks, 'this past week');
            })
            .catch((error) => {
                $.sendMessage("Uh... Actually, something fucked up. Sorry.");
            });
    }

    get routes() {
        return {
            'dailyHandler': 'daily',
            'weeklyHandler': 'weekly'
        }
    }
}

module.exports = {
    controller: ChartController,
    commands,
    help: {
        heading: 'Music',
        lines: [
            '/daily - Show Daily charts',
            '/weekly - Show weekly charts'
        ]
    }
};
