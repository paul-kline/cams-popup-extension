var disablerFunction = function() {
  const realOpen = window.open;
  function toaster(str) {
    var x = document.getElementById("snackbar");
    x.innerText = str;
    x.className = "show";
    setTimeout(function() {
      x.className = x.className.replace("show", "");
    }, 3000);
  }
  console.log("I'm running!");
  window.alert = function alert(msg) {
    if (msg.match(/^Popups are disabled/i)) {
      //eat it.
      console.log("Hidden Alert: " + msg);
    } else {
      console.log("toasting message:", msg);
      toaster(msg);
    }
  };
  window.confirm = function confirm(msg) {
    console.log("Hidden Confirm " + msg);
    toaster(msg);
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
snackbarHelper();
const disablerCode = "(" + disablerFunction.toString() + ")();";
const disablerScriptElement = document.createElement("script");
disablerScriptElement.textContent = disablerCode;

(document.head || document.documentElement).appendChild(disablerScriptElement);
disablerScriptElement.parentNode.removeChild(disablerScriptElement);

function snackbarHelper() {
  const snackbarStyle = document.createElement("style");
  snackbarStyle.textContent = `#snackbar {
    visibility: hidden;
    min-width: 250px;
    margin-left: -125px;
    background-color: #333;
    color: #fff;
    text-align: center;
    border-radius: 2px;
    padding: 16px;
    position: fixed;
    z-index: 1;
    left: 50%;
    bottom: 30px;
    font-size: 17px;
  }
  
  #snackbar.show {
    visibility: visible;
    -webkit-animation: fadein 0.5s, fadeout 0.5s 2.5s;
    animation: fadein 0.5s, fadeout 0.5s 2.5s;
  }
  
  @-webkit-keyframes fadein {
    from {bottom: 0; opacity: 0;} 
    to {bottom: 30px; opacity: 1;}
  }
  
  @keyframes fadein {
    from {bottom: 0; opacity: 0;}
    to {bottom: 30px; opacity: 1;}
  }
  
  @-webkit-keyframes fadeout {
    from {bottom: 30px; opacity: 1;} 
    to {bottom: 0; opacity: 0;}
  }
  
  @keyframes fadeout {
    from {bottom: 30px; opacity: 1;}
    to {bottom: 0; opacity: 0;}
  }`;
  const snackbar = document.createElement("div");
  snackbar.id = "snackbar";
  document.documentElement.appendChild(snackbarStyle);
  document.documentElement.appendChild(snackbar);
}
