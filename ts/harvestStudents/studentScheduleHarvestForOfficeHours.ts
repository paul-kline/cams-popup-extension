console.log("STUDENTSCHEDULEHARVESTFOROFFICEHOURS");
//@ts-ignore
function toEvent(c: any) {
  /* 
course: "PH201"
day: "MWF"
endtime: "03:50 PM"
instructor: "Luth, Karl"
room: "ALUM-143"
starttime: "03:00 PM"
time: "03:00 PM - 03:50 PM"
title: "GENERAL COLLEGE PHYSICS I"
*/
  const dayCode: any = {
    U: "SU",
    M: "MO",
    T: "TU",
    W: "WE",
    R: "TH",
    F: "FR",
    S: "SA",
  };
  const event: any = {};
  event.summary = c.course + " " + c.room;
  event.room = c.room;
  event.classTitle = c.course;
  event.location = c.room;
  event.description = c.title;
  //@ts-ignore
  const start_dt = adjustDate(
    //@ts-ignore
    setTime(new Date(c.startdate), c.starttime),
    c.day
  );
  //@ts-ignore
  const end_dt = adjustDate(setTime(new Date(c.startdate), c.endtime), c.day);
  const timesuffix = "-0" + start_dt.getTimezoneOffset() / 60 + ":00";
  event.start = {
    dateTime: start_dt.toISOString(), //.replace(".000Z", "") + timesuffix,
    timeZone: "America/Chicago",
  };
  event.end = {
    dateTime: end_dt.toISOString(), //.replace(".000Z", "") + timesuffix,
    timeZone: "America/Chicago",
  };
  if (c.enddate) {
    const until_dt = c.enddate;
    event.recurrence = [
      `RRULE:FREQ=WEEKLY;UNTIL=${until_dt.toISOString().replace(/-|\.\d+|:/g, "")};WKST=SU;BYDAY=${c.day
        .split("")
        .map((x: any) => dayCode[x])}`,
    ];
  } else {
    event.recurrence = [`RRULE:FREQ=WEEKLY;WKST=SU;BYDAY=${c.day.split("").map((x: any) => dayCode[x])}`];
  }

  // event.recurrence = `RRULE:FREQ=WEEKLY;UNTIL=${until_dt.toISOString().replace(/-|\.\d+|:/g, "")}`;
  event.attendees = [];
  event.reminders = {
    useDefault: true,
  };
  return event;
}
//@ts-ignore
function toEvents(classes: any[]) {
  return classes.map(toEvent);
}
/**
 *return date is set to 11:59:59;
 * @param str expect form: yyyy-mm-dd
 *
 */
//@ts-ignore
function parseDate(str: string): Date {
  //yyyy-mm-dd
  const d = new Date();
  d.setMilliseconds(59);
  d.setSeconds(59);
  d.setMinutes(59);
  d.setHours(23);
  // console.log("str, str.split('-')", str, str.split("-"));
  const [year, month, day] = str.split("-").map((x) => Number.parseInt(x, 10));
  // console.log("year, month, day", year, month, day);
  d.setFullYear(year);
  d.setMonth(month - 1);
  d.setDate(day);
  return d;
}
//@ts-ignore
function parseDateFromId(id) {
  const e = document.getElementById(id);

  if (e) {
    //@ts-ignore
    return parseDate(e.value);
  }
}

function getStudentName(doc = document): string {
  //@ts-ignore
  return doc.querySelector(".course_management_coursename").innerText.trim() || "";
}
/**
 * creates the array of objects from the webpage.
 */
