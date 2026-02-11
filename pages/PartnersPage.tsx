
import React from 'react';
import { Globe, Heart, Shield, Landmark } from 'lucide-react';

const PARTNERS = [
  {
    name: "Samusocial Bruxelles",
    role: "Urgence sociale et maraudes",
    desc: "Premier partenaire de terrain pour l'identification des personnes les plus vulnérables.",
    icon: Shield
  },
  {
    name: "CPAS Bruxelles-Ville",
    role: "Soutien administratif et réinsertion",
    desc: "Accompagnement pour la transformation des dossiers J'existe en demandes d'aides légales.",
    icon: Landmark
  },
  {
    name: "Médecins du Monde",
    role: "Veille sanitaire",
    desc: "Support pour les besoins de santé listés sur les fiches de profil.",
    icon: Heart
  },
  {
    name: "Plateforme Citoyenne",
    role: "Hébergement et lien social",
    desc: "Réseau de solidarité citoyenne active dans toute la région bruxelloise.",
    icon: Globe
  }
];

const PartnersPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8f7f4] py-32 px-6">
      <div className="max-w-6xl mx-auto space-y-24">
        <header className="max-w-2xl">
          <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.6em] mb-4 block">Écosystème</span>
          <h1 className="text-7xl font-impact text-stone-900 tracking-tighter leading-none mb-8">NOS ALLIÉS SUR LE TERRAIN</h1>
          <p className="font-serif italic text-2xl text-stone-500">
            J'existe n'est qu'un maillon d'une chaîne de solidarité bruxelloise plus vaste.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {PARTNERS.map((partner, i) => (
            <div key={i} className="group p-12 bg-white rounded-[3.5rem] border border-stone-100 paper-shadow hover:scale-[1.02] transition-all duration-500">
              <div className="flex flex-col h-full space-y-6">
                <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-900 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <partner.icon className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-impact text-stone-900 uppercase tracking-tight">{partner.name}</h3>
                  <p className="text-blue-600 text-[10px] font-black uppercase tracking-widest">{partner.role}</p>
                </div>
                <p className="text-stone-500 font-serif italic text-lg leading-relaxed">{partner.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-600 rounded-[3rem] p-16 text-center text-white shadow-2xl">
          <h2 className="text-4xl font-impact mb-6 uppercase">Devenir Partenaire</h2>
          <p className="font-serif italic text-xl opacity-80 mb-10 max-w-xl mx-auto">Vous êtes une ASBL bruxelloise ou un travailleur social indépendant ? Rejoignez le réseau de visibilité.</p>
          <button className="px-12 py-5 bg-stone-900 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-white hover:text-stone-900 transition-all">Nous contacter</button>
        </div>
      </div>
    </div>
  );
};

export default PartnersPage;
