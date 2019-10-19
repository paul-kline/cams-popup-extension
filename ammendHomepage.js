const page = document.querySelector("#mainBody");
chrome.storage.sync.get("classes", async function(classes) {
  classes = classes.classes;
  console.log("classes:", classes);
  classes.sort((a, b) => a.name.localeCompare(b.name));
  classes.forEach(c => {
    c.elem = document.createElement("button");
    c.elem.innerHTML = c.name + " Attendance";
    c.elem.onclick = async () => {
      console.log(c.name + " clicked.");
      const r = await goToAttendance(c.crs);
      console.log("response:", r, await r.text());
    };
  });
  classes.forEach(c => {
    page.appendChild(c.elem);
  });
});
async function goToAttendance(crs) {
  //post url
  //https://portals.blackburn.edu/efaculty/SetcmSessionObjects.asp?ak=
  //form data needs 2 things:
  //crs: 31503
  // accessKey:
  const k = getKey();
  const r = await postData("https://portals.blackburn.edu/efaculty/SetcmSessionObjects.asp?ak=" + k, {
    crs: crs,
    accessKey: k
  });
  console.log("response", r);
  window.location.href = "https://portals.blackburn.edu/efaculty/cmFacultyAttendanceDateRange.asp?ak=" + k;
  return r;
}

//returns an object of key value pairs of the get params.
function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
    vars[key] = value;
  });
  return vars;
}
//returns the current session key WHILE ON HOMEPAGE.
//This harvests the key by looking at the courselist link which has constructed
//the session key into the get param of that link.
function getKey() {
  // return getUrlVars().ak;
  return document.querySelector("#cmselectcrs").href.match(/ak=(.*)/)[1];
}
//turns a string of html into real HTML
function toElement(html) {
  const placeholder = document.createElement("div");
  placeholder.innerHTML = html;
  return placeholder;
}

//Posts data in the stupid way cams likes.
async function postData(url = "", data = {}) {
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

//umm... CAMS is so dumb, it expects the post body encoded like get params so..
//this is used to set body data in post request.
function paramEncode(obj) {
  let str = "";
  for (const key in obj) {
    str += key + "=" + obj[key] + "&";
  }
  str = str.slice(0, str.length - 1); //get rid of trailing "&"
  return str;
}
