/**
 * Gives the course offerings page the option to
 * harvest all course information to be sent to my custom course viewer.
 * Because the course offerings search and viewing really really sucks.
 */
//######################################################################

async function replaceAll() {
  const elem: any = document.querySelector(".Page_Content");
  const div = document.createElement("div");
  elem.prepend(div);
  //   elem.innerHTML = "Please wait...";
  //@ts-ignore
  const classes = await harvestCourses((currentpage, totalpages) => {
    div.innerHTML = `<div>Please wait....</div><div>${Math.round(
      (currentpage / totalpages) * 100
    )} %</div>`;
  }, div);
  (window as any).classes = classes;
}

async function harvestCourses(pageStatus: any, div?: HTMLDivElement) {
  console.log("harvestCoursesss");

  let currentPage = 1;
  const lastPage = getLastPage();
  const classes: any[] = [];
  const doc: Document = document;
  const promises: Promise<any>[] = [];
  for (let i = 1; i <= lastPage; i++) {
    promises.push(
      new Promise((resolve, reject) => {
        setTimeout(async () => {
          //@ts-ignore
          document.getElementById("idPage").value = i;
          const body = await formSubmit();
          const el = document.createElement("html");
          el.innerHTML = body;
          const newClasses = harvestPage(el);
          console.log("new classes", newClasses);
          classes.push(...newClasses);
          pageStatus(i, lastPage);
          resolve(newClasses);
        }, 0);
      })
    );
  }
  await Promise.all(promises);
  if (div) {
    div.innerHTML = "Resolving class details...";
  }
  console.log("lastpage: ", lastPage);
  console.log("classes", classes);
  let detailsResolved = 0;
  const classesLen = classes.length;
  await Promise.all(
    classes.map(c =>
      c.detailsPromise.then((x: any) => {
        detailsResolved++;
        if (div && Math.random() < 0.5) {
          div.innerHTML =
            "<div>Resolving classes: " +
            detailsResolved +
            "/" +
            classesLen +
            "</div>";
        }
      })
    )
  );
  if (div) {
    // div.innerHTML = `<a href="https://classplanner.pauliankline.com/ClassesView/" target="_blank"> All details resolved.</a>`;
    div.innerHTML = `All details resolved! Click button to view&plan: <button onclick="doOpen()">View/Plan</button>`;
  }
  console.log("all details fetched:", classes);
  return classes;
}
function doOpen() {
  const targetwindow = window.open(
    "https://classplanner.pauliankline.com/ClassesView/"
    // "http://localhost:3000/ClassesView"
  );
  if (targetwindow) {
    targetwindow.focus();
  } else {
    console.log("taget window awas null");
  }

  console.log("setting global targetwindow to", targetwindow);
  (window as any).targetwindow = targetwindow;
  postmessage();
}
function postmessage() {
  const targetwindow = (window as any).targetwindow;
  if (targetwindow) {
    console.log("posting message...");
    const termElem = document.querySelector("#ChangeTerm");
    if (!termElem) {
      console.error("could not parse the current term.");
      return;
    }
    const term = (termElem as any).innerText.match(/[A-Za-z]+-\d+/)[0];
    targetwindow.postMessage(
      JSON.stringify({ term: term, classes: (window as any).classes }),
      "*"
    );
  } else {
    console.log("target window was null");
  }
}
async function formSubmit() {
  const data = new URLSearchParams();
  const formElement: HTMLFormElement = (document.forms as any)[
    "OptionsForm"
  ] as any;
  //@ts-ignore
  for (const pair of new FormData(formElement)) {
    //@ts-ignore
    data.append(pair[0], pair[1]);
  }

  return fetch(location.href, {
    method: "post",
    body: data
  })
    .then(x => {
      // console.log("RESULT OF FETCH POST:", x);
      return x.text();
    })
    .then(x => {
      //   console.log(x);
      return x;
    });
}
/**
 * returns the number of pages of courses in the current result set.
 * It is intended that no filtering has been applied so that all courses
 * are in the result set.
 */
