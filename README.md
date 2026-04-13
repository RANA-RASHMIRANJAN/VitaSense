# Vitamin Deficiency Prediction System

A modern full-stack web application that uses machine learning to predict vitamin deficiencies based on lifestyle and health data.

## 🚀 Features

- **Modern UI/UX**: Built with React, TypeScript, and Tailwind CSS
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Interactive Forms**: Real-time validation and progress tracking
- **AI-Powered Predictions**: Machine learning model for vitamin deficiency analysis
- **Comprehensive Results**: Detailed health recommendations and risk assessment
- **Educational Content**: Health tips and vitamin information

## 📁 Project Structure

```
vitamin-ml-project/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── App.tsx         # Main App component
│   │   └── index.tsx       # Entry point
│   ├── public/             # Static assets
│   ├── package.json        # Frontend dependencies
│   └── tailwind.config.js  # Tailwind CSS configuration
└── backend/                 # Express.js backend API
    ├── controllers/        # Route controllers
    ├── routes/            # API routes
    ├── server.js          # Main server file
    └── package.json       # Backend dependencies
```

## 🛠️ Technologies Used

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security headers
- **Morgan** - HTTP request logger
- **Rate Limiting** - API rate limiting

## 📋 Pages

1. **Home** - Hero section with introduction and features
2. **About** - Information about vitamin deficiencies and the system
3. **Prediction** - Interactive form for health assessment
4. **Result** - Prediction results with recommendations
5. **Health Tips** - Educational content and guidelines

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vitamin-ml-project
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   The API will be available at `http://localhost:5000`

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm start
   ```
   The application will be available at `http://localhost:3000`

## 📡 API Endpoints

### POST /api/predict
Predict vitamin deficiency based on health data.

**Request Body:**
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

**Important medical note:** This is an educational screening tool and not a medical diagnosis. Vitamin deficiency is typically
confirmed using clinical context and laboratory biomarkers.

## 📏 Model evaluation

Run per-target metrics (MAE / R²) on a holdout split:

```bash
python -m backend.ml.evaluate_model
```

Run K-Fold cross validation (example: 5 folds):

```bash
python -m backend.ml.evaluate_model --kfold 5
```

**Response:**
```json
{
  "prediction": "Vitamin D Deficiency",
  "risk": "Medium",
  "suggestion": "Increase sun exposure and consume vitamin D rich foods",
  "riskScore": 3,
  "confidence": "Medium",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "factors": ["Low sun exposure", "Vegetarian diet"]
}
```

### GET /api/health
Health check endpoint to verify API status.

## 🔧 Configuration

### Backend Configuration
Create a `.env` file in the backend directory based on `.env.example`:

```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Frontend Configuration
The frontend is configured to work with the backend running on `http://localhost:5000`. Update the API URL in the prediction service if needed.

## 🎨 Customization

### Adding New Pages
1. Create a new component in `frontend/src/pages/`
2. Add the route in `frontend/src/App.tsx`
3. Update the navigation in `frontend/src/components/Navbar.tsx`

### Modifying the Prediction Logic
The prediction logic is located in `backend/controllers/prediction.js`. This can be replaced with actual ML model integration.

### Styling
The application uses Tailwind CSS. Modify `tailwind.config.js` for theme customization.

## 🔮 Future Enhancements

- Integration with real ML models (Python/Scikit-learn, TensorFlow)
- User authentication and profile management
- Database integration for storing predictions
- Advanced analytics and reporting
- Mobile application
- Real-time notifications
- Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This application is for educational purposes only and should not be used as a substitute for professional medical advice. Always consult with qualified healthcare professionals for medical diagnosis and treatment.

## 📞 Support

For support and questions, please open an issue in the GitHub repository.
