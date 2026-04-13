import React from 'react';
import { Heart, Sun, Activity, Apple, Shield, Brain, Droplets, Moon } from 'lucide-react';

const HealthTips: React.FC = () => {
  const tips = [
    {
      icon: Apple,
      title: 'Maintain Balanced Diet',
      description: 'Eat a variety of fruits, vegetables, whole grains, and lean proteins to ensure you get all essential vitamins and minerals.',
      color: 'bg-green-100 text-green-600',
      tips: [
        'Include colorful fruits and vegetables in every meal',
        'Choose whole grains over refined grains',
        'Opt for lean protein sources like fish, poultry, and legumes',
        'Limit processed foods and added sugars',
      ],
    },
    {
      icon: Sun,
      title: 'Get Enough Sunlight',
      description: 'Natural sunlight is crucial for Vitamin D production, which supports bone health and immune function.',
      color: 'bg-yellow-100 text-yellow-600',
      tips: [
        'Aim for 10-15 minutes of sun exposure daily',
        'Best times are early morning or late afternoon',
        'Expose arms and legs for better Vitamin D synthesis',
        'Use sunscreen after initial exposure time',
      ],
    },
    {
      icon: Activity,
      title: 'Exercise Regularly',
      description: 'Regular physical activity improves nutrient absorption, circulation, and overall health.',
      color: 'bg-blue-100 text-blue-600',
      tips: [
        'Aim for 150 minutes of moderate exercise per week',
        'Include both cardio and strength training',
        'Try outdoor activities for combined sun exposure',
        'Stay hydrated during physical activity',
      ],
    },
    {
      icon: Shield,
      title: 'Avoid Smoking',
      description: 'Smoking interferes with vitamin absorption and increases the risk of deficiencies.',
      color: 'bg-red-100 text-red-600',
      tips: [
        'Seek professional help to quit smoking',
        'Consider nicotine replacement therapy',
        'Join support groups for motivation',
        'Avoid secondhand smoke exposure',
      ],
    },
    {
      icon: Brain,
      title: 'Manage Stress',
      description: 'Chronic stress can deplete essential vitamins and affect overall health.',
      color: 'bg-purple-100 text-purple-600',
      tips: [
        'Practice meditation or deep breathing exercises',
        'Get adequate sleep (7-9 hours nightly)',
        'Engage in hobbies you enjoy',
        'Consider yoga or tai chi for stress relief',
      ],
    },
    {
      icon: Droplets,
      title: 'Stay Hydrated',
      description: 'Proper hydration is essential for nutrient absorption and overall bodily functions.',
      color: 'bg-cyan-100 text-cyan-600',
      tips: [
        'Drink at least 8 glasses of water daily',
        'Increase intake during hot weather or exercise',
        'Limit caffeinated and sugary beverages',
        'Eat water-rich fruits and vegetables',
      ],
    },
    {
      icon: Moon,
      title: 'Quality Sleep',
      description: 'Good sleep is vital for vitamin absorption, hormone regulation, and cellular repair.',
      color: 'bg-indigo-100 text-indigo-600',
      tips: [
        'Maintain a consistent sleep schedule',
        'Create a relaxing bedtime routine',
        'Keep bedroom dark and cool',
        'Avoid screens 1 hour before bedtime',
      ],
    },
    {
      icon: Heart,
      title: 'Regular Check-ups',
      description: 'Regular health monitoring helps detect deficiencies early and maintain optimal health.',
      color: 'bg-pink-100 text-pink-600',
      tips: [
        'Schedule annual health check-ups',
        'Get blood tests for vitamin levels periodically',
        'Discuss supplements with your healthcare provider',
        'Keep track of any symptoms or changes',
      ],
    },
  ];

  const vitaminSources = [
    {
      vitamin: 'Vitamin A',
      sources: ['Carrots', 'Sweet potatoes', 'Spinach', 'Kale', 'Liver'],
      benefit: 'Vision and immune health',
    },
    {
      vitamin: 'Vitamin B Complex',
      sources: ['Whole grains', 'Meat', 'Eggs', 'Legumes', 'Leafy greens'],
      benefit: 'Energy metabolism and nerve function',
    },
    {
      vitamin: 'Vitamin C',
      sources: ['Citrus fruits', 'Berries', 'Bell peppers', 'Broccoli', 'Tomatoes'],
      benefit: 'Immune system and skin health',
    },
    {
      vitamin: 'Vitamin D',
      sources: ['Sunlight', 'Fatty fish', 'Fortified milk', 'Egg yolks', 'Mushrooms'],
      benefit: 'Bone health and immune function',
    },
    {
      vitamin: 'Vitamin E',
      sources: ['Nuts', 'Seeds', 'Vegetable oils', 'Spinach', 'Avocado'],
      benefit: 'Antioxidant protection and skin health',
    },
    {
      vitamin: 'Vitamin K',
      sources: ['Leafy greens', 'Broccoli', 'Brussels sprouts', 'Fermented foods'],
      benefit: 'Blood clotting and bone health',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Health Tips & Guidelines
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Essential tips to maintain optimal vitamin levels and overall health through lifestyle choices
          </p>
        </div>

        {/* Main Tips Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {tips.map((tip, index) => {
            const Icon = tip.icon;
            return (
              <div
                key={index}
                className="feature-card animate-slide-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`p-3 rounded-full ${tip.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {tip.title}
                  </h3>
                </div>
                
                <p className="text-gray-600 mb-4">
                  {tip.description}
                </p>
                
                <div className="space-y-2">
                  {tip.tips.map((item, tipIndex) => (
                    <div key={tipIndex} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Vitamin Sources Section */}
        <section className="bg-white rounded-xl shadow-lg p-8 mb-16 animate-fade-in">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Natural Vitamin Sources
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vitaminSources.map((source, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-6 animate-slide-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h3 className="text-lg font-semibold text-purple-600 mb-3">
                  {source.vitamin}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {source.benefit}
                </p>
                <div className="flex flex-wrap gap-2">
                  {source.sources.map((item, sourceIndex) => (
                    <span
                      key={sourceIndex}
                      className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Lifestyle Assessment */}
        <section className="gradient-bg text-white rounded-xl p-8 mb-16 animate-fade-in">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">
              Quick Health Assessment
            </h2>
            <p className="text-xl opacity-95">
              Check your daily habits for optimal vitamin intake
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Daily Checklist</h3>
              <div className="space-y-3">
                {[
                  'Ate at least 5 servings of fruits/vegetables',
                  'Got 15+ minutes of sun exposure',
                  'Exercised for 30 minutes',
                  'Drank 8+ glasses of water',
                  'Slept 7-9 hours',
                  'Took vitamin supplements (if prescribed)',
                ].map((item, index) => (
                  <label key={index} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-white">{item}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Weekly Goals</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Physical Activity</span>
                    <span>150 min/week</span>
                  </div>
                  <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full" style={{ width: '65%' }} />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Sun Exposure</span>
                    <span>75 min/week</span>
                  </div>
                  <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full" style={{ width: '80%' }} />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Sleep Quality</span>
                    <span>7-9 hours/night</span>
                  </div>
                  <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full" style={{ width: '70%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Resources */}
        <section className="bg-white rounded-xl shadow-lg p-8 animate-fade-in">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Additional Resources
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Educational Content
              </h3>
              <p className="text-gray-600">
                Learn more about vitamins and their role in maintaining optimal health
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Apple className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Nutrition Guides
              </h3>
              <p className="text-gray-600">
                Detailed guides on balanced diets and meal planning
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Exercise Programs
              </h3>
              <p className="text-gray-600">
                Tailored workout routines to improve overall health
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HealthTips;
