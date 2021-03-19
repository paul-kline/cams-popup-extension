console.log("course master.");
sout(getCourseRows());
sout(getKey());
sout(getNumPages());
type HTML = HTMLDocument | HTMLHtmlElement;
function setButtonText(text: string) {
  const butt = document.getElementById(BUTTID);
  if (butt) {
    butt.innerText = text;
  }
}
const defaultText = "Harvest Courses";
async function harvestMasterCourseList() {
  // let pages : HTMLHtmlElement[] = [];
  setButtonText(defaultText + "...");
  let completedCourses = 0;
  let completedPages = 0;
  const promises = [];
  const coursePages: HTMLHtmlElement[] = [];
  const coursePagePromises: Promise<HTMLHtmlElement>[] = [];
  //@ts-ignore
  const startURL = location.href.match(/(.*)\/.+Master.asp/)[1] + "/";

  for (let i = 0; i < getNumPages(); i++) {
    promises.push(
      getPage(i + 1).then((page: HTMLHtmlElement) => {
        completedPages++;
        setButtonText(defaultText + `(${completedPages}/${promises.length})`);
        const rows = getCourseRows(page);
        // const urlEndings = rows.map(rowToUrl);

        rows.forEach((row: HTMLTableRowElement) => {
          const ending = rowToUrl(row);
          coursePagePromises.push(
            fetch(startURL + ending) //get the course page.
              .then((x) => x.text()) //turn course page into text.
              .then((x) => {
                //turn text into html.
                completedCourses++;
                setButtonText(
                  defaultText + `(${completedCourses}/${totalClasses})`
                );
                const e = document.createElement("html");
                e.innerHTML = x;
                return e;
              })
          );
        });
        return page;
      })
    );
  }
  const pages = await Promise.all(promises);
  sout("pages promises finished");
  const totalClasses = coursePagePromises.length;
  sout("total courses:", totalClasses);
  // sout("all pages", pages);
  const allCourses = await Promise.all(coursePagePromises);
  sout("allcourselinks", allCourses);
}

async function getPage(pg: number): Promise<HTMLHtmlElement> {
  // sout("getting page", pg);
  // document.body.style.cursor = 'wait';
  const a1 = getKey();
  //@ts-ignore
  document.getElementById("newpage").value = pg;
  //@ts-ignore
  document.getElementById("ak").value = a1;
  //@ts-ignore
  document.forms["NavigationForm"].action = "ceFacultyMaster.asp?ak=" + a1;
  //@ts-ignore
  // document.forms["NavigationForm"].submit();
  const pagetext = await submitForm("NavigationForm", location.href);
  // sout("fetch of page", pg, "resulted in ", pagetext);
  const html = document.createElement("html");
  html.innerHTML = pagetext;
  return html;
}
async function getAllClassLinksFromPage(html: HTMLHtmlElement) {
  html.querySelectorAll;
}
function rowToUrl(row: HTMLTableRowElement): string {
  try {
    //@ts-ignore
    return row.querySelector("a").href.match(/openpopup\(\'(.*)\'\)/)[1];
  } catch (e) {
    console.error("error turning html row into link from a tag");
    return "";
  }
}
function getCourseRows(doc: HTML = document): HTMLTableRowElement[] {
  return toArr(doc.querySelectorAll("tbody>tr")) as HTMLTableRowElement[];
}
function getNumPages(doc: HTMLDocument = document): number {
  try {
    //@ts-ignore
    return Number.parseInt(
      //@ts-ignore
      doc
        .querySelector(".Portal_Grid_Pager")
        //@ts-ignore
        .innerText.match(/Total Pages: (\d+)/)[1],
      10
    );
  } catch (e) {
    console.error("unable to determine number of pages.");
    console.error(e);
    return 0;
  }
}
const BUTTID = "eijfevfe483";
function addHarvestAllCourses() {
  const div = document.querySelector(
    ".course_management_coursename"
  ) as HTMLDivElement;
  const butt = document.createElement("button") as HTMLButtonElement;
  butt.style.background = "yellow";
  butt.innerText = "Harvest Courses";
  butt.id = BUTTID;
  butt.onclick = harvestMasterCourseList;
  div.appendChild(butt);
}
addHarvestAllCourses();
