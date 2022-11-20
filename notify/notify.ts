import {notifyViaTelegram} from "./telegram-notify";

export type NotifyParams = {e?: any}
export const notify = async (params?: NotifyParams) => {
    console.log('notify', params, JSON.stringify(params))
    await notifyViaTelegram(params)
}