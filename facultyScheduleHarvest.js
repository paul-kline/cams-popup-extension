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
function adjustDate(date, days) {
  //date: Date
  //days : "MWF", etc.
  //move the start date to the first day in list.
  const daysLookup = ["U", "M", "T", "W", "R", "F", "S"];
  days = days.split("");
  const daysAsNumbers = days.map(d => daysLookup.indexOf(d));
  if (daysAsNumbers.includes(date.getDay())) {
    return date;
  } else {
    for (let i = 0; i < 7; i++) {
      date.setDate(date.getDate() + 1);
      if (daysAsNumbers.includes(date.getDay())) {
        return date;
      }
    }
  }
  console.log("this should be impossible to reach. No future date was found in adjustDate", date, days);
}
function toDateTime(datestr, timestr) {
  return setTime(toDate(datestr), timestr);
}
function toDate(str) {
  const [_, month, day, year] = str.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  const d = new Date();
  d.setFullYear(year);
  d.setDate(day);
  d.setMonth(month - 1);
  return d;
}
function setTime(date, timestr) {
  // "03:00 PM"
  let [_, h, m] = timestr.match(/(\d+):(\d+)/);
  h = Number.parseInt(h);
  m = Number.parseInt(m);
  if (timestr.toLowerCase().endsWith("pm")) {
    h += 12;
  }
  date.setHours(h);
  date.setMinutes(m);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
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
  x.innerHTML =
    x.innerHTML + "<button id='calendar' onclick='exportToGoogle()'> Export to my Google Calendar!</button>";
}
placeButton();
function addCode() {
  const elem = document.createElement("script");
  let code = exportToGoogle.toString() + "\n";
  code += toEvents.toString() + "\n";
  code += toDateTime.toString() + "\n";
  code += toDate.toString() + "\n";
  code += setTime.toString() + "\n";
  code += harvestSchedule.toString() + "\n";
  code += adjustDate.toString() + "\n";
  code += mergeEvents.toString() + "\n";
  code += deleteEvent.toString() + "\n";

  elem.innerHTML = code;
  document.querySelector("body").append(elem);
  addGoogleCode();
}
addCode();
async function exportToGoogle() {
  console.log("boop. export clicked");
  const sched = harvestSchedule();
  const events = mergeEvents(sched.flatMap(toEvents));
  console.log("schedule:", sched);
  console.log("events:", events);
  await handleAuthClick();
  // const batch = gapi.client.newBatch();
  events.forEach(event => {
    console.log("event submitting is: ", event);
    const request = gapi.client.calendar.events.insert({
      calendarId: "primary",
      resource: event
    });
    const p = document.getElementById("calendar").parentElement;
    const eventIDs = [];
    request.execute(function(event) {
      console.log("Events created for: " + event.htmlLink, event);
      const elem = document.createElement("div");
      elem.setAttribute("id", event.id);
      elem.innerHTML =
        "Events created for: " +
        `<a href="${event.htmlLink}" target="_blank">${event.summary}</a><button onclick="deleteEvent('${event.id}')">delete event</button>`;
      p.append(elem);
      eventIDs.push(event.id);
    });

    // batch.add(request);
  });
  // batch.execute();
  // window.batch = batch;
  // console.log("batch:", batch);
}

// <!--Add buttons to initiate auth sequence and sign out-->
// <button id="authorize_button" style="display: none;">Authorize</button>
// <button id="signout_button" style="display: none;">Sign Out</button>

