import { User, Calendar, MapPin } from 'lucide-react';
import { MissingPerson } from '../lib/supabase';

interface MissingPersonsListProps {
  persons: MissingPerson[];
  onRefresh: () => void;
}

function MissingPersonsList({ persons }: MissingPersonsListProps) {
  if (persons.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No missing persons records found</p>
        <p className="text-sm text-gray-400 mt-2">Add a new case to get started</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-orange-100 text-orange-800';
      case 'found': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'child': return 'bg-red-100 text-red-800';
      case 'woman': return 'bg-pink-100 text-pink-800';
      case 'man': return 'bg-blue-100 text-blue-800';
      case 'elderly': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {persons.map((person) => (
        <div
          key={person.id}
          className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{person.full_name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(person.category)}`}>
                  {person.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(person.status)}`}>
                  {person.status}
                </span>
              </div>
              <p className="text-sm text-gray-500">Report: {person.report_number}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">Age: {person.age_at_missing}</p>
              <p className="text-xs text-gray-500 capitalize">{person.gender}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-gray-500">Last Seen</p>
                <p className="text-gray-900 font-medium">{person.last_seen_location}</p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-gray-500">Date</p>
                <p className="text-gray-900 font-medium">
                  {new Date(person.last_seen_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {person.description && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">{person.description}</p>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
            <span>Police Station: {person.police_station}</span>
            <span>Added: {new Date(person.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MissingPersonsList;
