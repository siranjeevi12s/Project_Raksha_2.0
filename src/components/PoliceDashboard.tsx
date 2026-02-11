import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase, MissingPerson, MatchRecord } from '../lib/supabase';
import AddMissingPersonForm from './AddMissingPersonForm';
import MatchesList from './MatchesList';
import MissingPersonsList from './MissingPersonsList';

interface PoliceDashboardProps {
  onBack: () => void;
}

type TabType = 'cases' | 'matches' | 'add';

function PoliceDashboard({ onBack }: PoliceDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('cases');
  const [missingPersons, setMissingPersons] = useState<MissingPerson[]>([]);
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCases: 0,
    activeCases: 0,
    pendingMatches: 0,
    foundCases: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [personsResult, matchesResult] = await Promise.all([
        supabase.from('missing_persons').select('*').order('created_at', { ascending: false }),
        supabase
          .from('match_records')
          .select(`*,missing_person:missing_persons(*)`)
          .order('match_timestamp', { ascending: false })
      ]);

      if (personsResult.data) {
        setMissingPersons(personsResult.data as MissingPerson[]);
        setStats({
          totalCases: personsResult.data.length,
          activeCases: personsResult.data.filter(p => p.status === 'active').length,
          pendingMatches: matchesResult.data?.filter(m => m.verification_status === 'pending').length || 0,
          foundCases: personsResult.data.filter(p => p.status === 'found').length
        });
      }

      if (matchesResult.data) {
        setMatches(matchesResult.data as MatchRecord[]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePersonAdded = () => {
    loadData();
    setActiveTab('cases');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold">Police Dashboard</h1>
                <p className="text-blue-100 text-sm">Missing Persons Management System</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Cases</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalCases}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Cases</p>
                <p className="text-3xl font-bold text-orange-600">{stats.activeCases}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending Matches</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingMatches}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Found</p>
                <p className="text-3xl font-bold text-green-600">{stats.foundCases}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('cases')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'cases'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Missing Persons ({stats.totalCases})
              </button>
              <button
                onClick={() => setActiveTab('matches')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'matches'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Matches ({matches.length})
              </button>
              <button
                onClick={() => setActiveTab('add')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                  activeTab === 'add'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Add New Case</span>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                <p className="text-gray-500 mt-4">Loading...</p>
              </div>
            ) : (
              <>
                {activeTab === 'cases' && (
                  <MissingPersonsList persons={missingPersons} onRefresh={loadData} />
                )}
                {activeTab === 'matches' && (
                  <MatchesList matches={matches} onRefresh={loadData} />
                )}
                {activeTab === 'add' && (
                  <AddMissingPersonForm onSuccess={handlePersonAdded} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PoliceDashboard;
