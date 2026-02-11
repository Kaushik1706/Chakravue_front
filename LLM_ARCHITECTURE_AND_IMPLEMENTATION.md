# LLM Architecture & Implementation — Complete Technical Reference

> **Project:** Hospital EMR Ophthalmology AI Assistant  
> **Last updated:** 2026-02-10

---

## Table of Contents

1. [High-Level Overview](#1-high-level-overview)
2. [System Architecture Diagram](#2-system-architecture-diagram)
3. [Component Inventory](#3-component-inventory)
4. [Agent 1 — Patient Data Retrieval (`retrival_agent1.py`)](#4-agent-1--patient-data-retrieval)
5. [Agent 2a — Knowledge Ingestion (`knowledge_ingestor.py`)](#5-agent-2a--knowledge-ingestion)
6. [Agent 2b — Knowledge Retrieval (`knowledge_retriever.py`)](#6-agent-2b--knowledge-retrieval)
7. [Agent 3 — LLM Inference (`llm_agent.py`)](#7-agent-3--llm-inference)
8. [Orchestration Script (`retrival_test.py`)](#8-orchestration-script)
9. [Model Details — DeepSeek-R1 1.5 B](#9-model-details--deepseek-r1-15-b)
10. [Prompt Engineering](#10-prompt-engineering)
11. [Quantization Configuration](#11-quantization-configuration)
12. [Generation Hyperparameters](#12-generation-hyperparameters)
13. [Embedding & Vector Store](#13-embedding--vector-store)
14. [Environment Variables & Configuration](#14-environment-variables--configuration)
15. [Dependencies](#15-dependencies)
16. [Data Flow — End-to-End](#16-data-flow--end-to-end)
17. [Error Handling](#17-error-handling)
18. [File Tree](#18-file-tree)

---

## 1. High-Level Overview

The system is a **Retrieval-Augmented Generation (RAG)** pipeline purpose-built for ophthalmology clinical decision support inside a Hospital EMR dashboard. It works in three stages:

| Stage | Description |
|-------|-------------|
| **Retrieve patient data** | Query MongoDB for the patient's structured visit history (IOP, vision, refraction, diagnosis, prescriptions, notes). |
| **Retrieve medical knowledge** | Semantic-search a ChromaDB vector store of ophthalmology textbook/guideline chunks. |
| **Generate summary** | Feed both data sources into a locally-hosted, 4-bit quantized DeepSeek-R1 1.5 B LLM that produces a clinically useful one-paragraph summary. |

The entire pipeline runs **locally / offline** — no external LLM API calls are made.

---

## 2. System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                         retrival_test.py                            │
│                      (Orchestration Entry Point)                    │
└──────┬───────────────────────┬───────────────────────┬──────────────┘
       │                       │                       │
       ▼                       ▼                       ▼
┌──────────────┐  ┌───────────────────────┐  ┌────────────────────┐
│  Agent 1     │  │  Agent 2b             │  │  Agent 3           │
│  retrival_   │  │  knowledge_retriever  │  │  llm_agent.py      │
│  agent1.py   │  │  .py                  │  │                    │
│              │  │                       │  │  DeepSeek-R1 1.5B  │
│  MongoDB ──► │  │  ChromaDB  ──►        │  │  (4-bit quant)     │
│  Patient     │  │  Semantic search      │  │  Generates summary │
│  Records     │  │  over textbook chunks │  │                    │
└──────────────┘  └───────────────────────┘  └────────────────────┘
                          ▲
                          │  (one-time ingestion)
                  ┌───────────────────────┐
                  │  Agent 2a             │
                  │  knowledge_ingestor   │
                  │  .py                  │
                  │  PDF → chunks →       │
                  │  embeddings → Chroma  │
                  └───────────────────────┘
```

---

## 3. Component Inventory

| File | Role | Key Exports |
|------|------|-------------|
| `backend/agents/retrival_agent1.py` | Patient data retrieval from MongoDB | `get_patient_summary()`, `extract_summary_from_visit()` |
| `backend/agents/knowledge_ingestor.py` | One-time PDF/TXT → ChromaDB ingestion | `ingest_book()`, `chunk_text()`, `load_pdf_pages()` |
| `backend/agents/knowledge_retriever.py` | Runtime semantic search over ChromaDB | `search_knowledge()` |
| `backend/agents/llm_agent.py` | LLM loading, prompt building, inference | `run_summary_llm()` |
| `backend/retrival_test.py` | End-to-end orchestration / test harness | *(script — no exports)* |
| `backend/models/deepseek-1.5b/` | Local model weights, tokenizer, config | `model.safetensors`, `tokenizer.json`, `config.json` |

---

## 4. Agent 1 — Patient Data Retrieval

**File:** `backend/agents/retrival_agent1.py`

### 4.1 Database Connection

```python
MONGO_URI = os.getenv("MONGO_URI_LOCAL", "mongodb://localhost:27017")
DB_NAME   = os.getenv("DATABASE_NAME", "hospital-emr")

client   = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
db       = client[DB_NAME]
patients = db["patients"]
```

- Uses **PyMongo** with a 3-second server-selection timeout for fast failure when offline.
- Database and URI are configurable via `.env`.
- Default database: `hospital-emr` (overridden to `chakra_hospital` in the project `.env`).

### 4.2 Functions

#### `_coerce_object_id(value)`

| Item | Detail |
|------|--------|
| **Purpose** | Safely convert a value to a BSON `ObjectId`, returning `None` if invalid. |
| **Parameters** | `value` — any (typically `str` or `ObjectId`) |
| **Returns** | `ObjectId` or `None` |
| **Logic** | If already an `ObjectId`, return as-is. If a `str`, validate with `ObjectId.is_valid()` before converting. Otherwise return `None`. |

```python
def _coerce_object_id(value):
    if isinstance(value, ObjectId):
        return value
    if isinstance(value, str) and ObjectId.is_valid(value):
        return ObjectId(value)
    return None
```

#### `extract_summary_from_visit(visit)`

| Item | Detail |
|------|--------|
| **Purpose** | Flatten a single visit document into a concise summary dict. |
| **Parameters** | `visit` — a visit sub-document from the patient record |
| **Returns** | `dict` with keys: `visitDate`, `iop`, `vision`, `refraction`, `diagnosis`, `prescription`, `notes` |

**Data extraction paths inside the visit document:**

| Field | Mongo Path |
|-------|-----------|
| `vision` | `stages.opd.data.optometry.vision` |
| `iop` | `stages.opd.data.optometry.iop` |
| `refraction` | `stages.opd.data.optometry.autoRefraction` |
| `diagnosis` | `stages.doctor.data.diagnosis` |
| `prescription` | `stages.doctor.data.prescription.items` |
| `notes` | `stages.doctor.data.notes` (fallback: `stages.doctor.data.followUp`) |

```python
def extract_summary_from_visit(visit):
    visit_summary = {
        "visitDate": visit.get("visitDate"),
        "iop": {},
        "vision": {},
        "refraction": {},
        "diagnosis": "",
        "prescription": [],
        "notes": ""
    }
    stages = visit.get("stages", {})

    opd = stages.get("opd", {}).get("data", {}).get("optometry", {})
    visit_summary["vision"]     = opd.get("vision", {})
    visit_summary["iop"]        = opd.get("iop", {})
    visit_summary["refraction"] = opd.get("autoRefraction", {})

    doc_data = stages.get("doctor", {}).get("data", {})
    visit_summary["diagnosis"]    = doc_data.get("diagnosis", "")
    visit_summary["prescription"] = doc_data.get("prescription", {}).get("items", [])
    visit_summary["notes"]        = doc_data.get("notes", "") or doc_data.get("followUp", "")

    return visit_summary
```

#### `get_patient_summary(patient_id, max_visits=3)`

| Item | Detail |
|------|--------|
| **Purpose** | Retrieve and summarize a patient's most recent visits from MongoDB. |
| **Parameters** | `patient_id` — 24-char hex string (MongoDB ObjectId), `max_visits` — number of latest visits to include (default 3) |
| **Returns** | `dict` with `name`, `registrationId`, `sex`, `age`, `visits[]` — or `{ "error": "..." }` on failure |

**Behaviour:**

1. Validates `patient_id` via `_coerce_object_id()`. Returns an error dict if invalid.
2. Queries `patients.find_one({ "_id": ObjectId })`.
3. Returns `{ "error": "Patient not found" }` if no document matches.
4. Slices the last `max_visits` visits and maps each through `extract_summary_from_visit()`.

**Output schema:**

```json
{
  "name": "John Doe",
  "registrationId": "REG-2025-000001",
  "sex": "Male",
  "age": "45",
  "visits": [
    {
      "visitDate": "2025-12-01",
      "iop": { "right": 14, "left": 16 },
      "vision": { "right": "6/6", "left": "6/9" },
      "refraction": {},
      "diagnosis": "Primary open-angle glaucoma",
      "prescription": [],
      "notes": "Follow-up in 3 months"
    }
  ]
}
```

---

## 5. Agent 2a — Knowledge Ingestion

**File:** `backend/agents/knowledge_ingestor.py`

This is a **one-time** offline step. It reads a PDF (or `.txt` / `.md`) reference book, chunks it, embeds each chunk, and persists them into a ChromaDB vector store.

### 5.1 Constants

| Constant | Default Value | Description |
|----------|---------------|-------------|
| `CHROMA_DIR` | `<repo_root>/vector_db/book_chunks` | Persistent ChromaDB storage path |
| `COLLECTION_NAME` | `"ophthal_book"` | ChromaDB collection name |
| `MODEL_NAME` | `"sentence-transformers/all-MiniLM-L6-v2"` | Embedding model (overridable via `EMBED_MODEL` env var) |
| `DEFAULT_SOURCE` | `<repo_root>/data/ophthalmology_reference.pdf` | Primary PDF location |
| `FALLBACK_SOURCE` | `<backend>/data/ophthalmology_reference.pdf` | Fallback PDF location |

### 5.2 Functions

#### `_get_embedder() → SentenceTransformer`

Lazy singleton. Instantiates the SentenceTransformer embedding model once. Respects `EMBED_OFFLINE` and `EMBED_CACHE_DIR` environment variables for air-gapped/offline usage.

#### `_get_collection()`

Lazy singleton. Creates (or opens) the ChromaDB persistent client and collection.

#### `_get_chroma_max_batch_size(collection) → int`

Discovers ChromaDB's internal max batch size via multiple API surface attempts. Falls back to `5000` if undiscoverable.

#### `_batched_upsert(collection, *, documents, metadatas, embeddings, ids)`

Upserts chunks into ChromaDB in batches of `max_batch_size` to avoid exceeding Chroma's per-call limit. Uses `upsert` so re-runs are idempotent.

#### `load_pdf_pages(path) → List[Tuple[int, str]]`

Extracts text from each page of a PDF via `pypdf.PdfReader`. Returns list of `(page_number, text)` tuples.

#### `load_text_file(path) → str`

Reads a plain-text file with UTF-8 encoding.

#### `chunk_text(text, chunk_size=500, chunk_overlap=50) → List[str]`

Splits cleaned text into overlapping character-level chunks.

| Parameter | Default | Description |
|-----------|---------|-------------|
| `chunk_size` | 500 chars | Maximum characters per chunk |
| `chunk_overlap` | 50 chars | Overlap between consecutive chunks (provides context continuity) |

**Algorithm:**
1. Collapse all whitespace into single spaces.
2. Slide a window of `chunk_size` characters across the text.
3. Step forward by `chunk_size - chunk_overlap` each iteration.

#### `_stable_chunk_id(source_path, page, chunk_index, chunk) → str`

Generates a deterministic, content-based ID for each chunk using SHA-1 hashing. Format: `chunk-p{page}-{index}-{hash[:12]}`. Ensures idempotent upserts.

#### `_iter_chunks(source_path) → Iterable[Tuple[str, dict, str]]`

Generator that yields `(text, metadata, chunk_id)` triples. Dispatches to `load_pdf_pages` for `.pdf` files or `load_text_file` for `.txt`/`.md` files.

**Metadata schema:**
```json
{
  "source": "path/to/file.pdf",
  "page": 42,
  "chunk_index": 3
}
```

#### `ingest_book(source_path)`

**Main entry point.** End-to-end pipeline:
1. Load source file.
2. Chunk into segments.
3. Embed all chunks with SentenceTransformer.
4. Upsert into ChromaDB.

```python
if __name__ == "__main__":
    ingest_book("backend/data/ophthalmology_reference.pdf")
```

---

## 6. Agent 2b — Knowledge Retrieval

**File:** `backend/agents/knowledge_retriever.py`

Runtime counterpart of the ingestor. Loads the persisted ChromaDB and performs semantic similarity search.

### 6.1 Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `CHROMA_DIR` | `<repo_root>/vector_db/book_chunks` | Same store the ingestor writes to |
| `COLLECTION_NAME` | `"ophthal_book"` | Same collection name |
| `MODEL_NAME` | `"sentence-transformers/all-MiniLM-L6-v2"` | Must match the ingestor's model |

### 6.2 Functions

#### `_get_embedder() → SentenceTransformer`

Identical lazy-singleton pattern as the ingestor.

#### `_get_collection()`

Opens the persistent ChromaDB client and fetches (or creates) the collection.

#### `search_knowledge(query, top_k=3) → list[str]`

| Parameter | Default | Description |
|-----------|---------|-------------|
| `query` | *(required)* | Natural-language clinical question |
| `top_k` | 3 | Number of most-similar chunks to return |

**Behaviour:**
1. Embeds the query string with SentenceTransformer.
2. Calls `collection.query(query_embeddings=[embedding], n_results=top_k)`.
3. Returns the raw text of the top-k most similar document chunks.

**Example call in the orchestration script:**

```python
guidance = search_knowledge("Interpret vision drop and stable IOP in adult patient")
```

---

## 7. Agent 3 — LLM Inference

**File:** `backend/agents/llm_agent.py`

### 7.1 Model Loading (Module-Level)

The model and tokenizer are loaded **at import time** as module-level singletons:

```python
MODEL_PATH = str(Path(__file__).resolve().parents[1] / "models" / "deepseek-1.5b")

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_use_double_quant=True,
)

tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, use_fast=True)
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

model = AutoModelForCausalLM.from_pretrained(
    MODEL_PATH,
    quantization_config=bnb_config,
    device_map="auto",
    torch_dtype=torch.float16
)
model.eval()
model.config.use_cache = True
```

**Key points:**
- The model is loaded from a **local directory** (`backend/models/deepseek-1.5b/`) — no internet required at inference time.
- 4-bit NF4 quantization with double quantization reduces VRAM usage to ~1 GB.
- `device_map="auto"` automatically distributes layers across available GPU(s) or falls back to CPU.
- `model.eval()` disables dropout for deterministic inference.
- `use_cache = True` enables KV-cache for faster auto-regressive generation.

### 7.2 Function

#### `run_summary_llm(patient_summary, knowledge_chunks, max_tokens=200) → str`

| Parameter | Type | Description |
|-----------|------|-------------|
| `patient_summary` | `dict` | Output of `get_patient_summary()` |
| `knowledge_chunks` | `list[str]` | Output of `search_knowledge()` |
| `max_tokens` | `int` | Maximum new tokens to generate (default 200) |

**Error guards (executed before prompt construction):**

```python
if not isinstance(patient_summary, dict):
    return "Error: patient summary is not a dict"

if patient_summary.get("error"):
    return f"Error: {patient_summary.get('error')}"

if "visits" not in patient_summary:
    return "Error: patient summary missing visits"
```

**Prompt construction → see [Section 10](#10-prompt-engineering).**

**Inference code:**

```python
inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

with torch.no_grad():
    output = model.generate(
        **inputs,
        max_new_tokens=max_tokens,
        temperature=0.6,
        top_p=0.9,
        do_sample=True,
        repetition_penalty=1.12,
        no_repeat_ngram_size=5,
        eos_token_id=tokenizer.eos_token_id,
        pad_token_id=tokenizer.eos_token_id
    )

response = tokenizer.decode(
    output[0][inputs["input_ids"].shape[-1]:],
    skip_special_tokens=True
)
return response.strip()
```

- `torch.no_grad()` disables gradient computation (saves memory during inference).
- Only the **newly generated** tokens are decoded (input tokens are sliced off).
- Special tokens are stripped from the output.

---

## 8. Orchestration Script

**File:** `backend/retrival_test.py`

This is the end-to-end test harness that ties all three agents together in sequence:

```python
from agents.retrival_agent1 import get_patient_summary
from agents.knowledge_retriever import search_knowledge
from agents.llm_agent import run_summary_llm

# Step 1 — Retrieve patient data from MongoDB
summary = get_patient_summary("65c4a2b3c9e5f7a1b2c3d4e5")

# Step 2 — Retrieve relevant medical knowledge chunks
guidance = search_knowledge("Interpret vision drop and stable IOP in adult patient")

# Step 3 — Generate clinical summary via LLM
result = run_summary_llm(summary, guidance)
print(result)
```

### Custom Query Used in the Test

The knowledge retrieval query hard-coded in the test is:

> **"Interpret vision drop and stable IOP in adult patient"**

This query is designed to pull textbook/guideline excerpts relevant to:
- Decreasing visual acuity
- Stable intra-ocular pressure (IOP)
- Adult patient differential diagnosis (e.g., glaucoma progression despite controlled IOP)

---

## 9. Model Details — DeepSeek-R1 1.5 B

The model is stored locally at `backend/models/deepseek-1.5b/`.

### 9.1 Architecture

| Property | Value |
|----------|-------|
| **Model family** | DeepSeek-R1 (Distilled) |
| **Base architecture** | `Qwen2ForCausalLM` |
| **Parameters** | ~1.5 Billion |
| **Hidden size** | 1536 |
| **Intermediate size** | 8960 |
| **Attention heads** | 12 |
| **KV heads (GQA)** | 2 (Grouped Query Attention — 6:1 ratio) |
| **Hidden layers** | 28 |
| **Activation** | SiLU |
| **Max position embeddings** | 131,072 tokens |
| **RoPE θ** | 10,000 |
| **Sliding window** | 4,096 tokens (defined but disabled: `use_sliding_window: false`) |
| **Max window layers** | 21 |
| **RMS norm ε** | 1×10⁻⁶ |
| **Vocab size** | 151,936 |
| **Tie word embeddings** | `false` |
| **Native dtype** | `bfloat16` |
| **License** | MIT |

### 9.2 Tokenizer

| Property | Value |
|----------|-------|
| **Class** | `LlamaTokenizerFast` |
| **BOS token** | `<｜begin▁of▁sentence｜>` (ID 151643) |
| **EOS token** | `<｜end▁of▁sentence｜>` (ID 151643) |
| **Pad token** | Set to EOS at runtime |
| **Model max length** | 16,384 tokens |
| **Add BOS** | `true` |
| **Add EOS** | `false` |

### 9.3 Generation Config (from `generation_config.json`)

| Property | Value |
|----------|-------|
| `do_sample` | `true` |
| `temperature` | 0.6 |
| `top_p` | 0.95 |
| `bos_token_id` | 151646 |
| `eos_token_id` | 151643 |

*(Note: the code overrides `top_p` to 0.9 and adds additional parameters — see [Section 12](#12-generation-hyperparameters).)*

### 9.4 Chat Template

The tokenizer includes a full Jinja2 chat template supporting:
- System prompts
- User / Assistant turns
- Tool-call and tool-output special tokens (`<｜tool▁calls▁begin｜>`, etc.)
- Chain-of-thought `<think>` sections

> **Note:** The current codebase uses a **raw-prompt approach** (not the chat template). The prompt is injected directly as a single text string.

---

## 10. Prompt Engineering

### The Complete Prompt Template

The following is the **exact prompt** constructed in `run_summary_llm()`, with placeholders shown as `{variable}`:

```
### Instruction
You are an ophthalmology AI assistant for doctors.
Write a concise, clinically useful one-paragraph summary based only on the visit history and the medical guidance excerpts.

### Patient
Name: {patient_summary['name']}
Age: {patient_summary['age']}
Sex: {patient_summary['sex']}

### Visit History
{visits_text}

### Medical Guidance (excerpts)
{context}

### One-paragraph summary
```

### Variable Definitions

| Variable | Source | Format |
|----------|--------|--------|
| `patient_summary['name']` | MongoDB `patients.name` | String |
| `patient_summary['age']` | MongoDB `patients.demographics.age` | String |
| `patient_summary['sex']` | MongoDB `patients.demographics.sex` | String |
| `visits_text` | Built from visit list | Multi-line, one bullet per visit |
| `context` | `"\n".join(knowledge_chunks)` | Newline-joined textbook excerpts |

### Visit Text Format

Each visit is formatted as a single bullet line:

```
- On {visitDate}: IOP: {iop}, Vision: {vision}, Diagnosis: {diagnosis}, Notes: {notes}
```

**Example rendered visit line:**

```
- On 2025-12-01: IOP: {'right': 14, 'left': 16}, Vision: {'right': '6/6', 'left': '6/9'}, Diagnosis: Primary open-angle glaucoma, Notes: Follow-up in 3 months
```

### Custom Knowledge Query

The embedded test question used to fetch relevant knowledge chunks is:

```
"Interpret vision drop and stable IOP in adult patient"
```

### Prompt Design Rationale

| Design Choice | Reason |
|---------------|--------|
| **Markdown-style section headers** (`### Instruction`, `### Patient`, etc.) | Clear delineation for the model to parse structured input |
| **"based only on"** phrasing | Constrains the model to avoid hallucination beyond provided data |
| **"one-paragraph"** output constraint | Keeps output concise for clinical use |
| **Role statement** ("ophthalmology AI assistant for doctors") | Primes the model for medical domain language |
| **Knowledge context at the end** | Follows RAG best practice — retrieval context placed closest to where the model begins generating |

---

## 11. Quantization Configuration

```python
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_use_double_quant=True,
)
```

| Parameter | Value | Description |
|-----------|-------|-------------|
| `load_in_4bit` | `True` | Quantize all linear layers to 4-bit precision |
| `bnb_4bit_compute_dtype` | `torch.float16` | Compute in FP16 during forward pass (balance of speed and accuracy) |
| `bnb_4bit_quant_type` | `"nf4"` | Normal-Float 4-bit — information-theoretically optimal for normally-distributed weights |
| `bnb_4bit_use_double_quant` | `True` | Quantize the quantization constants themselves, saving ~0.4 bits/param additional memory |

**Memory impact:** Reduces the 1.5 B model from ~3 GB (FP16) to ~1 GB VRAM.

---

## 12. Generation Hyperparameters

These are passed to `model.generate()` inside `run_summary_llm()`:

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `max_new_tokens` | 200 (default, configurable) | Caps output length |
| `temperature` | 0.6 | Controls randomness — lower = more deterministic. 0.6 gives slightly creative but focused clinical text |
| `top_p` | 0.9 | Nucleus sampling — considers tokens in the top 90% probability mass |
| `do_sample` | `True` | Enables stochastic sampling (vs. greedy decoding) |
| `repetition_penalty` | 1.12 | Penalizes previously generated tokens to reduce loops |
| `no_repeat_ngram_size` | 5 | Hard-blocks any 5-gram from appearing twice in output |
| `eos_token_id` | `tokenizer.eos_token_id` | Stops generation when EOS is produced |
| `pad_token_id` | `tokenizer.eos_token_id` | Prevents warnings about missing pad token |

---

## 13. Embedding & Vector Store

### Embedding Model

| Property | Value |
|----------|-------|
| **Model** | `sentence-transformers/all-MiniLM-L6-v2` |
| **Embedding dimension** | 384 |
| **Max sequence length** | 256 tokens |
| **Library** | `sentence-transformers` |

### Vector Store — ChromaDB

| Property | Value |
|----------|-------|
| **Client type** | `PersistentClient` (on-disk, no server process) |
| **Storage path** | `<repo_root>/vector_db/book_chunks/` |
| **Collection name** | `ophthal_book` |
| **Distance metric** | Cosine (ChromaDB default) |
| **Upsert strategy** | Batched, idempotent (`upsert` not `add`) |

### Chunking Configuration

| Parameter | Value |
|-----------|-------|
| Chunk size | 500 characters |
| Chunk overlap | 50 characters |
| ID generation | SHA-1 hash of `source_path + page + index + content` |

### Supported Source Formats

| Extension | Loader |
|-----------|--------|
| `.pdf` | `pypdf.PdfReader` (page-by-page) |
| `.txt` | `Path.read_text()` |
| `.md` | `Path.read_text()` |

---

## 14. Environment Variables & Configuration

All configurable via the `backend/.env` file:

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGO_URI_LOCAL` | `mongodb://localhost:27017` | MongoDB connection string |
| `DATABASE_NAME` | `hospital-emr` (`.env` overrides to `chakra_hospital`) | MongoDB database name |
| `EMBED_MODEL` | `sentence-transformers/all-MiniLM-L6-v2` | Embedding model name (HuggingFace) |
| `EMBED_CACHE_DIR` | *(unset)* | Local cache directory for the embedding model |
| `EMBED_OFFLINE` | `"0"` | Set to `"1"` to force fully offline mode (sets `HF_HUB_OFFLINE=1`) |

---

## 15. Dependencies

From `backend/requirements.txt` — LLM-specific dependencies:

| Package | Role |
|---------|------|
| `torch` | PyTorch — tensor computation and GPU acceleration |
| `transformers` | Hugging Face model loading, tokenizer, `model.generate()` |
| `bitsandbytes` | 4-bit NF4 quantization (BitsAndBytesConfig) |
| `sentence-transformers` | Embedding model for ChromaDB vector search |
| `chromadb` | Persistent vector database for knowledge chunks |
| `pypdf` | PDF text extraction for knowledge ingestion |
| `pymongo` | MongoDB driver for patient data retrieval |
| `python-dotenv` | `.env` file loading |

---

## 16. Data Flow — End-to-End

### One-Time Setup (Knowledge Ingestion)

```
ophthalmology_reference.pdf
        │
        ▼
  load_pdf_pages()          ← pypdf extracts text per page
        │
        ▼
  chunk_text(500, 50)       ← sliding-window character chunking
        │
        ▼
  SentenceTransformer.encode()  ← all-MiniLM-L6-v2 → 384-dim vectors
        │
        ▼
  ChromaDB.upsert()         ← persisted to vector_db/book_chunks/
```

### Runtime Query (Per Patient)

```
patient_id (24-char hex)
        │
        ├──► get_patient_summary(patient_id)
        │         │
        │         ▼
        │    MongoDB.find_one({ _id: ObjectId })
        │         │
        │         ▼
        │    Extract last 3 visits → { name, age, sex, visits[] }
        │
        ├──► search_knowledge("clinical question")
        │         │
        │         ▼
        │    SentenceTransformer.encode(query)
        │         │
        │         ▼
        │    ChromaDB.query(embedding, top_k=3)
        │         │
        │         ▼
        │    Return top-3 textbook chunks (list[str])
        │
        └──► run_summary_llm(patient_summary, knowledge_chunks)
                  │
                  ▼
             Build prompt (Instruction + Patient + Visits + Knowledge)
                  │
                  ▼
             tokenizer.encode() → model.generate() → tokenizer.decode()
                  │
                  ▼
             Return: one-paragraph clinical summary (str)
```

---

## 17. Error Handling

| Layer | Error | Handling |
|-------|-------|----------|
| **Agent 1** | Invalid `patient_id` (not 24-char hex) | Returns `{ "error": "Invalid patient_id ..." }` |
| **Agent 1** | Patient not found in DB | Returns `{ "error": "Patient not found" }` |
| **Agent 1** | MongoDB unreachable | `serverSelectionTimeoutMS=3000` — fails fast with PyMongo `ServerSelectionTimeoutError` |
| **Agent 3** | `patient_summary` is not a dict | Returns `"Error: patient summary is not a dict"` |
| **Agent 3** | `patient_summary` contains `"error"` key | Returns `"Error: {message}"` |
| **Agent 3** | `patient_summary` missing `"visits"` key | Returns `"Error: patient summary missing visits"` |
| **Ingestor** | Source file not found | Raises `FileNotFoundError` |
| **Ingestor** | Unsupported file type | Raises `ValueError` |
| **Ingestor** | `chunk_size` / `chunk_overlap` invalid | Raises `ValueError` with descriptive message |

---

## 18. File Tree

```
backend/
├── agents/
│   ├── retrival_agent1.py       # Agent 1: Patient data retrieval (MongoDB)
│   ├── knowledge_ingestor.py    # Agent 2a: One-time PDF → ChromaDB ingestion
│   ├── knowledge_retriever.py   # Agent 2b: Runtime semantic search
│   └── llm_agent.py             # Agent 3: LLM prompt + inference
├── models/
│   └── deepseek-1.5b/           # Local model weights & config
│       ├── config.json           #   Model architecture config
│       ├── generation_config.json#   Default generation settings
│       ├── model.safetensors     #   Model weights
│       ├── tokenizer.json        #   Tokenizer vocabulary
│       └── tokenizer_config.json #   Tokenizer settings + chat template
├── data/
│   └── ophthalmology_reference.pdf  # Source knowledge document
├── retrival_test.py             # End-to-end orchestration test
├── requirements.txt             # Python dependencies
└── .env                         # Environment configuration
```

---

*End of document.*
