import { By } from "selenium-webdriver";
import { BasePage } from "./BasePage";
import { PlayerSearchPage } from "./PlayerSearchPage";

export class HomePage extends BasePage {

    //locators

    //menu items
    ratingsMenuItem: By = By.xpath('//a[text()="Ratings" and @class="sf-depth-1 menuparent"]');
    playerRatingsSubMenuItem: By = By.xpath('//a[@class="sf-depth-2" and text()="Player/Ratings Look-Up"]');

    constructor(){
        super('https://new.uschess.org/');
    }

    /**
     * hover over the ratings menu item and then click the players rating sub menu
     * @returns a new instance of the Player Search page (so that a new driver does not need to be created)
     */
    async clickPlayerRatingsSubMenu(): Promise<PlayerSearchPage> {
        await this.hoverAndClick(this.ratingsMenuItem, this.playerRatingsSubMenuItem);
        return new PlayerSearchPage(this.driver);
    }
}