// Extract the abstract from the PubMed page
function extractAbstract() {
  const abstractElement = document.querySelector('.abstract-content');
  if (abstractElement) {
    return abstractElement.innerText;
  }
  return null;
}

// Replace the abstract with the new one, adding bold headings
function replaceAbstract(newAbstract) {
  const abstractElement = document.querySelector('.abstract-content');
  if (abstractElement) {
    // Split the modified abstract into sections
    const sections = newAbstract.split("\n\n");

    // Create a new HTML structure with bold headings
    let formattedAbstract = "";
    sections.forEach((section) => {
      const splitIndex = section.indexOf(":");
      if (splitIndex !== -1) {
        const heading = section.substring(0, splitIndex).trim();
        const content = section.substring(splitIndex + 1).trim();
        if (heading && content) {
          formattedAbstract += `<p><strong>${heading}:</strong> ${content}</p>`;
        }
      }
    });

    // Replace the abstract content with the formatted HTML
    abstractElement.innerHTML = formattedAbstract;
    console.log("Abstract replaced successfully.");
  } else {
    console.error("Abstract element not found.");
  }
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "extractAbstract") {
    const abstract = extractAbstract();
    sendResponse({ abstract });
  } else if (message.action === "replaceAbstract") {
    replaceAbstract(message.newAbstract);
    sendResponse({ success: true });
  }
});