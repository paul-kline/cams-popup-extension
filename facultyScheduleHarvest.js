function toEvents(classs) {
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
    const event = {};
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
function mergeEvents(events) {
  const result = [];
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
      const [, prefix1, suffix1] = match.classTitle.match(/([A-Za-z]+\d+)(\w+)/);
      const [, prefix2, suffix2] = event.classTitle.match(/([A-Za-z]+\d+)(\w+)/);
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
        suffix = suffix
          .split("")
          .sort()
          .toString()
          .replace(/,/g, "/");
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
 * [{"course":"CS210A","title":"ESSENTIALS OF COMPUTING","startdate":"8/21/2019","enddate":"12/14/2019","schedule":[{"building":"Hudson","room":"HU-106","day":"M","starttime":"03:00 PM","endtime":"03:50 PM"},{"building":"Hudson","room":"HU-206","day":"W","starttime":"10:00 AM","endtime":"10:50 AM"}]}
 * ]*/
function harvestSchedule() {
  const result = [];
  const rows = document.querySelectorAll("table[summary='Faculty Teaching Schedules'] > tbody > tr");
  //   console.log("rows are", rows);
  let curObj = {};
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    // console.log("row is:", row);
    if (i % 2 == 0) {
      //title row, new curObj
      curObj = {};
      const childs = row.children;
      curObj.course = childs[1].innerText.replace("LEC", "");
      curObj.title = childs[2].innerText;
      curObj.startdate = childs[3].innerText;
      curObj.enddate = childs[4].innerText;
      //   console.log("curObj:", curObj);
    } else {
      //this is the schedule row
      //headers.
      //   const headers = row.querySelector("thead");
      headers = ["building", "room", "day", "starttime", "endtime"];
      curObj.schedule = [];
      const rowsched = row.querySelector("tbody").querySelectorAll(":scope tr");
      console.log("rowsched", rowsched);
      for (let i = 0; i < rowsched.length; i++) {
        const schedObj = {};
        const cells = rowsched[i].children;
        for (let j = 1; j < cells.length; j++) {
          //first one is empty.
          schedObj[headers[j - 1]] = cells[j].innerText;
        }
        curObj.schedule.push(schedObj);
      }
      //cur obj is now complete.
      result.push(curObj);
    }
  }
  return result;
}
function placeButton() {
  const x = document.querySelector(".Page_Logo").nextElementSibling;
  x.innerHTML = x.innerHTML + "<button id='calendar' onclick='callExport()'> Export to my Google Calendar!</button>";
}
placeButton();
function callExport() {
  console.log("boop. export clicked");
  const sched = harvestSchedule();
  const events = mergeEvents(sched.flatMap(toEvents));
  console.log("schedule:", sched);
  console.log("events:", events);
  const p = document.getElementById("calendar").parentElement;
  exportToGoogle(events, function(event) {
    console.log("Events created for: " + event.htmlLink, event);
    const elem = document.createElement("div");
    elem.setAttribute("id", event.id);
    elem.innerHTML =
      "Events created for: " +
      `<a href="${event.htmlLink}" target="_blank">${event.summary}</a><button onclick="deleteEvent('${event.id}',x=> document.getElementById('${event.id}').style.display='none')">delete event</button>`;
    p.append(elem);
  });
}
function addCode() {
  const elem = document.createElement("script");
  code = toEvents.toString() + "\n";
  code += callExport.toString() + "\n";
  code += harvestSchedule.toString() + "\n";
  code += mergeEvents.toString() + "\n";

  elem.innerHTML = code;
  document.querySelector("body").append(elem);
}
addCode();
