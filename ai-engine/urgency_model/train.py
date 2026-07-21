import pandas as pd
import numpy as np
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# 1. Synthetic Dataset (City Issues)
data = [
    ("Huge pothole on main street causing traffic", "High"),
    ("Accident risk due to deep pothole", "High"),
    ("Streetlight broken in dark alley", "High"),
    ("Water pipe burst flooding the road", "High"),
    ("Live wire hanging from pole", "High"),
    ("Major traffic jam at downtown junction", "High"),
    ("Sewage overflow near school", "High"),
    
    ("Garbage piled up on sidewalk", "Medium"),
    ("Street sign damaged but visible", "Medium"),
    ("Park bench broken", "Medium"),
    ("Sidewalk slightly cracked", "Medium"),
    ("Stray dogs barking at night", "Medium"),
    ("Construction debris left on side", "Medium"),
    
    ("Graffiti on public wall", "Low"),
    ("Leaf litter in park", "Low"),
    ("Faded lane markings", "Low"),
    ("Noise complaint from neighbors", "Low"),
    ("Billboard light flickering", "Low")
]

# Duplicate data to increase sample size for distinct classes
data = data * 5 

df = pd.DataFrame(data, columns=["text", "urgency"])

# 2. Preprocessing & Model Pipeline
# Using Random Forest for robustness with small data
pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(stop_words='english')),
    ('clf', RandomForestClassifier(n_estimators=100, random_state=42))
])

# 3. Training
X = df['text']
y = df['urgency']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("Training Urgency Classifier...")
pipeline.fit(X_train, y_train)

# 4. Evaluation
print("Evaluating model...")
score = pipeline.score(X_test, y_test)
print(f"Model Accuracy: {score:.2f}")

# 5. Save Model
print("Saving model to disk...")
joblib.dump(pipeline, 'urgency_model.pkl')
print("Done! Model saved as 'urgency_model.pkl'")
