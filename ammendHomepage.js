const page = document.querySelector("#mainBody");
chrome.storage.sync.get(null, function(classes) {
  let arr = [];
  for (let prop in classes) {
    const c = classes[prop];
    console.log(prop, c);
    c.name = prop;

    const elem = toElement(c.attendanceElement);
    c.elem = elem;
    elem.innerHTML = prop + ": " + elem.innerHTML;
    arr.push(c);
  }
  arr = arr.sort((a, b) => a.name.match(/\[.*?\]/)[0].localeCompare(b.name.match(/\[.*?\]/)[0]));
  console.log("sorted", arr.map(e => e.name));
  arr.forEach(c => {
    page.appendChild(c.elem);
  });
});

function toElement(html) {
  const placeholder = document.createElement("div");
  placeholder.innerHTML = html;
  return placeholder;
}
