import puppeteer from "puppeteer";


export async function launchBrowser(browserOptions){

  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();

  await page.setViewport({width: 1920, height: 1080, deviceScaleFactor: 1});

  console.log("Navigating")
  const [response] = await Promise.all([
    //wait untill all external files like images, scripts etc. requested by the page have been loaded
    page.waitForNavigation({waitUntil:'load'}),
    page.goto('https://alpha.lokal-nyt.dk/e-avis/')
  ]);

  console.log("Setting media type")
  await page.emulateMediaType('print')
}

export class BrowserOptions{
    constructor(url,viewportHeight,viewportWidth,mediaType,headless){
        this.url = url,
        this.viewportHeight = viewportHeight,
        this.viewportWidth = viewportWidth,
        this.mediaType = mediaType,
        this.headless = headless
    }
    isUrlValid(){
        //...
    }
}