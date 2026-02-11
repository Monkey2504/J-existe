
import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Sparkles, ShieldCheck, HeartHandshake } from 'lucide-react';

const FAQ_ITEMS = [
  {
    icon: HelpCircle,
    q: "Qu'est-ce que le projet J'existe ?",
    a: "J'existe est une plateforme de visibilité humaine. Elle permet de transformer les parcours de vie souvent fragmentés des personnes sans-abri en récits dignes et structurés grâce à l'IA, facilitant ainsi le lien social et l'aide ciblée."
  },
  {
    icon: Sparkles,
    q: "Quel est le rôle de l'IA dans les récits ?",
    a: "L'IA (Gemini) agit comme un greffier social. Elle prend des notes brutes, souvent dures et désordonnées, pour les reformuler dans un style administratif, froid et factuel, évitant ainsi le misérabilisme tout en soulignant la complexité du parcours."
  },
  {
    icon: ShieldCheck,
    q: "Comment les données sont-elles protégées ?",
    a: "La création de fiches est réservée aux travailleurs sociaux habilités. Aucun nom de famille n'est publié. Chaque personne dispose d'un droit de retrait immédiat et total de ses données de l'index public."
  },
  {
    icon: HeartHandshake,
    q: "Puis-je donner directement de l'argent ?",
    a: "Le bouton de soutien redirige vers un compte géré par l'association ou le travailleur social référent. Cela garantit que les fonds sont utilisés pour les besoins réels listés sur la fiche (logement, santé, matériel)."
  }
];

const FAQPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8f7f4] py-32 px-6">
      <div className="max-w-4xl mx-auto space-y-20">
        <header className="text-center space-y-4">
          <h1 className="text-6xl font-impact text-stone-900 tracking-tighter">QUESTIONS FRÉQUENTES</h1>
          <p className="font-serif italic text-stone-500 text-xl">Comprendre notre démarche et notre éthique.</p>
        </header>

        <div className="grid gap-12">
          {FAQ_ITEMS.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group p-10 bg-white rounded-[3rem] border border-stone-100 paper-shadow hover:border-blue-200 transition-colors"
            >
              <div className="flex gap-8">
                <div className="shrink-0 p-4 bg-stone-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-serif font-bold text-stone-900 leading-tight">{item.q}</h3>
                  <p className="text-stone-600 leading-relaxed font-serif italic text-lg">{item.a}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
