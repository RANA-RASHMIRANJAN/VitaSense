# VitaSense

VitaSense is a full-stack health screening application that estimates potential vitamin deficiencies from lifestyle and wellness inputs. It combines a React frontend, an Express API, and a machine learning workflow to deliver structured risk insights and next-step recommendations.

## Highlights

- End-to-end prediction flow from user input to recommendation output
- Responsive React interface with route-based navigation
- REST API for prediction, authentication, and health checks
- Reproducible model training and evaluation scripts in Python
- Render-ready deployment blueprint via `render.yaml`

## System Architecture

### Frontend

- React 18 + TypeScript
- Tailwind CSS for styling
- Axios-based API communication
- Route protection and auth context support

### Backend

- Node.js + Express
- Security middleware (`helmet`, rate limiting, CORS)
- Auth endpoints with token-based flow
- Prediction and metrics endpoints

### ML Layer

- Python utilities for text processing, training, and evaluation
- Serialized model artifacts under `backend/models/`
- CLI utilities for local experimentation

## Repository Structure

```text
VitaSense/
├── backend/              # Express API + ML scripts + model artifacts
├── frontend/             # React client application
├── notebooks/            # Experiment and training notebooks
├── render.yaml           # Render Blueprint for web + API deployment
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 16+
- npm 8+
- Python 3.9+ (for ML utilities)

### 1) Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2) Configure Environment

Create `backend/.env` from `backend/.env.example`:

```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

Optionally create `frontend/.env.development`:

```env
REACT_APP_API_URL=http://localhost:5000
```

### 3) Run Locally

```bash
# Terminal 1 (backend)
cd backend
npm run dev

# Terminal 2 (frontend)
cd frontend
npm start
```

Application URLs:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

## API Overview

### Health Check

- `GET /api/health`  
  Returns service availability status.

### Prediction

- `POST /api/predict`  
  Accepts user health/lifestyle features and returns risk-oriented prediction output.

Example payload:

```json
{
  "age": "30",
  "gender": "male",
  "bmi": "24.5",
  "smoking": "non-smoker",
  "alcohol": "non-alcoholic",
  "exercise": "medium",
  "diet": "non-vegetarian",
  "sun": "moderate",
  "stress": "medium"
}
```

## Model Training and Evaluation

Run holdout evaluation:

```bash
python -m backend.ml.evaluate_model
```

Run k-fold evaluation:

```bash
python -m backend.ml.evaluate_model --kfold 5
```

## Deployment (Render)

This repository includes a Render Blueprint (`render.yaml`) that provisions:

- `vitasense-api` (Node web service from `backend/`)
- `vitasense-web` (static frontend from `frontend/`)

Deploy steps:

1. Push this repository to GitHub.
2. In Render, create a new Blueprint service.
3. Connect the repository and apply the blueprint.

## Quality, Security, and Scope

- Includes baseline API hardening (Helmet, CORS, rate limiting)
- Intended for educational screening and product demonstration
- Not a medical diagnostic system

## Contributing

1. Create a feature branch.
2. Make focused changes with clear commit messages.
3. Open a pull request with testing notes.

## License

This project is licensed under the MIT License. See `LICENSE` if available in the repository.

## Medical Disclaimer

VitaSense provides educational risk signals only and does not replace clinical judgment, laboratory testing, or licensed medical advice.
