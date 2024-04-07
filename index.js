import puppeteer from 'puppeteer';
// import workers from 'node:worker_threads';

await Begin();

//headless:shell er mere performant, når vi launcher browseren.


async function Begin(){
  const nextPageButtonSelector = "#screenNext";
  const pageIdSelector = "#page-Side"; //add pagenumber without whitespace
  const pageClassSelector = ".eavis-page";


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


  const eavisLength = await GetEavisLength(page, pageClassSelector);
  for(let pageNumber = 1; pageNumber < eavisLength; pageNumber++)
  {
    await MoveToNextPage(page,nextPageButtonSelector); 
    await EnsurePageScale(page,String(pageIdSelector+pageNumber));
    await GeneratePdf(page,String(pageIdSelector+pageNumber));
  }

  await browser.close();
}

async function GeneratePdf(page,pdfName){
    console.log("Generating PDF of page: "+pdfName);
    await page.pdf(
    {
      path: "./LokalNytHorsensUge34/"+pdfName+"alpha.pdf", 
      printBackground: true, 
      displayHeaderFooter: false,
      format: "A4"
    });
}

async function MoveToNextPage(page,nextPageButtonSelector){
    console.log("Moving on to next page");
    await page.evaluate((nextPageButtonSelector) => {
        const nextPageButton = document.querySelector(nextPageButtonSelector);
        nextPageButton.click();
      },nextPageButtonSelector)
}

async function EnsurePageScale(page,currentPage){

  //Ensuring that the CSS transform property on the pages have applied to scale to 1x before generating a PDF
  console.log("Ensuring page scale");
  try{
    await page.evaluate((currentPage) => {
      let pageElement = document.querySelector(currentPage);
      if(pageElement !== undefined && pageElement !== null)
      {
        let inlineStyleOfElement = pageElement.getAttribute("style");
        let newStyle = inlineStyleOfElement.slice(0,-1); //Removing the last single ' mark of the style attribute value
        newStyle += "transition: none; transform: scale(1.0);'" //Overriding style attributes to ensure correct scaling for PDF generation
        pageElement.setAttribute("style", newStyle);
      }
  },currentPage);
  }catch(err)
  {
    console.log("Something went wrong trying to change the style attribute of element: "+currentPage+" Possible cause: Missing style attribute on the element");
  }
}

async function GetEavisLength(page, pageClassSelector){
   const result = await page.$$(pageClassSelector)
   return result.length;
}
