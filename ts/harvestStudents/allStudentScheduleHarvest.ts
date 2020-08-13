// import "./studentScheduleHarvestForOfficeHours";

console.log("working");
//@ts-ignore
function addCode() {
  console.log("addcode running");
  const elem = document.createElement("script");
  let str = "";
  str += submitStudent.toString();
  str += getSchedulePage.toString();
  str += harvest.toString();
  str += formSubmit.toString();
  str += getNumberOfStudents.toString();
  str += harvesetHelper.toString();
  str += toArr.toString();
  str += pagify.toString();
  str += getOptionsPage.toString();
  elem.innerHTML = str;
  //@ts-ignore
  document.querySelector("body").append(elem);
}
addCode();
/**
 * This is the function that is called on button click. note that only displayed students are harvested.
 */
async function harvest() {
  const numStudents = getNumberOfStudents();
  const status = document.getElementById("status");
  const rows = document.querySelectorAll("tr:not(.Portal_Table_Caption");
  const seenStudents: string[] = [];
  const students = [];
  for (let i = 0; i < numStudents; i++) {
    const tds = rows[i + 1].querySelectorAll("td");
    const sName = tds[2].innerText.replace(/\d+\.\s+/, "");
    if (!seenStudents.includes(sName)) {
      seenStudents.push(sName);
      const s = await harvesetHelper(i);
      s.id = rows[i + 1].querySelectorAll("td")[1].innerText.trim();
      students.push(s);
    }

    if (status) {
      status.innerText = "Status: " + (i + 1) + " / " + numStudents;
    }
  }
  //   const x = await getSchedulePage(5);
  console.log("students:", students);
  console.log("stringed", JSON.stringify(students));
}
/**
 * called for each student to harvest them.
 * @param i th student on page.
 */
async function harvesetHelper(i: number): Promise<any> {
  //   setTimeout(async () => {
  //tell the server what student we want.
  const r1 = await submitStudent(i);
  //
  async function handleSchedule() {
    const r = await getSchedulePage();
    // const el = document.createElement("html");
    // el.innerHTML = r;
    const el = pagify(r);
    //@ts-ignore
    const message = el.querySelector(".Portal_Table_Caption").innerText;
    console.log(i, message);
    return harvestStudentSchedule(el);
  }
  async function handleOptionsPage() {
    const r = await getOptionsPage();
    const el = pagify(r);
    return harvestStudentOptions(el);
  }
  const [obj1, obj2] = await Promise.all([handleSchedule(), handleOptionsPage()]);
  const answer = { ...obj1, ...obj2 };
  console.log("answer", answer);
  return answer;

  //   }, i * 10);
}
function pagify(str: string): HTMLHtmlElement {
  const el = document.createElement("html");
  el.innerHTML = str;
  return el;
  //@ts-ignore
}
//@ts-ignore
function placeButton() {
  //@ts-ignore
  const x: HTMLElement = document.querySelector(".Page_Logo");
  x.innerHTML =
    "<button style=\"background:yellow;\" id='replacebtn' onclick='harvest()'> Harvest schedules (console print only those on page)</button>" +
    x.innerHTML;
  const div = document.createElement("div");
  div.id = "status";
  div.innerText = "status";
  x.appendChild(div);
}
placeButton();
// setTimeout(async () => {
//   console.log("result", await getSchedulePage(2));
// }, 100);
async function submitStudent(id: number) {
  // document.getElementById('txtStudentUID').value = StudentUID;
  // document.getElementById('ak').value = a1;
  // document.forms['Navigation'].action = 'setSessionObjects.asp?ak=' + a1;
  // document.forms['Navigation'].submit();
  //@ts-ignore
  document.getElementById("txtStudentUID").value = id;
  //@ts-ignore
  document.getElementById("ak").value = a1;
  //@ts-ignore
  document.forms["Navigation"].action = "setSessionObjects.asp?ak=" + a1;
  return formSubmit("Navigation");
}
function getNumberOfStudents(): number {
  //@ts-ignore
  return document.querySelector("table").querySelectorAll("tr:not(.Portal_Table_Caption)").length - 1;
}
async function getSchedulePage(): Promise<string> {
  //   console.log("boop1");
  // const r1 = await submitStudent(id); //moved to caller.
  //   console.log("first result", r1);
  //   console.log("subbmitted");
  const url = location.origin + "/efaculty/cePortalMatrixSchedule.asp" + location.search;
  //   console.log("fetching:", url);s
  return fetch(url).then((x) => x.text());
}
async function getOptionsPage(): Promise<string> {
  const url = location.origin + "/efaculty/ceStudentOptions.asp" + location.search;
  return fetch(url).then((x) => x.text());
}
//@ts-ignore
function toArr(ls: any): any[] {
  const ans = [];
  for (let i = 0; i < ls.length; i++) {
    ans.push(ls[i]);
  }
  return ans;
}
//@ts-ignore
async function formSubmit(
  formid: string,
  endpoint: string = location.origin + "/efaculty/setSessionObjects.asp" + location.search
) {
  const data = new URLSearchParams();
  //@ts-ignore
  const formElement = document.forms[formid];
  //   console.log("form element: ", formElement);

  //@ts-ignore
  for (const pair of new FormData(formElement)) {
    //@ts-ignore
    data.append(pair[0], pair[1]);
  }

  return fetch(endpoint, {
    method: "post",
    body: data,
  })
    .then((x) => {
      // console.log("RESULT OF FETCH POST:", x);
      return x.text();
    })
    .then((x) => {
      //   console.log(x);
      return x;
    });
}
