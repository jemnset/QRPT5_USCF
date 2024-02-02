import {
    Builder,
    By,
    Capabilities,
    until,
    WebDriver,
    WebElement
  } from "selenium-webdriver";
import { isElementAccessChain } from "typescript";
  const fs = require("fs");
  const chromedriver = require("chromedriver");
  
  export class BasePage {

    static KEY: number = 0;
    static VALUE: number = 1;
    
    driver: WebDriver;
    url: string;

    /**
     *
     * @property {WebDriver} driver - if no driver is provided, one will be created
     * @property {string} url - provide this if the page has a base url
     */
    constructor(url: string, driver?: WebDriver) {
        if (driver) 
            this.driver = driver
        else
            this.driver = new Builder()
            .withCapabilities(Capabilities.chrome())
            .build();

        this.url = url;
    }
    /**
     * navigates to the url passed in, or to the one stored on the page object
     * @param {string} url - the url to navigate to, unless you wish to use the page's defined base url
     */
    async navigate(url?: string): Promise<void> {
      if (url) 
        return await this.driver.get(url);
      else if (this.url) 
        return await this.driver.get(this.url);
      else
        return Promise.reject(
          "BasePage.navigate() needs a URL defined on the page object, or one passed in. No URL was provided."
        );
    }

    /**
     * determines if an element exists by waiting for 5000 ms before timing out
     * @param {By} elementBy {By} - the element to find
     * @returns true if the element is found before the time limit, false if otherwise
     */
    async hasElement(elementBy: By): Promise<boolean>{
      let doesExist: boolean;

      await this.driver.wait(until.elementLocated(elementBy), 5000)
          .then(()=> { doesExist = true; })
          .catch(()=> { doesExist = false; });
    
      return doesExist;
    }

    /**
     * determines if an element is enabled by waiting for 100000 ms before timing out
     * @param {By} elementBy - the element to find
     * @returns true if the element is enabled before the time limit, false if otherwise
     */
    async isElementEnabled(elementBy: By): Promise<boolean>{
      let isEnabled: boolean;
      let element = await this.getElement(elementBy);

      await this.driver.wait(until.elementIsEnabled(element), 100000)
        .then(() => {isEnabled = true;})
        .catch(() => {isEnabled = false;})
        
      return isEnabled;
    }

    /**
     * waits for the identified element to be located and visible before returning it.
     * @param {By} elementBy - the locator for the element to return.
     */
    async getElement(elementBy: By): Promise<WebElement> {
      await this.driver.wait(until.elementLocated(elementBy));
      let element = await this.driver.findElement(elementBy);
      await this.driver.wait(until.elementIsVisible(element));
      return element;
    }

    /**
     * waits for the identified elements to be located before returning an array of WebElements.
     * @param {By} elementBy - the locator for the elements to return.
     */
     async getElements(elementBy: By): Promise<WebElement[]> {
      await this.driver.wait(until.elementLocated(elementBy));
      let elements = await this.driver.findElements(elementBy);
      return elements;
    }

    /**
     * clicks the given element after waiting for it
     * @param {By} elementBy - the locator for the element to click
     */
    async click(elementBy: By): Promise<void> {
      let element = await this.getElement(elementBy);
      await this.driver.wait(until.elementIsEnabled(element));
      return await element.click();
    }

    /**
     * clicks a child element based on it's relative path from a parent element
     * @param parentElement {WebElement} - the parent element
     * @param childElementBy {By} - relative path of the child element to the parent element
     */
     async clickChildElementFromParentElement(parentElement: WebElement, childElementBy: By): Promise<void>{
      return await parentElement.findElement(childElementBy).click();
    }

    /**
     * simulates mouse hover over the given hoverElement and clicks the subsequent 
     * clickElement that is revealed
     * @param hoverElementBy {By} - the element to mouse hover over
     * @param clickElementby {By} - the element to click which has now been revealed
     */
    async hoverAndClick(hoverElementBy: By, clickElementby: By): Promise<void>{
      let element = await this.getElement(hoverElementBy);
      await this.driver.actions({ bridge:true}).move({duration:1000,origin:element,x:0,y:0}).perform();
      return await this.click(clickElementby);
    }

    /**
     * clears the given element after waiting for it, and then sends the provided keys
     * @param {By} elementBy - the locator for the element to clear and sendKeys to
     * @param {any} keys - the string or list of keys to send
     */
    async setInput(elementBy: By, keys: any): Promise<void> {
      let input = await this.getElement(elementBy);
      await this.driver.wait(until.elementIsEnabled(input));
      await input.clear();
      return input.sendKeys(keys);
    }

    /**
     * returns an element's text after waiting for it to be visible
     * @param {By} elementBy - the locator of the element to get text from
     */
    async getText(elementBy: By): Promise<string> {
      let element = await this.getElement(elementBy);
      await this.driver.wait(until.elementIsEnabled(element));
      return element.getText();
    }

    /**
     * returns an element's attribute value after waiting for the element to be visible
     * @param {By} elementBy - the locator of the element to get the value from
     * @param {string} attribute - the attribute to return the value from, such as 'value' or 'href'
     */
    async getAttribute(elementBy: By, attribute: string): Promise<string> {
      let element = await this.getElement(elementBy);
      await this.driver.wait(until.elementIsEnabled(element));
      return element.getAttribute(attribute);
    }
    
    /**
     * selects a drop down list option from a list of options based on the text of that option
     * @param {By} elementBy - the locator of the list of drop down list options
     * @param textToSelect - the text of the option to select from the drop down list
     */
     async selectDDLByDisplayedText(elementBy: By, textToSelect: string): Promise<void>{
      let options = await this.getElements(elementBy);

      for(let i=0; i<options.length; i++){
        if(await options[i].getText() == textToSelect){
          return await options[i].click();
        }
      }
    }

    /**
     * Retrieves the text from a pair of child elements from the parent element. The child elements are a key/value pair 
     * For example:
     * Parent: Player record
     * Key: Member ID
     * Value: Name
     * @param parentElementBy {By} - The location of the parent element
     * @param keyElementBy {By} - The relative path of the child element (from the parent element) which acts as the key of the key value pair
     * @param valueElementBy {By} - The relative path of the child element (from the parent element) which acts as the value of the key value pair
     * @returns A multidimensional array with the text of the key value elements
     */
    async getKeyValueTextFromElementList(parentElementBy: By, keyElementBy: By, valueElementBy: By): Promise<string[]>{
      let result = [];
      
      let parentElements = await this.getElements(parentElementBy);

      let key: string = "";
      let value: string = "";

      //console.log(parentElements.length);

      for(let i=0; i<parentElements.length; i++){

        key = await this.getChildElementTextFromParentElement(parentElements[i], keyElementBy);
        value = await this.getChildElementTextFromParentElement(parentElements[i], valueElementBy);

        await result.push([key, value]);
      }

      return result;
    }

    /**
     * Retrieves the text from a child element relative to a parent element
     * @param parentElement {WebElement} - parent element which contains the child element
     * @param childElementBy {By} - the relative path to the child element (from the parent element)
     * @returns the text from the child element
     */
    async getChildElementTextFromParentElement(parentElement: WebElement, childElementBy: By): Promise<string>{
      return await parentElement.findElement(childElementBy).getText();
    }

    /**
     * gets the url of the current page
     * @returns the url of the current page
     */
    async getCurrentPageURL(): Promise<string>{
      return await this.driver.getCurrentUrl();
    }

    /**
     * switch to the newly opened tab
     * assumes that the last tab is the newest tab
     */
    async switchToNewTab(): Promise<void>{
      let windows = await this.driver.getAllWindowHandles();
      return await this.driver.switchTo().window(windows[windows.length - 1]);
    }

    /**
     * close all tabs excluding the first tab which is assumed to be the main tab
     */
    async switchToParentTabAndCloseAllChildTabs(): Promise<void>{
      let windows = await this.driver.getAllWindowHandles();
      
      //close out any child tabs
      for(let i=1; i<windows.length; i++){
        await this.driver.switchTo().window(windows[i]);
        this.driver.close();
      }

      //switch to main tab
      return await this.driver.switchTo().window(windows[0]);
    }

    /**
     * Will take a screenshot and save it to the filepath/filename provided.
     * Automatically saves as a .png file.
     * @param {string} filepath - the filepath relative to the project's base folder where you want the screenshot saved
     * @example
     * page.takeScreenshot("myFolder/mypic")
     * //picture saves in "myFolder" as "mypic.png"
     */
    async takeScreenshot(filepath: string) {
      fs.writeFile(
        `${filepath}.png`,
        await this.driver.takeScreenshot(),
        "base64",
        (e) => {
          if (e) console.log(e);
          else console.log("screenshot saved successfully");
        }
      );
    }
}
  