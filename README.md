# PubMed Literature Skimmer

**PubMed Literature Skimmer** is a Chrome extension designed to streamline the process of reading and analyzing PubMed abstracts. It extracts abstracts from PubMed articles, processes them using a machine learning model, and reformats them with bold headings for better readability.

---

## Introduction Video
<iframe src="https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7318934203155247104?compact=1" height="399" width="504" frameborder="0" allowfullscreen="" title="Embedded post"></iframe>
---

## Features

- Extracts abstracts from PubMed articles.
- Processes abstracts using a Flask server and a machine learning model.
- Reformats abstracts with bold headings (`BACKGROUND`, `OBJECTIVE`, `METHODS`, `RESULTS`, `CONCLUSIONS`).
- Ensures the extension runs only once per page load.
- User-friendly UI with a button to trigger the extraction process.

---

## Installation

1. Clone this repository to your local machine:
   ```bash
   git clone https://github.com/abhi24112/PubMed-Literature-Skimmer.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select the (Extension Code folder only).

---

## Usage
1. Run the Flask Api by
 ```bash
    python server.py
```
2. Open a PubMed article in your browser.
3. Click the **PubMed Literature Skimmer** extension icon in the toolbar.
4. In the popup UI, click the **Extract Abstract** button.
5. The abstract will be processed and reformatted with bold headings directly on the PubMed page.

---

## Project Structure

```
PubMed-Literature-Skimmer/
├── server.py                                # Flask server for processing abstracts using a machine learning model
├── 09_pubmed_rct_200k_model_final.keras     # Model 
├──pubmed_extension/
   ├── background.js       # Handles communication between the content script and the Flask server
   ├── content.js          # Extracts and replaces abstracts on the PubMed page
   ├── popup.html          # UI for the Chrome extension
   ├── popup.js            # Handles UI interactions  
   ├── manifest.json       # Chrome extension manifest file
   └── README.md           # Project documentation
```

---

## Adding the Extension UI Heading

To add a heading "PubMed Literature Skimmer" to the extension UI, update the popup.html file as follows:

```html
<body>
  <h1 style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">PubMed Literature Skimmer</h1>
  <button id="extractButton">Extract Abstract</button>
  <script src="popup.js"></script>
</body>
```

---

## Requirements

- Python 3.8 or higher
- Flask
- TensorFlow
- Scapy
- Chrome browser

---

## Running the Flask Server

1. Navigate to the project directory:
   ```bash
   cd PubMed-Literature-Skimmer
   ```
2. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the Flask server:
   ```bash
   python server.py
   ```

---

## Contributing

Contributions are welcome! Feel free to submit a pull request or open an issue for any bugs or feature requests.

---

Let me know if you need further adjustments! 🚀
