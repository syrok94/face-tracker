chrome.runtime.onInstalled.addListener(() => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "clearCookie") {
      clearCookies();
      console.log("cookies cleared!!");
    } else if (message.action === "openFloatingPopup") {
      openFloatingPopup();
    }
  });
});

async function openFloatingPopup() {
  await chrome.windows.getCurrent((currentWindow) => {
    const popupWidth = currentWindow.width - 400;
    const popupHeight = currentWindow.height - 200;

    chrome.windows.create({
      url: chrome.runtime.getURL("custompage.html"),
      type: "panel",
      width: popupWidth,
      height: popupHeight,
      left: 200,
      top: 100,
    });
  });
}

async function clearCookies() {
  const Tab = await chrome.tabs.query({ active: true });

  const currentTab = Tab[0];

  var ms = 30 * 60 * 1000;
  var time = Date.now() - ms;

  chrome.browsingData.remove(
    {"origins": [currentTab.url], since: time },
    {
      cookies: true,
    },
    function () {
      console.log("starting to remove cookies...");
      console.log(`Current Tab Id : ${currentTab.id} and url : ${currentTab.url}...`);
      chrome.tabs.update(currentTab.id, { url: currentTab.url });
      console.log("cookies deleted!!");
    }
  );
}

