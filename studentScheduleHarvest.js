function toEvent(c) {
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
  const dayCode = {
    U: "SU",
    M: "MO",
    T: "TU",
    W: "WE",
    R: "TH",
    F: "FR",
    S: "SA"
  };
  const event = {};
  event.summary = c.course + " " + c.room;
  event.room = c.room;
  event.classTitle = c.course;
  event.location = c.room;
  event.description = c.title;
  const start_dt = adjustDate(setTime(new Date(c.startdate), c.starttime), c.day);
  const end_dt = adjustDate(setTime(new Date(c.startdate), c.endtime), c.day);
  const timesuffix = "-0" + start_dt.getTimezoneOffset() / 60 + ":00";
  event.start = {
    dateTime: start_dt.toISOString(), //.replace(".000Z", "") + timesuffix,
    timeZone: "America/Chicago"
  };
  event.end = {
    dateTime: end_dt.toISOString(), //.replace(".000Z", "") + timesuffix,
    timeZone: "America/Chicago"
  };
  if (c.enddate) {
    const until_dt = toDateTime(c.enddate, c.endtime);
    event.recurrence = [
      `RRULE:FREQ=WEEKLY;UNTIL=${until_dt.toISOString().replace(/-|\.\d+|:/g, "")};WKST=SU;BYDAY=${c.day
        .split("")
        .map(x => dayCode[x])}`
    ];
  } else {
    event.recurrence = [`RRULE:FREQ=WEEKLY;WKST=SU;BYDAY=${c.day.split("").map(x => dayCode[x])}`];
  }

  // event.recurrence = `RRULE:FREQ=WEEKLY;UNTIL=${until_dt.toISOString().replace(/-|\.\d+|:/g, "")}`;
  event.attendees = [];
  event.reminders = {
    useDefault: true
  };
  return event;
}
function toEvents(classes) {
  return classes.map(toEvent);
}
function parseDate(str) {
  //yyyy-mm-dd
  const d = new Date();
  d.setMilliseconds(59);
  d.setMinutes(59);
  d.setHours(23);
  [year, month, day] = str.split("-").map(Number.parseInt);
  d.setFullYear(year);
  d.setMonth(month - 1);
  d.setDate(day);
  return d;
}
function parseDateFromId(id) {
  const e = document.getElementById(id);

  if (e) {
    return parseDate(e.value);
  }
}
/**
 * creates the array of objects from the webpage.
 */
function harvestStudentSchedule() {
  const e = document.getElementById("startdate");
  const startDate = e && e.value ? parseDate(e.value) : new Date();
  const e2 = document.getElementById("enddate");
  const endDate = e2 && e2.value ? parseDate(e2.value) : undefined;
  const rows = document.querySelectorAll("table[summary='Course Schedule'] > tbody > tr");
  const result = [];
  //order of info:
  //Dept	CrsID	Type	Section	CourseName	Instructor	Days	Room	Time	Date	Credits
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const cells = row.children;
    const aclass = {};
    aclass.startdate = startDate;
    aclass.enddate = endDate;
    aclass.course = cells[0].innerText + cells[1].innerText; //+ " " + cells[2].innerText;
    if (!aclass.course.trim()) aclass.course = result[i - 1].course;
    aclass.title = cells[4].innerText;
    if (!aclass.title.trim()) aclass.title = result[i - 1].title;
    aclass.instructor = cells[5].innerText;
    if (!aclass.instructor.trim()) aclass.instructor = result[i - 1].instructor;
    aclass.day = cells[6].innerText;
    if (!aclass.day.trim()) aclass.day = result[i - 1].day;
    aclass.room = cells[7].innerText;
    if (!aclass.room.trim()) aclass.room = result[i - 1].day;
    aclass.time = cells[8].innerText;
    if (!aclass.time.trim()) aclass.time = result[i - 1].time;
    //"starttime":"03:00 PM","endtime":"03:50 PM"
    [aclass.starttime, aclass.endtime] = aclass.time.split(" - ");
    result.push(aclass);
  }
  return result;
}
/**
 *
 * @param {HTMLInputElement} input to set
 * @param {Date} date
 */
function setInputDate(input, date) {
  input.value = date.getFullYear() + "-" + twof(date.getMonth() + 1) + "-" + twof(date.getDate());
}
function twof(x) {
  x = "" + x;
  return x.length < 2 ? "0" + x : x;
}
function placeButton() {
  const x = document.querySelector(".Page_Logo").nextElementSibling;
  x.innerHTML =
    x.innerHTML +
    "<button id='calendar' onclick='callExport()'> Export to my Google Calendar!</button><div>Semester start:<input type='date' id='startdate'></div><div>Semester end:<input type='date' id='enddate'></div>";
}
placeButton();
function callExport() {
  console.log("boop. export clicked");
  const scheds = harvestStudentSchedule();
  console.log("sched start times", scheds.map(s => s.starttime));
  const events = toEvents(scheds);
  console.log("events", events);
  console.log("events", JSON.stringify(events));
  //   console.log(scheds.map(s => s.startdate));
  //   console.log(events.map(e => e.start));
  const p = document.querySelector(".Page_Logo").nextElementSibling;
  exportToGoogle(events, function(event) {
    console.log("Events created for: " + event.htmlLink, event);

    const str = `<div id='${event.id}'> Events created for: <a href="${event.htmlLink}" target="_blank">${event.summary}</a><button onclick="deleteEvent('${event.id}',x=> document.getElementById('${event.id}').style.display='none')">delete event</button>`;
    p.innerHTML = p.innerHTML + str;
  });
}
function addCode() {
  const elem = document.createElement("script");
  let code = toEvents.toString() + "\n";
  code += toEvent.toString() + "\n";
  code += harvestStudentSchedule.toString() + "\n";
  code += callExport.toString() + "\n";
  code += parseDate.toString() + "\n";
  code += parseDateFromId.toString() + "\n";
  code += setInputDate.toString() + "\n";
  code += twof.toString() + "\n";

  elem.innerHTML = code;
  document.querySelector("body").append(elem);
}
addCode();
