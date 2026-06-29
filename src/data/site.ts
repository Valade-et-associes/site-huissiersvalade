export const site = {
  name: "Valade et associés",
  legalName: "Valade et associés, Huissiers de justice inc.",
  url: "https://www.huissiersvalade.com",
  email: "info@valade.net",
  documentsEmail: "documents@valade.net",
  executionEmail: "avex@valade.net",
  phone: "514-842-2345",
  tollFree: "1-888-875-9499",
  fax: "514-842-2347",
  address: {
    street: "410, rue Saint-Nicolas, bureau 540",
    city: "Montréal",
    region: "Québec",
    postalCode: "H2Y 2P5"
  },
  hours: "Du lundi au vendredi, de 8 h 30 à 17 h",
  juriweb: "https://valade.juriweb.ca/"
};

export const assets = {
  logoLight: "/wp-content/uploads/2017/04/si-valade-logo-fond5_256x914-copy-14.png",
  aboutHero: "/wp-content/uploads/2017/03/salle-reunion-valade.jpg",
  servicesHero: "/wp-content/uploads/2017/04/dossier.jpg",
  formsHero: "/wp-content/uploads/2017/03/documents-valade.jpg",
  salesHero: "/wp-content/uploads/2026/06/img_6901-scaled.jpg",
  contactHero: "/wp-content/uploads/2017/03/batiment_valade.jpg",
  pdfIcon: "/wp-content/uploads/2017/03/icone_telecharger-1.png",
  heroDocument: "/wp-content/uploads/2017/05/document-agreement-documents-sign-48148-scaled.jpg",
  map: "/wp-content/uploads/2017/03/map-valade.png",
  luc: "/wp-content/uploads/2017/04/hr-2025-12-03-luc-valade-77-500x500.jpg",
  charles: "/wp-content/uploads/2017/04/hr-2024-12-10-charles-valade-52-500x500.jpg",
  blogLoyers: "/wp-content/uploads/2018/05/loyers-impayes-huissiers-valade-2.jpg"
};

export const nav = [
  { href: "/", label: "Accueil" },
  { href: "/a-propos/", label: "À propos" },
  { href: "/services-et-tarifs/", label: "Services et tarifs" },
  { href: "/formulaires/", label: "Formulaires" },
  { href: "/vente-de-vehicules-operation-sabot-de-denver/", label: "Ventes sabots" },
  { href: "/contact/", label: "Contact" }
];

export const stats = [
  { value: "36", label: "années d'existence" },
  { value: "27", label: "membres de notre équipe" },
  { value: "248", label: "municipalités desservies directement" }
];

export const values = [
  {
    title: "L’excellence professionnelle",
    text: "Une firme d’huissiers de justice de grande envergure agissant dans l’intérêt commun des justiciables tout en veillant rigoureusement au respect des lois applicables."
  },
  {
    title: "Leadership",
    text: "Une équipe unie par la valeur du surpassement, animée par la volonté de s’entourer des meilleurs et prête à rendre ses services maintenant."
  },
  {
    title: "Communication",
    text: "Des professionnels à l’écoute de vos besoins qui comprennent l’importance du dialogue, de la transparence et de l’impartialité."
  },
  {
    title: "Innovation",
    text: "Une entreprise créative cherchant à améliorer constamment la qualité de ses services afin de répondre aux besoins de ses clients."
  }
];

export const businessServices = [
  {
    title: "Signification",
    text: "La signification est un acte par lequel l’huissier de justice remet un acte de procédure ou tout autre document à son destinataire.",
    examples: ["Demande introductive d’instance", "Citation à comparaître", "Mise en demeure", "Avis d’exécution", "Demande en divorce", "Avis de renouvellement de bail"]
  },
  {
    title: "Exécution",
    text: "L’exécution des jugements regroupe les actes entrepris afin de satisfaire les conclusions d’un jugement, de façon impartiale.",
    examples: ["Saisie de biens meubles", "Saisie de biens immeubles", "Saisie de comptes bancaires", "Saisie de revenus", "Expulsion de locataires", "Saisie de véhicules routiers"]
  },
  {
    title: "Constat",
    text: "Le constat d’huissier inscrit des faits récoltés à la suite de constatations purement matérielles, de manière objective.",
    examples: ["État des lieux loués", "Bruits ou odeurs du voisinage", "Constat web", "Inventaire de biens", "Paroles ou gestes d’une personne"]
  },
  {
    title: "Services connexes",
    text: "Services professionnels complémentaires offerts pour répondre à l’ensemble des besoins de nos clients.",
    examples: ["Service de cour complet", "Émission et déposition de procédures", "Saisie avant jugement", "Vente sous contrôle de justice", "Perception amiable", "Immobilisation de véhicules"]
  }
];

export const forms = [
  {
    title: "Bordereau d’instructions : Exécution de jugement",
    href: "/wp-content/uploads/2017/06/bordereau_instructions_du-creancier.pdf"
  },
  {
    title: "Bordereau d’instructions : Saisie avant jugement",
    href: "/wp-content/uploads/2017/06/bordereau_instructions_du_saisissant.pdf"
  }
];

export const tariffs = [
  {
    title: "Tarif d’honoraires des huissiers de justice",
    href: "/wp-content/uploads/2026/02/tarif-dhonoraires-des-huissiers-de-justice-2025-10-24-h-4.1-r.-13.1.pdf"
  },
  {
    title: "Tarif d’honoraires professionnels",
    href: "/wp-content/uploads/2026/02/valade-et-associes-tarif-dhonoraires-professionnels-2026.pdf"
  }
];

export const posts = [
  {
    title: "Loyers impayés : Huissier de justice, agence de recouvrement ou cessionnaire?",
    date: "2018-05-30",
    category: "Immobilier",
    href: "/loyers-impayes-huissier-de-justice-agence-de-recouvrement-ou-cessionnaire/",
    image: assets.blogLoyers,
    excerpt: "Quelle est la meilleure approche pour récupérer des loyers impayés suite à une décision favorable de la Régie du logement?"
  },
  {
    title: "Lancement du nouveau site web",
    date: "2017-05-29",
    category: "Nos actions",
    href: "/solutions-impayes/",
    image: assets.logoLight,
    excerpt: "L’équipe de Valade et associés est fière de vous présenter son nouveau site web."
  }
];
