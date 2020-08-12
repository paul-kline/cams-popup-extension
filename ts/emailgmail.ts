const sout = console.log;
sout("email gmail workin22");

//prevent default behavior
function overrideSelectionChange() {
  (document.querySelector("select") as HTMLSelectElement).onchange = (ev: Event) => {
    console.log("I win!!! selection change overridden", ev);
    const option = (ev.target as HTMLSelectElement).selectedOptions[0];
    if (option.text.match(/gmail/i)) {
      console.log("I'll handle this one", option);
      //@ts-ignore
      document.getElementById("EMailSubmit").disabled = true;
      ev.preventDefault();
      const classVals = JSON.parse(option.value) as string[];
      document.body.style.cursor = "wait";
      (document.getElementById("gmail") as HTMLButtonElement).disabled = true;
      Promise.all(
        classVals.map((v) => {
          return formSubmit(v);
        })
      )
        .then((htmls) => {
          const allEmails: string[] = [];
          //@ts-ignore
          const superTable: HTMLTableElement = htmls[0].querySelector("table") as HTMLTableElement;
          const isPresent = (row: HTMLTableRowElement) => {
            const existingRows = superTable.querySelectorAll("tr");
            for (let i = 0; i < existingRows.length; i++) {
              const er = existingRows[i];
              if (er.cells[2].innerText.trim() == row.cells[2].innerText.trim()) {
                console.log("already here NOT ADDING:", row.cells[2].innerText.trim());

                return true;
              }
            }
            console.log("We got a new one!!!:", row.cells[2].innerText.trim());
            return false;
          };
          htmls.forEach((html) => {
            //@ts-ignore
            const table = html.querySelector("table") as HTMLTableElement;
            const rows = table.querySelectorAll("tr");
            const emails = getEmailAddressesOnPage(html);

            console.log("checking table:", table);

            for (let i = 0; i < rows.length; i++) {
              const row = rows[i];
              if (!isPresent(row)) {
                superTable.appendChild(row);
              }
            }
            emails.forEach((em) => {
              if (!allEmails.includes(em)) {
                allEmails.push(em);
              }
            });
          });
          //@ts-ignore
          document.querySelector("#EMailForm").removeChild(document.querySelector("table"));
          //@ts-ignore
          document.querySelector("#EMailForm").appendChild(superTable);
          return allEmails;
        })
        .then((emails) => {
          document.body.style.cursor = "";
          (document.getElementById("gmail") as HTMLButtonElement).disabled = false;
          console.log("all emails are:", emails);
        });
      //   console.log("all emails:" + allEmails);
    } else {
      //@ts-ignore
      OnChangeCourse();
    }
  };
}
//@ts-ignore
async function formSubmit(val: string = document.forms["EMailForm"].CourseName.value): Promise<HTMLElement> {
  //@ts-ignore
  document.getElementById("EMailSubmit").disabled = true;
  //@ts-ignore
  document.forms["EMailForm"].id_selected.value = val;
  //@ts-ignore
  document.forms["EMailForm"].action = "ceFacultyEmailClass.asp?ak=" + a1;
  //@ts-ignore
  document.forms["EMailForm"].onsubmit = "";
  const data = new URLSearchParams();
  const formElement: HTMLFormElement = (document.forms as any)["EMailForm"] as any;
  //@ts-ignore
  for (const pair of new FormData(formElement)) {
    //@ts-ignore
    data.append(pair[0], pair[1]);
  }

  const r = await fetch(location.href, {
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
  const el = document.createElement("html");
  el.innerHTML = r;

  console.log("fetched:", getEmailAddressesOnPage(el));
  return el;
}
//@ts-ignore
function addCode() {
  console.log("adding code");
  const bod = document.querySelector("body") as HTMLBodyElement;
  const script = document.createElement("script");
  script.innerHTML = overrideSelectionChange.toString() + "\n overrideSelectionChange();\n" + formSubmit.toString();
  script.innerHTML += getEmailAddressesOnPage.toString();
  bod.append(script);
}
addCode();

function createButton(): HTMLButtonElement {
  const b = document.createElement("button");
  b.id = "gmail";
  b.style.background = "yellow";
  b.innerText = "Send with Gmail (opens new editing window)";
  b.addEventListener("click", clicked);
  return b;
}

// async function getEmails(): Promise<string[]> {
//   const selection = (document.querySelector("select") as HTMLSelectElement).selectedOptions[0];
//   if ((selection as any).group) {
//     //then there is nothing special here. get emails on the page.
//     return getEmailAddressesOnPage();
//   } else {
//     //we need to do some fetching.
//     sout("special option selected");
//     return [];
//   }
// }
//----------------------------------------------------------------
function clicked(ev: Event) {
  ev.preventDefault();
  sout("clicked me!", ev);
  const emails = getEmailAddressesOnPage();

  const sub = getSubject();
  const bcc = getbcc();
  const body = getMessage();
  let url = "https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1";
  url += "&to=" + emails.join(",");
  if (sub) {
    url += "&su=" + sub;
  }
  if (bcc) {
    url += "&bcc=" + bcc;
  }
  if (body) {
    url += "&body=" + body;
  }

  window.open(url, "_blank");
}
function getOptions(): HTMLOptionElement[] {
  const collection = document.querySelector("select")!.options as HTMLOptionsCollection;
  sout("collection", collection);
  const ar: HTMLOptionElement[] = [];
  for (let i = 0; i < collection.length; i++) {
    ar.push(collection[i]);
  }
  return ar;
}

function addOptions() {
  sout("adding options!!!");
  const select = document.querySelector("select") as HTMLSelectElement;
  const groups = groupOptions(getOptions());
  sout("groups are:", groups);
  groups.forEach((group) => {
    const opt = document.createElement("option");
    opt.innerHTML = group.name + "  --  (GMAIL ONLY)";
    opt.style.background = "yellow";
    opt.value = JSON.stringify(group.options.map((x) => x.value));
    select.appendChild(opt);
  });

  /**
    var opt = document.createElement('option');
    opt.value = i;
    opt.innerHTML = i;
    select.appendChild(opt); 
    */
}
addOptions();
interface OptionGroup {
  name: string;
  options: HTMLOptionElement[];
}
function groupOptions(options: HTMLOptionElement[]): OptionGroup[] {
  //filter excludes [select one] option
  const options2 = options.filter((x) => x.value.length > 0);
  const answer: OptionGroup[] = [];

  const all = { name: "All", options: options2 };
  answer.push(all);
  //add groups.
  options2.forEach((option) => {
    const match = option.text.match(/^(\w+\d+)/);
    const m = match && match.length > 0 ? match[0] : "";
    (option as any).group = m;
  });
  const accountedFor: HTMLOptionElement[] = [];

  options2.forEach((option) => {
    const mygroup = (option as any).group;
    const all = options2.filter((op) => (op as any).group == mygroup && !accountedFor.includes(op));
    //only create group if there's more than 1 match.
    if (all.length > 1) {
      //let's make a group!
      //to disregard;
      accountedFor.push(...all);
      answer.push({ name: mygroup, options: all });
    }
  });
  return answer;
}
sout("options:", getOptions());
//@ts-ignore
function placeButton(b: HTMLButtonElement) {
  const em = document.querySelector("input[type='button'");
  em!.parentElement!.append(b);
}
function getSubject(): string {
  return getinputContents("idEMailSubject");
}
function getReplyTo(): string {
  return getinputContents("idEMailReplyTo");
}
function getMessage(): string {
  return getinputContents("idEMailMessage");
}
function getbcc(): string {
  return getinputContents("idEMailBcc");
}
function getinputContents(id: string): string {
  const e = document.querySelector("#" + id) as HTMLInputElement | null;
  return e ? e.value : "";
}
function getEmailAddressesOnPage(d: any = document): string[] {
  const tds = d.querySelectorAll("td[colspan='2']");
  const emails: string[] = [];
  tds.forEach((x: any) => emails.push(x.innerText.trim()));
  return emails;
}
function main() {
  placeButton(createButton());
}
main();
