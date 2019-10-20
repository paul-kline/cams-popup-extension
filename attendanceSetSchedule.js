const id = "srofferSchedule";
const days = ["U", "M", "T", "W", "R", "F", "S"];

const selector = document.querySelector("#" + id);
const options = selector.options;

console.log(options);
console.log("aeifjeifjeifjeifjeifj");
let wasSet = false;
function setScheduleToday() {
  const TODAYDATE = new Date();
  const today = days[TODAYDATE.getDay()];
  for (let i = 0; i < options.length; i++) {
    const option = options[i];
    const innerT = option.innerText;
    option.days = innerT.split(" ", 1)[0];
    if (option.days.includes(today)) {
      console.log("setting to today!!!!");
      wasSet = true;
      setTimeout(() => {
        selector.value = option.value;
      }, 10);
    }
    option.day = option.innerText[0];
    console.log(option.innerText);
    console.log(option.value);
    console.log(option.day);
  }
  console.log("selector.value", selector.value);
  console.log(selector);
  if (!wasSet) {
    console.log("no entry day, trying to find closest in past.");
    //if still not set, find closest in past.
    let i = days.indexOf(today);
    let count = 0;
    let dayLetter;
    while (count < 7) {
      i--;
      dayLetter = days[(i + 7) % 7];
      console.log("looking for entry of day:", dayLetter);
      for (let j = 0; j < options.length; j++) {
        const op = options[j];
        const v = op.value;
        if (op.days.includes(dayLetter)) {
          //how many days ago?
          TODAYDATE.setDate(TODAYDATE.getDate() - (count + 1));
          setTimeout(() => {
            document.querySelector("#datefrom").value = TODAYDATE.toLocaleDateString();
            selector.value = v;
          }, 10);

          console.log("found it! setting to", dayLetter);
          count = 7; //escape!
          break;
        } else {
        }
      }
      count++;
    }
  }
}

setScheduleToday();
console.log("done2");
