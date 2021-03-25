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
  const coursePagePromises: Promise<CourseMaster>[] = [];
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
                const courseMaster = harvestCourse(e);
                return courseMaster;
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
  sout("json string", JSON.stringify(allCourses));
}
/**
 * Gets the html page of the specified page.
 * @param pg the number page to retrieve
 * @returns the html of the page.
 */
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
// async function getAllClassLinksFromPage(html: HTMLHtmlElement) {
//   html.querySelectorAll;
// }
/**
 * Harvests the row for the link to the html page containing class info.
 * @param row the htmltablerow to harvest from
 * @returns the relative link to retrieve the course information page.
 */
function rowToUrl(row: HTMLTableRowElement): string {
  try {
    //@ts-ignore
    return row.querySelector("a").href.match(/openpopup\(\'(.*)\'\)/)[1];
  } catch (e) {
    console.error("error turning html row into link from a tag");
    return "";
  }
}
/**
 * Harvests the course rows from an html page.
 * @param doc the document to harvest the rows from. defaults to document.
 * @returns the html rows found in the page as an array.
 */
function getCourseRows(doc: HTML = document): HTMLTableRowElement[] {
  return toArr(doc.querySelectorAll("tbody>tr")) as HTMLTableRowElement[];
}
/**
 * Examines the HTML page to learn the number of pages present which must be harvested.
 * @param doc the document to examine. defaults to document.
 * @returns the number of pages.
 */
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
/**
 * A unique id unlikely to be in use already for the added button.
 */
const BUTTID = "eijfevfe483";
/**
 * Adds the harvest courses button to the page.
 */
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

type CourseMaster = {
  department: string;
  number: number;
  type: string;
  name: string;
  division: string;
  credits: number;
  description: string;
  prereqFormula: string;
  coreqFormula: string;
  prereqTree: any;
  coreqTree: any;
  id: string;
};
/**
 * Harvests the preReq formula from the page. If no prereqs, empty string is returned.
 * @param doc The document to harvest from. Defaults to document.
 * @returns The preReq formula. empty string if no prereqs.
 */
function getPrereqFormula(doc: HTML = document): string {
  const prereqTable = getTable("Prerequisite Formula", doc);
  if (prereqTable) {
    const e = prereqTable.querySelector("tbody>tr") as HTMLTableRowElement;
    if (e) {
      return e.innerText.trim();
    } else {
      console.error(
        "prereq table existed but could not get contents. table:",
        prereqTable
      );
    }
  }
  return "";
}
/**
 * Harvests the coReq formula from the page. If no coReqs, empty string is returned.
 * @param doc The document to harvest from. Defaults to document.
 * @returns The coReq formula. empty string if no coReq.
 */
function getCoreqFormula(doc: HTML = document): string {
  const coreqTable = getTable(
    ["Corequisite Formula", "Co-requisite Formula"],
    doc
  );
  if (coreqTable) {
    const e = coreqTable.querySelector("tbody>tr") as HTMLTableRowElement;
    if (e) {
      return e.innerText.trim();
    } else {
      console.error(
        "coreq table existed but could not get contents. table:",
        coreqTable
      );
    }
  }
  return "";
}
//just a test.
parseReq(
  "( 3 Credits From Range [EN140LEC To EN265LEC GPA .67]) AND ( College Level=Sophomore OR College Level=Junior OR College Level=Senior)"
);
/**
 * Harvest the course information from the webpage specified.
 * @param doc The html page to harvest from. Defaults to document.
 * @returns a CourseMaster instance.
 */
function harvestCourse(doc: HTML = document): CourseMaster {
  const row = doc.querySelectorAll("tbody>tr")[1] as HTMLTableRowElement;
  const tds = row.querySelectorAll("td");
  let c;
  const dept = tds[0].innerText.trim();
  const num = Number.parseInt(tds[1].innerText.trim(), 10);
  const descrow = doc.querySelectorAll("tbody>tr")[2] as HTMLTableRowElement;
  const coreq = getCoreqFormula(doc);
  const coreqTree = coreq ? parseReq(coreq) : null;
  const prereq = getPrereqFormula(doc);
  const prereqTree = prereq ? parseReq(prereq) : null;
  const tp = tds[2].innerText.trim();
  // if (coreq && coreq.length > 30) sout(dept + num + tp, coreq, coreqTree);
  // if (prereq && prereq.length > 30)
  //   sout(dept + num + tp, prereq, prereqTree);
  let desc = "";
  if (descrow) {
    desc = descrow.innerText.trim();
  }
  // sout(desc);
  try {
    c = {
      department: dept,
      number: num,
      type: tp,
      id: dept + num,
      name: tds[3].innerText.trim(),
      division: tds[4].innerText.trim(),
      credits: Number.parseInt(tds[5].innerText.trim(), 10),
      description: desc,
      prereqFormula: prereq,
      prereqTree: prereqTree,
      coreqFormula: coreq,
      coreqTree: coreqTree,
    };
  } catch (e) {
    console.error("something went wrong trying to parse course", dept, num);
    console.error(e);
  }
  //@ts-ignore
  return c;
}
/**
 * Gets a table basedf on txt being present somewhere within.
 * @param doc
 * @param txt
 * @returns
 */
function getTable(
  txt: string | string[],
  doc: HTML = document
): HTMLTableElement | undefined {
  const tables = doc.querySelectorAll("table");
  for (let i = 0; i < tables.length; i++) {
    const t = tables[i];
    if (txt instanceof Array) {
      for (let j = 0; j < txt.length; j++) {
        if (t.innerText.includes(txt[j])) {
          return t;
        }
      }
    } else if (t.innerText.includes(txt)) {
      return t;
    }
  }
  return undefined;
}
/**
 * Creates the Req object from the specified string.
 * @param req
 * @returns
 */
function parseReq(req: string): any {
  //this ensures splitting by spaces finds [ and ] as symbols.
  const ls = req.replaceAll(/]/g, " ] ").replaceAll(/,/g, " , ").split(/\s+/);
  // console.log("ls is", ls);
  let answer: any[] = [];
  ls.forEach((word) => {
    if (word == ",") return;
    // console.log(word);
    if (word.startsWith("(") || word.startsWith("[")) {
      answer.push(word[0]);
      word = word.slice(1);
    }
    if (word.endsWith(")") || word.endsWith("]")) {
      const last = word[word.length - 1];
      word = word.slice(0, word.length - 1);
      if (word) {
        answer.push(word);
      }
      answer.push(last);
    } else if (word) {
      answer.push(word);
    }
  });
  // console.log("pretoekize2", answer);
  const tokens = tokenize2(answer);
  // sout("tokenized", tokens);
  const parseTree = parsify(tokens);
  sout("initial", req, "tree", parseTree);

  return parseTree;
}
function tokenize2(arr: string[]): any[] {
  const answer: any[] = [];
  for (let i = 0; i < arr.length; i++) {
    // console.log(i, arr[i]);
    const word = arr[i];
    if (word == "College") continue;
    if (word.match(/[A-Z]+\d+[A-Z]+/)) {
      //course req. check for grade.
      if (i + 1 < arr.length && arr[i + 1] == "GPA" && i + 2 < arr.length) {
        //then there is a gpa requirement.
        const c = {
          course: word.replace(/LEC|LAB/, ""),
          gpa: Number.parseFloat(arr[i + 2]),
        };
        i += 2;
        answer.push(c);
      } else {
        //no gpa req.
        answer.push(word.replace(/LEC|LAB/, ""));
      }
    } else if (!isNaN(word as any)) {
      //then this is a number. 3 Credits from range or x credits from list
      let ii = i + 5;
      const ls = [];
      while (arr[ii] != "]") {
        ls.push(arr[ii++]);
      }
      const c = {
        credits: Number.parseInt(word, 10),
        type: arr[i + 3],
        ls: ls,
      };
      console.log("RANGE FOUND", c);
      answer.push(c);
      while (arr[i] != "]") {
        i++;
      }
    } else if (word.startsWith("Major")) {
      //take all words that could be part of major
      let a = word;
      let executed = false;
      while (
        arr[i + 1] &&
        arr[i + 1] != "AND" &&
        arr[i + 1] != "OR" &&
        !arr[i + 1].match(/\(|\)|[|]/)
      ) {
        a += " " + arr[1 + i++];
        executed = true;
      }
      answer.push(a);
      // if (executed) i--; //put it back.
    } else {
      if (
        !word.match(/\(|\)|[|]/) &&
        word != "OR" &&
        word != "AND" &&
        !word.startsWith("Level")
      ) {
        console.error("unexpected word", arr[i]);
      }
      answer.push(arr[i]);
    }
  }
  return answer;
}
function parsify(answer: string[]): any {
  const operators: string[] = [];
  const operands: any[] = [];
  for (let i = 0; i < answer.length; i++) {
    const token = answer[i];
    // console.log("TOken", token, operands, operators);
    if (token == "OR") {
      //1.2: process all the operators at the top of operatorStack and push the extracted operator to operatorStack
      const tempStack: any[] = [];
      let op = operators.pop();
      while (op && (op == "AND" || op == "OR")) {
        const right = operands.pop();
        const left = operands.pop();
        tempStack.push({ op: op, left: left, right: right });
        op = operators.pop();
      }
      while (tempStack.length > 0) {
        operands.push(tempStack.pop());
      }
      if (op) {
        operators.push(op); //if it's parens, put it back.
      }
      operators.push(token);
    } else if (token == "AND") {
      // 1.3: process the * or / operators at the top of operatorStack and push the extracted operator to operatorStack.
      const tempStack: any[] = [];
      let op = operators.pop();
      while (op && op == "AND") {
        // sout("in AND while loop", op);
        const right = operands.pop();
        const left = operands.pop();
        tempStack.push({ op: op, left: left, right: right });
        op = operators.pop();
      }
      while (tempStack.length > 0) {
        operands.push(tempStack.pop());
      }
      if (op) {
        operators.push(op);
      }
      operators.push(token);
    } else if (token == "(") {
      //1.4.	If the extracted item is a ( symbol, push it to operatorStack.
      operators.push(token);
    } else if (token == ")") {
      // sout("in ) branch");
      // 1.5.	If the extracted item is a ) symbol, repeatedly process the operators from the top of operatorStack until seeing the ( symbol on the stack.
      let op = operators.pop();
      while (op && op != "(") {
        // sout("in while loop op is: ", op);
        const right = operands.pop();
        const left = operands.pop();
        operands.push({ op: op, left: left, right: right });
        op = operators.pop();
      }
      // sout("exited while loop op is: ", op, operands, operators);
    } else {
      //1.1. is operand.
      operands.push(token);
    }
  }
  //Phase 2: Clearing the stack
  // Repeatedly process the operators from the top of operatorStack until operatorStack is empty.
  let op = operators.pop();
  while (op) {
    const right = operands.pop();
    const left = operands.pop();
    operands.push({ op: op, left: left, right: right });
    op = operators.pop();
  }
  // console.log("FINAL STACK", operands);
  if (operands.length !== 1) {
    console.error(
      "error in simplification. expected operand stack to have size 1",
      operands,
      operators,
      "initial array",
      answer
    );
  }
  return operands[0];
}
