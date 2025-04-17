// filepath: c:\Users\dayaa\Desktop\pubmed_extension\background.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "processAbstract") {
    console.log("Received processAbstract action");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      chrome.scripting.executeScript(
        {
          target: { tabId: activeTab.id },
          files: ["content.js"]
        },
        () => {
          console.log("Content script executed");
          chrome.tabs.sendMessage(activeTab.id, { action: "extractAbstract" }, (response) => {
            if (response && response.abstract) {
              console.log("Extracted abstract:", response.abstract);
              fetch("http://127.0.0.1:5000/process", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({ abstract: response.abstract })
              })
                .then((res) => {
                  if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                  }
                  return res.json();
                })
                .then((data) => {
                  console.log("Received response from server:", data);
                  const newAbstract = data.modified_abstract;
                  chrome.tabs.sendMessage(activeTab.id, { action: "replaceAbstract", newAbstract });
                })
                .catch((error) => console.error("Fetch error:", error));
            } else {
              console.error("No abstract extracted.");
            }
          });
        }
      );
    });
    sendResponse({ success: true });
  }
});