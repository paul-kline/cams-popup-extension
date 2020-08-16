//The purpose is to quickly check fo remote learners relevant to your courses.

console.log("remote learners check ");

/**
 * Add special check button.
 */
function placeFA20CheckButton(): void {
  const page = document.querySelector("#mainBody");
  const butt = document.createElement("button");
  butt.style.background = "yellow";

  butt.innerHTML =
    "FA 2020 Check status of remote students in my classes (ALPHA)";
  butt.onclick = async () => {
    console.log("fa button clicked.");
    //@ts-ignore
    checkStudents();
  };
  if (page) {
    const a = document.createElement("a");
    a.href =
      "https://docs.google.com/spreadsheets/d/1BLFS7guOD_Y6hGC2CExvTVcmf7akEz8RZcz4m8rNQYs/edit#gid=0";
    a.innerText = "Spreadsheet";
    a.style.display = "block";
    a.style.margin = "40px 0 0 0";
    a.target = "_blank";
    page.appendChild(a);
    page.appendChild(butt);
  }
}

async function checkStudents() {
  const remoteStudentIds: string[] = await getRemoteStudents();
  console.log("remote students retrieved.", remoteStudentIds);
  const myStudents = await getMyStudents();
  console.log("my student list retrieved", myStudents);
  const page = document.querySelector("#mainBody") as HTMLElement;
  myStudents.forEach((clss) => {
    const classHeader = document.createElement("h2");
    classHeader.innerText = clss.class;
    page.appendChild(classHeader);
    clss.students.forEach((stud: any) => {
      const div = document.createElement("div");
      div.style.width = "max-content";
      div.innerText = stud.name;
      if (remoteStudentIds.includes(stud.id)) {
        div.style.background = "red";
        div.innerText += " (REMOTE)";
      }
      page.appendChild(div);
    });
  });
}

/**
 * returns a JSON array of student IDs from my sheet that references kristi's sheet.
 */
async function getRemoteStudents() {
  const url =
    "https://script.google.com/a/blackburn.edu/macros/s/AKfycbzKDxMMxa_wJX0d6qX55WW0v952joXhyuHoHWyyUjGlVmt4vg6a/exec";
  //https://script.google.com/macros/s/AKfycbzKDxMMxa_wJX0d6qX55WW0v952joXhyuHoHWyyUjGlVmt4vg6a/exec
  const response = await fetch(url, { redirect: "follow" });

  if (response.redirected && response.url) {
    const resp2 = await fetch(response.url);
    const data2 = await resp2.json();
    // console.log("data2", data2);
    return data2;
  } else {
    console.log("response", response);
    const data = await response.json();
    console.log("data is", data);
    return data;
  }
}
/**
 * returns my classes of students in this form
 * [{class: "CS 120", students:[{id: "A00123123", name: "Bob Shalamonka"}]}]
 */
async function getMyStudents() {
  //@ts-ignore
  const htmltext = await tayloredSubmit();
  const html = document.createElement("html");
  html.innerHTML = htmltext;
  console.log(html);
  //@ts-ignore
  const res = [];
  if (html) {
    //@ts-ignore
    const rows = html.querySelector("tbody").querySelectorAll("tr");
    let curClass = "";
    rows.forEach((row) => {
      if (row.classList.contains("Portal_Table_Caption")) {
        //it's a title row!
        curClass = row.innerText.trim();
        res.push({ class: curClass, students: [] });
      } else {
        //it's not a title row!
        const tds = row.querySelectorAll("td");
        //@ts-ignore
        const studArray = res[res.length - 1].students;
        try {
          const sid = tds[1].innerText.trim();
          const rawName = tds[2].innerText.trim();
          //@ts-ignore
          const name = rawName.match(/\d+\.\s+(.*)/)[1];
          studArray.push({ id: sid, name: name });
        } catch (err) {
          console.error(err, "row was", row);
        }
      }
    });
  } else {
    console.log("html was false??");
  }
  //@ts-ignore
  return res;
}

/**
 * used in getMyStudents to get the webpage needed.
 */
async function tayloredSubmit() {
  //@ts-ignore
  const url = document.getElementById("my_students").href;
  const key = url.match(/ak=(.*)/)[1];
  const data = new URLSearchParams();
  data.append("txtStudentUID", "");
  data.append("showOfferID", "All");
  data.append("hShowPhoto", "");
  data.append("hShowWithdrawn", "False");
  data.append("accessKey", key);
  return fetch(url, {
    method: "post",
    body: data,
  })
    .then((x) => {
      console.log("RESULT OF FETCH POST:", x);
      return x.text();
    })
    .then((x) => {
      console.log(x);
      return x;
    });
}
/*
//here for reference.
async function formSubmit(
  formid: string,
  endpoint: string = location.origin +
    "/efaculty/setSessionObjects.asp" +
    location.search
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
*/
function mainRemoteLearnerCheck() {
  setTimeout(placeFA20CheckButton, 200);
}

function addCode2() {
  const elem = document.createElement("script");
  let code = checkStudents.toString() + "\n";
  code += placeFA20CheckButton.toString() + "\n";
  code += mainRemoteLearnerCheck.toString() + "\n";
  code += getMyStudents.toString() + "\n";
  code += tayloredSubmit.toString() + "\n";
  code += getRemoteStudents.toString() + "\n";
  code += "mainRemoteLearnerCheck();";
  elem.innerHTML = code;
  document.querySelector("body")!.append(elem);
}
addCode2();
