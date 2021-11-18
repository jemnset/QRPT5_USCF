import { HomePage } from "./pageObjects/HomePage";

describe('test can navigate to player search function', ()=> {
    const page = new HomePage();
    beforeEach(async () => {
        await page.navigate();
    });
    afterAll(async () => {
        await page.driver.quit();
    });
    test('JN5DL-81: Navigate to the Player Search page from the Home page', async ()=> {
        let searchPage = await page.clickPlayerRatingsSubMenu();
        let currentURL = await page.getCurrentPageURL();

        expect(currentURL).toBe(searchPage.url);
    });
});