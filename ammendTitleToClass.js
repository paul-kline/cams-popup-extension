try {
  console.log("ammending title to class...");
  const x = document.querySelector(".course_management_coursename").innerText.match(/\[(.+)\]/)[1];
  if (x) {
    document.title = document.title + " [" + x + "]";
  }
} catch (e) {
  console.log("ammend title to class failed: ", e);
}
