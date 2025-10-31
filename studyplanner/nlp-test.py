# nlp_test.py
import spacy
from nltk.corpus import stopwords
from textblob import TextBlob
import nltk

# ----------------- NLTK Setup -----------------
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')
stop_words = set(stopwords.words('english'))

# ----------------- spaCy Setup -----------------
nlp = spacy.load("en_core_web_sm")

# ----------------- Test text -----------------
text = "Algebra, Geometry and Trigonometry are important topics. Natural language processing is also cool."

# ----------------- spaCy noun chunks -----------------
print("=== spaCy Noun Chunks ===")
doc = nlp(text)
for chunk in doc.noun_chunks:
    print("-", chunk.text)

# ----------------- NLTK tokenization -----------------
print("\n=== NLTK Tokens (without stopwords) ===")
tokens = nltk.word_tokenize(text)
tokens = [t for t in tokens if t.lower() not in stop_words and t.isalpha()]
print(tokens)

# ----------------- TextBlob test -----------------
print("\n=== TextBlob Sentences ===")
blob = TextBlob(text)
for sentence in blob.sentences:
    print("-", sentence)
