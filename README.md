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

- Jemma (jemnset)

Selenium Webdriver is used to hook into the browser with Jest as test runner

## Setup

To set up the project.

1. clone the respository
1. `npm i`

## Running Tests

To run all the tests, use the command: `npm test`

To run a specific test, use the command: `npx jest test_name`

## What Do We Test

Player Search function

## How Do We Test



### Page Objects

The POM design strategy is used to model each page being tested in it's own class

- BasePage.ts
    - Parent class with all common functionality that would be found on any generic web page
    - Handles the navigation to pages, and stores the driver and url of any child page 

### Data Files

Iteration is key to test some specific functionality, so files are created for searching player details

## Lessons Learned



