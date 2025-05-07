document.getElementById("extractButton").addEventListener("click", () => {
  console.log("Extract button clicked");
  chrome.runtime.sendMessage({ action: "processAbstract" }, (response) => {
    console.log("Response from background script:", response);
  });
});