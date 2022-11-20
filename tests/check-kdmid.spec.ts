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

        let noFreeTime: boolean = true;
        while (noFreeTime) {
            const noFreeTimeLoc = page.getByText('В настоящий момент на интересующее Вас консульское действие в системе предварите')
            
            if (!await isVisible(noFreeTimeLoc)) {
                noFreeTime = false;
                await notify()
            } else {
                await sleep(1000);
                const newFormLoc = page.getByText('Внимание! Поля, отмеченные *, обязательны для заполнения.');
                if (await isVisible(newFormLoc)) {
                    await notify({e: 'New form page showed. You need to rerun script'})
                    await sleep(60*60*1000);
                    break;
                }

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
                        console.log(e, e.stack)
                        if (errorCount % 240 === 60) {
                            await notify({e});
                        }
                    }
                } while (wasError);
            }
        }
    } catch (e) {
        await notify({e})
        throw e
    }
});