import puppeteer from 'puppeteer';
import fs from 'node:fs';


// const htmlData = {data: ""};
// GetHtml();
Begin();

//headless:shell er mere performant, når vi launcher browseren.
//Det der skal ændres styling mæssigt:

      //Hver page-sideX
          //eavis-page styling klassen:
              //overskriv alle margins til 0
              //overskriv max-width til 100%
              //Sæt scale 1.0

// function GetHtml(){
//    htmlData.data = fs.readFileSync("./htmlcontent.txt", {encoding: "utf8"})
// }


async function Begin(){

  const eavisLength = 3
  const nextPageButtonSelector = "#screenNext";
  const pageSelector = "#page-Side" //add pagenumber without whitespace


  const browser = await puppeteer.launch({headless: false, slowMo: 1000});
  const page = await browser.newPage();

  await page.setViewport({width: 794, height: 1123, deviceScaleFactor: 1});
  

  const [response] = await Promise.all([
    //wait untill all external files like images, scripts etc. requested by the page have been loaded
    page.waitForNavigation({waitUntil:'load'}),
    page.goto('https://lokalnytmiddelfart.dk/e-avis/')
  ])

  for(let pageNumber = 1; pageNumber < eavisLength; pageNumber++)
  {

    //Algorithm:

        //Edit style of page with javascript
          //Determine if page has background image
            //Get the style attribute, discard everything in the style attribute except the image.
            //Apply the eavis to pdf styling, to the style attribute along with the saved image
          //Change class

        //Generate PDF
        //Next page
        //Repeat until at the end of the eavis...

    //Run a javascript function that changes the styling of the eavis page to match our pdf
    await page.evaluate(() => {
      const pageElement = document.querySelector("#page-Side1");
      pageElement.setAttribute("style","background-image: url(https://lokalnytmiddelfart.dk/wp-content/uploads/2023/07/Gammel-Havn.jpg); display: block; margin-left:0px; margin-right:0px; max-width: 100%");
      pageElement.setAttribute("class","eavis-page frontpage");
    })
    await GeneratePdf(page,String(pageSelector+pageNumber));
    await NextPage(page,nextPageButtonSelector,String(pageSelector+pageNumber));

  }

  await browser.close();
}

async function NextPage(page,nextPageButtonSelector,currentPage){

    await page.click(nextPageButtonSelector);
    //table of contents page does not have any id selector unlike all other pages
    //so ignore this page here
    if(currentPage != 2){
      try{
        await page.waitForSelector(currentPage, {timeout: 3000});
      }
      catch(error){
        console.log("Kunne ikke finde siden")
      }
    }

}

async function GeneratePdf(page,pdfName){
    await page.pdf(
    {
      path: pdfName+".pdf", 
      printBackground: true, 
      displayHeaderFooter: false,
      format: "A4"
    });
  }

  function ChangeStyling(page, currentPage){

    const eavisPageStyling = "background-image: url(&quot;https://lokalnytmiddelfart.dk/wp-content/uploads/2023/07/Gammel-Havn.jpg&quot;); display: block; margin-left:0px; margin-right:0px; max-width: 100%"

    //Run a javascript function that changes the styling of the eavis page to match our pdf
    page.evaluate(() => {
      const pageElement = document.querySelector(currentPage);
      pageElement.setAttribute("style",eavisPageStyling);
    })
  }