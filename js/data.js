// Contenu de l'appli : thèmes, quiz, exercices, fiches. Aucune donnée personnelle ici.

export const THEMES = {
  sport:   { label: 'Sport',        short: 'Sport' },
  peau:    { label: 'Peau',         short: 'Peau' },
  cheveux: { label: 'Cheveux',      short: 'Cheveux' },
  sommeil: { label: 'Sommeil',      short: 'Sommeil' },
  alim:    { label: 'Alimentation', short: 'Alim.' },
  memoire: { label: 'Mémoire',      short: 'Mémoire' },
};
export const THEME_ORDER = ['sport', 'peau', 'cheveux', 'sommeil', 'alim', 'memoire'];

/* ---------------------------------------------------------------- QUIZ */
// type: 'one' (un choix) ou 'multi' (plusieurs choix). max = nombre maximum de choix.
export const QUIZ = [
  { id: 'lever', section: 'Rythme', q: 'À quelle heure te lèves-tu en général ?', type: 'one',
    opts: [['tot', 'Avant 7 h'], ['7', 'Entre 7 h et 8 h 30'], ['9', 'Entre 8 h 30 et 10 h'], ['tard', 'Après 10 h']] },
  { id: 'coucher', section: 'Rythme', q: 'Et tu te couches vers quelle heure ?', type: 'one',
    opts: [['tot', 'Avant 22 h 30'], ['mid', 'Entre 22 h 30 et 23 h 30'], ['late', 'Entre 23 h 30 et 0 h 30'], ['vlate', 'Après 0 h 30']] },
  { id: 'train', section: 'Rythme', q: 'Combien de jours par semaine as-tu un déplacement ou une journée très chargée ?', type: 'one',
    opts: [['0', 'Aucun'], ['1', '1 jour'], ['2', '2 jours'], ['3', '3 jours ou plus']] },
  { id: 'concentration', section: 'Rythme', q: 'Combien de temps tiens-tu concentré sans regarder ton téléphone ?', type: 'one',
    opts: [['c10', 'Moins de 10 minutes'], ['c25', '10 à 25 minutes'], ['c45', '25 à 45 minutes'], ['c60', 'Plus de 45 minutes']] },
  { id: 'tempsCalme', section: 'Sport', q: 'Les jours calmes, combien de temps peux-tu consacrer à une séance ?', type: 'one',
    opts: [['m10', '10 minutes'], ['m20', '20 minutes'], ['m30', '30 minutes'], ['m45', '45 minutes ou plus']] },
  { id: 'cheveuxLong', section: 'Cheveux', q: 'Quelle est la longueur de tes cheveux ?', type: 'one',
    opts: [['tc', 'Très courts (dégradé, rasés sur les côtés)'], ['c', 'Courts'], ['mi', 'Mi-longs (jusqu’aux oreilles ou la nuque)'], ['l', 'Longs (sur les épaules ou plus)']] },
  { id: 'pompes', section: 'Sport', q: 'Combien de pompes classiques enchaînes-tu, sans pause ?', type: 'one',
    opts: [['0', 'Aucune pour l’instant'], ['1', '1 à 5'], ['2', '6 à 15'], ['3', 'Plus de 15']] },
  { id: 'planche', section: 'Sport', q: 'Combien de temps tiens-tu la planche sur les avant-bras ?', type: 'one',
    opts: [['0', 'Moins de 20 secondes'], ['1', '20 à 45 secondes'], ['2', '45 à 90 secondes'], ['3', 'Plus de 90 secondes']] },
  { id: 'gene', section: 'Sport', q: 'As-tu une gêne ou une douleur récurrente ?', type: 'one',
    opts: [['none', 'Non, rien'], ['dos', 'Dos ou lombaires'], ['epaules', 'Épaules'], ['poignets', 'Poignets']] },
  { id: 'activites', section: 'Sport', q: 'Quelles activités pratiques-tu déjà ?', type: 'multi', max: 6,
    opts: [['danse', 'Danse'], ['skate', 'Skate'], ['velo', 'Vélo'], ['marche', 'Marche'], ['course', 'Course à pied'], ['rien', 'Aucune pour le moment']] },
  { id: 'petitdej', section: 'Alimentation', q: 'Que mange-t-on le plus souvent à ton petit-déjeuner ?', type: 'one',
    opts: [['sucre', 'Plutôt sucré (biscuits, gaufres, céréales)'], ['mixte', 'Un mélange sucré et salé'], ['sale', 'Plutôt salé ou protéiné (œufs, fromage, pain)'], ['rien', 'Je ne mange rien']] },
  { id: 'eau', section: 'Alimentation', q: 'Combien d’eau bois-tu par jour ?', type: 'one',
    opts: [['e0', 'Moins d’un demi-litre'], ['e1', 'Entre 0,5 et 1 litre'], ['e2', 'Entre 1 et 1,5 litre'], ['e3', 'Plus de 1,5 litre']] },
  { id: 'sucre', section: 'Alimentation', q: 'À quelle fréquence manges-tu des produits sucrés en dehors des repas ?', type: 'one',
    opts: [['jamais', 'Rarement'], ['parfois', 'Quelques fois par semaine'], ['jour', 'Tous les jours'], ['plusieurs', 'Plusieurs fois par jour']] },
  { id: 'ecran', section: 'Sommeil', q: 'Combien de temps passes-tu sur ton téléphone au lit avant de dormir ?', type: 'one',
    opts: [['s0', 'Pas du tout'], ['s30', 'Moins de 30 minutes'], ['s60', '30 à 60 minutes'], ['s90', 'Plus d’une heure']] },
  { id: 'reveil', section: 'Sommeil', q: 'Comment te sens-tu au réveil ?', type: 'one',
    opts: [['bien', 'Reposé'], ['moyen', 'Moyen'], ['fatigue', 'Fatigué']] },
  { id: 'peauType', section: 'Peau', q: 'Comment décrirais-tu ta peau du visage ?', type: 'one',
    opts: [['grasse', 'Grasse, qui brille vite'], ['mixte', 'Mixte (zone T grasse)'], ['seche', 'Sèche, qui tiraille'], ['normale', 'Normale'], ['nsp', 'Je ne sais pas']] },
  { id: 'peauSoucis', section: 'Peau', q: 'Quels sont tes soucis de peau ?', type: 'multi', max: 6,
    opts: [['boutons', 'Boutons'], ['pointsnoirs', 'Points noirs'], ['grain', 'Grain de peau irrégulier'], ['rougeurs', 'Rougeurs'], ['marques', 'Marques ou cicatrices'], ['aucun', 'Aucun']] },
  { id: 'cheveuxForme', section: 'Cheveux', q: 'Comment sont tes cheveux au naturel, une fois secs ?', type: 'one',
    opts: [['raides', 'Raides'], ['ondules', 'Ondulés'], ['boucles', 'Bouclés'], ['crepus', 'Crépus ou très frisés']] },
  { id: 'cuir', section: 'Cheveux', q: 'Comment est ton cuir chevelu ?', type: 'one',
    opts: [['gras', 'Gras, il se regraisse en 24 h'], ['normal', 'Normal'], ['sec', 'Sec, ça tiraille'], ['pellicules', 'Avec des pellicules']] },
  { id: 'priorites', section: 'Objectifs', q: 'Quelles sont tes trois priorités du moment ?', type: 'multi', max: 3,
    opts: [['muscle', 'Prendre du muscle'], ['ventre', 'Perdre du gras du ventre'], ['peau', 'Améliorer ma peau'], ['cheveux', 'Soigner mes cheveux'], ['memoire', 'Mémoire et concentration'], ['sommeil', 'Mieux dormir']] },
];

