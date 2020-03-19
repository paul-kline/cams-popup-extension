/// <reference path="./googleCalendarTools.ts" />

/**
 * Turns a parsed class into an array of google events.
 * @param classs
 */
function toEvents(classs: Course): GoogleEvent[] {
  const dayCode = {
    U: "SU",
    M: "MO",
    T: "TU",
    W: "WE",
    R: "TH",
    F: "FR",
    S: "SA"
  };
  const c = classs;
  const events = [];
  for (let i = 0; i < c.schedule.length; i++) {
    //@ts-ignore
    const event: GoogleEvent = {};
    const sched = c.schedule[i];
    event.summary = c.course + " " + sched.room;
    event.room = sched.room;
    event.classTitle = c.course;
    event.location = sched.building + ": " + sched.room;
    event.description = c.title;
    const start_dt = adjustDate(toDateTime(c.startdate, sched.starttime), sched.day);
    const end_dt = adjustDate(toDateTime(c.startdate, sched.endtime), sched.day);
    const timesuffix = "-0" + start_dt.getTimezoneOffset() / 60 + ":00";
    event.start = {
      dateTime: start_dt.toISOString(), //.replace(".000Z", "") + timesuffix,
      timeZone: "America/Chicago"
    };
    event.end = {
      dateTime: end_dt.toISOString(), //.replace(".000Z", "") + timesuffix,
      timeZone: "America/Chicago"
    };
    const until_dt = toDateTime(c.enddate, sched.endtime);
    event.recurrence = [
      `RRULE:FREQ=WEEKLY;UNTIL=${until_dt.toISOString().replace(/-|\.\d+|:/g, "")};WKST=SU;BYDAY=${sched.day
        .split("")
        //@ts-ignore
        .map(x => dayCode[x])}`
    ];
    // event.recurrence = `RRULE:FREQ=WEEKLY;UNTIL=${until_dt.toISOString().replace(/-|\.\d+|:/g, "")}`;
    event.attendees = [];
    event.reminders = {
      useDefault: true
    };

    events.push(event);
  }
  return events;
}
/**
 * Some events are actually duplicates of other events.
 * This is a consequence of having 'sections' in CAMS. For example, if a
 * class meets MWF at 10 and there are 2 lab sections, the lecture periods
 * are repeated. Therefore, it is benefitial to consolidate such repetitions
 * before exporting to google Calendar. This functions attempts smart
 * consoliation based on the starting times of these events.
 * @param events
 */
