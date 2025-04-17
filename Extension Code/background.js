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
              fetch("http://127.0.0.1:5000/process", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({ abstract: response.abstract })
              })
                .then((res) => {
                  console.log("Fetch response status:", res.status); // Log the response status
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
    return true; // Keep the message channel open for async response
  }
});