import {expect, Locator, test} from '@playwright/test';
import {notify} from "../notify/notify";

// import {bypassDdosGuardHeaders} from "../ddos-guard/ddos-bypass";
import config from "../kdmid-checker.config";

const sleep = (timeInMs) => new Promise((resolve) => setTimeout(resolve, timeInMs));

async function isVisible(loc: Locator): Promise<boolean> {
    try {
        const isVisible = await loc.isVisible();
        return isVisible;
    } catch (e) {
        return false;
    }
}

function isTimeToWaitAndNotReload(): boolean {
    const date = new Date();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    if (hours === 6) {
        if (minutes >= 43) {
            return true;
        }
    }

    return false;
}

test('check kdmid', async ({page}) => {
    // await notify()
    try {
        // await page.setExtraHTTPHeaders(await bypassDdosGuardHeaders())
        await page.goto(config.link_to_kdmid);

        await page.getByRole('img', {name: 'Необходимо включить загрузку картинок в браузере.'}).screenshot();

        await page.locator('input[name="ctl00\\$MainContent\\$txtCode"]').click();

        // await page.locator('input[name="ctl00\\$MainContent\\$txtCode"]').fill('575564');

        await page.getByRole('button', {name: 'Далее'}).click();
        await expect(page).toHaveURL(config.link_to_kdmid);

        await expect(page.getByText('Уважаемый Есаков Кирилл ИгоревичВы зарегистрированы в системе по вопросу Прием п')).toBeVisible();

        await page.getByRole('button', {name: 'Записаться на прием'}).click();
        await expect(page).toHaveURL('https://yerevan.kdmid.ru/queue/SPCalendar.aspx?bjo=54019');

        await expect(page.getByRole('heading', {name: 'ПРОВЕРКА НАЛИЧИЯ СВОБОДНОГО ВРЕМЕНИ'})).toBeVisible();

        while (true) {
            if (isTimeToWaitAndNotReload()) {
                await sleep((10 + 6 * Math.random()) * 1000);
                continue;
            }
            const newFormLoc = page.getByText('Внимание! Поля, отмеченные *, обязательны для заполнения.');
            if (await isVisible(newFormLoc)) {
                await notify({e: 'New form page showed. You need to rerun script'})
                await sleep(3*24*60*60*1000);
                break;
            }
            
            const noFreeTimeLoc = page.getByText('В настоящий момент на интересующее Вас консульское действие в системе предварите')
            if (!await isVisible(noFreeTimeLoc)) {
                await sleep((10 + 60 * Math.random()) * 1000);
                if (!await page.getByText('Проводятся регламентные работы. Сервис временно недоступен, повторите попытку че').isVisible()) {
                    console.log((new Date()).toUTCString, 'Проводятся регламентные работы.')
                } else {
                    await notify()
                }
            } else {
                let wasError: boolean;
                let errorCount = 0;
                do {
                    await sleep((10 + 60 * Math.random()) * 1000);
                    try {
                        await page.reload()
                        wasError = false;
                    } catch (e) {
                        errorCount++;
                        wasError = true;
                        console.log((new Date()).toUTCString, e, e.stack)
                        if (errorCount % 240 === 60) {
                            await notify({e});
                        }
                    }
                } while (wasError);
            }
        }
    } catch (e) {
        await notify({e: {e, stack: e.stack}})
        throw e
    }
});