var disablerFunction = function() {
  const realOpen = window.open;
  console.log("I'm running!");
  window.alert = function alert(msg) {
    console.log("Hidden Alert: " + msg);
  };
  window.confirm = function confirm(msg) {
    console.log("Hidden Confirm " + msg);
    return true; /*simulates user clicking yes*/
  };
  window.open = function open(...msg) {
    // const realOpen = realOpen1;
    const m = msg[0].match(/poptest/);
    if (m) {
      console.log("Chrome extension has disabled the ability to open new pages, sucka!", ...msg);
      return true; /*simulates user clicking yes*/
    } else {
      console.log("Allowing popup");
      realOpen(...msg);
    }
  };
};
var disablerCode = "(" + disablerFunction.toString() + ")();";
var disablerScriptElement = document.createElement("script");
disablerScriptElement.textContent = disablerCode;

(document.head || document.documentElement).appendChild(disablerScriptElement);
disablerScriptElement.parentNode.removeChild(disablerScriptElement);
