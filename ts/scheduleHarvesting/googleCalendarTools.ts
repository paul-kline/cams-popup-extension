interface GoogleEvent {
  summary: string;
  room: string;
  location: string;
  description: string;
  start: GDate;
  end: GDate;
  recurrence: string[];
  attendees?: any[];
  reminders?: any;
  //my additions:
  classTitle: string;
  start_dt?: string;
  end_dt?: string;
}
interface GDate {
  dateTime: string;
  timeZone: string;
}
/**
 *move the start date to the first day in list.
 * @param {Date} date the date to modify
 * @param {string} dayss A string like "MWF"
 */
function adjustDate(date: Date, dayss: string): Date {
  const daysLookup = ["U", "M", "T", "W", "R", "F", "S"];
  const days = dayss.split("");
  const daysAsNumbers = days.map((d) => daysLookup.indexOf(d));
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

  console.error("this should be impossible to reach. No future date was found in adjustDate", date, days);
  return date;
}
/**
 * @param datestr expected form m/d/yyyy
 * @param timestr expected form "03:00 PM"
 */
function toDateTime(datestr: string, timestr: string): Date {
  return setTime(toDate(datestr), timestr);
}
/**
 * @param {string} str expected form m/d/yyyy
 */
function toDate(str: string): Date {
  const [_, month, day, year]: any = str.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  const d = new Date();
  d.setFullYear(year);
  d.setDate(day);
  d.setMonth(month - 1);
  return d;
}
/**
 * @param {Date} date the date to modify
 * @param {string} timestr expected form "03:00 PM"
 */
function setTime(date: Date, timestr: string): Date {
  // "03:00 PM"
  // "12:30 PM"
  let [_, h, m]: any = timestr.match(/(\d+):(\d+)/);
  h = Number.parseInt(h, 10);
  m = Number.parseInt(m, 10);
  if (timestr.toLowerCase().endsWith("pm") && h < 12) {
    h += 12;
  }
  date.setHours(h);
  date.setMinutes(m);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
}
//@ts-ignore
function addCode() {
  const elem = document.createElement("script");
  let code = exportToGoogle.toString() + "\n";
  //   code += toEvents.toString() + "\n";
  code += toDateTime.toString() + "\n";
  code += toDate.toString() + "\n";
  code += setTime.toString() + "\n";
  //   code += harvestSchedule.toString() + "\n";
  code += adjustDate.toString() + "\n";
  //   code += mergeEvents.toString() + "\n";
  code += deleteEvent.toString() + "\n";

  elem.innerHTML = code;
  document.querySelector("body")!.append(elem);
  addGoogleCode();
}
addCode();

async function exportToGoogle(events: GoogleEvent[], callback: any) {
  console.log("boop. export clicked");
  //handleauth click lives on the window.
  //@ts-ignore
  const r = await handleAuthClick();
  console.log("result of handle authclient:", r);
  if (r.error) {
    console.log("abandon export:", r.error);
    return;
  }
  // const batch = gapi.client.newBatch();
  events.forEach((event) => {
    console.log("event submitting is: ", event);
    //@ts-ignore : calendar type isn't known?
    const request = gapi.client.calendar.events.insert({
      calendarId: "primary",
      resource: event,
    });

    request.execute(callback);

    // batch.add(request);
  });
  // batch.execute();
  // window.batch = batch;
  // console.log("batch:", batch);
}

function deleteEvent(eventId: any, callback: (x: any, y: any) => any) {
  var params = {
    calendarId: "primary",
    eventId: eventId,
  };

  //@ts-ignore
  const request = gapi.client.calendar.events.delete(params, function (err) {
    if (err) {
      console.log("The API returned an error: " + err);
      return;
    }
    console.log("Event deleted.");
    // callback("Event deleted: " + eventId);
  });
  request.execute((event: any) => {
    console.log(event, "deleted");
    if (callback) {
      callback(eventId, event);
    }
  });
}