/* ---------------------------------------------------------------- SPORT */
// Chaque « slot » est une échelle de 4 exercices, du plus facile au plus difficile.
// type 'reps' = répétitions ; 'time' = secondes. side = par côté.
export const LADDERS = {
  push: { label: 'Pectoraux', ladder: [
    { name: 'Pompes inclinées, mains sur le lit', type: 'reps', base: 8, cue: 'Mains un peu plus larges que les épaules sur le bord du lit, corps aligné de la tête aux talons. Descends la poitrine vers le lit, coudes à 45°.' },
    { name: 'Pompes classiques', type: 'reps', base: 8, cue: 'Corps gainé comme une planche. Poitrine proche du sol, coudes à 45°, pousse fort en remontant.' },
    { name: 'Pompes lentes (3 s à la descente)', type: 'reps', base: 6, cue: 'Descends en comptant trois secondes, remonte franchement. Le tempo lent augmente le travail du muscle.' },
    { name: 'Pompes pieds surélevés', type: 'reps', base: 6, cue: 'Pieds posés sur le lit, mains au sol. Plus tu surélèves, plus tu sollicites les épaules et le haut des pectoraux.' },
  ] },
  shoulder: { label: 'Épaules', ladder: [
    { name: 'Élévations latérales, bouteilles de 1,5 L', type: 'reps', base: 12, cue: 'Une bouteille pleine dans chaque main, bras légèrement fléchis. Monte les bras jusqu’à hauteur d’épaules, redescends lentement.' },
    { name: 'Pike push-up (fessiers hauts)', type: 'reps', base: 6, cue: 'Corps en V inversé, hanches hautes. Descends le sommet du crâne vers le sol entre les mains, puis pousse.' },
    { name: 'Pike push-up pieds surélevés', type: 'reps', base: 6, cue: 'Même mouvement, pieds posés sur le lit. La charge sur les épaules augmente.' },
    { name: 'Pike lent pieds surélevés', type: 'reps', base: 5, cue: 'Descente en 3 secondes, pause d’une seconde en bas, poussée franche.' },
  ] },
  triceps: { label: 'Triceps', ladder: [
    { name: 'Dips sur le bord du lit, genoux fléchis', type: 'reps', base: 8, cue: 'Mains sur le bord d’un support stable, fessiers devant. Fléchis les coudes vers l’arrière, sans les écarter.' },
    { name: 'Dips sur le bord du lit, jambes tendues', type: 'reps', base: 8, cue: 'Jambes tendues devant toi. Garde les épaules basses et le dos proche du support.' },
    { name: 'Pompes diamant sur les genoux', type: 'reps', base: 8, cue: 'Mains rapprochées sous la poitrine, coudes le long du corps.' },
    { name: 'Pompes diamant', type: 'reps', base: 6, cue: 'Mains en losange, coudes serrés. Exercice exigeant pour les triceps.' },
  ] },
  biceps: { label: 'Biceps', ladder: [
    { name: 'Curl isométrique à la serviette', type: 'time', base: 20, cue: 'Une serviette sous un pied, coudes à 90°. Tire vers le haut avec les bras en résistant avec la jambe, sans bouger.' },
    { name: 'Curl avec bouteilles de 1,5 L', type: 'reps', base: 10, cue: 'Coudes collés au corps, monte sans balancer le buste, redescends en 2 secondes.' },
    { name: 'Curl lent (4 s à la descente), bouteilles', type: 'reps', base: 8, cue: 'Monte en 1 seconde, redescends en 4 secondes. La phase lente est la plus efficace.' },
    { name: 'Curl à une main, sac à dos chargé', type: 'reps', side: true, base: 8, cue: 'Sac à dos chargé de livres, tenu par la poignée. Reste strict, fais toutes les répétitions d’un côté puis de l’autre.' },
  ] },
  back: { label: 'Dos', ladder: [
    { name: 'Superman au sol', type: 'reps', base: 10, cue: 'Ventre au sol, bras tendus devant. Lève bras et jambes en serrant le dos et les fessiers, sans cambrer fort le bas du dos.' },
    { name: 'Superman avec pause de 2 s', type: 'reps', base: 10, cue: 'Même mouvement, tiens deux secondes en haut. Si le bas du dos tire, lève seulement les bras.' },
    { name: 'Rowing penché, sac à dos chargé', type: 'reps', base: 10, cue: 'Buste penché à 45°, dos plat. Tire le sac vers le bas du ventre en serrant les omoplates.' },
    { name: 'Rowing à un bras, sac à dos chargé', type: 'reps', side: true, base: 10, cue: 'Une main sur le lit pour te stabiliser. Tire le coude vers la hanche, fais un côté puis l’autre.' },
  ] },
  traps: { label: 'Trapèzes', ladder: [
    { name: 'Élévations en Y, ventre au sol', type: 'reps', base: 10, cue: 'Bras en Y, pouces vers le plafond. Lève les bras en serrant les omoplates, nuque relâchée.' },
    { name: 'Y-T-W au sol', type: 'reps', base: 6, cue: 'Enchaîne le Y, le T (bras en croix) et le W (coudes fléchis). Une série de 6 = 6 de chaque.' },
    { name: 'Haussements d’épaules, sac à dos chargé', type: 'reps', base: 12, cue: 'Sac chargé tenu devant les cuisses. Monte les épaules vers les oreilles, tiens une seconde, redescends.' },
    { name: 'Haussements lents, pause 2 s', type: 'reps', base: 10, cue: 'Tiens deux secondes tout en haut, redescends en 3 secondes.' },
  ] },
  abs: { label: 'Abdos', ladder: [
    { name: 'Dead bug', type: 'reps', base: 10, cue: 'Sur le dos, bras au plafond, genoux à 90°. Allonge un bras et la jambe opposée, bas du dos plaqué au sol.' },
    { name: 'Relevés de genoux allongé', type: 'reps', base: 12, cue: 'Sur le dos, ramène les genoux vers la poitrine en décollant le bassin, redescends lentement.' },
    { name: 'Relevés de jambes tendues', type: 'reps', base: 10, cue: 'Jambes tendues, bas du dos collé au sol. Descends sans toucher le sol, remonte.' },
    { name: 'Hollow hold (position du bateau)', type: 'time', base: 20, cue: 'Épaules et jambes décollées, bas du dos plaqué au sol. Tiens la position.' },
  ] },
  abs2: { label: 'Abdos (haut et obliques)', ladder: [
    { name: 'Crunch lent', type: 'reps', base: 12, cue: 'Mains derrière la tête sans tirer, monte les épaules en soufflant, redescends en 2 secondes.' },
    { name: 'Crunch inversé', type: 'reps', base: 12, cue: 'Genoux fléchis, enroule le bassin vers la poitrine. Mouvement lent, sans élan.' },
    { name: 'Bicyclette coudes-genoux', type: 'reps', base: 16, cue: 'Alterne coude gauche-genou droit et inversement, en contrôlant. Compte chaque côté.' },
    { name: 'Bicyclette lente (3 s par côté)', type: 'reps', base: 12, cue: 'Prends trois secondes par côté, buste décollé en continu.' },
  ] },
  core2: { label: 'Gainage', ladder: [
    { name: 'Planche sur les genoux', type: 'time', base: 20, cue: 'Avant-bras au sol, alignement genoux-épaules. Serre les fessiers et rentre le ventre.' },
    { name: 'Planche sur les avant-bras', type: 'time', base: 30, cue: 'Corps droit, bassin ni creusé ni trop haut. Respire normalement.' },
    { name: 'Planche avec toucher d’épaule', type: 'time', base: 30, cue: 'En planche haute, touche l’épaule opposée en gardant le bassin immobile.' },
    { name: 'Planche longue, bras tendus devant', type: 'time', base: 40, cue: 'Avant-bras avancés d’une main, gainage maximal. Serre fort les fessiers.' },
  ] },
  cardio: { label: 'Cardio', ladder: [
    { name: 'Step jacks (jumping jacks sans saut)', type: 'time', base: 30, silent: true, cue: 'Écarte une jambe puis l’autre en levant les bras. Silencieux et sans impact.' },
    { name: 'Montées de genoux rapides', type: 'time', base: 30, cue: 'Monte les genoux à hauteur de hanches, bras qui accompagnent. Reste léger sur les appuis.' },
    { name: 'Mountain climbers', type: 'time', base: 30, cue: 'En planche haute, ramène les genoux vers la poitrine en alternant, rythme soutenu.' },
    { name: 'Burpees sans saut', type: 'time', base: 30, cue: 'Descends au sol, pompe facultative, remonte et lève les bras sans sauter.' },
  ] },
};

