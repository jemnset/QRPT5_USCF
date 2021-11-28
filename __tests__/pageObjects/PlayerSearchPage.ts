import { By, WebDriver } from 'selenium-webdriver';
import { BasePage } from "./BasePage";

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

        //check that there are actually results
        let playerRecordList = await this.getElements(this.playerRecord);
        if(playerRecordList.length > 0) {

            //put the results into a string array
            result = await this.getKeyValueTextFromElementList(this.playerRecord, this.playerName, playerDataBy);

            //check if there are more search results 
            let hasMoreResults = await this.hasElement(this.resultNextBtn);

            while(hasMoreResults){
                await this.click(this.resultNextBtn);
                //get the new page of results and add to the results collected so far
                result = result.concat(await this.getKeyValueTextFromElementList(this.playerRecord, this.playerName, playerDataBy));
                hasMoreResults = await this.hasElement(this.resultNextBtn);
            }
        } 

        return result;
    }
}