import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle, Info, ArrowLeft, Download, Share2 } from 'lucide-react';

const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/$/, '');

interface DeficiencyRow {
  id: string;
  name: string;
  predicted_percent: number;
  deficiency_score: number;
  adequacy_score: number;
  severity: string;
  below_target?: boolean;
  lifestyle_notes?: string[];
}

interface LocationState {
  prediction: {
    prediction: string;
    risk: string;
    suggestion: string;
    disclaimer?: string;
    model_metrics?: {
      overall?: { mae?: number; r2?: number };
      per_target?: Array<{ target: string; mae: number; r2: number }>;
    };
    vitamin_predictions?: Record<string, number>;
    deficiencies?: DeficiencyRow[];
    deficiency_count?: number;
    concern_row_count?: number;
    overall_nutrient_score?: number;
  };
  formData: {
    [key: string]: string;
  };
}

const Result: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  if (!state || !state.prediction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No Prediction Data</h1>
          <p className="text-gray-600 mb-6">Please complete the prediction form first.</p>
          <button
            onClick={() => navigate('/prediction')}
            className="btn-primary"
          >
            Go to Prediction Form
          </button>
        </div>
      </div>
    );
  }

  const { prediction, formData } = state;

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low':
        return 'risk-low';
      case 'medium':
        return 'risk-medium';
      case 'high':
        return 'risk-high';
      default:
        return 'risk-medium';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low':
        return CheckCircle;
      case 'medium':
        return AlertTriangle;
      case 'high':
        return AlertTriangle;
      default:
        return Info;
    }
  };

  const RiskIcon = getRiskIcon(prediction.risk);

  const inputLabels: Record<string, string> = {
    stress: 'Stress level',
    sun: 'Sun exposure',
    diet: 'Diet type',
    bmi: 'BMI',
    age: 'Age',
    gender: 'Gender',
    smoking: 'Smoking',
    alcohol: 'Alcohol',
    exercise: 'Exercise',
  };

  const formatInputKey = (key: string) => inputLabels[key] || key.replace(/([A-Z])/g, ' $1').trim();

  const handleDownload = () => {
    const reportData = {
      prediction: prediction.prediction,
      risk: prediction.risk,
      suggestion: prediction.suggestion,
      model_metrics: prediction.model_metrics,
      deficiencies: prediction.deficiencies,
      deficiency_count: prediction.deficiency_count,
      concern_row_count: prediction.concern_row_count,
      overall_nutrient_score: prediction.overall_nutrient_score,
      vitamin_predictions: prediction.vitamin_predictions,
      formData: formData,
      date: new Date().toLocaleDateString(),
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `vitamin-prediction-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Vitamin Deficiency Prediction Results',
          text: `My prediction: ${prediction.prediction} with ${prediction.risk} risk level.`,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      const text = `My vitamin deficiency prediction: ${prediction.prediction} with ${prediction.risk} risk level.`;
      navigator.clipboard.writeText(text);
      alert('Results copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <button
            onClick={() => navigate('/prediction')}
            className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Prediction</span>
          </button>
          
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Your Prediction Results
          </h1>
          <p className="text-xl text-gray-600">
            Based on your health and lifestyle assessment
          </p>
        </div>

        {/* Main Result Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 animate-slide-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-4">
              <RiskIcon className="h-10 w-10 text-purple-600" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {prediction.prediction}
            </h2>
            
            <div className={`risk-indicator ${getRiskColor(prediction.risk)} text-lg px-4 py-2 mb-4 capitalize`}>
              Risk level: {prediction.risk}
            </div>

            {prediction.overall_nutrient_score != null && (
              <p className="text-gray-600 text-lg mb-2">
                Overall nutrient score (mean % of RDA):{' '}
                <span className="font-semibold text-gray-900">{prediction.overall_nutrient_score}</span>
              </p>
            )}
            {prediction.deficiencies && prediction.deficiencies.length > 0 && (
              <p className="text-sm text-gray-600 mb-4">
                <span className="font-semibold text-gray-800">{prediction.deficiency_count ?? 0}</span> below 100% RDA
                {prediction.concern_row_count != null && prediction.concern_row_count > (prediction.deficiency_count ?? 0)
                  ? (
                    <>
                      {' · '}
                      <span className="font-semibold text-gray-800">{prediction.concern_row_count}</span> total rows
                      (includes lifestyle-linked focuses)
                    </>
                    )
                  : null}
              </p>
            )}
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-6">
            <p className="text-yellow-900 text-sm">
              <span className="font-semibold">Medical note:</span>{' '}
              {prediction.disclaimer ||
                'This is an educational screening tool and not a medical diagnosis. Confirm vitamin deficiency with clinical context and lab testing.'}
            </p>
          </div>

          {!prediction.model_metrics && (
            <div className="mb-6">
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch(`${API_BASE}/api/metrics/model`);
                    if (!res.ok) return;
                    const data = await res.json();
                    // Attach metrics to the in-memory state so it shows without needing refetch on refresh.
                    // (This page is navigated-to with state; we keep it simple and mutate locally.)
                    (prediction as any).model_metrics = data;
                    // Force a repaint by navigating to same route with updated state.
                    navigate('/result', { replace: true, state: { prediction, formData } });
                  } catch {
                    // ignore
                  }
                }}
                className="btn-secondary"
              >
                Load model quality metrics
              </button>
            </div>
          )}

          {prediction.model_metrics?.overall && (
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Model quality (dataset metrics)</h3>
              <p className="text-sm text-gray-700">
                Overall MAE: <span className="font-semibold">{prediction.model_metrics.overall.mae}</span>
                {' · '}
                Overall R²: <span className="font-semibold">{prediction.model_metrics.overall.r2}</span>
              </p>
              <p className="text-xs text-gray-500 mt-2">
                These are regression metrics on the training dataset split / cross-validation. They do not represent clinical diagnostic accuracy.
              </p>
            </div>
          )}

          {prediction.deficiencies && prediction.deficiencies.length > 0 && (
            <div className="mb-8 overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Nutrient</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">&lt;100% RDA</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Predicted % RDA</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Gap / focus score</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Adequacy score</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Severity</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Lifestyle notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {prediction.deficiencies.map(d => (
                    <tr key={d.id}>
                      <td className="px-4 py-3 font-medium text-gray-900">{d.name}</td>
                      <td className="px-4 py-3 text-center text-gray-700">
                        {(d.below_target ?? d.predicted_percent < 100) ? (
                          <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">Yes</span>
                        ) : (
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">{d.predicted_percent}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{d.deficiency_score}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{d.adequacy_score}</td>
                      <td className="px-4 py-3 capitalize text-gray-700">{d.severity}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 max-w-xs">
                        {(d.lifestyle_notes && d.lifestyle_notes.length > 0) ? d.lifestyle_notes.join(' ') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-t border-gray-200">
                This app estimates nutrient adequacy (% of RDA) from lifestyle inputs. In medicine, deficiency is usually confirmed
                by symptoms + laboratory biomarkers (e.g., 25‑OH vitamin D, B12, ferritin/iron studies). Use this output to decide
                whether to discuss testing and diet changes with a clinician.
              </p>
            </div>
          )}

          {prediction.vitamin_predictions && Object.keys(prediction.vitamin_predictions).length > 0 && (
            <div className="mb-8 rounded-lg border border-gray-200 overflow-x-auto">
              <h3 className="text-lg font-semibold text-gray-800 px-4 py-3 bg-gray-50 border-b border-gray-200">
                All nutrients (model output, % of RDA)
              </h3>
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Nutrient</th>
                    <th className="px-4 py-2 text-right font-semibold text-gray-700">% RDA</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Band</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Object.entries(prediction.vitamin_predictions)
                    .sort(([, a], [, b]) => Number(a) - Number(b))
                    .map(([key, val]) => {
                      const v = Number(val);
                      const band = v < 80 ? 'Low' : v < 100 ? 'Below target' : v < 112 ? 'Adequate / watch' : 'Adequate';
                      const bandClass =
                        v < 80 ? 'text-red-700 font-medium' : v < 100 ? 'text-amber-800 font-medium' : 'text-gray-700';
                      const label = key.replace(/_percent_rda/g, '').replace(/_/g, ' ');
                      return (
                        <tr key={key}>
                          <td className="px-4 py-2 capitalize text-gray-800">{label}</td>
                          <td className="px-4 py-2 text-right tabular-nums">{v}</td>
                          <td className={`px-4 py-2 ${bandClass}`}>{band}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}

          {/* Suggestions */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg mb-8">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  Health Suggestions
                </h3>
                <p className="text-blue-700 whitespace-pre-line">
                  {prediction.suggestion}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleDownload}
              className="btn-secondary flex items-center justify-center space-x-2"
            >
              <Download className="h-5 w-5" />
              <span>Download Report</span>
            </button>
            
            <button
              onClick={handleShare}
              className="btn-secondary flex items-center justify-center space-x-2"
            >
              <Share2 className="h-5 w-5" />
              <span>Share Results</span>
            </button>
          </div>
        </div>

        {/* Detailed Analysis */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 animate-fade-in">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            Detailed Analysis
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-4">
                Your Input Data
              </h4>
              <div className="space-y-3">
                {Object.entries(formData).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600 capitalize">
                      {formatInputKey(key)}
                    </span>
                    <span className="font-medium text-gray-800 capitalize">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-4">
                Risk Factors
              </h4>
              <div className="space-y-3">
                {formData.smoking === 'smoker' && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Smoking increases deficiency risk</span>
                  </div>
                )}
                {formData.alcohol === 'alcoholic' && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Alcohol affects vitamin absorption</span>
                  </div>
                )}
                {formData.exercise === 'low' && (
                  <div className="flex items-center space-x-2 text-yellow-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Low exercise may impact metabolism</span>
                  </div>
                )}
                {formData.sun === 'low' && (
                  <div className="flex items-center space-x-2 text-yellow-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Low sun exposure affects Vitamin D</span>
                  </div>
                )}
                {(formData.stress === 'high' || formData.stress === 'medium') && (
                  <div className="flex items-center space-x-2 text-yellow-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Higher stress can affect eating patterns and nutrient status</span>
                  </div>
                )}
                {(formData.diet === 'vegetarian' || formData.diet === 'vegan') && (
                  <div className="flex items-center space-x-2 text-yellow-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Plant-based diet may need B12 supplementation</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-8 animate-fade-in">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            Personalized Recommendations
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-700 mb-3">
                Immediate Actions
              </h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Consult with a healthcare professional</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Consider blood testing for vitamin levels</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Review your diet with a nutritionist</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-700 mb-3">
                Lifestyle Changes
              </h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Maintain balanced diet rich in vitamins</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Get regular moderate exercise</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Ensure adequate sleep and stress management</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg mt-8 animate-fade-in">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                Medical Disclaimer
              </h3>
              <p className="text-yellow-700">
                This prediction is for educational purposes only and should not be considered as medical advice. 
                Always consult with qualified healthcare professionals for diagnosis and treatment. 
                The predictions are based on machine learning models and may not be 100% accurate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Result;
