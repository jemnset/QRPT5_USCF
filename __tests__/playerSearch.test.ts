import { PlayerSearchPage } from "./pageObjects/PlayerSearchPage";
import * as playerMemberIDs from "./data/playerData.json";
import { error } from "selenium-webdriver";

describe('test player search function', ()=> {
    const page = new PlayerSearchPage();

    beforeEach(async () => {
        await page.navigate();
    });
    afterAll(async () => {
        await page.driver.quit();
    });
    test('JN5DL-82: Search for a player based on their name', async ()=> {
        let searchTerms: string[] = ['andrew', 'smith'];
        
        await page.setFirstNameInput(searchTerms[0]);
        await page.setLastNameInput(searchTerms[1]);
        await page.clickSubmitBtn();

        let result = await page.getNamesFromSearchResults();
        let errRecords = [];

        result.forEach((record) => {
            //verify that either name in the search term appears in the results
            if(searchTerms.some(playerName => record[PlayerSearchPage.KEY].toLowerCase().includes(playerName)) == false)
                errRecords.push(record);
        });

        //we expect to find no records in error
         expect(errRecords.length).toBe(0);

    });
    test('JN5DL-83: Search for a player based on their location', async ()=> {
        let searchTerm: string = 'Guam';

        await page.setLocationInput(searchTerm);
        await page.clickSubmitBtn();

        let result = await page.getLocationsFromSearchResults();
        let errRecords = [];
        //check to make sure that all results have the location as the search term
        result.forEach((record) => {
            if(record[PlayerSearchPage.VALUE] != searchTerm)
                errRecords.push(record);
        })

        //we expect to find no records in error
        expect(errRecords.length).toBe(0);
    });
    test('JN5DL-84: Search for a player based on their name and location', async ()=> {
        let nameSearchTerm = 'johnson';
        let locationSearchTerm = 'New York';

        await page.setFirstNameInput(nameSearchTerm);
        await page.setLocationInput(locationSearchTerm);
        await page.clickSubmitBtn();

        let result = await page.getLocationsFromSearchResults();

        let errRecords = [];

        result.forEach((record) => {
            if(record[PlayerSearchPage.VALUE] != locationSearchTerm ||
                record[PlayerSearchPage.KEY].toUpperCase().includes(nameSearchTerm.toUpperCase()) == false)
                errRecords.push(record);
        })

        //we expect to find no records in error
        expect(errRecords.length).toBe(0);

    }); 
    playerMemberIDs.forEach((playerID) => {
        test(`JN5DL-85: Search for a player based on their USCF member ID: ${playerID}`, async ()=> {

            await page.setMemberIDInput(playerID);
            await page.clickSubmitBtn();
            
            let result = await page.getMemberIDsFromSearchResults();
            
            let errRecords = [];

            //cannot have more than 1 record
            //if 1 record is returned it must match the playerID
            if(result.length > 1 || 
                (result.length == 1 && result[0][PlayerSearchPage.VALUE] != playerID))
                errRecords = result;

            //we expect one record
            expect(result.length).not.toBe(0);
            //we expect to find no records in error
            expect(errRecords.length).toBe(0);
        }); 
    });
    test('JN5DL-86: Search for a player based on their USCF regular rating', async ()=> {
        let searchTerm: number = 2550;

        //await page.clickSearchByRankingsLinkBtn();
        await page.setRegularRatingInput(searchTerm);
        await page.clickSubmitBtn();

        let result = await page.getRatingsFromSearchResults();
        let errRecords = [];

        result.forEach((record) => {
            if(parseInt(record[PlayerSearchPage.VALUE]) < searchTerm)
                errRecords.push(record);
        })

        //we expect to find no records in error
        expect(errRecords.length).toBe(0);

    });
});