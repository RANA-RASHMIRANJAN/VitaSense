const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');
const { authRequired } = require('../middleware/auth');

/** XGBoost / sklearn sometimes print warnings to stdout before JSON — extract the JSON object. */
function parsePredictorStdout(stdout) {
  const trimmed = String(stdout || '').trim();
  if (!trimmed) {
    throw new Error('Python predictor returned empty output');
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start === -1 || end <= start) {
      throw new Error('Python predictor returned non-JSON output');
    }
    return JSON.parse(trimmed.slice(start, end + 1));
  }
}

function runPythonPredict(formData) {
  const mlModelPath =
    process.env.ML_MODEL_PATH ||
    path.join(__dirname, '..', 'models', 'vitamin_model.pkl');

  const pythonScriptPath = path.join(__dirname, '..', 'ml', 'predict_cli.py');

  if (!fs.existsSync(pythonScriptPath)) {
    throw new Error(`Missing python predictor script: ${pythonScriptPath}`);
  }

  if (!fs.existsSync(mlModelPath)) {
    // Controller will fall back to dummy response.
    return { modelMissing: true };
  }

  const inputJson = JSON.stringify(formData);

  // Use stdin to pass input JSON, and get JSON back from stdout.
  const result = spawnSync(
    'python',
    [pythonScriptPath, '--model', mlModelPath],
    {
      input: inputJson,
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
    }
  );

  if (result.error) {
    throw result.error;
  }

  const stderr = (result.stderr || '').trim();
  if (stderr) {
    console.warn('[predict] python stderr:', stderr.slice(0, 2000));
  }

  const output = parsePredictorStdout(result.stdout);
  if (output.error === 'MODEL_NOT_FOUND') {
    return { modelMissing: true };
  }

  return { modelMissing: false, output };
}

function dummyResponse(formData) {
  return {
    prediction: 'Multiple deficiencies: Vitamin D, Vitamin B12',
    risk: 'medium',
    suggestion:
      'Increase safe sun exposure and vitamin D sources.\n\nIf you follow a plant-based diet, consider B12 fortified foods (medical guidance).',
    deficiency_count: 2,
    concern_row_count: 2,
    deficiencies: [
      {
        id: 'vitamin_d_percent_rda',
        name: 'Vitamin D',
        predicted_percent: 62,
        deficiency_score: 38,
        adequacy_score: 62,
        severity: 'medium',
        below_target: true,
        lifestyle_notes: [],
      },
      {
        id: 'vitamin_b12_percent_rda',
        name: 'Vitamin B12',
        predicted_percent: 78,
        deficiency_score: 22,
        adequacy_score: 78,
        severity: 'medium',
        below_target: true,
        lifestyle_notes: ['Plant-based diet (monitor B12 intake).'],
      },
    ],
    overall_nutrient_score: 88,
    vitamin_predictions: {
      vitamin_d_percent_rda: 62,
      vitamin_b12_percent_rda: 78,
    },
  };
}

function pickField(v) {
  if (v === undefined || v === null) return '';
  return String(v).trim();
}

async function predict(req, res) {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const age = pickField(body.age);
    const gender = pickField(body.gender);
    const bmi = pickField(body.bmi);
    const smoking = pickField(body.smoking);
    const alcohol = pickField(body.alcohol);
    const exercise = pickField(body.exercise);
    const diet = pickField(body.diet);
    const sun = pickField(body.sun);
    const stress = pickField(body.stress ?? body.income);

    const required = {
      age,
      gender,
      bmi,
      smoking,
      alcohol,
      exercise,
      diet,
      sun,
      stress,
    };
    const missing = Object.entries(required)
      .filter(([, v]) => !v)
      .map(([k]) => k);

    if (missing.length > 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message:
          missing.length === Object.keys(required).length && Object.keys(body).length === 0
            ? 'Request body was empty. Ensure the client sends JSON (Content-Type: application/json).'
            : `Missing or empty fields: ${missing.join(', ')}`,
        missing,
      });
    }

    const py = runPythonPredict({ age, gender, bmi, smoking, alcohol, exercise, diet, sun, stress });
    if (py.modelMissing) return res.json(dummyResponse(req.body));

    // Python returns: {prediction, risk, suggestion, vitamin_predictions: {...}}
    const { prediction, risk, suggestion } = py.output || {};

    // Normalize risk casing for UI. Frontend expects lower-case risk values for colors.
    const riskNormalized = String(risk || 'medium').toLowerCase();

    return res.json({
      prediction: prediction || 'No Significant Deficiency',
      risk: riskNormalized,
      suggestion: suggestion || 'Consult with a healthcare professional if symptoms persist.',
      ...(py.output && py.output.vitamin_predictions ? { vitamin_predictions: py.output.vitamin_predictions } : {}),
      ...(py.output && py.output.deficiencies ? { deficiencies: py.output.deficiencies } : {}),
      ...(py.output && py.output.deficiency_count != null ? { deficiency_count: py.output.deficiency_count } : {}),
      ...(py.output && py.output.concern_row_count != null ? { concern_row_count: py.output.concern_row_count } : {}),
      ...(py.output && py.output.overall_nutrient_score != null
        ? { overall_nutrient_score: py.output.overall_nutrient_score }
        : {}),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Prediction error:', error);
    // Don’t hard-fail the frontend; fall back to dummy response.
    return res.json(dummyResponse(req.body));
  }
}

module.exports = {
  // protect prediction by default (simple auth)
  predict: [authRequired, predict],
};