function googleCode() {
  console.log("googleCode...");
  // Client ID and API key from the Developer Console
  //this key is managed by paul.kline@blackburn.edu
  (window as any).CLIENT_ID = "1034386305664-ml1uq0ncrujg5hfo0dqd0im49tun1h73.apps.googleusercontent.com";

  //pauliankline@gmail.com : "820527871859-o85ov91ar8rrnos73i6qslvjov5361j1.apps.googleusercontent.com";
  // const clientsecret = "fedE3mPOcBfcLJmWkU2d-F0l";
  //pauliankline@gmail.com managed key:
  // window.API_KEY = apikey = "AIzaSyD-K091cR8wf1wJYfxfGFgBdfaUwm_TEr4";
  //paul.kline@blackburn.edu managed key
  (window as any).API_KEY = "AIzaSyDQIAXi4vhBoqiKJ4Alc21LThU3J0hM0r0";

  // Array of API discovery doc URLs for APIs used by the quickstart
  (window as any).DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
  // Authorization scopes required by the API; multiple scopes can be
  // included, separated by spaces.
  (window as any).SCOPES = "https://www.googleapis.com/auth/calendar";

  //   var authorizeButton = document.getElementById('authorize_button');
  //   var signoutButton = document.getElementById('signout_button');
  /**
   *  On load, called to load the auth2 library and API client library.
   */
  function handleClientLoad() {
    console.log("handleClientLoad...");
    //@ts-ignore
    gapi.load("client:auth2", initClient);
  }
  (window as any).handleClientLoad = handleClientLoad;
  /**
   *  Initializes the API client library and sets up sign-in state
   *  listeners.
   */
  function initClient() {
    console.log("initClient...");
    //these are fine, they have placed on window object.
    //@ts-ignore
    gapi.client
      .init({
        //@ts-ignore
        apiKey: API_KEY,
        //@ts-ignore
        clientId: CLIENT_ID,
        //@ts-ignore
        discoveryDocs: DISCOVERY_DOCS,
        //@ts-ignore
        scope: SCOPES,
      })
      .then(
        function () {
          // Listen for sign-in state changes.
          //@ts-ignore
          gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

          // Handle the initial sign-in state.
          //@ts-ignore
          updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
          //   authorizeButton.onclick = handleAuthClick;
          //   signoutButton.onclick = handleSignoutClick;
        },
        //@ts-ignore
        function (error) {
          appendPre(JSON.stringify(error, null, 2));
        }
      );
  }
  (window as any).initClient = initClient;

  /**
   *  Called when the signed in status changes, to update the UI
   *  appropriately. After a sign-in, the API is called.
   */
  function updateSigninStatus(isSignedIn: boolean) {
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
  (window as any).updateSigninStatus = updateSigninStatus;
  /**
   *  Sign in the user upon button click.
   */
  async function handleAuthClick(
    event: any,
    f = () => {
      console.log("signed in");
    }
  ) {
    try {
      //@ts-ignore
      return await gapi.auth2.getAuthInstance().signIn(f as any);
    } catch (e) {
      console.log("failed to sign in:", e);
      return e;
    }
    console.log("booooooop signed in finished!");
  }
  //don't mind me.
  (window as any).handleAuthClick = handleAuthClick;

  /**
   *  Sign out the user upon button click.
   */
  function handleSignoutClick(event: any) {
    //@ts-ignore
    gapi.auth2.getAuthInstance().signOut();
  }
  (window as any).handleSignoutClick = handleSignoutClick;

  /**
   * Append a pre element to the body containing the given message
   * as its text node. Used to display the results of the API call.
   *
   * @param {string} message Text to be placed in pre element.
   */
  function appendPre(message: string) {
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
    //@ts-ignore
    gapi.client.calendar.events
      .list({
        calendarId: "primary",
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 10,
        orderBy: "startTime",
      })
      .then((response: any) => {
        const events = response.result.items;
        appendPre("Upcoming events:");

        if (events && events.length > 0) {
          for (let i = 0; i < events.length; i++) {
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
/**
 * brings in that sweet, juicy google calendar code
 * into our universe. that code is stored in @googleCode
 */
function addGoogleCode() {
  const googStarter = mkGscriptElem();
  const body = document.querySelector("body");
  //come on, this def exists.
  body!.append(googStarter);
  const elem = document.createElement("script");
  let content = googleCode.toString() + "; googleCode()";
  elem.innerHTML = content;
  body!.append(elem);
}

/**
 * creates the element to load in g cal.
 */
function mkGscriptElem(): HTMLScriptElement {
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