//@ts-ignore
function harvestStudentSchedule(doc: any = document) {
  // const e = doc.getElementById("startdate");
  const e = doc.querySelector("#startdate");
  const startDate = e && e.value ? parseDate(e.value) : new Date();
  // const e2 = doc.getElementById("enddate");
  const e2 = doc.querySelector("#enddate");
  const endDate = e2 && e2.value ? parseDate(e2.value) : undefined;
  console.log("enddate", endDate);
  const rows = doc.querySelectorAll("table[summary='Non-matrix schedule'] > tbody > tr");
  const result = [];
  //order of info:
  //Dept	CrsID	Type	Section	CourseName	Instructor	Days	Room	Time	Date	Credits
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const cells = row.children;
    const aclass = {};
    //@ts-ignore
    aclass.startdate = startDate;
    //@ts-ignore
    aclass.enddate = endDate;
    //@ts-ignore
    aclass.course = cells[0].innerText.trim() + cells[1].innerText.trim(); //+ " " + cells[2].innerText;
    //@ts-ignore
    if (!aclass.course.trim()) aclass.course = result[i - 1].course;
    //@ts-ignore
    aclass.title = cells[4].innerText.trim();
    //@ts-ignore
    if (!aclass.title.trim()) aclass.title = result[i - 1].title;
    //@ts-ignore
    aclass.instructor = cells[5].innerText.trim();
    //@ts-ignore
    if (!aclass.instructor.trim()) aclass.instructor = result[i - 1].instructor;
    //@ts-ignore
    aclass.day = cells[6].innerText.trim();
    //@ts-ignore
    if (!aclass.day.trim()) aclass.day = result[i - 1].day;
    //@ts-ignore
    aclass.room = cells[7].innerText.trim();
    //@ts-ignore
    if (!aclass.room.trim()) aclass.room = result[i - 1].day;
    //@ts-ignore
    aclass.time = cells[8].innerText.trim();
    //@ts-ignore
    if (!aclass.time.trim()) aclass.time = result[i - 1].time;
    //"starttime":"03:00 PM","endtime":"03:50 PM"
    //@ts-ignore
    [aclass.starttime, aclass.endtime] = aclass.time.split(" - ");
    result.push(aclass);
  }
  const student = getStudentName(doc);
  return {
    student: student,
    rawEvents: result,
    // googleEvents: toEvents(result)
  };
}
/**
 *
 * @param {HTMLInputElement} input to set
 * @param {Date} date
 */
//@ts-ignore
function setInputDate(input, date) {
  input.value = date.getFullYear() + "-" + twof(date.getMonth() + 1) + "-" + twof(date.getDate());
}
//@ts-ignore
function twof(x) {
  x = "" + x;
  return x.length < 2 ? "0" + x : x;
}
// function placeButton() {
//   const x = document.querySelector(".Page_Logo").nextElementSibling;
//   x.innerHTML =
//     x.innerHTML +
//     "<button id='calendar' onclick='callExport()'> Export to my Google Calendar!</button><div>Semester start:<input type='date' id='startdate'></div><div>Semester end:<input type='date' id='enddate'></div>";
// }
// placeButton();
//@ts-ignore
function callExport() {
  console.log("boop. export clicked");
  const scheds = harvestStudentSchedule();
  console.log(
    "sched start times",
    scheds.map((s) => s.starttime)
  );
  const events = toEvents(scheds);
  console.log("events", events);
  console.log("events", JSON.stringify(events));
  //   console.log(scheds.map(s => s.startdate));
  //   console.log(events.map(e => e.start));
  //@ts-ignore
  const p = document.querySelector(".Page_Logo").nextElementSibling;
  //@ts-ignore
  exportToGoogle(events, function (event) {
    console.log("Events created for: " + event.htmlLink, event);
    const elem = document.createElement("div");
    elem.setAttribute("id", event.id);
    const str = `Events created for: <a href="${event.htmlLink}" target="_blank">${event.summary}</a><button onclick="deleteEvent('${event.id}',x=> document.getElementById('${event.id}').style.display='none')">delete event</button>`;
    elem.innerHTML = str;
    //@ts-ignore
    p.append(elem);
  });
}
//@ts-ignore
function addCode() {
  console.log("add code studentscheduleharvestforofficehours called");
  const elem = document.createElement("script");
  let code = toEvents.toString() + "\n";
  code += toEvent.toString() + "\n";
  code += harvestStudentSchedule.toString() + "\n";
  code += callExport.toString() + "\n";
  code += parseDate.toString() + "\n";
  code += parseDateFromId.toString() + "\n";
  code += setInputDate. toString() + "\n";
  code += twof.toString() + "\n";
  code += getStudentName.toString();

  elem.innerHTML = code;
  console.log("elem", elem);
  //@ts-ignore
  document.querySelector("body").append(elem);
}
addCode();
