# QRPT5_USCF
- [Summary](#summary)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [What Do We Test](#what-do-we-test)
- [How Do We Test](#how-do-we-test)
    - [Page Objects](#page-objects)
    - [Data Files](#data-files)
   
## Summary   
Github repository for DevMountain QRPT5 solo capstone project for automated testing of the USCF website

Author:

- Jemma N (jemnset)

Selenium Webdriver is used to hook into the browser with Jest as test runner

## Setup

To set up the project.

1. clone the respository
1. `npm i`

## Running Tests

To run all the tests, use the command: `npm test`

To run a specific test, use the command: `npx jest test_name`

## What Do We Test

The functionality test was focussed primarily on the Player Search function and viewing the player and tournament details:

- Player Search function
    - The user has the ability to search for a player based on their name, location, member ID and rating
    - Search restuls returned were verified to ensure they contained the corresponding search terms 
- Player Details and Tournament function
    - From the search results, the user has the ability to view a player's details and their tournament history
    - Player details were verified to ensure they matched the values displayed in the player search results
    - Tournament history was verified to ensure it was in chronological order (excluding those which needed to be rerated and those prior to 2004 as per the requirements on the USCF website)

## How Do We Test

Tests were organised into the following test files:

- homePage.test.ts
    - Includes the test to navigate to the Player Search page via the Home Page main menu
- playerSearch.test.ts
    - Includes the tests associated with using the search function to find past and present USCF registered players
- playerDetails.test.ts
    - Includes the tests associated with verifying the details and tournament history of a particular player, selected from the Player Search page

### Page Objects

The POM design strategy is used to model each page being tested in it's own class

- BasePage.ts
    - Parent class with all common functionality that would be found on any generic web page
    - Handles the navigation to pages, and stores the driver and url of any child page 
- HomePage.ts
    - Extends BasePage.ts
    - Handles the functionality associated with the home page of the USCF web application, primarily the ability to navigate to the Player Search page via the main menu
- PlayerSearchPage.ts
    - Extends BasePage.ts
    - Handles the functionality associated with the Player Search function and search results
    - Handles navigation to the Player Details page based on the player selected from the search results
- PlayerDetailsPage.ts
    - Extends BasePage.ts
    - Handles the functionality associated with the Player Details page, primarily the same data displayed in the search results of the Player Search page
    - Handles navigation to the Player Tournament History page which the user can access from the "General" tab on the player details page
- PlayerTournamentHistoryPage.ts
    - Extends BasePage.ts
    - Handldes the functionality associated with the Player Tournament History page

### Data Files

Iteration is key to test some specific functionality, so files are created for searching player details which includes the following JSON data files:

- playerData.json
    - Member IDs of players which match particular test conditions, in particular players who are rated or unrated, and players who have played no tournaments or players who have competed in over 200+ tournaments
    - Values sourced from the USCF website itself
- locationAbbrevToName.json
    - Mapping of location names between the full name e.g. New York vs abbreviation e.g. NY
    - Required due to inconsistency with how Player Search page and Player Details page display location

## Lessons Learned

The following tools and technologies were learned during the course and used for this project:

- Jest was used as test runner with Selenium WebDriver used to hook into the browser, written in JavaScript
- JIRA was used to document the test plan, test cases and test summary report
git and GitHub were used for source control with branching used for new functionality and pull requests opened to ensure code reviews could be completed before changes could be merged into the main code base
- API testing was limited to GET HTTP requests of the Find a Doctor search function in Postman
- The Page Object Model (POM) design strategy was used to model the USCF web pages for testing

