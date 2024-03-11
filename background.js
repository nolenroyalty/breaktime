
chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
    text: "OFF",
  });
});

const calendar = 'https://calendar.google.com/calendar/"

chrome.action.onClicked.addListener(async (tab) => {
    console.log("clicked");
  if (tab.url.startsWith(calendar)) {
    const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
    const nextState = prevState === 'ON' ? 'OFF' : 'ON'
    await chrome.action.setBadgeText({
      tabId: tab.id,
      text: nextState,
    });
  }

    cssArgs = { files: ["style.css"], target: { tabId: tab.id }, };
    jsArgs = { files: ["main.js"], target: { tabId: tab.id}, };
    if (nextState === "ON") {
        await chrome.scripting.insertCSS(cssArgs);
        await chrome.scripting.executeScript(jsArgs);
    }
    else if (nextState === "OFF") {
        await chrome.scripting.removeCSS(cssArgs);
    }
});
