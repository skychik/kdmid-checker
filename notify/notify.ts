import config from "../kdmid-checker.config";
import Telegram from "telegram-notify";
import {assertNever} from "../helpers";

const notifyTelegram = async (message: string) => {
    for (const user of config.users) {
        const notify = new Telegram({token: config.telegram_token, chatId: user.chatId});
        await notify.send(message, {}, {disable_notification: false});
    }
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