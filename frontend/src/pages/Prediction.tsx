import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Activity, Heart, Sun, Brain, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';

/**
 * Call the Express API directly (CORS is enabled on the backend).
 * Avoids CRA dev-proxy POST bodies sometimes arriving empty (which caused "All fields are required").
 */
function getPredictUrl(): string {
  const base = (process.env.REACT_APP_API_URL || 'http://localhost:5000').trim().replace(/\/$/, '');
  return `${base}/api/predict`;
}

interface FormData {
  age: string;
  gender: string;
  bmi: string;
  smoking: string;
  alcohol: string;
  exercise: string;
  diet: string;
  sun: string;
  stress: string;
}

interface FormErrors {
  [key: string]: string;
}

const Prediction: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    age: '',
    gender: '',
    bmi: '',
    smoking: '',
    alcohol: '',
    exercise: '',
    diet: '',
    sun: '',
    stress: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [bmiCalcHeightCm, setBmiCalcHeightCm] = useState('');
  const [bmiCalcWeightKg, setBmiCalcWeightKg] = useState('');
  const [bmiCalcMessage, setBmiCalcMessage] = useState('');

  const formFields = [
    {
      name: 'age',
      label: 'Age',
      type: 'number',
      icon: User,
      placeholder: 'Enter your age',
      options: null,
    },
    {
      name: 'gender',
      label: 'Gender',
      type: 'select',
      icon: User,
      placeholder: 'Select gender',
      options: [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' },
      ],
    },
    {
      name: 'bmi',
      label: 'BMI',
      type: 'number',
      icon: Activity,
      placeholder: 'Enter your BMI',
      options: null,
    },
    {
      name: 'smoking',
      label: 'Smoking Status',
      type: 'select',
      icon: AlertCircle,
      placeholder: 'Select smoking status',
      options: [
        { value: 'smoker', label: 'Smoker' },
        { value: 'non-smoker', label: 'Non-Smoker' },
      ],
    },
    {
      name: 'alcohol',
      label: 'Alcoholic Status',
      type: 'select',
      icon: AlertCircle,
      placeholder: 'Select alcohol status',
      options: [
        { value: 'alcoholic', label: 'Alcoholic' },
        { value: 'non-alcoholic', label: 'Non-Alcoholic' },
      ],
    },
    {
      name: 'exercise',
      label: 'Exercise Level',
      type: 'select',
      icon: Activity,
      placeholder: 'Select exercise level',
      options: [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
      ],
    },
    {
      name: 'diet',
      label: 'Diet Type',
      type: 'select',
      icon: Heart,
      placeholder: 'Select diet type',
      options: [
        { value: 'vegetarian', label: 'Vegetarian' },
        { value: 'non-vegetarian', label: 'Non-Vegetarian' },
        { value: 'vegan', label: 'Vegan' },
      ],
    },
    {
      name: 'sun',
      label: 'Sun Exposure',
      type: 'select',
      icon: Sun,
      placeholder: 'Select sun exposure',
      options: [
        { value: 'low', label: 'Low' },
        { value: 'moderate', label: 'Moderate' },
        { value: 'high', label: 'High' },
      ],
    },
    {
      name: 'stress',
      label: 'Stress Level',
      type: 'select',
      icon: Brain,
      placeholder: 'Select stress level',
      options: [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
      ],
    },
  ];

  const fieldLabels: Record<string, string> = {
    gender: 'Gender',
    smoking: 'Smoking status',
    alcohol: 'Alcohol status',
    exercise: 'Exercise level',
    diet: 'Diet type',
    sun: 'Sun exposure',
    stress: 'Stress level',
  };

  const applyCalculatedBmi = () => {
    const h = parseFloat(bmiCalcHeightCm);
    const w = parseFloat(bmiCalcWeightKg);
    if (!h || !w || h < 50 || h > 260 || w < 20 || w > 300) {
      setBmiCalcMessage('Enter height (cm, 50–260) and weight (kg, 20–300).');
      return;
    }
    const m = h / 100;
    const bmi = w / (m * m);
    const rounded = Math.round(bmi * 10) / 10;
    setFormData(prev => ({ ...prev, bmi: String(rounded) }));
    setBmiCalcMessage(`BMI set to ${rounded}. You can edit the field if needed.`);
    setErrors(prev => ({ ...prev, bmi: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Age validation
    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (parseInt(formData.age) < 1 || parseInt(formData.age) > 120) {
      newErrors.age = 'Age must be between 1 and 120';
    }

    // BMI validation
    if (!formData.bmi) {
      newErrors.bmi = 'BMI is required';
    } else if (parseFloat(formData.bmi) < 10 || parseFloat(formData.bmi) > 50) {
      newErrors.bmi = 'BMI must be between 10 and 50';
    }

    // Required field validation for selects
    ['gender', 'smoking', 'alcohol', 'exercise', 'diet', 'sun', 'stress'].forEach(field => {
      if (!formData[field as keyof FormData]) {
        newErrors[field] = `${fieldLabels[field] || field} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setSubmitError(null);

    try {
      const response = await axios.post(getPredictUrl(), formData, {
        headers: token
          ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
          : { 'Content-Type': 'application/json' },
      });
      navigate('/result', { state: { prediction: response.data, formData } });
    } catch (error: unknown) {
      console.error('Prediction error:', error);
      let message = 'Could not reach the prediction API.';
      if (axios.isAxiosError(error)) {
        if (error.code === 'ERR_NETWORK' || !error.response) {
          message =
            'Network error: start the API (`cd backend && npm start`). It must listen on the same host/port as REACT_APP_API_URL in frontend/.env.development (default http://localhost:5000). If the backend picked another port, update that file and restart `npm start` in frontend.';
        } else if (error.response?.data?.message) {
          const data = error.response.data as { message?: string; missing?: string[] };
          message = String(data.message);
          if (Array.isArray(data.missing) && data.missing.length > 0) {
            message += ` (${data.missing.join(', ')})`;
          }
        } else if (error.response?.status) {
          message = `Request failed (${error.response.status}). Check the form and try again.`;
        }
      }
      setSubmitError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      age: '',
      gender: '',
      bmi: '',
      smoking: '',
      alcohol: '',
      exercise: '',
      diet: '',
      sun: '',
      stress: '',
    });
    setErrors({});
    setSubmitError(null);
    setBmiCalcHeightCm('');
    setBmiCalcWeightKg('');
    setBmiCalcMessage('');
  };

  const getProgressPercentage = () => {
    const filledFields = Object.values(formData).filter(value => value !== '').length;
    return Math.round((filledFields / Object.keys(formData).length) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Health Assessment Form
          </h1>
          <p className="text-xl text-gray-600">
            Fill in your health and lifestyle information for personalized vitamin deficiency prediction
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8 animate-slide-in">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Form Completion</span>
              <span className="text-sm font-medium text-purple-600">{getProgressPercentage()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {formFields.map((field, index) => {
                const Icon = field.icon;

                if (field.name === 'bmi') {
                  return (
                    <div
                      key="bmi"
                      className="md:col-span-2 animate-slide-in space-y-4"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <label className="form-label flex items-center space-x-2">
                        <Icon className="h-4 w-4 text-purple-600" />
                        <span>{field.label}</span>
                      </label>
                      <div className="grid md:grid-cols-2 gap-4 items-start">
                        <div>
                          <input
                            type="number"
                            name="bmi"
                            value={formData.bmi}
                            onChange={handleInputChange}
                            placeholder={field.placeholder}
                            min="10"
                            max="50"
                            step="0.1"
                            className={`form-input ${errors.bmi ? 'border-red-500' : ''}`}
                          />
                          {errors.bmi && (
                            <div className="flex items-center space-x-1 mt-1 text-red-500 text-sm">
                              <AlertCircle className="h-4 w-4" />
                              <span>{errors.bmi}</span>
                            </div>
                          )}
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
                          <p className="text-sm font-semibold text-gray-800">BMI calculator</p>
                          <p className="text-xs text-gray-600">
                            If you do not know your BMI, enter height (cm) and weight (kg), then apply.
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Height (cm)</label>
                              <input
                                type="number"
                                value={bmiCalcHeightCm}
                                onChange={e => setBmiCalcHeightCm(e.target.value)}
                                placeholder="e.g. 170"
                                min="50"
                                max="260"
                                className="form-input text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Weight (kg)</label>
                              <input
                                type="number"
                                value={bmiCalcWeightKg}
                                onChange={e => setBmiCalcWeightKg(e.target.value)}
                                placeholder="e.g. 70"
                                min="20"
                                max="300"
                                className="form-input text-sm"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={applyCalculatedBmi}
                            className="w-full rounded-md bg-purple-600 px-3 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
                          >
                            Use calculated BMI
                          </button>
                          {bmiCalcMessage && (
                            <p className="text-xs text-purple-700">{bmiCalcMessage}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={field.name}
                    className="animate-slide-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <label className="form-label flex items-center space-x-2">
                      <Icon className="h-4 w-4 text-purple-600" />
                      <span>{field.label}</span>
                    </label>

                    {field.type === 'select' ? (
                      <select
                        name={field.name}
                        value={formData[field.name as keyof FormData]}
                        onChange={handleInputChange}
                        className={`form-input ${errors[field.name] ? 'border-red-500' : ''}`}
                      >
                        <option value="">{field.placeholder}</option>
                        {field.options?.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        name={field.name}
                        value={formData[field.name as keyof FormData]}
                        onChange={handleInputChange}
                        placeholder={field.placeholder}
                        min={field.name === 'age' ? '1' : undefined}
                        max={field.name === 'age' ? '120' : undefined}
                        className={`form-input ${errors[field.name] ? 'border-red-500' : ''}`}
                      />
                    )}

                    {errors[field.name] && (
                      <div className="flex items-center space-x-1 mt-1 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors[field.name]}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {submitError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Prediction did not run</p>
                    <p className="mt-1">{submitError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary flex-1 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Predict</span>
                    <CheckCircle className="h-5 w-5" />
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleReset}
                disabled={isLoading}
                className="btn-secondary flex-1"
              >
                Reset Form
              </button>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg animate-fade-in">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Privacy & Accuracy
              </h3>
              <p className="text-blue-700">
                Your health data is processed securely and anonymously. The predictions are based on 
                machine learning algorithms trained on extensive health datasets. Always consult with 
                healthcare professionals for medical advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prediction;
