import pandas as pd
from sentence_transformers import SentenceTransformer, util

# Load CSV knowledge
df = pd.read_csv("data/knowledge.csv")

# Load embedding model (you can use a lighter one like 'all-MiniLM-L6-v2')
embedder = SentenceTransformer('all-MiniLM-L6-v2')

# Precompute embeddings for all knowledge entries
df['embedding'] = df['content'].apply(lambda x: embedder.encode(x, convert_to_tensor=True))

def retrieve_context(query: str, top_k=2):
    """Retrieve top relevant entries for the user's query."""
    query_embedding = embedder.encode(query, convert_to_tensor=True)
    similarities = [util.pytorch_cos_sim(query_embedding, emb).item() for emb in df['embedding']]
    top_indices = sorted(range(len(similarities)), key=lambda i: similarities[i], reverse=True)[:top_k]
    return "\n".join([df.iloc[i]['content'] for i in top_indices])
