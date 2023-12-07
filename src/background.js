chrome.runtime.onInstalled.addListener(() => {

});

chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.update({url: 'chrome://newtab'});
});
