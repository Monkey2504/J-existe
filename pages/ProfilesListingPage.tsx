import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Compass, Heart, Clock, SlidersHorizontal, Search, RefreshCw, Sparkles } from 'lucide-react';
import ProfilCard from '../components/ProfilCard.tsx';
import { getPublicProfiles } from '../services/mockSupabase.ts';
import { Profile } from '../types.ts';

// --- Types ---
interface LieuGroupe {
  nom: string;
  description: string;
  profils: Profile[];
  count: number;
  urgentCount: number;
}

interface FilterState {
  search: string;
  lieu: string | null;
  urgentOnly: boolean;
  needs: string[];
  sortBy: 'recent' | 'name' | 'urgent';
}

const NEEDS_FILTERS = ['Logement','Nourriture','Vêtements','Médicaments','Administratif','Travail','Santé','Hygiène'];

// --- Hero + Stats ---
const HeroStats: React.FC<{stats: {totalProfils:number,totalLieux:number,urgentCount:number,recentCount:number}}> = ({ stats }) => (
  <div className="bg-stone-900 text-white relative overflow-hidden py-20">
    <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=1920')] bg-cover bg-center" />
    <div className="relative max-w-7xl mx-auto px-6 text-center">
      <motion.h1 initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} className="text-5xl md:text-7xl font-serif font-bold mb-6">Les Visages</motion.h1>
      <motion.p initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.1}} className="text-xl text-stone-300 max-w-2xl mx-auto font-light">
        Découvrez les histoires de celles et ceux qui habitent nos rues. Parce que derrière l'invisibilité, il y a une existence.
      </motion.p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-12">
        <StatCard icon={Users} value={stats.totalProfils} label="Profils" colorClass="text-stone-400" />
        <StatCard icon={Compass} value={stats.totalLieux} label="Lieux" colorClass="text-stone-400" />
        <StatCard icon={Heart} value={stats.urgentCount} label="Urgences" colorClass="text-red-400" />
        <StatCard icon={Clock} value={stats.recentCount} label="Nouveaux" colorClass="text-stone-400" />
      </div>
    </div>
  </div>
);

const StatCard: React.FC<{icon: React.ElementType,value:number,label:string,colorClass:string}> = ({icon:Icon,value,label,colorClass}) => (
  <div className="p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
    <Icon className={`w-6 h-6 mx-auto mb-2 ${colorClass}`} />
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-xs uppercase tracking-widest text-stone-500">{label}</div>
  </div>
);

