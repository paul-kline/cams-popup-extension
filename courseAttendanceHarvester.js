//myt job is to harvest the course info!
//Someone visited a course page.

function getAttendanceElement() {
  return document.querySelector('[title="Attendance Entry"]');
}

function getClassName() {
  return document.querySelector(".course_management_coursename").innerText;
}
function reset() {
  chrome.storage.sync.clear();
}

async function storeInfo() {
  //   reset();
  const attendance_element = getAttendanceElement();
  const className = getClassName();
  //   console.log("fetching stored classes");
  chrome.storage.sync.get(null, function(currentStoredClasses) {
    console.log("current storage contents", currentStoredClasses);
  });
  //   console.log("Value currently is " + JSON.stringify(currentStoredClasses));
  //   console.log("stored classes", currentStoredClasses);
  const classs = {};
  classs.attendanceElement = attendance_element.outerHTML;
  classs.accessed = new Date();
  const toStore = {};
  toStore[className] = classs;
  chrome.storage.sync.set(toStore, function() {
    console.log("Value is set to ", toStore);
  });
  //   });
}

async function storeClasses(classes) {
  // chrome.storage.sync.set({key: value}, function() {
  //     console.log('Value is set to ' + value);
  //   });
  const result = await promify(chrome.storage.sync.set, { classes: classes });
  console.log("stored:", result);
  return result;
  //   chrome.storage.sync.get(["classes"], function(result) {
  //     console.log("Value currently is " + result.key);
  //   });
}
async function promify(func, arg) {
  return new Promise((resolve, reject) => {
    try {
      func(arg, result => {
        resolve(result);
      });
    } catch (e) {
      reject(e);
    }
  });
}

console.log("attempting harvest of attendance info");
storeInfo();
// var p = document.createElement("p");
// p.innerText = "eijfeifjefj";
// document.querySelector("#mainBody").appendChild(p);
