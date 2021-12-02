import { PlayerDetailsPage } from "./pageObjects/PlayerDetailsPage";
import { PlayerSearchPage } from "./pageObjects/PlayerSearchPage";
import { PlayerTournamentHistoryPage } from "./pageObjects/PlayerTournamentHistoryPage";
import * as playerData from "./data/playerData.json";

describe("test player details", () =>{
    const page = new PlayerSearchPage();

    beforeEach(async () => {
        await page.navigate();
    });
    afterEach(async () => {
        await page.switchToParentTabAndCloseAllChildTabs();
    });
    afterAll(async () => {
        await page.driver.quit();
    });
    playerData.forEach((memberID) => {
        test(`JN5DL-97 - View the details of a player: ${memberID}`, async() => {
            let player = await page.getFullPlayerRecordByMemberID(memberID);
    
            expect(player.id).toBe(memberID);
    
            if(player.id == memberID){
                let detailsPage: PlayerDetailsPage = await page.clickPlayerNameByMemberID(memberID);

                if(detailsPage != null){
                    //now we check that all the values on the Player Search page match the Player Details page
                    expect(await detailsPage.getPlayerName()).toBe(player.name);
                    expect(await detailsPage.getPlayerMemberID()).toBe(player.id);
                    expect(await detailsPage.getPlayerLocationAsFullName()).toBe(player.location);
                    expect(await detailsPage.getPlayerRegularRating()).toBe(player.rating);
                }
            }
        });
    });
    playerData.forEach((memberID) => {
        test(`JN5DL-100 - View the tournament history of a player: ${memberID}`, async() => {
            await page.setMemberIDInput(memberID);
            await page.clickSubmitBtn();

            let detailsPage: PlayerDetailsPage = await page.clickPlayerNameByMemberID(memberID);
            let tournamentPage: PlayerTournamentHistoryPage = await detailsPage.clickTournamentTab(memberID);

            let results = await tournamentPage.getTournamentDatesByTournamentID();
            
            let startIdx = 0;
            let endIdx = results.length;

            //check to see if there are any games that need to be rerated, indicated by **
            //if rerated games exist, then starting point for date check is the tournament prior to these games
            for(let i=0; i<results.length; i++){
                if(results[i][PlayerTournamentHistoryPage.KEY].includes("**"))
                    startIdx = i + 1;

                //tournaments prior to 2004 are not in chronological order so no need to include in check
                let tournamentDate = new Date(results[i][PlayerTournamentHistoryPage.VALUE]);
                if(tournamentDate.getFullYear() == 2003){
                    endIdx = i;
                    break;
                }
            }

            let errRecords = []; 

            if(results.length > 0){
                //verify that the games appear in chronological order and stop if there is any discrepancy 
                let current = new Date(results[startIdx][PlayerTournamentHistoryPage.VALUE]);
                for(let i=startIdx+1; i<endIdx; i++){
                    let next = new Date(results[startIdx][PlayerTournamentHistoryPage.VALUE]);

                    if(next >= current){
                        current = next;
                    }
                    else{
                        errRecords.push(current);
                        errRecords.push(next);
                        break;
                    }
                }
            }

            expect(errRecords.length).toBe(0);
        });
    });
});