function mergeEvents(events: GoogleEvent[]): GoogleEvent[] {
  const result: GoogleEvent[] = [];
  events.forEach(event => {
    const match = result.find(
      r =>
        r.start.dateTime == event.start.dateTime &&
        r.end.dateTime == event.end.dateTime &&
        r.location == event.location &&
        r.room == event.room
    );
    if (match) {
      //merge
      console.log("match found!!!!!", match, event);
      const [, prefix1, suffix1]: any = match.classTitle.match(/([A-Za-z]+\d+)(\w+)/);
      const [, prefix2, suffix2]: any = event.classTitle.match(/([A-Za-z]+\d+)(\w+)/);
      if (!prefix1 == prefix2) {
        console.log(
          "CLASS MATCH ERROR: I thought these two classes were the same, but their prefixes didn't match:",
          match,
          event,
          prefix1,
          prefix2
        );
      } else {
        let suffix = suffix1.replace(/\//g, "") + suffix2;
        //event will not have /
        const containsLab = suffix.includes("LAB");
        const containsLec = suffix.includes("LEC");

        suffix = suffix
          .replace(/LAB|LEC/g, "")
          .split("")
          .sort()
          .toString()
          .replace(/,/g, "/");
        suffix = (containsLab ? "LAB" : "") + (containsLec ? "LEC" : "") + suffix;
        console.log("new title:", prefix1 + suffix);
        match.summary = prefix1 + suffix;
      }
    } else {
      // console.log("no match", result, event);
      result.push(event);
    }
  });
  return result;
}

/**
 * answers, 'should this row be skipped in regards to containing relevant schedule information?'
 * @param row the row in question
 */
function filterOut(row: HTMLTableRowElement): boolean {
  //right now, only check for innerText containing Waitlisted Students. Then it should be skipped!
  return row.innerText.includes("Waitlisted Students");
}
/**
 * [{"course":"CS210A","title":"ESSENTIALS OF COMPUTING","startdate":"8/21/2019","enddate":"12/14/2019","schedule":[{"building":"Hudson","room":"HU-106","day":"M","starttime":"03:00 PM","endtime":"03:50 PM"},{"building":"Hudson","room":"HU-206","day":"W","starttime":"10:00 AM","endtime":"10:50 AM"}]}
 * ]*/
interface Course {
  course: string;
  title: string;
  startdate: string;
  enddate: string;
  schedule: Schedule[];
}
interface Schedule {
  building: string;
  room: string;
  day: string;
  starttime: string;
  endtime: string;
}
/**
 * Parses the courses present on the page into json objects.
 */
function harvestSchedule(): Course[] {
  const result: Course[] = [];
  const rows0 = document.querySelectorAll("table[summary='Faculty Teaching Schedules'] > tbody > tr");
  const rows: HTMLTableRowElement[] = [];
  //remove waitlist rows.
  for (let i = 0; i < rows0.length; i++) {
    const r = rows0[i] as HTMLTableRowElement;
    if (!filterOut(r)) rows.push(r);
  }

  //@ts-ignore
  let curObj: Course = {};
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    // console.log("row is:", row);
    if (i % 2 == 0) {
      //title row, new curObj
      //@ts-ignore
      curObj = {};
      const childs = row.children;
      curObj.course = (childs[1] as HTMLTableDataCellElement).innerText.replace("LEC", "");
      curObj.title = (childs[2] as HTMLTableDataCellElement).innerText;
      curObj.startdate = (childs[3] as HTMLTableDataCellElement).innerText;
      curObj.enddate = (childs[4] as HTMLTableDataCellElement).innerText;
      //   console.log("curObj:", curObj);
    } else {
      //this is the schedule row
      //headers.
      //   const headers = row.querySelector("thead");
      const headers = ["building", "room", "day", "starttime", "endtime"];
      (curObj as Course).schedule = [] as Schedule[];
      const rowsched = row.querySelector("tbody")!.querySelectorAll(":scope tr");
      console.log("rowsched", rowsched);
      for (let i = 0; i < rowsched.length; i++) {
        const schedObj: any = {};
        const cells = rowsched[i].children;
        for (let j = 1; j < cells.length; j++) {
          //first one is empty.
          schedObj[headers[j - 1]] = (cells[j] as HTMLTableDataCellElement).innerText;
        }
        curObj.schedule.push(schedObj as Schedule);
      }
      //cur obj is now complete.
      result.push(curObj);
    }
  }
  return result;
}

/**
 * places the export to google calendar button on the page.
 * Button calls callExport when clicked.
 */
function placeButton() {
  //@ts-ignore
  const x: Element = document.querySelector(".Page_Logo").nextElementSibling;
  x.innerHTML =
    x.innerHTML +
    "<button style=\"background:yellow;\" id='calendar' onclick='callExport()'> Export to my Google Calendar!</button>";
}
placeButton();

/**
 * User wants to export their schedule to google calendar.
 * 1. harvest the schedule information.
 * 2. export to google calendar.
 */
function callExport() {
  console.log("boop. export clicked");
  const sched: Course[] = harvestSchedule();
  const events = mergeEvents(sched.flatMap(toEvents));
  console.log("schedule:", sched);
  console.log("events:", events);
  const p = document.getElementById("calendar")!.parentElement;
  exportToGoogle(events, function(event: any) {
    console.log("Events created for: " + event.htmlLink, event);
    const elem = document.createElement("div");
    elem.setAttribute("id", event.id);
    elem.style.backgroundColor = "yellow";
    elem.innerHTML =
      "Events created for: " +
      `<a href="${event.htmlLink}" target="_blank">${event.summary}</a><button style=\"background:yellow;\" onclick="deleteEvent('${event.id}',x=> document.getElementById('${event.id}').style.display='none')">delete event</button>`;
    p!.append(elem);
  });
}
function addCode() {
  const elem = document.createElement("script");
  let code = toEvents.toString() + "\n";
  code += callExport.toString() + "\n";
  code += harvestSchedule.toString() + "\n";
  code += mergeEvents.toString() + "\n";
  code += filterOut.toString() + "\n";
  elem.innerHTML = code;
  document.querySelector("body")!.append(elem);
}
addCode();
