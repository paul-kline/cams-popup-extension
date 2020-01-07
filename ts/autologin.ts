console.log("0007");
// window.addEventListener("DOMContentLoaded", event => {
console.log("DOM fully loaded and parsed");
//try catch: could be student login page..
try {
  (document.querySelector("#FERPA") as HTMLInputElement).checked = true;
} catch (e) {
  console.log("ferpa checkbox checking failed:", e);
}

const auto_login = () => {
  console.log("attempting login");
  let userLen = (document.querySelector("#txtUsername") as HTMLInputElement)
    .value.length;
  let pswLen = (document.querySelector("#txtPassword")! as HTMLInputElement)
    .value.length;
  console.log("userlen", userLen);
  if ((userLen > 0 && pswLen > 0) || true) {
    console.log("attempting login click!");
    (document.querySelector("#btnLogin") as HTMLButtonElement).click();
  }

  // showWaitPanel();
  // submitForm(document.forms["frmLogin"], "ceProcess.asp", "login");
};
setTimeout(() => {
  auto_login();
}, 1000);
// });
