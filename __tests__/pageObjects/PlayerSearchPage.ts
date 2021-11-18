import { By, WebDriver } from 'selenium-webdriver';
import { BasePage } from "./BasePage";

export interface Player{
    name: string;
    id: number;
    state: string;
    regularRating: number;
}

export class PlayerSearchPage extends BasePage{
    
    //locators
    
    //search filters
    nameInput: By = By.id('edit-display-name');
    stateDDL: By = By.xpath('//select[@id="edit-state-province-id"]/option');
    memberIDInput: By = By.id('edit-member-id');
    regularRatingMinInput: By = By.id('edit-rating-94-min');
    regularRatingMaxInput: By = By.id('edit-rating-94-max');

    //buttons
    searchByRankingsLinkBtn: By = By.xpath('//summary[@role="button"]');
    submitBtn: By = By.id('edit-submit');
    resetBtn: By = By.id('edit-reset');

    //search results
    resultName: By = By.xpath('//table/tbody/tr/td[1]/a');
    resultMemberID: By = By.xpath('//table/tbody/tr/td[2]');
    resultState: By = By.xpath('//table/tbody/tr/td[10]');

    //pagination
    resultPage: By = By.xpath('//li[@class="pager-item item-current"]/following-sibling::li[@class="pager-item"]');

    //constructor
    constructor(driver?: WebDriver){
        super("https://new.uschess.org/player-search", driver);
    }

    async setNameInput(name: string){
        await this.setInput(this.nameInput, name);
    }

    async selectStateDDlByDisplayedText(optionToSelect: string){
        await this.selectDDLByDisplayedText(this.stateDDL, optionToSelect);
    }

    async setMemberIDInput(memberID: string){
        await this.setInput(this.memberIDInput, memberID);
    }

    async setRegularRatingMinInput(minRating: string){
        await this.setInput(this.regularRatingMinInput, minRating);
    }

    async setRegularRatingMaxInput(maxRating: string){
        await this.setInput(this.regularRatingMaxInput, maxRating);
    }

    async clickSearchByRankingsLinkBtn(){
        await this.click(this.searchByRankingsLinkBtn);
    }

    async clickSubmitBtn(){
        await this.click(this.submitBtn);
    }

    async clickResetBtn(){
        await this.click(this.resetBtn);
    }
}