function getLastPage(): number {
  return Number.parseInt(
    (document.getElementsByClassName(
      "Portal_Grid_Pager"
    )[0] as any).innerText.match(/Total Pages: (\d+)/)[1],
    10
  );
}
function harvestPage(
  doc: HTMLHtmlElement = document.querySelector("html") as any
) {
  let table: HTMLTableElement | null = doc.querySelector(
    "table[summary='Course Offering List']"
  );
  // console.log("table is", table);
  if (!table) {
    console.log("couldn't find main table");
    return [];
  }
  const headersElems = table.querySelectorAll(":scope thead>tr>th");
  const headers = toArr(headersElems)
    .map(toInnerText)
    .map(toKey); //[];
  // console.log("headers are", headers);
  const rows: NodeListOf<HTMLTableRowElement> = (table.querySelector(
    "tbody"
  ) as any).children as any;
  (window as any).rows = rows;
  const results = [];
  // console.log(rows);
  let currentObj: any;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (isTitleRow(row)) {
      //make new object
      // console.log("row is title row!:", row);
      // console.log("currentObj is", currentObj);

      if (currentObj) {
        currentObj.detailsPromise = mkDetailsPromise(
          currentObj,
          currentObj.path
        );
        results.push(currentObj);
      }
      currentObj = {};
      //   console.log("new obj. index:", i);
      parseTitleRow(headers, row, currentObj);
    } else {
      //for student parsing.
      if (row.id.startsWith("Bl")) {
        continue;
      }
      parseScheduleTable(row, currentObj);
    }
  }
  // console.log("results", results);
  return results;
}
function mkDetailsPromise(me: any, path: string) {
  const PATH = window.location.href.replace(/cePortalOffering.asp.*/, "");

  // const url = "https://portals.blackburn.edu/efaculty/" + path;
  const url = PATH + path;
  return new Promise((resolve, reject) => {
    if (!path) {
      console.log("skipping details fetch for", me, "because path was", path);
      resolve();
      return;
    }
    setTimeout(() => {
      fetch(url)
        .then(x => x.text())
        .then(text => {
          const el = document.createElement("html");
          el.innerHTML = text;
          me.division = el.querySelectorAll("td")[5].innerText.trim();
          try {
            me.description = el.querySelectorAll("td")[7].innerText.trim();
          } catch (e) {
            console.log(
              "something wrong in details promise",
              toArr(el.querySelectorAll("td")).map(td =>
                td ? td.innerText.trim() : "td is null"
              )
            );
            // console.error(e);
          }
          const preReqTable = el.querySelector(
            "table[summary='Prerequisite formula information']"
          );
          if (preReqTable) {
            try {
              //@ts-ignore
              me.prereqs = (
                preReqTable.querySelector("span") ||
                preReqTable.querySelector("td")
              ).innerText.trim();
            } catch (e) {
              console.error("failed to parse prereqs:", e);
            }
          }
          const coRecTableBody = el.querySelector(
            "table[summary='CoRequisite formula information'] >tbody"
          );
          if (coRecTableBody) {
            try {
              //@ts-ignore
              const coreqs = coRecTableBody.innerText.trim();
              if (coreqs) me.coreqs = coreqs;
            } catch (e) {
              console.error("couldn't parse coreqs", e);
            }
          }

          const equivalentsTable = el.querySelector(
            "table[summary*='Course Equivalent']"
          );
          if (equivalentsTable) {
            try {
              me.equivalents = parseEquivalents(equivalentsTable as any);
            } catch (e) {
              console.error("equivalence parse fail", e);
            }
          }
          console.log("details resolved");
          resolve(me);
          //   return me;
        })
        .catch(reject);
    }, 0);
  });
}
function toArr<T extends Node>(ls: NodeListOf<T>): T[] {
  const ans = [];
  for (let i = 0; i < ls.length; i++) {
    ans.push(ls[i]);
  }
  return ans;
}
function toKey(x: string): string {
  return x.replace(/\s/g, "").toLowerCase();
}
function parseEquivalents(equivalentsTable: HTMLTableElement): any {
  const headers = toArr(equivalentsTable.querySelectorAll("th"))
    .map(x => x.innerText.trim())
    .map(toKey);
  const tds = toArr(equivalentsTable.querySelectorAll("td")).map(x =>
    x.innerText.trim()
  );
  const ans: any = {};
  headers.forEach((h, i) => {
    ans[h] = tds[i];
  });
  return ans;
}
function toInnerText(x: any): string {
  return x.innerText ? x.innerText.trim() : "";
}
function parseScheduleTable(row: HTMLTableRowElement, obj: any = {}) {
  const table: HTMLTableElement = row.querySelector(
    ":scope table"
  ) as HTMLTableElement;
  // console.log("row is", row);
  const headerElems = table.querySelectorAll(
    ":scope .headerRow> th:not(.blankCell)"
  );

  const headers = toArr(headerElems)
    .map(toInnerText)
    .map(toKey);
  // console.log("headers are:", headers);
  //   obj.headers = headers;
  obj.schedules = [];
  const rows = table.querySelectorAll(":scope tbody>tr:not(.headerRow)");
  // console.log("the rows within are:", rows);
  for (let i = 0; i < rows.length; i++) {
    const sched: any = {};
    const tr = rows[i];
    const tds = toArr(tr.children as any).filter(
      //@ts-ignore
      x => !x.className.includes("blankCell")
    );
    // console.log("tds", tds);
    for (let j = 0; j < tds.length; j++) {
      const td: any = tds[j];
      sched[headers[j]] = td.innerText.trim();
    }
    obj.schedules.push(sched);
  }
  return obj;
}
function parseTitleRow(
  headers: string[],
  row: HTMLTableRowElement,
  obj: any = {}
) {
  const courseNameIndex = 1;
  const tds = row.children;
  for (let i = 0; i < tds.length; i++) {
    const cell = tds[i];
    if (courseNameIndex == i) {
      try {
        obj.path = (cell.children[0] as any).onclick
          .toString()
          .match(/openpopup\('(.*)'\)/)[1];
      } catch (e) {
        console.error(
          "something went wrong trying to harvest the details path url",
          cell,
          toArr(tds as any).map((x: any) => x.innerText.trim()),
          e
        );
      }
    }
    obj[headers[i]] = (tds[i] as any).innerText.trim();
  }
  return obj;
}
function isTitleRow(row: HTMLTableRowElement): boolean {
  return row.className.search("courseInfo") >= 0;
}
function placeButton() {
  //@ts-ignore
  const x: any = document.querySelector(".Page_Logo");
  x.innerHTML =
    "<button id='replacebtn' onclick='replaceAll()'> Better view plz</button>" +
    x.innerHTML;
}
placeButton();

/**
 * creates a script element and adds all code here natively to the page.
 * This step is necessary because js code in an extention is actually sandboxed.
 * Though in this case, we need to avoid the sandbox.
 */
function addCode() {
  const elem = document.createElement("script");
  let str = "";
  str += isTitleRow.toString();
  str += parseTitleRow.toString();
  str += parseScheduleTable.toString();
  str += mkDetailsPromise.toString();
  str += harvestPage.toString();
  str += getLastPage.toString();
  str += formSubmit.toString();
  str += harvestCourses.toString();
  str += replaceAll.toString();
  str += parseEquivalents.toString();
  str += toArr.toString();
  str += toInnerText.toString();
  str += toKey.toString();
  str += doOpen.toString();
  str += postmessage.toString();
  str += `(${(() => {
    window.addEventListener("message", receiveMessage, false);
    function receiveMessage(event: any) {
      console.log(
        "I received a message! :D I will postmessge in response",
        event
      );
      postmessage();
    }
  }).toString()})()`;
  elem.innerHTML = str;
  //@ts-ignore
  document.querySelector("body").append(elem);
}
addCode();
console.log("course harvest running!!!!!");
