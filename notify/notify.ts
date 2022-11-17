import {notifyViaTelegram} from "./telegram-notify";

export const notify = async (params?: {e: any}) => {
    await notifyViaTelegram(params)
}