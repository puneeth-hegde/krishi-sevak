import chromadb
from sentence_transformers import SentenceTransformer
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DB_PATH = "db"
DOCUMENT_PATH = "documents"
COLLECTION_NAME = "local_knowledge"

def ingest_documents():
    """
    Reads .txt files, converts them to numerical embeddings, and stores them in ChromaDB.
    This creates a searchable local knowledge base for the AI.
    """
    if os.path.exists(DB_PATH):
        logger.info(f"Database already exists at {DB_PATH}. Skipping ingestion.")
        return

    logger.info("Initializing ChromaDB client...")
    client = chromadb.PersistentClient(path=DB_PATH)

    logger.info("Loading sentence transformer model (all-MiniLM-L6-v2)...")
    embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

    logger.info(f"Creating collection: {COLLECTION_NAME}")
    collection = client.create_collection(name=COLLECTION_NAME)

    documents, metadatas, ids = [], [], []
    doc_id_counter = 1

    logger.info(f"Reading documents from: {DOCUMENT_PATH}")
    for filename in os.listdir(DOCUMENT_PATH):
        if filename.endswith(".txt"):
            filepath = os.path.join(DOCUMENT_PATH, filename)
            with open(filepath, 'r', encoding='utf-8') as file:
                content = file.read()
                chunks = content.split('\n\n')
                for chunk in chunks:
                    if chunk.strip():
                        documents.append(chunk)
                        metadatas.append({"source": filename})
                        ids.append(f"{filename}_{doc_id_counter}")
                        doc_id_counter += 1

    if not documents:
        logger.warning("No documents found to ingest.")
        return

    logger.info(f"Generating embeddings for {len(documents)} document chunks...")
    embeddings = embedding_model.encode(documents).tolist()

    logger.info("Adding documents to the collection...")
    collection.add(embeddings=embeddings, documents=documents, metadatas=metadatas, ids=ids)

    logger.info("✅ Document ingestion complete. Knowledge base is ready.")

if __name__ == "__main__":
    ingest_documents()