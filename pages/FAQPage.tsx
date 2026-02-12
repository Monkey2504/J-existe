import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Sparkles, ShieldCheck, HeartHandshake } from 'lucide-react';

// ------------------------------------------------------------
// Données statiques - mémoïsées pour éviter la recréation
// ------------------------------------------------------------
const useFaqItems = () => {
  return useMemo(
    () => [
      {
        id: 'projet',
        icon: HelpCircle,
        question: "Qu'est-ce que le projet J'existe ?",
        reponse:
          "J'existe est une plateforme de visibilité humaine. Elle permet de transformer les parcours de vie souvent fragmentés des personnes sans‑abri en récits dignes et structurés grâce à l'IA, facilitant ainsi le lien social et l'aide ciblée."
      },
      {
        id: 'ia',
        icon: Sparkles,
        question: 'Quel est le rôle de l’IA dans les récits ?',
        reponse:
          "L'IA (Gemini) agit comme un greffier social. Elle prend des notes brutes, souvent dures et désordonnées, pour les reformuler dans un style administratif, froid et factuel, évitant ainsi le misérabilisme tout en soulignant la complexité du parcours."
      },
      {
        id: 'donnees',
        icon: ShieldCheck,
        question: 'Comment les données sont‑elles protégées ?',
        reponse:
          "La création de fiches est réservée aux travailleurs sociaux habilités. Aucun nom de famille n'est publié. Chaque personne dispose d'un droit de retrait immédiat et total de ses données de l'index public."
      },
      {
        id: 'dons',
        icon: HeartHandshake,
        question: 'Puis‑je donner directement de l’argent ?',
        reponse:
          'Le bouton de soutien redirige vers un compte géré par l’association ou le travailleur social référent. Cela garantit que les fonds sont utilisés pour les besoins réels listés sur la fiche (logement, santé, matériel).'
      }
    ],
    []
  );
};

// ------------------------------------------------------------
// Composant d'une carte FAQ (mémoïsé)
// ------------------------------------------------------------
const FaqCard = React.memo<{
  item: ReturnType<typeof useFaqItems>[number];
  index: number;
}>(({ item, index }) => {
  const Icon = item.icon;

  return (
    <motion.article
      id={`faq-${item.id}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      viewport={{ once: true, margin: '-50px' }}
      className="group p-10 bg-white rounded-[3rem] border border-stone-100 paper-shadow hover:border-blue-200 transition-colors focus-within:ring-2 focus-within:ring-blue-400 focus-within:ring-offset-2"
      aria-labelledby={`faq-question-${item.id}`}
    >
      <div className="flex gap-8">
        <div className="shrink-0 p-4 bg-stone-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
          <Icon className="w-6 h-6" aria-hidden="true" />
        </div>
        <div className="space-y-4">
          <h3 id={`faq-question-${item.id}`} className="text-2xl font-serif font-bold text-stone-900 leading-tight">
            {item.question}
          </h3>
          <p className="text-stone-600 leading-relaxed font-serif italic text-lg">{item.reponse}</p>
        </div>
      </div>
    </motion.article>
  );
});

FaqCard.displayName = 'FaqCard';

// ------------------------------------------------------------
// Composant principal
// ------------------------------------------------------------
const FAQPage: React.FC = () => {
  const faqItems = useFaqItems();

  // Ajout d'un ancrage d'évitement pour les utilisateurs clavier
  const handleSkipToContent = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const main = document.getElementById('faq-contenu');
    main?.focus();
    main?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Lien d'évitement – invisible au focus */}
      <a
        href="#faq-contenu"
        onClick={handleSkipToContent}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-4 focus:bg-white focus:text-stone-900 focus:border-2 focus:border-stone-900 focus:rounded-xl focus:font-bold focus:uppercase focus:tracking-widest focus:text-[10px]"
      >
        Aller au contenu principal
      </a>

      <main
        id="faq-contenu"
        tabIndex={-1}
        className="min-h-screen bg-[#f8f7f4] py-32 px-6 outline-none"
        aria-labelledby="faq-titre"
      >
        <div className="max-w-4xl mx-auto space-y-20">
          {/* En-tête de page */}
          <header className="text-center space-y-4">
            <h1 id="faq-titre" className="text-6xl font-impact text-stone-900 tracking-tighter">
              QUESTIONS FRÉQUENTES
            </h1>
            <p className="font-serif italic text-stone-500 text-xl">
              Comprendre notre démarche et notre éthique.
            </p>
          </header>

          {/* Liste des FAQ – balisage sémantique et ARIA */}
          <section
            aria-label="Foire aux questions"
            className="grid gap-12"
          >
            {/* Optionnel : balisage Schema.org pour le référencement */}
            <script type="application/ld+json">
              {JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: faqItems.map(item => ({
                  '@type': 'Question',
                  name: item.question,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: item.reponse
                  }
                }))
              })}
            </script>

            {faqItems.map((item, index) => (
              <FaqCard key={item.id} item={item} index={index} />
            ))}
          </section>
        </div>
      </main>
    </>
  );
};

// Mémoïsation du composant principal – inutile de re-rendre si les props ne changent pas
export default React.memo(FAQPage);