
import React from 'react';

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8f7f4] py-32 px-6">
      <div className="max-w-3xl mx-auto prose prose-stone lg:prose-xl">
        <h1 className="text-6xl font-impact text-stone-900 tracking-tighter mb-12 uppercase">Confidentialité</h1>
        
        <p className="font-serif italic text-2xl text-stone-600 mb-12">
          La dignité commence par le respect du secret de la vie privée, même quand celle-ci se déroule dans l'espace public.
        </p>

        <section className="space-y-8">
          <div className="p-8 bg-white border-l-4 border-blue-600 rounded-r-3xl paper-shadow">
            <h2 className="text-stone-900 font-bold uppercase tracking-widest text-xs mt-0">Consentement Éclairé</h2>
            <p className="font-serif text-lg text-stone-700">Aucun profil n'est créé sans un accord explicite, oral et documenté du sujet. Le travailleur social doit expliquer la portée de la publication numérique.</p>
          </div>

          <div className="p-8 bg-white border-l-4 border-stone-900 rounded-r-3xl paper-shadow">
            <h2 className="text-stone-900 font-bold uppercase tracking-widest text-xs mt-0">Droit à l'Oubli Numérique</h2>
            <p className="font-serif text-lg text-stone-700">À tout moment, une personne peut demander la suppression immédiate de son profil via n'importe quel travailleur social du réseau J'existe ou par simple signalement.</p>
          </div>

          <div className="p-8 bg-white border-l-4 border-blue-600 rounded-r-3xl paper-shadow">
            <h2 className="text-stone-900 font-bold uppercase tracking-widest text-xs mt-0">Données Sensibles</h2>
            <p className="font-serif text-lg text-stone-700">Nous ne stockons aucune donnée bancaire, aucun numéro de sécurité sociale et aucune information médicale précise sur l'index public.</p>
          </div>
        </section>

        <div className="mt-20 pt-10 border-t border-stone-200">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Dernière mise à jour : Mai 2024 • Bruxelles</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
