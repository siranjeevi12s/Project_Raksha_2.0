import { AlertTriangle, CheckCircle, XCircle, MapPin, Clock } from 'lucide-react';
import { MatchRecord } from '../lib/supabase';

interface MatchesListProps {
  matches: MatchRecord[];
  onRefresh: () => void;
}

function MatchesList({ matches }: MatchesListProps) {
  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No matches found yet</p>
        <p className="text-sm text-gray-400 mt-2">Matches will appear here when citizens submit photos</p>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'false_positive':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'false_positive': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.8) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <div
          key={match.id}
          className="bg-gradient-to-r from-yellow-50 to-white rounded-lg p-6 border-l-4 border-yellow-400 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-start space-x-3">
              {getStatusIcon(match.verification_status)}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {match.missing_person?.full_name || 'Unknown'}
                </h3>
                <p className="text-sm text-gray-500">
                  Report: {match.missing_person?.report_number}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(match.verification_status)}`}>
                {match.verification_status.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Confidence Score</p>
              <p className={`text-2xl font-bold ${getConfidenceColor(match.confidence_score)}`}>
                {(match.confidence_score * 100).toFixed(1)}%
              </p>
            </div>

            <div className="bg-white rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Alert Sent</p>
              <p className="text-lg font-semibold text-gray-900">
                {match.alert_sent ? 'Yes' : 'No'}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Missing Person</p>
              <p className="text-sm text-gray-900">
                Age: {match.missing_person?.age_at_missing || 'N/A'}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {match.missing_person?.category}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Match found: {new Date(match.match_timestamp).toLocaleString()}</span>
            </div>

            {match.match_location && (
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>Location recorded</span>
              </div>
            )}
          </div>

          {match.missing_person?.last_seen_location && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">Last seen at</p>
              <p className="text-sm text-gray-900 font-medium">
                {match.missing_person.last_seen_location}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default MatchesList;
