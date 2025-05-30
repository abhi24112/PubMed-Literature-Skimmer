import os
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"  # Disable GPU usage for TensorFlow
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
os.environ["TF_ENABLE_ONEDNN_OPTS"]= "0"

# Importing all libraries
from flask import Flask, request, jsonify
import tensorflow as tf
import tensorflow_hub as hub
from spacy.lang.en import English
from flask_cors import CORS


# Define the UniversalTextEncoder layer
class UniversalTextEncoder(tf.keras.layers.Layer):
    def __init__(self, **kwargs):
        super(UniversalTextEncoder, self).__init__(**kwargs)
        self.encoder = hub.KerasLayer(
            "https://www.kaggle.com/models/google/universal-sentence-encoder/TensorFlow2/universal-sentence-encoder/2",
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
        print("Loading model...")
        try:
            model = tf.keras.models.load_model(
                "09_pubmed_rct_200k_model_final.keras",
                custom_objects={"UniversalTextEncoder": UniversalTextEncoder}
            )
            print("Model loaded successfully.")
        except Exception as e:
            print(f"Error loading model: {e}")

# Initialize the Flask app
app = Flask(__name__)
CORS(app)

# Load the model when the server starts
print("Initializing server...")
load_model()
print("Server initialized successfully.")

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

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "PubMed Literature Skimmer API is running"}), 200

temp_storage ={}

# Define the API endpoint
@app.route("/process", methods=["POST", "OPTIONS"])
def process_abstract():
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS preflight request successful"}), 200

    data = request.json
    print("Received data:", data)  # Debug log
    link = data.get("link", "")  # Get the link from the request
    abstract = data.get("abstract", "")  # Get the abstract from the request
    print("Link:", link)
    print("Abstract:", abstract)
    print("Temp storage:", temp_storage)

    # If no link is provided, return an error
    if not link:
        return jsonify({"error": "No link provided"}), 400

    # If no abstract is provided and the link is not in storage, return an error
    if not abstract and link not in temp_storage:
        return jsonify({"error": "No abstract provided and link not found in storage"}), 400

    # Check if the link is already stored
    if link in temp_storage:
        print(f"Link already exists: {link}")
        stored_abstract = temp_storage[link]
        print(f"Using stored abstract for link: {link}")
    else:
        # Store the link and abstract in temporary storage
        temp_storage[link] = abstract
        stored_abstract = abstract
        print(f"Stored new link and abstract: {link}")

    # Process the abstract using the model
    print("Processing abstract...")
    modified_abstract = make_prediction(stored_abstract)

    return jsonify({"modified_abstract": modified_abstract, "link": link})


# Run the thread when the app starts
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Default to 5000 if PORT is not set
    app.run(host="0.0.0.0", port=port, debug=True)