export const SESSIONS = [
  { id: 'A', name: 'Poussée et abdos', tag: 'Pectoraux, triceps, épaules, abdos', slots: ['push', 'triceps', 'shoulder', 'abs', 'core2', 'cardio'] },
  { id: 'B', name: 'Dos et trapèzes', tag: 'Dos, trapèzes, biceps, gainage', slots: ['back', 'traps', 'biceps', 'abs2', 'core2', 'cardio'] },
  { id: 'C', name: 'Bras et épaules', tag: 'Biceps, triceps, épaules, abdos', slots: ['biceps', 'triceps', 'shoulder', 'abs2', 'abs', 'cardio'] },
  { id: 'D', name: 'Complet et dépense', tag: 'Tout le haut du corps, cardio', slots: ['push', 'back', 'abs', 'cardio', 'biceps', 'core2'] },
];

export const FORMATS = {
  mini:     { id: 'mini',     label: 'Mini',     mins: 5,  slots: 2, warm: 1, cool: 0, rest: 20 },
  express:  { id: 'express',  label: 'Express',  mins: 10, slots: 3, warm: 2, cool: 1, rest: 25 },
  standard: { id: 'standard', label: 'Standard', mins: 20, slots: 5, warm: 4, cool: 2, rest: 40 },
  complete: { id: 'complete', label: 'Complète', mins: 30, slots: 6, warm: 5, cool: 3, rest: 45 },
};

