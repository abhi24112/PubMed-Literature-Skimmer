chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "processAbstract") {
    console.log("Received processAbstract action");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || tabs.length === 0) {
        console.error("No active tab found.");
        sendResponse({ success: false, error: "No active tab found." });
        return;
      }

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

              // Simulate sending the abstract to the server and receiving a response
              fetch("https://diverse-meerkat-precise.ngrok-free.app/process", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ abstract: response.abstract })
              })
                .then((res) => res.json())
                .then((data) => {
                  chrome.tabs.sendMessage(activeTab.id, {
                    action: "replaceAbstract",
                    newAbstract: data.modified_abstract
                  });
                  sendResponse({ success: true });
                })
                .catch((error) => {
                  console.error("Error processing abstract:", error);
                  sendResponse({ success: false, error: error.message });
                });
            } else {
              console.error("Failed to extract abstract.");
              sendResponse({ success: false, error: "Failed to extract abstract." });
            }
          });
        }
      );
    });
    return true; // Keep the message channel open for async response
  }
});