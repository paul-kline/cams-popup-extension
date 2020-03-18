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
};
let auto_in = true;
const butt = document.createElement("button");
try {
  butt.innerText = "Cancel Auto-login";
  butt.addEventListener("click", cancelAutoLogin, false);
  document.getElementsByClassName("yui-g")[0].append(butt);
} catch (e) {
  console.error("failed to add cancel button", e);
}
function cancelAutoLogin() {
  auto_in = false;
  console.log("auto-login cancelled");
  butt.innerText = "cancelled auto-login";
}
document.onkeypress = function(evt) {
  evt = evt || window.event;
  if (evt.keyCode == 27) {
    cancelAutoLogin();
  }
};
setTimeout(() => {
  auto_in && auto_login();
}, 1000);
// });
