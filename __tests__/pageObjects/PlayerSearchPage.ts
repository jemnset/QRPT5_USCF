import { By, WebDriver, WebElementCondition } from 'selenium-webdriver';
import { BasePage } from "./BasePage";
import { PlayerDetailsPage } from './PlayerDetailsPage';

export class PlayerSearchPage extends BasePage{
    
    //locators
    
    //search filters
    firstNameInput: By = By.xpath('//label[normalize-space()="First Name"]/..//input[@type="text"]');
    lastNameInput: By = By.xpath('//label[normalize-space()="Last Name"]/..//input[@type="text"]');
    locationInput: By = By.xpath('//label[normalize-space()="State"]//following::input[1]');
    locationDDL: By = By.xpath('//ul[@class="select2-results"]/li/div');
    memberIDInput: By = By.xpath('//label[normalize-space()="Member ID"]//following::input[1]');
    regularRatingInput: By = By.xpath('//label[normalize-space()="Player Details: Regular Rating"]/..//input[@type="number"]');

    //buttons
    searchByRankingsLinkBtn: By = By.xpath('//legend[normalize-space()="Search by Rating"]');
    submitBtn: By = By.xpath('//button[normalize-space()="Search"]');

    //search results
    playerRecord: By = By.xpath('//tbody/tr');
    playerName: By = By.xpath('//td[1]/..//a');
    playerMemberID: By = By.xpath('//td[2]');
    playerRegularRating: By = By.xpath('//td[3]');
    playerLocation: By = By.xpath('//td[10]');

    //pagination
    resultNextBtn: By = By.xpath('//li[@class="pagination-next ng-scope"]//a');

    //messages
    noRecordsMessage: By = By.xpath('//p[normalize-space()="None Found"]');

    //constructor
    constructor(driver?: WebDriver){
        super("https://new.uschess.org/civicrm/player-search", driver);
    }

    //methods to set input values for search terms

    async setFirstNameInput(name: string){
        await this.setInput(this.firstNameInput, name);
    }

    async setLastNameInput(name: string){
        await this.setInput(this.lastNameInput, name);
    }

    //location can be displayed by typing in textbox and selecting from DDL or by selecting directly from DDL

    //location is an autocomplete drop down list so need to type the location in input box then select from drop down list
    async setLocationInput(location: string){
        await this.click(this.locationInput);
        await this.setInput(this.locationInput, location);
        await this.setLocationDDL(location);
    }

    async setLocationDDL(location: string){
        //check to see if the drop down list is being displayed, if not click the autocomplete input box
        if(await this.hasElement(this.locationDDL) == false)
            await this.click(this.locationInput);
        await this.selectDDLByDisplayedText(this.locationDDL, location);
    }

    async setMemberIDInput(memberID: string){
        await this.setInput(this.memberIDInput, memberID);
    }

    async setRegularRatingInput(rating: number){
        await this.setInput(this.regularRatingInput, rating);
    }

    //buttons

    async clickSearchByRankingsLinkBtn(){
        await this.click(this.searchByRankingsLinkBtn);
    }

    async clickSubmitBtn(){
        await this.click(this.submitBtn);
    }

    //get search results

    async getNamesFromSearchResults(): Promise<string[]>{
        //this uses the same logic as the member ID search so just call this method
        return await this.getMemberIDsFromSearchResults();
    }

    async getLocationsFromSearchResults(): Promise<string[]>{
        return await this.getSearchResults(this.playerLocation);
    }

    async getMemberIDsFromSearchResults(): Promise<string[]>{
        return await this.getSearchResults(this.playerMemberID);
    }

    async getRatingsFromSearchResults(): Promise<string[]>{
        return await this.getSearchResults(this.playerRegularRating);
    }

