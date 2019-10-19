
function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
    vars[key] = value;
  });
  return vars;
}
function getKey() {
  return getUrlVars().ak;
}
console.log("in course harvest");
storeInfo();
async function storeInfo() {
  console.log("course harvesting...");
  //   reset();
  const classes = parseClasses();
  //   console.log("fetching stored classes");
  chrome.storage.sync.get("classes", function(storedClasses) {
    console.log("current storage contents", storedClasses);
  });
  //   console.log("Value currently is " + JSON.stringify(currentStoredClasses));
  //   console.log("stored classes", currentStoredClasses);

  chrome.storage.sync.set({ classes: classes }, function(result) {
    console.log("Value is set to ", result);
  });
  //   });
}

function parseClasses() {
  const classes = [];
  console.log(
    document
      .querySelector(".Page_Content")
      .querySelectorAll("a")
      .toString()
  );
  document
    .querySelector(".Page_Content")
    .querySelectorAll("a")
    .forEach(e => {
      console.log(e);
      console.log(e.outerHTML);
      classes.push({
        name: e.innerText,
        crs: e.outerHTML.toString().match(/SelectCourse\('(\d+)'\)/)[1]
      });
    });

  console.log("classes", classes);
  return classes;
}
