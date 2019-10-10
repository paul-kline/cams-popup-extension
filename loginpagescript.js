console.log("0006");
//------------------------------------
var disablerFunction = function() {
  console.log("I'm running!");
  window.alert = function alert(msg) {
    console.log("Hidden Alert: " + msg);
  };
  window.confirm = function confirm(msg) {
    console.log("Hidden Confirm " + msg);
    return true; /*simulates user clicking yes*/
  };
  window.open = function open(...msg) {
    console.log("Chrome extension has disabled the ability to open new pages, sucka!", ...msg);
    return true; /*simulates user clicking yes*/
  };

  window.addEventListener("DOMContentLoaded", event => {
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
  });
};
var disablerCode = "(" + disablerFunction.toString() + ")();";
var disablerScriptElement = document.createElement("script");
disablerScriptElement.textContent = disablerCode;

(document.head || document.documentElement).appendChild(disablerScriptElement);
disablerScriptElement.parentNode.removeChild(disablerScriptElement);