    /**
     * retrieves the search results of player records based on the player data that needs to be retrieved
     * @param playerDataBy {By} - location of the player data to be retrieved from the search results
     * @returns all the search results as a multidimensional array with key value pair where player name 
     * is key and the specified player data is value
     */
    async getSearchResults(playerDataBy: By): Promise<string[]>{
        let result = [];

        //wait until the submit button has been re-enabled because it will show a fake table until records are retrieved
        await this.isElementEnabled(this.submitBtn);

        //check that there are records in the table itself, if none, return an empty array and stop
        if(await this.hasElement(this.noRecordsMessage))
            return result;

        //get the current page of results and put into a string array
        result = await this.getKeyValueTextFromElementList(this.playerRecord, this.playerName, playerDataBy);

        //check if there are more search results by checking if there is a "Next" button
        let hasMoreResults = await this.hasElement(this.resultNextBtn);

        while(hasMoreResults){
            await this.click(this.resultNextBtn);
            //wait until the submit button has been re-enabled because it will show a fake table until records are retrieved
            await this.isElementEnabled(this.submitBtn);

            //get the new page of results and add to the results collected so far
            result = result.concat(await this.getKeyValueTextFromElementList(this.playerRecord, this.playerName, playerDataBy));
            hasMoreResults = await this.hasElement(this.resultNextBtn) && await this.isElementEnabled(this.resultNextBtn);
        }
        
        return result;
    }

    /**
     * Retrieves an object which contains player name, member ID, location and rating based on the result of searching for a member ID
     * @param memberID {string} - the player to retrieve a player record for
     * @returns an object which contains player name, member ID, location and rating 
     */
    async getFullPlayerRecordByMemberID(memberID: string): Promise<{name: string, id: string, location: string, rating: number}> {
        let player = {name: "", id: "", location: "", rating: -1};
        
        await this.setMemberIDInput(memberID);
        await this.clickSubmitBtn();

        //wait until the submit button has been re-enabled because it will show a fake table until records are retrieved
        this.isElementEnabled(this.submitBtn);

        //check that there are records in the table itself, if none, return an empty player object and stop
        if(await this.hasElement(this.noRecordsMessage))
            return player;

        let results = await this.getElements(this.playerRecord);

        //if there is more than one record, return an empty player object and stop
        if(results.length == 1){
            player.name = await (await this.getChildElementTextFromParentElement(results[0], this.playerName)).toUpperCase();
            player.id = await this.getChildElementTextFromParentElement(results[0], this.playerMemberID);
            player.location = await (await this.getChildElementTextFromParentElement(results[0], this.playerLocation)).toUpperCase();
            
            let rating = await (await this.getChildElementTextFromParentElement(results[0], this.playerRegularRating)).trim();
            
            //rating can be blank or 0 which maps to "Unrated" on details page so set this to 0 to be consistent
            if(rating == "")
                player.rating = 0;
            else{
                try{
                    player.rating = parseInt(rating);
                }
                catch(e){
                    //If a non-number is retrieved this is unexpected so let the calling method handle this
                    player.rating = -1;
                }
            }
        }

        return player;
    }

    /**
     * click on the player name which will navigate to the player details page
     * need to create the PlayerDetailsPage object and pass the current driver to ensure that multiple drivers
     * are not being created and to ensure that the driver object can be closed properly
     * @param memberID {string} - the ID of the player to be clicked on and details page to navigate to
     * @returns an instance of the PlayerDetailsPage that uses the current driver
     */
    async clickPlayerNameByMemberID(memberID: string): Promise<PlayerDetailsPage>{
        //wait until the submit button has been re-enabled because it will show a fake table until records are retrieved
        await this.isElementEnabled(this.submitBtn);
        
        let results = await this.getElements(this.playerRecord);

        if (results.length == 1){
            let searchResultMemberID = await this.getChildElementTextFromParentElement(results[0], this.playerMemberID);

            if(searchResultMemberID == memberID){
                await this.clickChildElementFromParentElement(results[0], this.playerName);
                await this.switchToNewTab();
                return new PlayerDetailsPage(memberID, this.driver);
            }
        }

        //if there are no results or more than one result or if the result 
        //displayed does not match the member ID return null 
        return null;
    }
}