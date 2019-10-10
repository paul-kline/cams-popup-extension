// chrome.runtime.onInstalled.addListener(function() {
//   console.log(chrome.storage);
//   chrome.storage.sync.set({ color: "#3aa757" }, function() {
//     console.log("The color is green.");
//   });
//   chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
//     chrome.declarativeContent.onPageChanged.addRules([
//       {
//         conditions: [
//           new chrome.declarativeContent.PageStateMatcher({
//             pageUrl: { hostEquals: "portals.blackburn.edu", pathEquals: "/efaculty/login.asp" }
//           })
//         ],
//         actions: [new chrome.declarativeContent.RequestContentScript({ allFrames: true, js: ["./loginpagescript.js"] })]
//         // actions: [new chrome.declarativeContent.ShowPageAction()]
//       }
//     ]);
//   });
// });
