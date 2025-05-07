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
      console.log("Active tab:", activeTab);
      chrome.scripting.executeScript(
        {
          target: { tabId: activeTab.id },
          files: ["content.js"]
        },
        () => {
          console.log("Content script executed");
          chrome.tabs.sendMessage(activeTab.id, { action: "extractAbstract" }, (response) => {
            console.log("Response from content script:", response);
            if (response && response.abstract) {
              console.log("Extracted abstract:", response.abstract);

              // Send the link and abstract to the Flask API
              fetch("https://ghoul-more-cricket.ngrok-free.app/process", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  link: activeTab.url, // Send the current tab's URL as the link
                  abstract: response.abstract
                })
              })
                .then((res) => res.json())
                .then((data) => {
                  console.log("Payload sent to Flask API:", {
                    link: activeTab.url,
                    abstract: response.abstract
                  });
                  console.log("Active tab URL:", activeTab.url);
                  console.log("Response from Flask API:", data);
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