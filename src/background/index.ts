chrome.runtime.onInstalled.addListener(() => {
  console.log('Color Picker Extension installed');
});


chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js'],
    });
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_COLOR') {
    console.log('Request from content script:', message);
    sendResponse({ status: 'ok' });
  }
});
