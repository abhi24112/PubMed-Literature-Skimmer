import os
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"  # Disable GPU usage for TensorFlow

from flask import Flask, request, jsonify
import tensorflow as tf
import tensorflow_hub as hub
from spacy.lang.en import English
from flask_cors import CORS
import requests
import time
from threading import Thread

# Define the UniversalTextEncoder layer
class UniversalTextEncoder(tf.keras.layers.Layer):
    def __init__(self, **kwargs):
        super(UniversalTextEncoder, self).__init__(**kwargs)
        self.encoder = hub.KerasLayer(
            "https://tfhub.dev/google/universal-sentence-encoder/4",
            trainable=False,
            input_shape=[],
            dtype=tf.string,
            name="Universal_Text_Encoder"
        )

    def call(self, inputs):
        return self.encoder(inputs)

# Load the custom model
# model = tf.keras.models.load_model(
#     "09_pubmed_rct_200k_model_final.keras",
#     custom_objects={"UniversalTextEncoder": UniversalTextEncoder}
# )
model = None

def load_model():
    global model
    if model is None:
        model = tf.keras.models.load_model(
            "09_pubmed_rct_200k_model_final.keras",
            custom_objects={"UniversalTextEncoder": UniversalTextEncoder}
        )

# Initialize the Flask app
app = Flask(__name__)
CORS(app)

# Function to preprocess the abstract
def preprocess_abstract(abstract):
    nlp = English()
    sentencizer = nlp.add_pipe("sentencizer")  # Create sentence splitting pipeline object
    doc = nlp(abstract)
    sentences = [str(sent) for sent in list(doc.sents)]

    characters = [" ".join(list(word)) for word in sentences]
    line_number = list(range(len(sentences)))
    total_line = [len(sentences)] * len(sentences)

    # One-hot encoding
    line_number_one_hot = tf.one_hot(line_number, axis=1, depth=15)
    total_line_one_hot = tf.one_hot(total_line, axis=1, depth=20)

    # Convert to tensors
    sentence_tensor = tf.constant(sentences)
    character_tensor = tf.constant(characters)

    return line_number_one_hot, total_line_one_hot, sentence_tensor, character_tensor, sentences

# Function to make predictions
def make_prediction(abstract):
    load_model()
    line_number_one_hot, total_line_one_hot, sentence_tensor, character_tensor, sentences = preprocess_abstract(abstract)

    # Predict using the model
    model_pred_probs = model.predict(
        x=(line_number_one_hot, total_line_one_hot, sentence_tensor, character_tensor),
        verbose=0
    )

    # Convert prediction probabilities to labels
    class_names = ['BACKGROUND', 'CONCLUSIONS', 'METHODS', 'OBJECTIVE', 'RESULTS']
    pred = tf.argmax(model_pred_probs, axis=1)
    pred_labels = [class_names[i] for i in pred]

    # Organize predictions into sections
    result = {}
    for i, sentence in enumerate(sentences):
        label = pred_labels[i]
        if label not in result:
            result[label] = [sentence]
        else:
            result[label].append(sentence)

    # Format the modified abstract
    desired_order = ['BACKGROUND', 'OBJECTIVE', 'METHODS', 'RESULTS', 'CONCLUSIONS']
    modified_abstract = ""
    for section in desired_order:
        if section in result:
            modified_abstract += f"{section.title()}:\n"
            modified_abstract += " ".join(result[section]) + "\n\n"

    return modified_abstract.strip()

# Define the API endpoint
@app.route("/process", methods=["POST"])
def process_abstract():
    data = request.json
    abstract = data.get("abstract", "")

    if not abstract:
        return jsonify({"error": "No abstract provided"}), 400

    # Process the abstract using the model
    modified_abstract = make_prediction(abstract)

    return jsonify({"modified_abstract": modified_abstract})

# Prevent Render app from sleeping
url = "https://loan-approval-prediction-jc8r.onrender.com"  # Replace with your Render URL
interval = 30  # Interval in seconds (30 seconds)

def reload_website():
    while True:
        try:
            response = requests.get(url)
            print(f"Reloaded at {time.strftime('%Y-%m-%d %H:%M:%S')}: Status Code {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"Error reloading at {time.strftime('%Y-%m-%d %H:%M:%S')}: {str(e)}")
        time.sleep(interval)

# Start the reload function in a separate thread
def start_reloading():
    thread = Thread(target=reload_website)
    thread.daemon = True
    thread.start()

# Run the thread when the app starts
if __name__ == "__main__":
    with app.app_context():
        start_reloading()
    
    # Use the PORT environment variable provided by Render
    port = int(os.environ.get("PORT", 5000))  # Default to 5000 if PORT is not set
    app.run(host="0.0.0.0", port=port, debug=True)