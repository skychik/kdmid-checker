import {Locator, Page, test} from '@playwright/test';

import {notify} from "../notify/notify";
import config from "../kdmid-checker.config";
import {assertNever, smallSleep} from "../helpers";

export type KdmidState =
// | 'ddosGuard'
    | 'kdmidCaptcha'
    | 'kdmidAppointmentButton'
    | 'kdmidNoFreeTime'
    | 'kdmidNewForm'
    | 'kdmidMaintenance'
    | 'unknown'

export async function getKdmidState(page: Page): Promise<KdmidState> {
    const url = page.url()
    if (url.includes('https://yerevan.kdmid.ru/queue/orderinfo.aspx')) {
        if (await page
            .getByRole('img', {name: 'Необходимо включить загрузку картинок в браузере.'})
            .isVisible()
        ) {
            return 'kdmidCaptcha'
        }
        if (await page
            .getByText('Уважаемый Есаков Кирилл ИгоревичВы зарегистрированы в системе по вопросу Прием п')
            .isVisible()
        ) {
            return 'kdmidAppointmentButton'
        }
    }
    if (url.includes('https://yerevan.kdmid.ru/queue/SPCalendar.aspx')) {
        if (await page
            .getByText('В настоящий момент на интересующее Вас консульское действие в системе предварите')
            .isVisible()
        ) {
            return 'kdmidNoFreeTime';
        }
    }

    if (url.includes('https://yerevan.kdmid.ru/')) {
        // unknown page
        if (await page
            .getByText('Внимание! Поля, отмеченные *, обязательны для заполнения.')
            .isVisible()
        ) {
            return 'kdmidNewForm'
        }
        if (await page
            .getByText('Проводятся регламентные работы. Сервис временно недоступен, повторите попытку че')
            .isVisible()
        ) {
            return 'kdmidMaintenance'
        }
    }

    return 'unknown'
}

let repeatingStateCount = 0;

async function process(page: Page, newState: KdmidState, prevState: KdmidState | null) {
    if (prevState === newState) {
        repeatingStateCount++;
    } else {
        repeatingStateCount = 0;
    }

    const log = (...message) => {
        console.log(`${new Date().toUTCString()} ${newState}=${repeatingStateCount}`, ...message)
    }
    const doIfRepeatedTooMuch = async (fn: () => Promise<void>) => {
        if (repeatingStateCount % 60 === 59) {
            await fn()
        }
    }

    switch (newState) {
        // case "ddosGuard":
        //     // press button
        //     // while
        //     //  take screenshot
        //     //  send to telegram and await answer
        //     //  enter answer
        //     //  press button
        //     //  wait
        //     return;
        case "kdmidCaptcha":
            // take screenshot
            // send to telegram and await answer
            await page.locator('input[name="ctl00\\$MainContent\\$txtCode"]').click();
            // enter answer
            await page.getByRole('button', {name: 'Далее'}).click();
            return;
        case "kdmidAppointmentButton":
            await page.getByRole('button', {name: 'Записаться на прием'}).click();
            return;
        case "kdmidNewForm":
            log(page.url())
            await doIfRepeatedTooMuch(async () => {
                await notify({type: 'newForm'})
            })
            await smallSleep();
            await page.goto(config.link_to_kdmid); // may not work
            return;
        case "kdmidNoFreeTime":
            await smallSleep();
            await page.reload();
            return;
        case "kdmidMaintenance":
            log('Проводятся регламентные работы')
            await doIfRepeatedTooMuch(async () =>
                await notify({type: 'maintenance'})
            )
            await smallSleep();
            await page.reload();
            return
        case "unknown":
            log(page.url())
            // take screenshot, send it to tg
            await notify({type: 'unknown'})
            return;
        default:
            assertNever(newState)
    }
}

test('check kdmid', async ({page}) => {
    try {
        await page.goto(config.link_to_kdmid);

        let state: KdmidState | null = null;
        while (true) {
            const prevState = state;
            state = await getKdmidState(page);
            await process(page, state, prevState)
        }
    } catch (e) {
        await notify({type: 'error', context: 'outer try-catch', e})
        throw e
    }
});