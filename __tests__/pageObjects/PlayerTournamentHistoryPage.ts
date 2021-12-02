import { BasePage } from "./BasePage";
import { By, WebDriver } from 'selenium-webdriver';

export class PlayerTournamentHistoryPage extends BasePage{

    //locators

    //tournament history tab
    tournamentRecord: By = By.xpath('//comment()[contains(.,"Detail")]/following-sibling::*[1]');
    tournamentDate: By = By.xpath('./td[1]');
    tournamentName: By = By.xpath('./td[2]/a');
    tournamentID: By = By.xpath('./td[1]/small');
    tournamentSection: By = By.xpath('./td[2]/small');
    
    //pagination
    tournamentHistoryPages: By = By.xpath('//b[text()="Show Events:"]/following-sibling::nobr/a');

    readonly dateIdx: number = 0;

    constructor(memberID, driver: WebDriver){
        super("http://www.uschess.org/msa/MbrDtlTnmtHst.php?" + memberID, driver);
    }

    async getTournamentDate(): Promise<string>{
        let tournament = await this.getElement(this.tournamentRecord);
        return await this.getChildElementTextFromParentElement(tournament, this.tournamentDate);
    }

    async getTournamentName(): Promise<string>{
        let tournament = await this.getElement(this.tournamentRecord);
        return await this.getChildElementTextFromParentElement(tournament, this.tournamentName);
    }

    async getTournamentID(): Promise<string>{
        let tournament = await this.getElement(this.tournamentRecord);
        return await this.getChildElementTextFromParentElement(tournament, this.tournamentID);
    }

    async getTournamentSection(): Promise<string>{
        let tournament = await this.getElement(this.tournamentRecord);
        return await this.getChildElementTextFromParentElement(tournament, this.tournamentSection);
    }

    async getTournamentDatesByTournamentID(): Promise<string[]>{
        let tournaments = [];

        tournaments = await this.getTournamentHistory(this.tournamentID, this.tournamentDate);

        //clean up the dates as the current xpath text string is comprised of date and tournament IDs
        for(let i=0; i<tournaments.length; i++){
            let dateString = tournaments[i][PlayerTournamentHistoryPage.VALUE].split("\n");
            tournaments[i][PlayerTournamentHistoryPage.VALUE] = dateString[this.dateIdx];
        }
        
        return tournaments;
    }

    async getTournamentSectionsByTournamentNames(): Promise<string[]>{
        return await this.getTournamentHistory(this.tournamentSection, this.tournamentName);
    }

    /**
     * retrieves all the tournament records as key value pairs as specified by keyElementBy and valueElementBy locators
     * passed in as arguments. if the results are paginated, navigates to each results page to get all tournament records
     * @param keyElementBy {By} - locator of the key element e.g. tournament ID, relative to the parent tournament record
     * @param valueElementBy {By} - locator of the value element e.g. tournament date, relative to the parent tournament record
     * @returns a multidimensional array of key value pairs of tournament data
     * @example await this.getTournamentHistory(this.tournamentID, this.tournamentDate);
     */
    async getTournamentHistory(keyElementBy: By, valueElementBy: By): Promise<string[]>{
        let result = [];
        let resultPages = [];

        //check if there are any tournaments history, if not return an empty array and stop
        if(await this.hasElement(this.tournamentRecord) == false)
            return result;
        
        //check if there are multiple pages of tournaments
        if(await this.hasElement(this.tournamentHistoryPages))
            resultPages = await this.getElements(this.tournamentHistoryPages);

        let numResultsPages = resultPages.length;

        //get current page of results
        result = await this.getKeyValueTextFromElementList(this.tournamentRecord, keyElementBy, valueElementBy);
        
        for(let i=1; i<numResultsPages; i++){
            //the DOM gets reconstructed every time we click a results page link so we need to get the links again
            resultPages = await this.getElements(this.tournamentHistoryPages);
            //click next page
            await resultPages[i].click();
            
            //get results
            result = result.concat(await this.getKeyValueTextFromElementList(this.tournamentRecord, keyElementBy, valueElementBy));
        }

        return result;
    }
}