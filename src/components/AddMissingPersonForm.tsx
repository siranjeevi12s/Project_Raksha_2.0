import { useState } from 'react';
import { Upload, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AIEngine } from '../lib/aiEngine';

interface AddMissingPersonFormProps {
  onSuccess: () => void;
}

function AddMissingPersonForm({ onSuccess }: AddMissingPersonFormProps) {
  const [formData, setFormData] = useState({
    reportNumber: '',
    fullName: '',
    ageAtMissing: '',
    gender: 'male',
    lastSeenLocation: '',
    lastSeenDate: '',
    description: '',
    category: 'child',
    policeStation: '',
    contactNumber: ''
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [processingStage, setProcessingStage] = useState('');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setProcessing(true);

    try {
      setProcessingStage('Creating missing person record...');

      const { data: personData, error: personError } = await supabase
        .from('missing_persons')
        .insert({
          report_number: formData.reportNumber,
          full_name: formData.fullName,
          age_at_missing: parseInt(formData.ageAtMissing),
          gender: formData.gender,
          last_seen_location: formData.lastSeenLocation,
          last_seen_date: formData.lastSeenDate,
          description: formData.description,
          category: formData.category,
          police_station: formData.policeStation,
          contact_number: formData.contactNumber,
          status: 'active'
        })
        .select()
        .single();

      if (personError) throw personError;

      if (photoFile) {
        setProcessingStage('Detecting face in photo...');
        const detectionResult = await AIEngine.detectFace(photoFile);

        if (!detectionResult.detected) {
          throw new Error(detectionResult.message || 'No face detected in photo');
        }

        setProcessingStage('Generating face embedding...');
        const embeddingResult = await AIEngine.generateEmbedding(photoFile);

        setProcessingStage('Storing face data...');
        const { error: embeddingError } = await supabase
          .from('face_embeddings')
          .insert({
            missing_person_id: personData.id,
            embedding_vector: JSON.stringify(embeddingResult.vector),
            is_age_progressed: false,
            quality_score: detectionResult.qualityScore,
            photo_taken_date: formData.lastSeenDate
          });

        if (embeddingError) throw embeddingError;
      }

      setProcessingStage('Complete!');
      setTimeout(() => {
        onSuccess();
      }, 1000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add missing person');
      setProcessing(false);
      setProcessingStage('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Number *
            </label>
            <input
              type="text"
              name="reportNumber"
              value={formData.reportNumber}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., FIR/2024/001234"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age When Missing *
            </label>
            <input
              type="number"
              name="ageAtMissing"
              value={formData.ageAtMissing}
              onChange={handleChange}
              required
              min="0"
              max="120"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender *
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="child">Child</option>
              <option value="woman">Woman</option>
              <option value="man">Man</option>
              <option value="elderly">Elderly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Seen Date *
            </label>
            <input
              type="date"
              name="lastSeenDate"
              value={formData.lastSeenDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Seen Location *
            </label>
            <input
              type="text"
              name="lastSeenLocation"
              value={formData.lastSeenLocation}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="City, State"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Police Station *
            </label>
            <input
              type="text"
              name="policeStation"
              value={formData.policeStation}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Number
            </label>
            <input
              type="tel"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+91 XXXXXXXXXX"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Physical description, clothing, distinguishing features..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photo (Recommended)
          </label>
          <div className="mt-2">
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click to upload photo</p>
                  <p className="text-xs text-gray-400 mt-1">Clear face photo recommended</p>
                </div>
              )}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handlePhotoChange}
              />
            </label>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {processing && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center">
            <Loader className="w-5 h-5 animate-spin mr-3" />
            <span>{processingStage}</span>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="submit"
            disabled={processing}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {processing ? 'Processing...' : 'Add Missing Person'}
          </button>
        </div>
      </div>
    </form>
  );
}

export default AddMissingPersonForm;
