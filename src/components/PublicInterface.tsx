import { useState } from 'react';
import { ArrowLeft, Upload, Camera, Loader, CheckCircle, XCircle, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AIEngine, hashImage, generateSubmissionCode } from '../lib/aiEngine';

interface PublicInterfaceProps {
  onBack: () => void;
}

type ProcessingStage = 'idle' | 'uploading' | 'detecting' | 'embedding' | 'matching' | 'complete';

function PublicInterface({ onBack }: PublicInterfaceProps) {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [stage, setStage] = useState<ProcessingStage>('idle');
  const [result, setResult] = useState<{
    matchFound: boolean;
    submissionCode: string;
    confidence?: number;
  } | null>(null);
  const [error, setError] = useState('');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setResult(null);
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!photoFile) return;

    setProcessing(true);
    setError('');
    setStage('uploading');

    try {
      setStage('detecting');
      const detectionResult = await AIEngine.detectFace(photoFile);

      if (!detectionResult.detected) {
        throw new Error(detectionResult.message || 'No face detected. Please use a clear photo showing a face.');
      }

      setStage('embedding');
      const embeddingResult = await AIEngine.generateEmbedding(photoFile);

      setStage('matching');
      const { data: dbEmbeddings } = await supabase
        .from('face_embeddings')
        .select('id, missing_person_id, embedding_vector');

      const databaseEmbeddings = (dbEmbeddings || []).map(item => ({
        id: item.missing_person_id,
        embedding: typeof item.embedding_vector === 'string'
          ? JSON.parse(item.embedding_vector)
          : item.embedding_vector
      }));

      const matches = AIEngine.findMatches(
        embeddingResult.vector,
        databaseEmbeddings,
        0.75
      );

      const photoHashValue = await hashImage(photoFile);
      const submissionCode = generateSubmissionCode();

      const { error: submissionError } = await supabase
        .from('public_submissions')
        .insert({
          submission_code: submissionCode,
          photo_hash: photoHashValue,
          embedding_vector: JSON.stringify(embeddingResult.vector),
          match_found: matches.length > 0,
          status: 'processed'
        });

      if (submissionError) throw submissionError;

      if (matches.length > 0) {
        const topMatch = matches[0];

        const { error: matchError } = await supabase
          .from('match_records')
          .insert({
            submission_id: submissionCode,
            missing_person_id: topMatch.missingPersonId,
            confidence_score: topMatch.confidence,
            verification_status: 'pending',
            alert_sent: false
          });

        if (matchError) throw matchError;

        setResult({
          matchFound: true,
          submissionCode,
          confidence: topMatch.confidence
        });
      } else {
        setResult({
          matchFound: false,
          submissionCode
        });
      }

      setStage('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process photo');
      setStage('idle');
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setPhotoFile(null);
    setPhotoPreview('');
    setResult(null);
    setError('');
    setStage('idle');
  };

  const getStageMessage = () => {
    switch (stage) {
      case 'uploading': return 'Uploading photo...';
      case 'detecting': return 'Detecting face in photo...';
      case 'embedding': return 'Generating face signature...';
      case 'matching': return 'Searching database for matches...';
      case 'complete': return 'Processing complete!';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50">
      <div className="bg-green-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-green-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold">Public Portal</h1>
                <p className="text-green-100 text-sm">Help find missing persons - Your identity stays anonymous</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 flex items-start space-x-3">
            <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Your Privacy is Protected</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your identity remains completely anonymous</li>
                <li>• Photos are deleted immediately after processing</li>
                <li>• Only encrypted face data is temporarily stored</li>
                <li>• Police will be notified automatically if there's a match</li>
              </ul>
            </div>
          </div>

          {!result ? (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit a Photo</h2>

              {!photoPreview ? (
                <label className="flex flex-col items-center justify-center w-full h-96 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Camera className="w-16 h-16 text-gray-400 mb-4" />
                    <p className="mb-2 text-lg font-medium text-gray-700">
                      Upload or take a photo
                    </p>
                    <p className="text-sm text-gray-500 text-center px-4">
                      Clear face photo works best. Photo will be deleted after processing.
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoChange}
                  />
                </label>
              ) : (
                <div className="space-y-6">
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-96 object-contain bg-gray-50 rounded-xl"
                    />
                    <button
                      onClick={resetForm}
                      className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                    >
                      <XCircle className="w-6 h-6 text-gray-600" />
                    </button>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  {processing ? (
                    <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center justify-center">
                      <Loader className="w-5 h-5 animate-spin mr-3" />
                      <span>{getStageMessage()}</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={processing}
                      className="w-full py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold text-lg flex items-center justify-center space-x-2"
                    >
                      <Upload className="w-5 h-5" />
                      <span>Check for Matches</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {result.matchFound ? (
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Match Found!
                  </h2>
                  <p className="text-lg text-gray-600 mb-6">
                    This person matches a missing person in our database.
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
                    <p className="text-sm font-medium text-yellow-900 mb-2">
                      Confidence Score: {result.confidence ? `${(result.confidence * 100).toFixed(1)}%` : 'High'}
                    </p>
                    <p className="text-sm text-yellow-800">
                      Police have been automatically notified and will investigate immediately.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <p className="text-xs text-gray-500 mb-1">Your submission code</p>
                    <p className="text-2xl font-mono font-bold text-gray-900">
                      {result.submissionCode}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Save this code for your records
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">
                    Thank you for helping us find missing persons. Your contribution is valuable.
                  </p>
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Submit Another Photo
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-12 h-12 text-gray-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    No Match Found
                  </h2>
                  <p className="text-lg text-gray-600 mb-6">
                    This person does not match any missing person in our database.
                  </p>
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <p className="text-xs text-gray-500 mb-1">Your submission code</p>
                    <p className="text-2xl font-mono font-bold text-gray-900">
                      {result.submissionCode}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">
                    Your photo has been processed and deleted. Thank you for helping us.
                  </p>
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Submit Another Photo
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-semibold text-xs">
                  1
                </div>
                <p>Upload a photo of someone you think might be missing</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-semibold text-xs">
                  2
                </div>
                <p>Our AI analyzes the face and compares it with missing persons database</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-semibold text-xs">
                  3
                </div>
                <p>If there's a match, police are notified instantly to take action</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-semibold text-xs">
                  4
                </div>
                <p>Your photo is automatically deleted - only you know your submission code</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublicInterface;