export const WARMUP = [
  { name: 'Cercles de bras', secs: 30, cue: 'Grands cercles lents, vers l’avant puis vers l’arrière.' },
  { name: 'Rotations de buste', secs: 30, cue: 'Pieds largeur de bassin, tourne le buste de chaque côté en relâchant les bras.' },
  { name: 'Chat-vache', secs: 30, cue: 'À quatre pattes, alterne dos rond et dos creux, lentement.' },
  { name: 'Rotations d’épaules et de nuque', secs: 30, cue: 'Roule les épaules vers l’arrière, puis incline la tête doucement de chaque côté.' },
  { name: 'Squats lents sans charge', secs: 30, cue: 'Descends en poussant les fesses vers l’arrière, remonte en poussant dans les talons.' },
];
export const COOLDOWN = [
  { name: 'Étirement des pectoraux', secs: 30, cue: 'Avant-bras contre un mur ou un cadre de porte, tourne doucement le buste à l’opposé.' },
  { name: 'Étirement triceps et épaules', secs: 30, cue: 'Un coude derrière la tête, tire doucement dessus avec l’autre main. Change de côté à la moitié.' },
  { name: 'Posture de l’enfant', secs: 30, cue: 'Assis sur les talons, bras allongés devant, respire profondément.' },
];

