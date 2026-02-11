import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Profile } from '../types';
import { getProfiles, deleteProfile, toggleProfileVisibility } from '../services/mockSupabase';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  EyeOff,
  Edit2, 
  Trash2, 
  UserPlus,
  MoreVertical,
  ChevronUp,
  ChevronDown,
  CheckCircle,
  Clock
} from 'lucide-react';

interface SortConfig {
  key: keyof Profile | 'created_at';
  direction: 'asc' | 'desc';
}

const AdminDashboard: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'public' | 'draft'>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'created_at', direction: 'desc' });
  const [selectedProfiles, setSelectedProfiles] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [bulkAction, setBulkAction] = useState<'none' | 'makePublic' | 'makeDraft' | 'delete'>('none');
  
  const navigate = useNavigate();

  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProfiles();
      setProfiles(data);
    } catch (err) {
      setError('Erreur lors du chargement des profils');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  // Filtrage et tri
  useEffect(() => {
    let result = [...profiles];

    // Filtre par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(profile =>
        profile.name.toLowerCase().includes(term) ||
        profile.usual_place?.toLowerCase().includes(term) ||
        profile.raw_story?.toLowerCase().includes(term)
      );
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      const isPublic = statusFilter === 'public';
      result = result.filter(profile => profile.is_public === isPublic);
    }

    // Tri
    result.sort((a, b) => {
      const aValue = a[sortConfig.key as keyof Profile];
      const bValue = b[sortConfig.key as keyof Profile];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortConfig.direction === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      return 0;
    });

    setFilteredProfiles(result);
  }, [profiles, searchTerm, statusFilter, sortConfig]);

  const handleSort = (key: SortConfig['key']) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleToggleVisibility = async (profile: Profile) => {
    try {
      await toggleProfileVisibility(profile.id, !profile.is_public);
      await fetchProfiles();
    } catch (err) {
      setError('Erreur lors de la modification du statut');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProfile(id);
      await fetchProfiles();
      setShowDeleteConfirm(null);
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  const handleBulkAction = async () => {
    if (bulkAction === 'none' || selectedProfiles.size === 0) return;

    try {
      switch (bulkAction) {
        case 'makePublic':
          await Promise.all(
            Array.from(selectedProfiles).map(id => toggleProfileVisibility(id, true))
          );
          break;
        case 'makeDraft':
          await Promise.all(
            Array.from(selectedProfiles).map(id => toggleProfileVisibility(id, false))
          );
          break;
        case 'delete':
          if (window.confirm(`Supprimer ${selectedProfiles.size} profil(s) ?`)) {
            await Promise.all(
              Array.from(selectedProfiles).map(id => deleteProfile(id))
            );
          }
          break;
      }
      
      await fetchProfiles();
      setSelectedProfiles(new Set());
      setBulkAction('none');
    } catch (err) {
      setError('Erreur lors de l\'action groupée');
    }
  };

  const toggleProfileSelection = (id: string) => {
    const newSelected = new Set(selectedProfiles);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProfiles(newSelected);
  };

  const selectAllProfiles = () => {
    if (selectedProfiles.size === filteredProfiles.length) {
      setSelectedProfiles(new Set());
    } else {
      setSelectedProfiles(new Set(filteredProfiles.map(p => p.id)));
    }
  };

  const stats = useMemo(() => ({
    total: profiles.length,
    public: profiles.filter(p => p.is_public).length,
    draft: profiles.filter(p => !p.is_public).length,
    recent: profiles.filter(p => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(p.created_at) > weekAgo;
    }).length
  }), [profiles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des profils...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
            <p className="text-gray-600 mt-2">
              Gestion des profils et suivi des personnes
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Link
              to="/profiles"
              className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Voir le site public
            </Link>
            
            <Link
              to="/admin/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <UserPlus className="w-5 h-5" />
              Nouveau profil
            </Link>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total des profils</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <UserPlus className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Profils publics</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.public}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Brouillons</p>
                <p className="text-3xl font-bold text-amber-600 mt-2">{stats.draft}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <EyeOff className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Ajoutés cette semaine</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{stats.recent}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un profil par nom, lieu ou contenu..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">Tous les statuts</option>
                <option value="public">Public uniquement</option>
                <option value="draft">Brouillons uniquement</option>
              </select>

              <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Download className="w-5 h-5" />
                Exporter
              </button>
            </div>
          </div>

          {/* Actions groupées */}
          {selectedProfiles.size > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-medium text-blue-800">
                  {selectedProfiles.size} profil(s) sélectionné(s)
                </span>
                
                <select
                  className="px-4 py-2 border border-blue-300 rounded-lg bg-white"
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value as any)}
                >
                  <option value="none">Action groupée...</option>
                  <option value="makePublic">Rendre public</option>
                  <option value="makeDraft">Mettre en brouillon</option>
                  <option value="delete">Supprimer</option>
                </select>

                <button
                  onClick={handleBulkAction}
                  disabled={bulkAction === 'none'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Appliquer
                </button>
              </div>

              <button
                onClick={() => setSelectedProfiles(new Set())}
                className="text-blue-600 hover:text-blue-800"
              >
                Annuler la sélection
              </button>
            </div>
          )}
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-100">
              <div className="flex items-center text-red-700">
                <span className="font-medium">{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-12 px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedProfiles.size === filteredProfiles.length && filteredProfiles.length > 0}
                      onChange={selectAllProfiles}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-2">
                      Nom
                      {sortConfig.key === 'name' && (
                        sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('usual_place')}
                  >
                    <div className="flex items-center gap-2">
                      Lieu habituel
                      {sortConfig.key === 'usual_place' && (
                        sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Besoins
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center gap-2">
                      Date de création
                      {sortConfig.key === 'created_at' && (
                        sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-gray-200">
                {filteredProfiles.map(profile => (
                  <tr 
                    key={profile.id} 
                    className={`hover:bg-gray-50 ${selectedProfiles.has(profile.id) ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProfiles.has(profile.id)}
                        onChange={() => toggleProfileSelection(profile.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-gray-700">
                            {profile.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{profile.name}</div>
                          <div className="text-sm text-gray-500">ID: {profile.publicId}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{profile.usual_place}</div>
                    </td>
                    
                    <td className="px-6 py-4">
                      {profile.immediate_needs?.slice(0, 2).map((need, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mr-1 mb-1"
                        >
                          {need}
                        </span>
                      ))}
                      {profile.immediate_needs?.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{profile.immediate_needs.length - 2}
                        </span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {new Date(profile.created_at).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          profile.is_public 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {profile.is_public ? (
                            <>
                              <Eye className="w-3 h-3 mr-1" />
                              Public
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 mr-1" />
                              Brouillon
                            </>
                          )}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleVisibility(profile)}
                          className={`p-2 rounded-lg ${
                            profile.is_public 
                              ? 'text-green-600 hover:bg-green-50' 
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                          title={profile.is_public ? 'Rendre privé' : 'Rendre public'}
                        >
                          {profile.is_public ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        
                        <Link
                          to={`/p/${profile.publicId}`}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                          title="Voir le profil"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Link>
                        
                        <Link
                          to={`/admin/edit/${profile.publicId}`}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        
                        <button
                          onClick={() => setShowDeleteConfirm(profile.id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProfiles.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== 'all' ? 'Aucun résultat' : 'Aucun profil'}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Aucun profil ne correspond à vos critères de recherche.'
                  : 'Commencez par créer votre premier profil.'}
              </p>
              <Link
                to="/admin/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <UserPlus className="w-5 h-5" />
                Créer un profil
              </Link>
            </div>
          ) : (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {filteredProfiles.length} profil(s) trouvé(s)
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                  ←
                </button>
                <span className="px-3 py-1 text-gray-700">1</span>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                  →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Confirmer la suppression</h3>
                  <p className="text-gray-600 mt-1">Cette action est irréversible.</p>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Supprimer définitivement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(AdminDashboard);