// --- Filters ---
const FiltersPanel: React.FC<{
  filters: FilterState;
  uniqueLieux: string[];
  onChange: (key:keyof FilterState,value:any)=>void;
  onReset: ()=>void;
  visible:boolean;
  toggleNeed:(need:string)=>void;
}> = ({ filters, uniqueLieux, onChange, onReset, visible, toggleNeed }) => (
  <AnimatePresence>
    {visible && (
      <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} className="overflow-hidden">
        <div className="py-6 border-t border-stone-100 mt-4 space-y-6">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-3">Filtrer par lieu</h4>
            <div className="flex flex-wrap gap-2">
              <button onClick={()=>onChange('lieu',null)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!filters.lieu?'bg-stone-900 text-white':'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>Tous</button>
              {uniqueLieux.map(l => (
                <button key={l} onClick={()=>onChange('lieu',l)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filters.lieu===l?'bg-stone-900 text-white':'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>{l}</button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-3">Besoins</h4>
            <div className="flex flex-wrap gap-2">
              {NEEDS_FILTERS.map(n=>(
                <button key={n} onClick={()=>toggleNeed(n)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filters.needs.includes(n)?'bg-blue-600 text-white':'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>{n}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="urgentOnly" className="w-5 h-5 rounded border-stone-300 text-stone-900 focus:ring-stone-900" checked={filters.urgentOnly} onChange={(e)=>onChange('urgentOnly',e.target.checked)} />
            <label htmlFor="urgentOnly" className="text-stone-700 font-medium">Afficher uniquement les situations urgentes</label>
          </div>
          <button onClick={onReset} className="text-sm text-stone-400 hover:text-stone-900 flex items-center gap-1">
            <RefreshCw className="w-4 h-4" /> Réinitialiser tous les filtres
          </button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// --- Listing ---
const ProfilesList: React.FC<{groupes:LieuGroupe[]}> = ({ groupes }) => (
  <div className="space-y-16">
    {groupes.map(groupe => (
      <section key={groupe.nom} className="space-y-8">
        <div className="flex items-baseline gap-4 border-b border-stone-200 pb-4">
          <h2 className="text-3xl font-serif font-bold text-stone-900">{groupe.nom}</h2>
          <span className="text-stone-400 font-medium">{groupe.count} personne{groupe.count>1?'s':''}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {groupe.profils.map(profil => <ProfilCard key={profil.id} profil={profil} />)}
        </div>
      </section>
    ))}
  </div>
);

// --- Main Page ---
const ProfilesListingPage: React.FC = () => {
  const [searchParams,setSearchParams] = useSearchParams();
  const [groupesLieux,setGroupesLieux] = useState<LieuGroupe[]>([]);
  const [filteredGroupes,setFilteredGroupes] = useState<LieuGroupe[]>([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState<string|null>(null);
  const [showFilters,setShowFilters] = useState(false);
  const [stats,setStats] = useState({totalProfils:0,totalLieux:0,urgentCount:0,recentCount:0});

  const [filters,setFilters] = useState<FilterState>({
    search: searchParams.get('q')||'',
    lieu: searchParams.get('lieu')||null,
    urgentOnly: searchParams.get('urgent')==='true',
    needs: searchParams.get('needs')?.split(',').filter(Boolean)||[],
    sortBy: (searchParams.get('sort') as FilterState['sortBy'])||'recent'
  });

  const fetchProfiles = useCallback(async ()=>{
    try {
      setLoading(true);
      setError(null);
      const data = await getPublicProfiles();
      const groupesMap:{[key:string]:LieuGroupe}={};
      data.forEach(p=>{
        const lieu = p.usual_place||p.lieu_habituel||'Lieu non spécifié';
        if(!groupesMap[lieu]) groupesMap[lieu]={nom:lieu,description:`Des visages et des histoires autour de ${lieu}`,profils:[],count:0,urgentCount:0};
        groupesMap[lieu].profils.push(p);
        groupesMap[lieu].count++;
        if((p.metadata?.urgency_score||0)>=8) groupesMap[lieu].urgentCount++;
      });
      const groupesArray = Object.values(groupesMap).sort((a,b)=>b.count-a.count);
      setGroupesLieux(groupesArray);
      const urgentCount = data.filter(p=>(p.metadata?.urgency_score||0)>=8).length;
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate()-7);
      const recentCount = data.filter(p=>new Date(p.created_at)>weekAgo).length;
      setStats({totalProfils:data.length,totalLieux:groupesArray.length,urgentCount,recentCount});
    } catch(err){
      console.error(err);
      setError('Impossible de charger les profils.');
    } finally { setLoading(false); }
  },[]);

  useEffect(()=>{ fetchProfiles(); },[fetchProfiles]);

  useEffect(()=>{
    let filtered = [...groupesLieux];
    if(filters.lieu) filtered = filtered.filter(g=>g.nom===filters.lieu);
    filtered = filtered.map(g=>{
      let profils = [...g.profils];
      if(filters.search){
        const s = filters.search.toLowerCase();
        profils = profils.filter(p=>p.name.toLowerCase().includes(s)||(p.reformulated_story||'').toLowerCase().includes(s)||(p.usual_place||'').toLowerCase().includes(s));
      }
      if(filters.urgentOnly) profils = profils.filter(p=>(p.metadata?.urgency_score||0)>=8);
      if(filters.needs.length>0) profils = profils.filter(p=>filters.needs.some(n=>(p.needs||'').toLowerCase().includes(n.toLowerCase())));
      profils.sort((a,b)=>{
        switch(filters.sortBy){
          case 'name': return a.name.localeCompare(b.name);
          case 'urgent': return (b.metadata?.urgency_score||0)-(a.metadata?.urgency_score||0);
          default: return new Date(b.created_at).getTime()-new Date(a.created_at).getTime();
        }
      });
      return {...g,profils,count:profils.length};
    }).filter(g=>g.count>0);
    setFilteredGroupes(filtered);
    const params:Record<string,string>={};
    if(filters.search) params.q=filters.search;
    if(filters.lieu) params.lieu=filters.lieu;
    if(filters.urgentOnly) params.urgent='true';
    if(filters.needs.length>0) params.needs=filters.needs.join(',');
    if(filters.sortBy!=='recent') params.sort=filters.sortBy;
    setSearchParams(params,{replace:true});
  },[filters,groupesLieux,setSearchParams]);

  const handleFilterChange = (key:keyof FilterState,value:any)=>setFilters(prev=>({...prev,[key]:value}));
  const toggleNeed = (need:string)=>setFilters(prev=>({...prev,needs:prev.needs.includes(need)?prev.needs.filter(n=>n!==need):[...prev.needs,need]}));
  const handleResetFilters = ()=>setFilters({search:'',lieu:null,urgentOnly:false,needs:[],sortBy:'recent'});

  const uniqueLieux = useMemo(()=>groupesLieux.map(g=>g.nom),[groupesLieux]);

  if(loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
      <motion.div animate={{rotate:360}} transition={{duration:1.5,repeat:Infinity,ease:'linear'}} className="w-12 h-12 border-4 border-stone-200 border-t-stone-900 rounded-full mb-4" />
      <p className="text-stone-500 font-serif italic">À la rencontre des autres...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50">
      <HeroStats stats={stats} />

      {/* Search & Filters */}
      <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
              <input type="text" placeholder="Chercher un nom, un lieu, une histoire..." className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 outline-none transition-all" value={filters.search} onChange={e=>handleFilterChange('search',e.target.value)} />
            </div>
            <div className="flex gap-2">
              <button onClick={()=>setShowFilters(!showFilters)} className={`px-4 py-3 rounded-xl border flex items-center gap-2 transition-all ${showFilters?'bg-stone-900 text-white border-stone-900':'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'}`}>
                <SlidersHorizontal className="w-5 h-5" />
                <span>Filtres</span>
              </button>
              <select className="px-4 py-3 bg-white border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-stone-900" value={filters.sortBy} onChange={e=>handleFilterChange('sortBy',e.target.value)}>
                <option value="recent">Plus récents</option>
                <option value="name">Par nom</option>
                <option value="urgent">Urgences d'abord</option>
              </select>
            </div>
          </div>
          <FiltersPanel filters={filters} uniqueLieux={uniqueLieux} onChange={handleFilterChange} onReset={handleResetFilters} visible={showFilters} toggleNeed={toggleNeed} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {filteredGroupes.length===0 ? (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-stone-200 mx-auto mb-4" />
            <h3 className="text-xl font-serif font-bold text-stone-800">Aucun profil trouvé</h3>
            <p className="text-stone-500 mt-2">Essayez de modifier vos filtres ou de faire une autre recherche.</p>
            <button onClick={handleResetFilters} className="mt-6 px-6 py-2 bg-stone-900 text-white rounded-lg">Voir tous les profils</button>
          </div>
        ) : (
          <ProfilesList groupes={filteredGroupes} />
        )}
      </div>

      {/* Floating Admin Button */}
      <div className="fixed bottom-8 left-8 z-40">
        <Link to="/admin" className="flex items-center gap-2 px-6 py-3 bg-white border border-stone-200 shadow-xl rounded-full text-stone-600 hover:text-stone-900 hover:border-stone-900 transition-all font-medium">
          <Sparkles className="w-5 h-5 text-blue-500" />
          <span>Espace Pro</span>
        </Link>
      </div>
    </div>
  );
};

export default React.memo(ProfilesListingPage);