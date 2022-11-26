import {Page} from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

// returns path to file
export async function screenshot(page: Page, extension: string = 'png'): Promise<string> {
    const generatedName = `screenshot-${uuidv4}.${extension}`;
    await page.screenshot({ path: generatedName, fullPage: true})
    return generatedName;
}