import { slugify } from "./utils";

export interface CityIntro {
  name: string;
  slug: string;
  paragraphs: string[];
}

const CITY_FACTS: Record<string, string[]> = {
  casablanca: [
    "Casablanca est le poumon économique du Maroc et la plus grande métropole du pays. La ville concentre la majorité des sièges sociaux des banques, des groupes industriels et des multinationales implantées au Maroc.",
    "Le Grand Casablanca offre un écosystème diversifié : finance et assurance (Boulevard Mohammed V, Casa Finance City), industrie (zones de Mohammedia et Nouaceur), commerce de détail et services numériques en pleine expansion.",
    "Avec son aéroport international Mohammed V et son port, Casablanca attire chaque année des milliers de candidats venus de tout le royaume à la recherche d'opportunités professionnelles dans tous les secteurs.",
  ],
  rabat: [
    "Rabat, capitale administrative du Maroc, abrite de nombreuses institutions publiques, ambassades et organismes internationaux. La ville offre un cadre de vie calme et structuré, idéal pour les carrières dans le secteur public et les services.",
    "Le technopôle de Rabat-Shore et les quartiers d'affaires de Agdal et Hassan attirent les entreprises de conseil, d'ingénierie et de technologies de l'information. Les ministères et agences gouvernementales recrutent régulièrement.",
    "Bien connectée à Salé et accessible depuis les grandes villes du nord, Rabat constitue un hub stratégique pour les professionnels recherchant stabilité et qualité de vie tout en restant au cœur des décisions nationales.",
  ],
  marrakech: [
    "Marrakech combine un tourisme international florissant avec un tissu économique local en pleine mutation. L'hôtellerie de luxe, la restauration et l'artisanat génèrent des milliers d'emplois directs et indirects.",
    "La ville accueille également des zones industrielles et des projets immobiliers ambitieux. Le secteur agricole de la région Marrakech-Safi, notamment autour des coopératives et exportateurs, recrute des profils variés.",
    "Avec son climat ensoleillé et son dynamisme culturel, Marrakech attire de plus en plus d'entrepreneurs et de télétravailleurs, faisant émerger une scène tech et créative en pleine croissance.",
  ],
  tanger: [
    "Tanger, porte de l'Afrique vers l'Europe, bénéficie d'une position géographique unique. Le Tanger Med, plus grand port d'Afrique, et la zone franche font de la ville un pôle logistique et manufacturier majeur.",
    "L'industrie automobile, l'aéronautique et les équipements électroniques y sont particulièrement développés. Renault, plusieurs équipementiers et des entreprises de sous-traitance recrutent en permanence des techniciens et ingénieurs.",
    "Le renouveau urbain autour de la Kasbah et du centre-ville, combiné à des infrastructures modernes, fait de Tanger une destination attractive pour les jeunes diplômés du nord du Maroc.",
  ],
  fes: [
    "Fès, capitale spirituelle et culturelle du Maroc, possède également un tissu industriel solide. La ville abrite des usines de transformation agroalimentaire, des ateliers de cuir et un secteur artisanal reconnu mondialement.",
    "L'Université Al Quaraouiyine et l'Université Sidi Mohammed Ben Abdellah alimentent le marché local en profils qualifiés. Le secteur de l'enseignement, de la santé et des services y est particulièrement actif.",
    "Fès offre un coût de la vie modéré et un patrimoine historique exceptionnel, attirant des candidats en quête d'équilibre entre tradition et opportunités professionnelles.",
  ],
  agadir: [
    "Agadir est la capitale économique du sud marocain. Le tourisme balnéaire, la pêche et l'agro-industrie (notamment les agrumes et les produits de la mer) constituent les piliers de l'emploi local.",
    "La ville a été reconstruite après le séisme de 1960 et dispose aujourd'hui d'infrastructures modernes, d'un aéroport international et d'une zone industrielle en expansion. Les hôtels et complexes touristiques recrutent toute l'année.",
    "Le climat doux toute l'année et la qualité de vie font d'Agadir une destination prisée des professionnels souhaitant s'installer dans le sud du royaume.",
  ],
  meknes: [
    "Meknès, ancienne capitale impériale, est une ville universitaire dynamique. L'Université Moulay Ismail et ses écoles d'ingénieurs produisent chaque année des milliers de diplômés recherchés par les employeurs régionaux.",
    "L'agriculture de la région Fès-Meknès, le vin et l'olive en particulier, ainsi que l'industrie agroalimentaire offrent de nombreuses opportunités. La proximité de Fès et de Rabat facilite les déplacements professionnels.",
    "Meknès combine patrimoine historique et modernité, avec un marché de l'emploi en croissance dans les services, le commerce et l'administration publique.",
  ],
  oujda: [
    "Oujda, capitale de l'Oriental, est le carrefour économique de l'est marocain. La ville bénéficie de sa proximité avec l'Algérie et joue un rôle clé dans les échanges commerciaux transfrontaliers.",
    "L'université Mohammed Premier et les zones industrielles locales génèrent une demande constante en profils techniques et commerciaux. Le secteur public et les services de santé recrutent également.",
    "Les projets d'infrastructure et le développement du corridor logistique oriental renforcent l'attractivité d'Oujda pour les investisseurs et les candidats à l'emploi.",
  ],
  kenitra: [
    "Kénitra, située entre Rabat et Tanger, est un pôle industriel et portuaire important. La ville abrite des usines automobiles, des unités de transformation et le port de Kénitra.",
    "Sa position stratégique sur l'axe Rabat-Tanger en fait un lieu de choix pour les entreprises souhaitant desservir le nord du Maroc. Le secteur logistique et le transport y sont particulièrement développés.",
    "Kénitra offre un marché de l'emploi diversifié avec des opportunités dans l'industrie, l'agriculture de la région Gharb et les services aux entreprises.",
  ],
  tetouan: [
    "Tétouan, au cœur du Rif, est une ville culturelle et commerciale du nord marocain. Son artisanat, son tourisme et sa proximité avec Ceuta en font un centre économique régional actif.",
    "L'Université Abdelmalek Essaâdi et les établissements de santé recrutent régulièrement. Le secteur du bâtiment et des travaux publics connaît une activité soutenue avec les projets de développement urbain.",
    "Tétouan attire les candidats recherchant un cadre de vie méditerranéen tout en restant connectés aux grands centres économiques du nord.",
  ],
};

export function getCityIntro(cityName: string, citySlug?: string): CityIntro {
  const slug = citySlug || slugify(cityName);
  const paragraphs = CITY_FACTS[slug] || [
    `${cityName} fait partie des villes marocaines où le marché de l'emploi évolue rapidement. Entreprises locales, filiales de groupes nationaux et acteurs internationaux y publient régulièrement des offres dans de nombreux secteurs.`,
    `Que vous soyez jeune diplômé, professionnel expérimenté ou en reconversion, ${cityName} propose des opportunités en CDI, CDD, stage et alternance. Letravail.ma agrège automatiquement les offres publiées par les employeurs pour vous faire gagner du temps.`,
    `Consultez ci-dessous les dernières offres d'emploi à ${cityName}, mises à jour automatiquement depuis les sites de recrutement des entreprises marocaines.`,
  ];

  return { name: cityName, slug, paragraphs };
}
