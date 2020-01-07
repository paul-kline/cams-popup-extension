// import "./studentScheduleHarvestForOfficeHours";

console.log("working");
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
  elem.innerHTML = str;
  document.querySelector("body").append(elem);
}
addCode();
async function harvest() {
  const numStudents = getNumberOfStudents();
  const students = [];
  for (let i = 0; i < numStudents; i++) {
    students.push(await harvesetHelper(i));
  }
  //   const x = await getSchedulePage(5);
  console.log("students:", students);
  console.log("stringed", JSON.stringify(students));
}

async function harvesetHelper(i: number): any {
  //   setTimeout(async () => {
  const r = await getSchedulePage(i);
  const el = document.createElement("html");
  el.innerHTML = r;
  const message = el.querySelector(".Portal_Table_Caption").innerText;
  console.log(i, message);
  return harvestStudentSchedule(el);
  //   }, i * 10);
}
function placeButton() {
  //@ts-ignore
  const x = document.querySelector(".Page_Logo");
  x.innerHTML =
    "<button id='replacebtn' onclick='harvest()'> Harvest</button>" +
    x.innerHTML;
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
  document.getElementById("txtStudentUID").value = id;
  document.getElementById("ak").value = a1;
  document.forms["Navigation"].action = "setSessionObjects.asp?ak=" + a1;
  return formSubmit("Navigation");
}
function getNumberOfStudents(): number {
  return (
    document
      .querySelector("table")
      .querySelectorAll("tr:not(.Portal_Table_Caption)").length - 1
  );
}
async function getSchedulePage(id: number) {
  //   console.log("boop1");
  const r1 = await submitStudent(id);
  //   console.log("first result", r1);
  //   console.log("subbmitted");
  const url =
    location.origin + "/efaculty/cePortalMatrixSchedule.asp" + location.search;
  //   console.log("fetching:", url);s
  return fetch(url).then(x => x.text());
}
function toArr(ls: any): any[] {
  const ans = [];
  for (let i = 0; i < ls.length; i++) {
    ans.push(ls[i]);
  }
  return ans;
}
async function formSubmit(
  formid: string,
  endpoint: string = location.origin +
    "/efaculty/setSessionObjects.asp" +
    location.search
) {
  const data = new URLSearchParams();
  const formElement = document.forms[formid];
  //   console.log("form element: ", formElement);

  //@ts-ignore
  for (const pair of new FormData(formElement)) {
    //@ts-ignore
    data.append(pair[0], pair[1]);
  }

  return fetch(endpoint, {
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