function deleteEvent(eventId, callback) {
  var params = {
    calendarId: "primary",
    eventId: eventId
  };

  const request = gapi.client.calendar.events.delete(params, function(err) {
    if (err) {
      console.log("The API returned an error: " + err);
      return;
    }
    console.log("Event deleted.");
    callback("Event deleted: " + eventId);
  });
  request.execute(event => {
    console.log(event, "deleted");
    document.getElementById(eventId).style.display = "none";
  });
}
function googleCode() {
  console.log("googleCode...");
  // Client ID and API key from the Developer Console
  window.CLIENT_ID = "820527871859-o85ov91ar8rrnos73i6qslvjov5361j1.apps.googleusercontent.com";
  const clientsecret = "fedE3mPOcBfcLJmWkU2d-F0l";
  window.API_KEY = apikey = "AIzaSyD-K091cR8wf1wJYfxfGFgBdfaUwm_TEr4";
  // Array of API discovery doc URLs for APIs used by the quickstart
  window.DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
  // Authorization scopes required by the API; multiple scopes can be
  // included, separated by spaces.
  window.SCOPES = "https://www.googleapis.com/auth/calendar";

  //   var authorizeButton = document.getElementById('authorize_button');
  //   var signoutButton = document.getElementById('signout_button');
  /**
   *  On load, called to load the auth2 library and API client library.
   */
  function handleClientLoad() {
    console.log("handleClientLoad...");
    gapi.load("client:auth2", initClient);
  }
  window.handleClientLoad = handleClientLoad;
  /**
   *  Initializes the API client library and sets up sign-in state
   *  listeners.
   */
  function initClient() {
    console.log("initClient...");
    gapi.client
      .init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
      })
      .then(
        function() {
          // Listen for sign-in state changes.
          gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

          // Handle the initial sign-in state.
          updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
          //   authorizeButton.onclick = handleAuthClick;
          //   signoutButton.onclick = handleSignoutClick;
        },
        function(error) {
          appendPre(JSON.stringify(error, null, 2));
        }
      );
  }
  window.initClient = initClient;

  /**
   *  Called when the signed in status changes, to update the UI
   *  appropriately. After a sign-in, the API is called.
   */
  function updateSigninStatus(isSignedIn) {
    console.log("signed in!!!!", isSignedIn);
    // if (isSignedIn) {
    //   authorizeButton.style.display = 'none';
    //   signoutButton.style.display = 'block';
    //   listUpcomingEvents();
    // } else {
    //   authorizeButton.style.display = 'block';
    //   signoutButton.style.display = 'none';
    // }
  }
  window.updateSigninStatus = updateSigninStatus;
  /**
   *  Sign in the user upon button click.
   */
  async function handleAuthClick(
    event,
    f = () => {
      console.log("signed in");
    }
  ) {
    try {
      await gapi.auth2.getAuthInstance().signIn(f);
    } catch (e) {
      console.log("failed to sign in:", e);
    }
    console.log("booooooop signed in finished!");
  }
  window.handleAuthClick = handleAuthClick;

  /**
   *  Sign out the user upon button click.
   */
  function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
  }
  window.handleSignoutClick = handleSignoutClick;

  /**
   * Append a pre element to the body containing the given message
   * as its text node. Used to display the results of the API call.
   *
   * @param {string} message Text to be placed in pre element.
   */
  function appendPre(message) {
    // var pre = document.getElementById("content");
    // var textContent = document.createTextNode(message + "\n");
    // pre.appendChild(textContent);
    alert(message);
    console.log("from pre:", message);
  }

  /**
   * Print the summary and start datetime/date of the next ten events in
   * the authorized user's calendar. If no events are found an
   * appropriate message is printed.
   */
  function listUpcomingEvents() {
    gapi.client.calendar.events
      .list({
        calendarId: "primary",
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 10,
        orderBy: "startTime"
      })
      .then(function(response) {
        var events = response.result.items;
        appendPre("Upcoming events:");

        if (events.length > 0) {
          for (i = 0; i < events.length; i++) {
            var event = events[i];
            var when = event.start.dateTime;
            if (!when) {
              when = event.start.date;
            }
            appendPre(event.summary + " (" + when + ")");
          }
        } else {
          appendPre("No upcoming events found.");
        }
      });
  }
}
function addGoogleCode() {
  const googStarter = mkGscriptElem();
  const body = document.querySelector("body");
  body.append(googStarter);
  const elem = document.createElement("script");
  let content = googleCode.toString() + "; googleCode()";
  elem.innerHTML = content;
  body.append(elem);
}
function mkGscriptElem() {
  const elem = document.createElement("script");
  elem.setAttribute("async", "");
  elem.setAttribute("defer", "");
  //   elem.async = true;
  //   elem.defer = true;
  elem.src = "https://apis.google.com/js/api.js";
  elem.setAttribute("onload", "this.onload=function(){};handleClientLoad()");
  //   elem.onload = "this.onload=function(){};handleClientLoad()";
  elem.setAttribute("onreadystatechange", "if (this.readyState === 'complete') this.onload()");
  // elem.onreadystatechange = "if (this.readyState === 'complete') this.onload()";

  return elem;
}
