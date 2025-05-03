// Extract the abstract from the PubMed page
function extractAbstract() {
  const abstractElement = document.querySelector('.abstract-content');
  if (abstractElement) {
    // Add a CSS class to animate the text while processing
    abstractElement.classList.add('processing-animation');
    return abstractElement.innerText;
  }
  return null;
}

// Inject CSS for the animation
const style = document.createElement('style');
style.innerHTML = `
  .processing-animation {
    background: linear-gradient(90deg, rgba(89, 82, 82, 0.53) 25%, rgba(200, 200, 200, 0.5) 50%, rgba(240, 240, 240, 0.65) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite, scaleUp 1.5s infinite alternate;
    color: transparent; /* Hide the text during animation */
    -webkit-background-clip: text; /* Clip the gradient to the text */
    background-clip: text;
  }

  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

  @keyframes scaleUp {
    0% {
      transform: scale(1);
    }
    100% {
      transform: scale(1.05);
    }
  }
`;
document.head.appendChild(style);

// Replace the abstract with the new one, removing the animation
function replaceAbstract(newAbstract) {
  const abstractElement = document.querySelector('.abstract-content');
  if (abstractElement) {
    // Remove the animation class
    abstractElement.classList.remove('processing-animation');

    // Split the modified abstract into sections
    const sections = newAbstract.split("\n\n");

    // Create a new HTML structure with bold headings
    let formattedAbstract = "";
    sections.forEach((section) => {
      const splitIndex = section.indexOf(":");
      if (splitIndex !== -1) {
        const heading = section.slice(0, splitIndex + 1);
        const content = section.slice(splitIndex + 1).trim();
        formattedAbstract += `<p><strong>${heading}</strong> ${content}</p>`;
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