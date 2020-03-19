console.log("ammend menu");
const innerTexts = ["Home", "Email Students", "My Schedule", "Course Offering"];
function ammend() {
  const navMenu = document.querySelector("#nav");
  if (navMenu) {
    const linkCollection = navMenu.querySelectorAll("li>a") as NodeList;
    for (let i = 0; i < linkCollection.length; i++) {
      const a = linkCollection[i] as HTMLAnchorElement;
      const txt = a.innerText.trim();
      if (innerTexts.includes(txt)) {
        console.log("found one:", txt);
        // (li as any).style.backgroundColor = "yellow";
        a.innerText += "*";
      }
    }
  }
}
ammend();
