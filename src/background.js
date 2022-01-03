chrome.browserAction.onClicked.addListener(oldTab => {
    chrome.tabs.create({ 'url': 'chrome://newtab' }, newTab => {
        chrome.tabs.move(newTab.id, { index: oldTab.index }, () => {
            chrome.tabs.remove(oldTab.id);
        });
    });
});