/* ---------------------------------------------------------------- CHEVEUX */
export const HAIR = {
  forme: {
    raides:  { label: 'Raides', tips: 'Les cheveux raides se regraissent vite car le sébum descend facilement. Évite les produits lourds qui les aplatissent.', produits: 'Poudre ou spray texturisant pour le volume, pâte ou cire mate pour la tenue.' },
    ondules: { label: 'Ondulés', tips: 'Les ondulations se forment mieux avec un peu d’humidité. Ne les brosse pas à sec, ça crée des frisottis.', produits: 'Crème ou mousse légère sur cheveux humides, spray au sel marin pour accentuer les vagues.' },
    boucles: { label: 'Bouclés', tips: 'Les boucles sont plus sèches car le sébum descend mal. Hydratation et douceur sont la priorité.', produits: 'Crème coiffante ou gel sans alcool sur cheveux humides, après-shampoing sans rinçage.' },
    crepus:  { label: 'Crépus', tips: 'Les cheveux très frisés sont fragiles et secs. Ils demandent beaucoup d’hydratation et peu de manipulation.', produits: 'Crème riche ou beurre léger, produit hydratant sans rinçage, huile légère pour sceller.' },
  },
  cuir: {
    gras:       { label: 'Gras', lavage: 2, conseil: 'Lavage un jour sur deux : se laver souvent un cuir chevelu gras ne l’aggrave pas si le shampoing reste doux.' },
    normal:     { label: 'Normal', lavage: 3, conseil: 'Lavage tous les deux à trois jours selon la sensation.' },
    sec:        { label: 'Sec', lavage: 3, conseil: 'Lavage deux à trois fois par semaine avec un shampoing doux, eau tiède plutôt que chaude.' },
    pellicules: { label: 'Pellicules', lavage: 2, conseil: 'Un shampoing antipelliculaire en pharmacie (par exemple avec kétoconazole ou pyrithione de zinc), laissé 3 minutes avant rinçage. Si ça persiste après un mois, avis médical.' },
  },
  longueur: {
    tc: { label: 'Très courts', style: 'Pâte ou cire mate, une noisette réchauffée entre les paumes, répartie à contre-sens puis lissée dans le sens de la coiffure.' },
    c:  { label: 'Courts', style: 'Cheveux humides, un peu de crème ou de pâte. Sèche avec le sèche-cheveux en tirant avec les doigts dans la direction voulue, puis fixe avec la pâte.' },
    mi: { label: 'Mi-longs', style: 'Sur cheveux humides, crème légère ou spray au sel marin. Sèche en donnant du mouvement avec les doigts. Évite le gel qui fige.' },
    l:  { label: 'Longs', style: 'Démêle de bas en haut avec un peigne à grosses dents, sur cheveux humides avec un après-shampoing. Un peu de sérum sur les pointes.' },
  },
};

