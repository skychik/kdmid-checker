export type TgUser = { chatId: number; username: string };
export type Config = {
    users: TgUser[];
    link_to_kdmid: string;
    telegram_token: string;
}