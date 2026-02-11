import { useState } from 'react';
import { Shield, Users } from 'lucide-react';
import PoliceDashboard from './components/PoliceDashboard';
import PublicInterface from './components/PublicInterface';

type ViewMode = 'select' | 'police' | 'public';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('select');

  if (viewMode === 'police') {
    return <PoliceDashboard onBack={() => setViewMode('select')} />;
  }

  if (viewMode === 'public') {
    return <PublicInterface onBack={() => setViewMode('select')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Missing Persons AI System
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            AI-powered facial recognition platform to help locate missing persons across India.
            Using advanced computer vision and real-time alerts to reunite families.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <button
            onClick={() => setViewMode('police')}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-left group"
          >
            <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-6 group-hover:scale-110 transition-transform">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Police Dashboard
            </h2>
            <p className="text-gray-600 mb-4">
              Upload missing person records, manage cases, view matches, and send alerts to field units.
            </p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>• Register missing person reports</li>
              <li>• Upload photos & generate face embeddings</li>
              <li>• View match confidence scores</li>
              <li>• Manage verification & alerts</li>
            </ul>
          </button>

          <button
            onClick={() => setViewMode('public')}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-left group"
          >
            <div className="flex items-center justify-center w-16 h-16 bg-green-600 rounded-xl mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Public Portal
            </h2>
            <p className="text-gray-600 mb-4">
              Help find missing persons by submitting photos. Your identity remains anonymous.
            </p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>• Submit photos anonymously</li>
              <li>• Instant AI-powered face matching</li>
              <li>• Get confirmation if match found</li>
              <li>• Complete privacy protection</li>
            </ul>
          </button>
        </div>

        <div className="mt-16 max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            How It Works
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                1
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Face Detection</h4>
              <p className="text-sm text-gray-600">AI detects and extracts facial features from photos</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                2
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Embedding Generation</h4>
              <p className="text-sm text-gray-600">Convert face to 512-dimensional numerical vector</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                3
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Real-time Matching</h4>
              <p className="text-sm text-gray-600">Compare against database in milliseconds</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                4
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Instant Alert</h4>
              <p className="text-sm text-gray-600">Notify nearby police units within 60 seconds</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p className="mb-2">
            <strong>Privacy First:</strong> All photos are deleted after processing. Only encrypted embeddings are stored.
          </p>
          <p>
            <strong>Secure:</strong> Row-level security, audit logs, and restricted access ensure data protection.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
