function imgToString(doc: any = document, querySelect: string = "img"): string {
  const img = doc.querySelector(querySelect);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (img && ctx) {
    ctx.drawImage(img as HTMLImageElement, 0, 0);
    return canvas.toDataURL();
  } else {
    console.error("img or context was null. img: ", img, "context", ctx);
    return "";
  }
}

function harvestImage(doc: any = document): string {
  const querySel = "img.Portal_Img_Action";
  return imgToString(doc, querySel);
}
function getAddressText(doc: any = document): string {
  //@ts-ignore
  return doc.querySelector("address").innerText;
}
interface AddrInfo {
  address: string;
  phone: string;
  email: string;
  photo: string;
}
function harvestAddressInformation(doc: any = document): AddrInfo {
  const str = getAddressText(doc);
  const addressR = str.match(/[\w\s,0-9\.]+\d\d\d\d\d/);
  const address = addressR ? addressR[0].trimLeft() : "";
  const phoneR = str.match(/\(\d{3}\)\s\d{3}-\d{4}/);
  const phone = phoneR ? phoneR[0].trim() : "";
  const emailR = str.match(/[\w._]+@[\w]+\.[\w]+/);
  const email = emailR ? emailR[0].trim() : "";

  return { address: address, email: email, phone: phone, photo: harvestImage(doc) };
}
interface FERPAInfo {
  account_provide_info: string;
  account_to_whom: string;
  records_provide_info: string;
  records_to_whom: string;
  directory_provide_info: string;
  directory_to_whom: string;
  relations_provide_info: string;
  relations_to_whom: string;
}
function getFERPATable(doc: any = document): HTMLTableElement {
  return doc.querySelector("table[summary='FERPA Restrictions'") as HTMLTableElement;
}
function harvestFERPA(doc: any = document): FERPAInfo {
  const table = getFERPATable(doc);
  // const bod = table.querySelector("tbody") as HTMLTableSectionElement;
  const tds = table.querySelectorAll("td");
  const obj = {} as any;
  obj.account_provide_info = tds[1].innerText.trim();
  obj.account_to_whom = tds[2].innerText.trim();
  obj.records_provide_info = tds[4].innerText.trim();
  obj.records_to_whom = tds[5].innerText.trim();
  obj.directory_provide_info = tds[7].innerText.trim();
  obj.directory_to_whom = tds[8].innerText.trim();
  obj.relations_provide_info = tds[10].innerText.trim();
  obj.relations_to_whom = tds[11].innerText.trim();
  return obj;
}
function harvestStudentOptions(doc: any = document): any {
  return { ferpa: harvestFERPA(doc), ...harvestAddressInformation(doc) };
}
//@ts-ignore
function addCode() {
  console.log("addcode running");
  const elem = document.createElement("script");
  let str = "";
  str += imgToString.toString();
  str += harvestImage.toString();
  str += getAddressText.toString();
  str += harvestAddressInformation.toString();
  str += getFERPATable.toString();
  str += harvestFERPA.toString();
  str += harvestStudentOptions.toString();
  elem.innerHTML = str;
  //@ts-ignore
  document.querySelector("body").append(elem);
}
addCode();
console.log(imgToString());
