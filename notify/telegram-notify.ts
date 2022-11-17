import Telegram from "telegram-notify";
import config from "../kdmid-checker.config";

export const notifyViaTelegram = async (params?: { e: any }) => {
    let message = `Probably found free spot. Check out: ${config.link_to_kdmid}`;
    if (params) {
        message = JSON.stringify(params.e);
    }
    for (const user of config.users) {
        const notify = new Telegram({ token: config.telegram_token, chatId: user.chatId });
        await notify.send(message, {}, { disable_notification: false });
    }
}