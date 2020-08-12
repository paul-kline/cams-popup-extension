/**
 * Meant to be applied to: cmFacultyAttendanceDateRange page.
 * Auto sets the "Schedule" field on the attendance page since it
 * ANNOYING is not set by default.
 */

//globally useful constants. note this page modification can be made
//within the sandbox of chrome extension js files so no
//namespace contamination occurs.
const id = "srofferSchedule";
const days = ["U", "M", "T", "W", "R", "F", "S"];
function setSchedule(): void {
  const selector: HTMLSelectElement | null = document.querySelector("#" + id);
  if (selector) {
    selector.style.backgroundColor = "yellow";
    const options = selector.options;
    // console.log(options);
    //set to today or most recent. takes advantage of short circuiting.
    setSelector(selector, todayOption(options) || mostRecentDayOption(options) || "");
  }
}
setSchedule();
/**
 * Handles the logic for if an option matches the requirements.
 * Currently, checks that the second word matches searchText extactly
 * @param option
 * @param searchText
 */
function optionIsMatch(option: HTMLOptionElement, searchText: string): boolean {
  if (!(option as any).days) {
    (option as any).days = option.innerText.split(" ", 1)[0];
  }
  return (option as any).days.includes(searchText);
}
/**
 * Finds the option which corresponds to today or null otherwise.
 * @param selector the selector html element
 * @param today the day as a letter code 'U', 'M', etc.
 */
function todayOption(options: HTMLOptionsCollection, today: string = days[new Date().getDay()]): string | null {
  //TODO: does not account for multiple occuring in same day: i.e. lab and lecture.
  for (let i = 0; i < options.length; i++) {
    //any type because gunna add prop.
    let option = options[i];

    if (optionIsMatch(option, today)) {
      console.log("setting to today!!!!");
      return option.value;
      //   wasSet = true;
      //   setTimeout(() => {
      //     selector.value = option.value;
      //   }, 10);
      // }
      // option.day = option.innerText[0];
      // console.log(option.innerText);
      // console.log(option.value);
      // console.log(option.day);
    }
    // console.log("selector.value", selector.value);
    // console.log(selector);
  }
  return null;
}
/**
 * returns the most recent day or null otherwise.
 * @param options
 */
function mostRecentDayOption(options: HTMLOptionsCollection): string | null {
  console.log("no entry day, trying to find closest in past.");
  //if still not set, find closest in past.
  const TODAYDATE = new Date();
  const today: string = days[TODAYDATE.getDay()];
  let i = days.indexOf(today);
  let count = 0;
  let dayLetter;
  while (count < 7) {
    i--;
    dayLetter = days[(i + 7) % 7];
    const r = todayOption(options, dayLetter);
    if (r) {
      //we found it, but we also have to set the date now.
      //reuse todaydate since we're done with it.
      TODAYDATE.setDate(TODAYDATE.getDate() - (count + 1));
      setTimeout(() => {
        const e = document.querySelector("#datefrom");
        if (e) {
          //@ts-ignore
          e.style.backgroundColor = "yellow";
          setSelector(e as HTMLSelectElement, TODAYDATE.toLocaleDateString());
        }
      }, 10);
      return r;
    }
    count++;
  }
  return null;
}

/**
 * sets a selector using a settimeout because that helps for some reason.
 * @param selector
 * @param optionValue
 */
function setSelector(selector: HTMLSelectElement, optionValue: string) {
  setTimeout(() => {
    selector.value = optionValue;
  }, 10);
}
