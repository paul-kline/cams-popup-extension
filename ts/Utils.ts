console.log("utils loaded");

try {
  //@ts-ignore
  var sout = console.log;
} catch (e) {
  console.log("sout already defined");
}
//@ts-ignore
function toArr<T extends Node>(ls: NodeListOf<T>): T[] {
  const ans = [];
  for (let i = 0; i < ls.length; i++) {
    ans.push(ls[i]);
  }
  return ans;
}
/**
 * get the session key from get params.
 */
//@ts-ignore
function getKey(): string {
  return getUrlVars().ak;
}
/**
 * get params as object.
 */
//@ts-ignore
function getUrlVars(): { [key: string]: string } {
  const vars: { [key: string]: string } = {};
  var parts = window.location.href.replace(
    /[?&]+([^=&]+)=([^&]*)/gi,
    function (m, key, value) {
      vars[key] = value;
      return "";
    }
  );
  return vars;
}

/**
 * sends the content of the given form to the url specified.
 * @param formname the name of filled out form to submit.
 * @returns text representing the webpage result.
 */
async function submitForm(formname: string, url: string): Promise<string> {
  const data = new URLSearchParams();
  const formElement: HTMLFormElement = (document.forms as any)[formname] as any;
  //@ts-ignore
  for (const pair of new FormData(formElement)) {
    //@ts-ignore
    data.append(pair[0], pair[1]);
  }

  return fetch(url, {
    method: "post",
    body: data,
  })
    .then((x) => {
      // console.log("RESULT OF FETCH POST:", x);
      return x.text();
    })
    .then((x) => {
      //   console.log(x);
      return x;
    });
}
