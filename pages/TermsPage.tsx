
import React from 'react';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8f7f4] py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-6xl font-impact text-stone-900 tracking-tighter mb-12 uppercase">Conditions d'Utilisation</h1>
        
        <div className="space-y-16">
          <section className="space-y-4">
            <h2 className="font-impact text-3xl text-stone-900 uppercase">1. Usage du Service</h2>
            <p className="font-serif text-xl text-stone-600 leading-relaxed italic">
              L'utilisation de la plateforme "J'existe" est strictement réservée à des fins de soutien social et de visibilité humaine. Toute exploitation commerciale des données des profils est formellement interdite.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-impact text-3xl text-stone-900 uppercase">2. Responsabilité des Travailleurs Sociaux</h2>
            <p className="font-serif text-xl text-stone-600 leading-relaxed italic">
              Les agents inscrits s'engagent à fournir des informations vérifiées et à respecter la déontologie du secteur social. La saisie de faux témoignages ou de données dégradantes entraîne la révocation immédiate du compte pro.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-impact text-3xl text-stone-900 uppercase">3. Gestion des Dons</h2>
            <p className="font-serif text-xl text-stone-600 leading-relaxed italic">
              Les intentions de don formulées via la plateforme ne constituent pas un contrat. J'existe facilite le lien vers des solutions de paiement tierces (Stripe) gérées par les associations partenaires agréées.
            </p>
          </section>

          <section className="bg-stone-900 text-white p-12 rounded-[3rem] shadow-2xl">
            <h2 className="font-impact text-2xl mb-4">CHARTE ÉTHIQUE</h2>
            <p className="text-stone-400 font-mono text-sm leading-relaxed">
              En naviguant sur cet index, vous vous engagez à regarder les personnes listées comme des citoyens à part entière. Le voyeurisme social est proscrit. J'existe se réserve le droit de poursuivre tout détournement malveillant d'image ou de récit.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