/* ---------------------------------------------------------------- FICHES */
export const SOURCES = {
  sport: [
    ['OMS, Lignes directrices sur l’activité physique et la sédentarité (2020)', 'Au moins 2 jours de renforcement musculaire par semaine pour les adultes.'],
    ['ACSM, Progression models in resistance training (2009)', 'Principe de surcharge progressive : augmenter peu à peu répétitions, difficulté ou volume.'],
    ['Schoenfeld et al., J Strength Cond Res (2017)', 'Des charges légères à la fatigue donnent un gain de muscle comparable aux charges lourdes.'],
    ['Vispute et al., J Strength Cond Res (2011)', 'Six semaines d’exercices pour les abdos n’ont pas réduit la graisse abdominale.'],
  ],
  peau: [
    ['American Academy of Dermatology, Guidelines of care for the management of acne vulgaris (2024)', 'Nettoyage doux, actifs topiques, hydratation, protection solaire, avis médical pour les formes persistantes.'],
    ['American Academy of Dermatology, recommandations de photoprotection', 'Crème solaire à large spectre, indice 30 ou plus.'],
  ],
  cheveux: [
    ['American Academy of Dermatology, conseils de soin des cheveux', 'Fréquence de lavage selon le cuir chevelu, shampoing doux, limiter la chaleur.'],
  ],
  sommeil: [
    ['Watson et al., Consensus de l’AASM et de la SRS (2015)', 'Les adultes devraient dormir 7 heures ou plus par nuit.'],
    ['Chang et al., PNAS (2015)', 'L’usage d’écrans lumineux le soir retarde l’endormissement et réduit la qualité du sommeil.'],
    ['Drake et al., J Clin Sleep Med (2013)', 'La caféine consommée 6 heures avant le coucher réduit le sommeil.'],
  ],
  alim: [
    ['OMS, Lignes directrices sur les sucres libres (2015)', 'Limiter les sucres libres à moins de 10 % de l’apport énergétique, idéalement moins de 5 %.'],
    ['Jäger et al., Position de l’ISSN sur les protéines (2017)', 'Entre 1,4 et 2,0 g de protéines par kg et par jour pour soutenir la prise de muscle.'],
    ['EFSA (2010), Apports de référence en eau', 'Environ 2,5 L d’eau par jour au total pour un homme adulte, aliments compris.'],
    ['Santé publique France, PNNS', 'Au moins cinq fruits et légumes par jour.'],
  ],
  memoire: [
    ['Cepeda et al., Psychological Bulletin (2006)', 'Espacer les révisions améliore la mémorisation à long terme.'],
    ['Roediger et Karpicke, Psychological Science (2006)', 'Se tester (rappel actif) retient mieux que relire.'],
    ['Dresler et al., Neuron (2017)', 'La méthode des lieux améliore la mémoire chez des adultes sans entraînement préalable.'],
  ],
};

export const PEAU_PRODUITS = [
  { etape: 'Nettoyant doux, à rincer', exemples: 'CeraVe gel moussant, La Roche-Posay Effaclar gel moussant, Bioderma Sébium gel moussant' },
  { etape: 'Actif ciblé, gel ou sérum incolore', exemples: 'The Ordinary Niacinamide 10 % + Zinc 1 %, La Roche-Posay Effaclar Duo+M' },
  { etape: 'Hydratant léger non gras', exemples: 'Avène Cleanance Hydra, CeraVe lait hydratant, La Roche-Posay Toleriane' },
  { etape: 'Crème solaire fluide, sans fini blanc', exemples: 'La Roche-Posay Anthelios UVMune 400 fluide, Bioderma Photoderm' },
];
export const PEAU_NOTE_PRODUITS = 'Ce sont des exemples de gammes courantes en pharmacie, pas une liste testée par l’appli. Demande conseil à un pharmacien selon ta peau.';

export const MEMOIRE_LIEUX = [
  'Choisis un trajet que tu connais par cœur, par exemple de ta porte d’entrée à ta chambre.',
  'Repère 6 à 10 endroits fixes sur ce trajet (porte, miroir, canapé, frigo…).',
  'Transforme chaque élément à retenir en image bizarre ou exagérée et pose-la sur un endroit.',
  'Pour rappeler la liste, refais le trajet dans ta tête et regarde chaque image.',
];

export const SUCRE_SEMAINES = [
  'Ajoute une source de protéines à ton petit-déjeuner (œuf, fromage blanc, yaourt nature, fromage) avant le sucré.',
  'Réduis de moitié la part sucrée du petit-déjeuner (une gaufre au lieu de deux, par exemple).',
  'Remplace le sucré du matin par du pain complet ou des flocons d’avoine avec un fruit, selon ce qu’il y a à la maison.',
  'Garde un petit-déjeuner salé ou protéiné au moins 5 jours sur 7.',
];

export const DISCLAIMER = 'Cette appli ne remplace pas un avis médical. En cas de douleur persistante ou de doute sur ta peau, ta santé ou ta forme, consulte un professionnel.';
