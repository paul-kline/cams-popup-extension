//The purpose is to quickly check fo remote learners relevant to your courses.

console.log("remote learners check ");

/**
 * Add special check button.
 */
function placeFA20CheckButton(): void {
  const page = document.querySelector("#mainBody");
  const butt = document.createElement("button");
  butt.style.background = "yellow";
  butt.style.margin = "40px 0 0 0";
  butt.innerHTML = "FA 2020 Check status of remote students";
  butt.onclick = async () => {
    console.log("fa button clicked.");
    //@ts-ignore
    checkStudents();
  };
  if (page) {
    page.appendChild(butt);
  }
}

async function checkStudents() {
  const url =
    "https://script.google.com/a/blackburn.edu/macros/s/AKfycbzKDxMMxa_wJX0d6qX55WW0v952joXhyuHoHWyyUjGlVmt4vg6a/exec";
  //https://script.google.com/macros/s/AKfycbzKDxMMxa_wJX0d6qX55WW0v952joXhyuHoHWyyUjGlVmt4vg6a/exec
  const response = await fetch(url, { redirect: "follow" });

  if (response.redirected && response.url) {
    const resp2 = await fetch(response.url);
    const data2 = await resp2.json();
    console.log("data2", data2);
  } else {
    console.log("response", response);
    const data = await response.json();
    console.log("data is", data);
  }
}

function mainRemoteLearnerCheck() {
  setTimeout(placeFA20CheckButton, 200);
}

function addCode2() {
  const elem = document.createElement("script");
  let code = checkStudents.toString() + "\n";
  code += placeFA20CheckButton.toString() + "\n";
  code += mainRemoteLearnerCheck.toString() + "\n";
  code += "mainRemoteLearnerCheck();";
  elem.innerHTML = code;
  document.querySelector("body")!.append(elem);
}
addCode2();
