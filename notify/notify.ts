import config from "../kdmid-checker.config";
import Telegram from "telegram-notify";
import {assertNever} from "../helpers";
import {TgUser} from "../types";

const doForEveryTgUser = async <T>(fn: (user: TgUser) => Promise<T>): Promise<T[]> => {
    return await Promise.all(config.users.map(user => fn(user)));
}

const notifyTelegram = async (message: string) => {
    doForEveryTgUser(async user => {
        const notify = new Telegram({token: config.telegram_token, chatId: user.chatId});
        await notify.send(message, {}, {disable_notification: false});
    })
}

const sendFileTelegram = async (pathToFile: string): Promise<void> => {
    doForEveryTgUser(async user => {
        //
    })
}

export type NotifyParams =
    | { type: 'unknown' }
    | { type: 'newForm' }
    | { type: 'maintenance' }
    | {
        type: 'error';
        context: string;
        e: Error;
    }
export const notify = async (params: NotifyParams) => {
    console.log('notify', new Date().toUTCString(), params, JSON.stringify(params))

    const type = params.type
    switch (type) {
        case "error":
            await notifyTelegram(`error(${params.context}): ${JSON.stringify(params.e)}`);
            return
        case "newForm":
            await notifyTelegram(`New form page showed. You need to rerun script`);
            return;
        case "maintenance":
            await notifyTelegram(`Maintenance on kdmid`);
            return;
        case "unknown":
            await notifyTelegram(`Unknown state. Maybe found free spot. Check out: ${config.link_to_kdmid}`)
            return
        default:
            assertNever(type)
    }
}

export const askCaptchaAnswer = async (pathToFile: string) => {
    // send file to everyone
    sendFileTelegram(pathToFile)
    // wait for a single answer

    // send everyone, that answer was given
    notifyTelegram(`Answer for ${pathToFile} was given`)
}