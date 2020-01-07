/**
 * This file is to be added when the homepage loads. Currently, the only useful
 * thing it does is:
 * 1. add the attendance short links to the home page.
 */
//#############################################################################

/**
 * This function adds attendance links to the main page body IF
 * classes are found in chrome storage.
 */
function placeAttendanceButtons(): void {
  const page = document.querySelector("#mainBody");
  //fetch stored classes, if any, and perform modification.
  chrome.storage.sync.get("classes", async function(classes) {
    classes = classes.classes;
    console.log("classes:", classes);
    //sort so they will show up alphabetically
    classes.sort((a: any, b: any) => a.name.localeCompare(b.name));
    //create an html button for each class
    classes.forEach((c: any) => {
      c.elem = document.createElement("button");
      c.elem.innerHTML = c.name + " Attendance";
      c.elem.onclick = async () => {
        console.log(c.name + " clicked.");
        const r = await goToAttendance(c.crs);
        console.log("response:", r, await r.text());
      };
    });
    if (page) {
      classes.forEach((c: any) => {
        page.appendChild(c.elem);
      });
    } else {
      console.error(
        "page was null. cannot find an element from selector #mainBody. Not appending attendance classes."
      );
    }
  });
}
placeAttendanceButtons();

/**
 * Returns the post request result of navigating to the given course (id) AND
 * Side Effect: navigates to the attendance page of the given course.
 * @param crs the course ID to navigate to.
 */
async function goToAttendance(crs: string | number): Promise<Response> {
  //post url
  //https://portals.blackburn.edu/efaculty/SetcmSessionObjects.asp?ak=
  //form data needs 2 things:
  //crs: 31503
  // accessKey:
  const k = getKey();
  const r = await postData(
    "https://portals.blackburn.edu/efaculty/SetcmSessionObjects.asp?ak=" + k,
    {
      crs: crs,
      accessKey: k
    }
  );
  console.log("response", r);
  window.location.href =
    "https://portals.blackburn.edu/efaculty/cmFacultyAttendanceDateRange.asp?ak=" +
    k;
  return r;
}

/**
 * returns an object of key value pairs of the get params of the specified path.
 * @param path URL to harvest gat params from. Defaults to window.location.href
 */
function getUrlVars(
  path: string = window.location.href
): { [key: string]: string } {
  const vars: any = {};
  const parts = path.replace(
    /[?&]+([^=&]+)=([^&]*)/gi,
    (m: any, key: any, value: any) => {
      vars[key] = value;
      return "";
    }
  );
  return vars;
}

/**
 * returns the current session key WHILE ON HOMEPAGE.
 * This harvests the key by looking at the courselist link which has constructed
 * the session key into the get param of that link.
 */
function getKey(): string {
  // return getUrlVars().ak;
  //@ts-ignore
  return document.querySelector("#cmselectcrs").href.match(/ak=(.*)/)[1];
}
/**
 * turns a string of html into real HTML wrapped in a div
 * @param html the string of html to convert
 */
function toElement(html: string): HTMLDivElement {
  const placeholder = document.createElement("div");
  placeholder.innerHTML = html;
  return placeholder;
}

/**
 * Posts data in the stupid way cams likes.
 * @param url where to post
 * @param data and data to attach.
 */
async function postData(url: string = "", data: any = {}): Promise<Response> {
  // Default options are marked with *
  // var formData = new FormData();
  // for (const key in data) {
  //   if (data.hasOwnProperty(key)) {
  //     const val = data[key];
  //     formData.append(key, val);
  //   }
  // }
  const response = await fetch(url, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    // mode: "cors", // no-cors, *cors, same-origin
    // cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    // credentials: "same-origin", // include, *same-origin, omit
    headers: {
      // 'Content-Type': 'application/json'
      "Content-Type": "application/x-www-form-urlencoded"
    },
    redirect: "follow", // manual, *follow, error
    referrer: "no-referrer", // no-referrer, *client
    // body: formData // body data type must match "Content-Type" header
    body: paramEncode(data)
  });
  return response; // parses JSON response into native JavaScript objects
}

/**
 *umm... CAMS is so dumb, it expects the post body encoded like get params so..
  this is used to set body data in post request. 
 * @param obj parameters.
 */
function paramEncode(obj: any): string {
  let str = "";
  for (const key in obj) {
    str += key + "=" + obj[key] + "&";
  }
  str = str.slice(0, str.length - 1); //get rid of trailing "&"
  return str;
}
