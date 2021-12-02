import { By, WebDriver } from 'selenium-webdriver';
import { BasePage } from "./BasePage";
import { PlayerDetailsPage } from './PlayerDetailsPage';

export class PlayerSearchPage extends BasePage{
    
    //locators
    
    //search filters
    nameInput: By = By.id('edit-display-name');
    locationDDL: By = By.xpath('//select[@id="edit-state-province-id"]/option');
    memberIDInput: By = By.id('edit-member-id');
    regularRatingMinInput: By = By.id('edit-rating-94-min');
    regularRatingMaxInput: By = By.id('edit-rating-94-max');

    //buttons
    searchByRankingsLinkBtn: By = By.xpath('//summary[@role="button"]');
    submitBtn: By = By.id('edit-submit');
    resetBtn: By = By.id('edit-reset');

    //search results
    playerRecord: By = By.xpath('//tbody/tr');
    playerName: By = By.xpath('.//td[1]/a');
    playerMemberID: By = By.xpath('.//td[2]');
    playerRegularRating: By = By.xpath('.//td[3]');
    playerLocation: By = By.xpath('.//td[10]');

    //pagination
    resultNextBtn: By = By.xpath('//li[@class="pager-item item-next"]/a');

    //constructor
    constructor(driver?: WebDriver){
        super("https://new.uschess.org/player-search", driver);
    }

    //methods to set input values for search terms

    async setNameInput(name: string){
        await this.setInput(this.nameInput, name);
    }

    async selectLocationDDlByDisplayedText(optionToSelect: string){
        await this.selectDDLByDisplayedText(this.locationDDL, optionToSelect);
    }

    async setMemberIDInput(memberID: string){
        await this.setInput(this.memberIDInput, memberID);
    }

    async setRegularRatingMinInput(minRating: number){
        await this.setInput(this.regularRatingMinInput, minRating);
    }

    async setRegularRatingMaxInput(maxRating: number){
        await this.setInput(this.regularRatingMaxInput, maxRating);
    }

    //buttons

    async clickSearchByRankingsLinkBtn(){
        await this.click(this.searchByRankingsLinkBtn);
    }

    async clickSubmitBtn(){
        await this.click(this.submitBtn);
    }

    async clickResetBtn(){
        await this.click(this.resetBtn);
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

        //check that there are actually results, if there are none, return an empty array and stop
        if(await this.hasElement(this.playerRecord) == false)
            return result;

        //get the current page of results and put into a string array
        result = await this.getKeyValueTextFromElementList(this.playerRecord, this.playerName, playerDataBy);

        //check if there are more search results by checking if there is a "Next" button
        let hasMoreResults = await this.hasElement(this.resultNextBtn);

        while(hasMoreResults){
            await this.click(this.resultNextBtn);
            //get the new page of results and add to the results collected so far
            result = result.concat(await this.getKeyValueTextFromElementList(this.playerRecord, this.playerName, playerDataBy));
            hasMoreResults = await this.hasElement(this.resultNextBtn);
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

        //if there is no player displayed then return the empty player object and stop
        if(await this.hasElement(this.playerRecord) == false)
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