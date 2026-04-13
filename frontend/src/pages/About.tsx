import React from 'react';
import { Brain, Shield, Activity, Heart, Sun, Apple } from 'lucide-react';

const About: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: 'Lifestyle Analysis',
      description: 'Comprehensive analysis of your daily habits, diet, and health patterns to identify potential risk factors for vitamin deficiencies.',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: Shield,
      title: 'Health Risk Detection',
      description: 'Early detection system that identifies warning signs and potential vitamin deficiencies before they become serious health issues.',
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: Activity,
      title: 'AI Based Prediction',
      description: 'Advanced machine learning algorithms trained on extensive health data to provide accurate predictions and personalized recommendations.',
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  const vitaminInfo = [
    {
      icon: Sun,
      title: 'Vitamin D',
      description: 'Essential for bone health and immune function. Common deficiency in areas with limited sunlight.',
      deficiency: 'Fatigue, bone pain, muscle weakness',
    },
    {
      icon: Heart,
      title: 'Vitamin B12',
      description: 'Crucial for nerve function and red blood cell formation. Common in vegetarians and older adults.',
      deficiency: 'Anemia, fatigue, neurological symptoms',
    },
    {
      icon: Apple,
      title: 'Vitamin C',
      description: 'Important for immune system and skin health. Found in fruits and vegetables.',
      deficiency: 'Scurvy, poor wound healing, weakened immunity',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            About Vitamin Deficiency
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Understanding how vitamins affect your health and how lifestyle factors influence deficiency risks
          </p>
        </div>
      </section>

      {/* What is Vitamin Deficiency */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                What is Vitamin Deficiency?
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Vitamin deficiency occurs when your body doesn't get enough of the essential vitamins it needs to function properly. 
                  These micronutrients play crucial roles in metabolism, immunity, and overall health.
                </p>
                <p>
                  Modern lifestyles, dietary restrictions, and environmental factors can contribute to vitamin deficiencies, 
                  even in developed countries. Early detection and prevention are key to maintaining optimal health.
                </p>
                <p>
                  Our prediction system helps identify potential deficiencies based on your lifestyle factors, 
                  allowing you to take proactive steps toward better health.
                </p>
              </div>
            </div>
            <div className="animate-slide-in">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">2B+</div>
                    <div className="text-sm text-gray-600">People affected globally</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">13</div>
                    <div className="text-sm text-gray-600">Essential vitamins</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">40%</div>
                    <div className="text-sm text-gray-600">Have deficiencies</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">85%</div>
                    <div className="text-sm text-gray-600">Preventable</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How Lifestyle Affects Health */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              How Lifestyle Affects Your Health
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your daily habits and choices significantly impact your vitamin levels and overall health
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="feature-card animate-slide-in"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="flex justify-center mb-6">
                    <div className={`p-4 rounded-full ${feature.color}`}>
                      <Icon className="h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Common Vitamin Deficiencies */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Common Vitamin Deficiencies
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Learn about the most common vitamin deficiencies and their impact on your health
            </p>
          </div>

          <div className="space-y-8">
            {vitaminInfo.map((vitamin, index) => {
              const Icon = vitamin.icon;
              return (
                <div
                  key={index}
                  className="bg-gray-50 rounded-xl p-8 animate-fade-in"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Icon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800 mb-3">
                        {vitamin.title}
                      </h3>
                      <p className="text-gray-600 mb-3">
                        {vitamin.description}
                      </p>
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <div className="text-sm font-medium text-yellow-800 mb-1">
                          Common Deficiency Symptoms:
                        </div>
                        <div className="text-sm text-yellow-700">
                          {vitamin.deficiency}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 px-4 gradient-bg text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Powered by Advanced Technology
          </h2>
          <p className="text-xl mb-12 opacity-95 max-w-3xl mx-auto">
            Our prediction system uses cutting-edge machine learning algorithms trained on 
            extensive health datasets to provide accurate and personalized insights.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl font-bold mb-2">95%</div>
              <div className="opacity-90">Accuracy Rate</div>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl font-bold mb-2">50K+</div>
              <div className="opacity-90">Training Samples</div>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="opacity-90">Available</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
