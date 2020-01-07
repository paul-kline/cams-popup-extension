/**
 * Harvest information and store in chrome storage for attendance links.
 * Apply to ceCourseList page
 */
//###############################################################################

/**
 * get params as object.
 */
function getUrlVars(): { [key: string]: string } {
  const vars: { [key: string]: string } = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(
    m,
    key,
    value
  ) {
    vars[key] = value;
    return "";
  });
  return vars;
}

/**
 * get the session key from get params.
 */
function getKey(): string {
  return getUrlVars().ak;
}
console.log("in course harvest");

storeInfo();
async function storeInfo() {
  console.log("course harvesting...");
  //   reset();
  const classes = parseClasses();
  chrome.storage.sync.get("classes", function(storedClasses) {
    console.log("current storage contents", storedClasses);
  });
  //   console.log("Value currently is " + JSON.stringify(currentStoredClasses));
  //   console.log("stored classes", currentStoredClasses);

  //@ts-ignore : complains about callback type, idk
  chrome.storage.sync.set({ classes: classes }, function(result: any) {
    console.log("Value is set to ", result);
  });
}

interface Crs {
  name: string;
  crs: string;
}

/**
 * parses the Crs objects out of the page.
 */
function parseClasses(): Crs[] {
  const classes: Crs[] = [];
  console.log(
    //@ts-ignore
    document
      .querySelector(".Page_Content")
      .querySelectorAll("a")
      .toString()
  );
  //@ts-ignore
  document
    .querySelector(".Page_Content")
    .querySelectorAll("a")
    .forEach(e => {
      console.log(e);
      console.log(e.outerHTML);
      classes.push({
        name: e.innerText.trim(),
        //@ts-ignore
        crs: e.outerHTML.toString().match(/SelectCourse\('(\d+)'\)/)[1]
      });
    });

  console.log("classes", classes);
  return classes;
}
