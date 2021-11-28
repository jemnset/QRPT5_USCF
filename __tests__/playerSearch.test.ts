import { PlayerSearchPage } from "./pageObjects/PlayerSearchPage";
import * as playerMemberIDs from "./data/playerData.json";

describe('test player search function', ()=> {
    const page = new PlayerSearchPage();

    beforeEach(async () => {
        await page.navigate();
    });
    afterAll(async () => {
        await page.driver.quit();
    });
    test('JN5DL-82: Search for a player based on their name', async ()=> {
        let searchTerm: string = 'andrew smith';
        
        await page.setNameInput(searchTerm);
        await page.clickSubmitBtn();

        let result = await page.getNamesFromSearchResults();
        let errRecords = [];

        let searchTermSplit = searchTerm.split(" ");
        let isMatch;

        result.forEach((record) => {
            isMatch = false;
            //verify that either name in the search term appears in the results
            for(let i=0; i<searchTermSplit.length; i++){
                if(record[PlayerSearchPage.KEY].toUpperCase().includes(searchTermSplit[i].toUpperCase())){
                    isMatch = true;
                    break;
                }
            }

            if(!isMatch)
                errRecords.push(record);        
        });

        //we expect to find no records in error
         expect(errRecords.length).toBe(0);

    });
    test('JN5DL-83: Search for a player based on their location', async ()=> {
        let searchTerm: string = 'Guam';

        await page.selectLocationDDlByDisplayedText(searchTerm);
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

        await page.setNameInput(nameSearchTerm);
        await page.selectLocationDDlByDisplayedText(locationSearchTerm);
        await page.clickSubmitBtn();

        let result = await page.getLocationsFromSearchResults();
        let nameSearchTermSplit = nameSearchTerm.split(" ");

        let errRecords = [];
        let isMatch = false;

        //check to make sure all results have the correct search terms
        result.forEach((record) => {

            for(let i=0; i<nameSearchTermSplit.length; i++){
                if(record[PlayerSearchPage.KEY].toUpperCase().includes(nameSearchTermSplit[i].toUpperCase())){
                    isMatch = true;
                    break;
                }
            }

            if((record[PlayerSearchPage.VALUE] != locationSearchTerm) || !isMatch)
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
        let minRatingSearchTerm: number = 2550;
        let maxRatingSearchTerm: number = 2600;

        await page.clickSearchByRankingsLinkBtn();
        await page.setRegularRatingMinInput(minRatingSearchTerm);
        await page.setRegularRatingMaxInput(maxRatingSearchTerm);
        await page.clickSubmitBtn();

        let result = await page.getRatingsFromSearchResults();
        let errRecords = [];
        
        result.forEach((record) => {
            if(parseInt(record[PlayerSearchPage.VALUE]) < minRatingSearchTerm ||
            parseInt(record[PlayerSearchPage.VALUE]) > maxRatingSearchTerm)
                errRecords.push(record);
        });

        //we expect to find no records in error
        expect(errRecords.length).toBe(0);

    });
});