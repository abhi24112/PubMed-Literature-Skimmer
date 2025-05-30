# PubMed Literature Skimmer

**PubMed Literature Skimmer** is a Chrome extension designed to streamline the process of reading and analyzing PubMed abstracts. It extracts abstracts from PubMed articles, processes them using a machine learning model, and reformats them with bold headings for better readability.

---

## Introduction Video

[https://www.youtube.com/watch?v=zDaNslvWURY](https://youtu.be/zDaNslvWURY?si=Sws2BIXVzcJWkmOC


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

### Running the Flask Server

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
4. Open the PubMed article which you want to skim.
5. Then click the extension.
6. Boom!.. the abstract is now skimmed.

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

## Contributing

Contributions are welcome! Feel free to submit a pull request or open an issue for any bugs or feature requests.

---

Let me know if you need further adjustments! 🚀
