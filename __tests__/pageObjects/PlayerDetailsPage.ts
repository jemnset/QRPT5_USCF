import { By, WebDriver } from 'selenium-webdriver';
import { BasePage } from "./BasePage";
import { PlayerTournamentHistoryPage } from './PlayerTournamentHistoryPage';
import * as fullLocationName from "../data/locationAbbrevToName.json";

export class PlayerDetailsPage extends BasePage{

    //locators

    //member details tab
    playerMemberIDAndNAme: By = By.xpath('//td[@class="topbar-middle"]//tr[contains(@bgcolor, "EEEEFF")]/td/font/b');
    playerRegularRating: By = By.xpath('//td[normalize-space()="Regular Rating"]/following-sibling::td[1]//nobr');
    playerLocation: By = By.xpath('//td[normalize-space()="State"]/following-sibling::td[1]/b');

    //tabs
    tournamentTab: By = By.xpath('//tbody/tr[1]/td[1]/a[5]/img');

    readonly memberIDIdx: number = 0;
    readonly memberNameIdx: number = 1;
    readonly ratingIdx: number = 0;

    /**
     * PageDetailsPage is constructed based on the player selected from PlayerSearchPage 
     * so the memberID and driver must be passed in when a new PlayerDetailsPage object is instantiated
     * @param memberID {string} - USCF member ID of the player which makes up the url of the page
     * @param driver {WebDriver} - the driver from the PlayerSearchPage object
     */
    constructor(memberID: string, driver: WebDriver){
        super("http://www.uschess.org/msa/MbrDtlMain.php?" + memberID, driver);
    }

    /**
     * retrieves the player name from a string which contains both member ID and player name
     * @returns the player name only
     */
    async getPlayerName(): Promise<string>{
        let memberIDAndName = (await this.getText(this.playerMemberIDAndNAme)).split(":");
        return memberIDAndName[this.memberNameIdx].trim().toUpperCase();
    }

    /**
     * retrieves the member id from a string which contains both member ID and player name
     * @returns the member ID only
     */
    async getPlayerMemberID(): Promise<string>{
        let memberIDAndName = (await this.getText(this.playerMemberIDAndNAme)).split(":");
        return memberIDAndName[this.memberIDIdx].trim();
    }

    /**
     * player location on the Player Details page, displayed as an abbreviation e.g. NY
     * @returns the player location
     */
    async getPlayerLocationAsAbbreviation(): Promise<string>{
        return await this.getText(this.playerLocation);
    }

    /**
     * player location on the Player Details page but as the location full name e.g. New York
     * @returns the full name of the player location
     */
    async getPlayerLocationAsFullName(): Promise<string>{
        //map between state name and state abbrev
        let abbreviation = await (await this.getText(this.playerLocation)).toUpperCase();
        return fullLocationName[abbreviation].toUpperCase();
    }
    /**
     * parses the Regular Rating string from the Player Details page to only return the rating 
     * (as the string may include the date the rating was published which is not required)
     * 
     * on the player details page, Regular Rating displays as "(Unrated)" which differs from 
     * the player search page which will display 0 or blank so a 0 is returned in this case for consistency
     * 
     * @returns the rating displayed on the player details page
     */
    async getPlayerRegularRating(): Promise<number>{
        let rating: number;
        let ratingString = await (await this.getText(this.playerRegularRating)).split(" ");

        if(ratingString[this.ratingIdx] == "(Unrated)")
            rating = 0;
        else{
            try{
                rating = parseInt(ratingString[this.ratingIdx]);
            }
            catch(e){
                //something went wrong so just set rating to -1 and let the calling method handle it
                rating = -1;
            }
        }

        return rating;
    }

    /**
     * clicks the tournament tab on the player details page which navigates to the tournament history page
     * 
     * @param memberID {string} - member ID of the player who's tournament history is on the tournament history page
     * @returns an instance of the PlayerTournamentHistoryPage with the current driver
     */
    async clickTournamentTab(memberID: string): Promise<PlayerTournamentHistoryPage>{
        await this.click(this.tournamentTab);
        return new PlayerTournamentHistoryPage(memberID, this.driver);
    }
}