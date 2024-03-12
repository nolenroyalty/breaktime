chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
    text: "",
  });
});

const calendar = "https://calendar.google.com/calendar/";

chrome.action.onClicked.addListener(async (tab) => {
  console.log("clicked");
  let nextState;
  if (tab.url.startsWith(calendar)) {
    const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
    nextState = prevState === "ON" ? "OFF" : "ON";
    await chrome.action.setBadgeText({
      tabId: tab.id,
      text: nextState === "ON" ? "ON" : "",
    });

    const cssArgs = { files: ["style.css"], target: { tabId: tab.id } };
    const jsArgs = { files: ["main.js"], target: { tabId: tab.id } };
    if (nextState === "ON") {
      await chrome.scripting.insertCSS(cssArgs);
      await chrome.scripting.executeScript(jsArgs);
    } else if (nextState === "OFF") {
      await chrome.scripting.removeCSS(cssArgs);
    }
  }
});
