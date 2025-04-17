document.getElementById("extractButton").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "processAbstract" }, (response) => {
  });
});