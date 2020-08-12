interface StudentCourse {
  startdate: Date;
  enddate: Date | undefined;
  course: string;
  title: string;
  instructor: string;
  room: string;
  day: string;
  time: string;
  starttime: string;
  endtime: string;
}
//@ts-ignore
function toEvent(c: StudentCourse): GoogleEvent {
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
    S: "SA",
  };
  //@ts-ignore
  const event: GoogleEvent = {};
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
        //@ts-ignore
        .map((x) => dayCode[x])}`,
    ];
  } else {
    event.recurrence = [
      //@ts-ignore
      `RRULE:FREQ=WEEKLY;WKST=SU;BYDAY=${c.day.split("").map((x) => dayCode[x])}`,
    ];
  }

  // event.recurrence = `RRULE:FREQ=WEEKLY;UNTIL=${until_dt.toISOString().replace(/-|\.\d+|:/g, "")}`;
  event.attendees = [];
  event.reminders = {
    useDefault: true,
  };
  return event;
}
//@ts-ignore
function toEvents(classes: StudentCourse[]) {
  return classes.map(toEvent);
}

/**
 * Used to parse the start and end dates entered in to the text boxes
 * since student schedule page does not show them!
 * @param str expected form: yyyy-mm-dd
 */
//@ts-ignore
function parseDate(str: string): Date {
  //yyyy-mm-dd
  const d = new Date();
  d.setMilliseconds(59);
  d.setMinutes(59);
  d.setHours(23);
  // console.log("str, str.split('-')", str, str.split("-"));
  const [year, month, day]: any = str.split("-").map((x) => Number.parseInt(x, 10));
  // console.log("year, month, day", year, month, day);
  d.setFullYear(year);
  d.setMonth(month - 1);
  d.setDate(day);
  return d;
}
//@ts-ignore
function parseDateFromId(id: string) {
  const e = document.getElementById(id) as HTMLInputElement;
  if (e) {
    return parseDate(e.value);
  }
}
/**
 * creates the array of objects from the webpage.
 */
//@ts-ignore
function harvestStudentSchedule(): StudentCourse[] {
  const e = document.getElementById("startdate") as HTMLInputElement;
  const startDate = e && e.value ? parseDate(e.value) : new Date();
  const e2 = document.getElementById("enddate") as HTMLInputElement;
  const endDate = e2 && e2.value ? parseDate(e2.value) : undefined;
  console.log("enddate", endDate);
  const rows: NodeListOf<HTMLTableRowElement> = document.querySelectorAll(
    "table[summary='Course Schedule'] > tbody > tr"
  );
  const result: StudentCourse[] = [];
  //order of info:
  //Dept	CrsID	Type	Section	CourseName	Instructor	Days	Room	Time	Date	Credits
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const cells: any = row.children;
    ///@ts-ignore
    const aclass: StudentCourse = {};
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
//@ts-ignore
function setInputDate(input: HTMLInputElement, date: Date) {
  input.value = date.getFullYear() + "-" + twof(date.getMonth() + 1) + "-" + twof(date.getDate());
}
/**
 * Ensure length >=2
 * @param x
 */
//@ts-ignore
function twof(x: string | number): string {
  x = "" + x;
  return x.length < 2 ? "0" + x : x;
}
//@ts-ignore
function placeButton() {
  const x = document.querySelector(".Page_Logo")!.nextElementSibling as HTMLDivElement;
  if (!x) {
    console.error("cannot place button. nextelement sibling of .Page_Logo not found");
  }
  x.innerHTML =
    x.innerHTML +
    "<button style=\"background:yellow;\" id='calendar' onclick='callExport()'> Export to my Google Calendar!</button><div>Semester start:<input type='date' id='startdate'></div><div>Semester end:<input type='date' id='enddate'></div>";
}
placeButton();
//@ts-ignore
function callExport() {
  console.log("boop. export clicked");
  const scheds: StudentCourse[] = harvestStudentSchedule();
  console.log(
    "sched start times",
    scheds.map((s) => s.starttime)
  );
  const events = toEvents(scheds);
  console.log("events", events);
  console.log("events", JSON.stringify(events));
  //   console.log(scheds.map(s => s.startdate));
  //   console.log(events.map(e => e.start));
  const p = document.querySelector(".Page_Logo")!.nextElementSibling;
  exportToGoogle(events, function (event: any) {
    console.log("Events created for: " + event.htmlLink, event);
    const elem = document.createElement("div");

    elem.setAttribute("id", event.id);
    const str = `Events created for: <a href="${event.htmlLink}" target="_blank">${event.summary}</a><button style=\"background:yellow;\" onclick="deleteEvent('${event.id}',x=> document.getElementById('${event.id}').style.display='none')">delete event</button>`;
    elem.innerHTML = str;
    p!.append(elem);
  });
}
//@ts-ignore
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
  document.querySelector("body")!.append(elem);
}
addCode();
