/**
 * This file simply adds the class name to the page title of any page within a course.
 * having multiple courses open at once is totally ambiguous.
 * Actually, even having 1 page open is confusing.
 */
function addCourseToTitle() {
  try {
    console.log("ammending title to class...");
    const elem: HTMLDivElement | null = document.querySelector(".course_management_coursename");
    if (elem) {
      const x = (elem.innerText.match(/\[(.+)\]/) || [, ""])[1];
      if (x) {
        document.title = "[" + x + "]" + document.title;
      }
    } else {
      console.error("Course name not used to ammend page title: no course element found to harvest name. ");
    }
  } catch (e) {
    console.log("ammend title to class failed: ", e);
  }
}
addCourseToTitle();
