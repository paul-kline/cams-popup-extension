console.log("0007");
// window.addEventListener("DOMContentLoaded", event => {
console.log("DOM fully loaded and parsed");

document.querySelector("#FERPA").checked = true;

const auto_login = () => {
  console.log("attempting login");
  let userLen = document.querySelector("#txtUsername").value.length;
  let pswLen = document.querySelector("#txtPassword").value.length;
  console.log("userlen", userLen);
  if ((userLen > 0 && pswLen > 0) || true) {
    console.log("attempting login click!");
    document.querySelector("#btnLogin").click();
  }

  // showWaitPanel();
  // submitForm(document.forms["frmLogin"], "ceProcess.asp", "login");
};
setTimeout(() => {
  auto_login();
}, 1000);
// });
