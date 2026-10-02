/* ============================================================
   lesson-engine.js — Physical Science · Lesson Engine
   Version: 2.0.0
   Depends on: config.js, store.js, gamify.js, ui-helpers.js
   ============================================================ */

window.LessonEngine = (function () {
  'use strict';

  // ============================================================
  // CONTENT BANK [week][day] = { intro, objectives, content, activity, check, quiz }
  // ============================================================
  const CONTENT = {
    1: {
      1: {
        intro: "The Big Bang theory explains how the universe began as a hot, dense point and expanded. The lightest elements—hydrogen and helium—were the first to form.",
        objectives: ["Explain the Big Bang theory's formation of light elements","Cite evidence: cosmic microwave background, H/He abundance"],
        content: [
          "<h4>Big Bang Nucleosynthesis</h4><p>Within the first three minutes after the Big Bang, protons and neutrons fused to form hydrogen, helium, and traces of lithium. The observed 75% hydrogen / 25% helium ratio matches predictions.</p>",
          "<h4>Key Evidence</h4><ul><li>Cosmic Microwave Background (CMB) radiation — the leftover heat of the Big Bang</li><li>Redshift of distant galaxies — the universe is expanding</li><li>Primordial abundances of H and He</li></ul>"
        ],
        activity: "Draw a diagram showing the timeline of the Big Bang from 10⁻⁴³ s to 380,000 years.",
        check: "Why is hydrogen the most abundant element in the universe?",
        quiz: [
          { q: "Which piece of evidence BEST supports the Big Bang theory?", options: ["Abundance of H and He","Presence of iron in the crust","Discovery of exoplanets","Existence of black holes"], answer: 0 },
          { q: "The Big Bang theory states that the universe began as a:", options: ["Steady, unchanging void","Hot, dense point that expanded","Cold, empty space","Rotating disc of dust"], answer: 1 },
          { q: "What does the cosmic microwave background radiation represent?", options: ["Light from the first stars","Leftover heat from the Big Bang","Glow of distant galaxies","Radiation from black holes"], answer: 1 }
        ]
      },
      2: {
        intro: "Stars are the factories where heavier elements are forged. Hydrogen fuses into helium, and in more massive stars, helium fuses into carbon, oxygen, and beyond.",
        objectives: ["Describe stellar nucleosynthesis","Explain the proton-proton chain and CNO cycle"],
        content: [
          "<h4>Stellar Nucleosynthesis</h4><p>In main-sequence stars, hydrogen nuclei fuse into helium. Massive stars continue fusion to form carbon, oxygen, neon, silicon, and iron.</p>",
          "<h4>Fusion Steps</h4><ul><li>H → He (main sequence)</li><li>He → C, O (red giant)</li><li>C → Ne, Na, Mg</li><li>O → Si, S</li><li>Si → Fe (final stage)</li></ul>"
        ],
        activity: "Illustrate the onion-layer structure of a massive star before supernova.",
        check: "Why does fusion stop at iron?",
        quiz: [
          { q: "Which element forms in the core of a massive star at the END of fusion?", options: ["Carbon","Oxygen","Iron","Uranium"], answer: 2 },
          { q: "What is the primary fusion process in main-sequence stars?", options: ["Helium to carbon","Hydrogen to helium","Carbon to oxygen","Iron to gold"], answer: 1 },
          { q: "Fusion in stars releases energy because:", options: ["Atoms split apart","Smaller nuclei combine into larger ones","Electrons fall into the nucleus","Protons decay"], answer: 1 }
        ]
      },
      3: {
        intro: "Nuclear fusion reactions can be written as balanced equations—just like chemical equations—but with mass numbers and atomic numbers on both sides.",
        objectives: ["Write nuclear fusion equations","Balance mass number (A) and atomic number (Z)"],
        content: [
          "<h4>Writing Fusion Reactions</h4><p>Example: ¹H + ¹H → ²H + e⁺ + ν (proton-proton chain step 1)</p>",
          "<h4>Practice Reactions</h4><ul><li>²H + ¹H → ³He + γ</li><li>³He + ³He → ⁴He + 2¹H</li><li>⁴He + ⁴He → ⁸Be + γ</li></ul>"
        ],
        activity: "Write and balance 5 fusion reactions that occur in stars.",
        check: "What must be conserved when writing a nuclear reaction?",
        quiz: [
          { q: "In a nuclear equation, which two quantities must be conserved?", options: ["Mass number and atomic number","Mass and color","Volume and charge","Temperature and pressure"], answer: 0 },
          { q: "Which reaction is the first step of the proton-proton chain?", options: ["¹H + ¹H → ²H + e⁺ + ν","⁴He + ⁴He → ⁸Be","²³⁸U → ²³⁴Th + ⁴He","¹⁴C → ¹⁴N + e⁻"], answer: 0 },
          { q: "In ³He + ³He → ⁴He + 2¹H, how many total nucleons appear on each side?", options: ["3","4","6","8"], answer: 2 }
        ]
      },
      4: {
        intro: "Elements heavier than iron cannot be formed by ordinary stellar fusion—they require the extreme conditions of supernovae or neutron star mergers.",
        objectives: ["Describe supernova nucleosynthesis","Explain the r-process and s-process"],
        content: [
          "<h4>Beyond Iron</h4><p>Iron is the most tightly bound nucleus—fusion beyond it absorbs energy. Heavier elements form during supernova explosions via rapid neutron capture (r-process).</p>",
          "<h4>Formation Mechanisms</h4><ul><li>s-process (slow neutron capture) — in AGB stars</li><li>r-process (rapid neutron capture) — in supernovae</li><li>Neutron star mergers — gold, platinum</li></ul>"
        ],
        activity: "Trace the origin of gold on Earth back to a neutron star merger.",
        check: "Why are elements heavier than iron rare in the universe?",
        quiz: [
          { q: "Elements heavier than iron are formed mainly in:", options: ["Main sequence stars","Supernovae and neutron star mergers","The Sun","The Moon"], answer: 1 },
          { q: "The r-process stands for:", options: ["Rapid neutron capture","Reverse fusion","Radioactive decay","Redshift"], answer: 0 },
          { q: "Why is iron the final element produced by stellar fusion?", options: ["It is the heaviest element","Fusion past iron absorbs energy","Iron cannot fuse","Iron is unstable"], answer: 1 }
        ]
      }
    },
    2: {
      1: {
        intro: "Ancient Greek philosophers were the first to speculate about the nature of matter. Democritus proposed that matter is made of indivisible particles called atomos.",
        objectives: ["Describe Democritus' atomic idea","Compare it with Aristotle's view"],
        content: ["<h4>Democritus (~460–370 BC)</h4><p>Proposed that all matter is made of tiny, indivisible particles called <em>atomos</em>.</p>","<h4>Aristotle's Counter-View</h4><p>Aristotle rejected atomism, arguing matter was continuous and made of four elements. His view dominated for ~2000 years.</p>"],
        activity: "Debate: Was Democritus 'right' even without experiments?",
        check: "Why did Aristotle's view win over Democritus'?",
        quiz: [
          { q: "Who proposed that matter is made of indivisible particles called 'atomos'?", options: ["Aristotle","Democritus","Plato","Socrates"], answer: 1 },
          { q: "Aristotle believed matter was made of:", options: ["Atoms","Four elements","Protons and electrons","Empty space"], answer: 1 },
          { q: "Which view dominated science for about 2,000 years?", options: ["Atomism","Aristotelian natural philosophy","Heliocentrism","Quantum theory"], answer: 1 }
        ]
      },
      2: {
        intro: "The Ancient Greeks believed all matter was composed of four fundamental elements: earth, water, air, and fire.",
        objectives: ["Identify the four classical elements","Explain their properties and combinations"],
        content: ["<h4>The Four Elements</h4><ul><li><strong>Earth</strong> — cold and dry, moves downward</li><li><strong>Water</strong> — cold and wet, moves downward</li><li><strong>Air</strong> — hot and wet, moves upward</li><li><strong>Fire</strong> — hot and dry, moves upward</li></ul>","<h4>Aether</h4><p>A fifth element, <em>aether</em>, was thought to fill the heavens.</p>"],
        activity: "Classify common materials by their supposed Greek element composition.",
        check: "Why did the four-element theory persist for so long?",
        quiz: [
          { q: "Which of these was NOT one of the four classical Greek elements?", options: ["Earth","Water","Metal","Fire"], answer: 2 },
          { q: "What did Ancient Greeks think filled the heavens?", options: ["Aether","Plasma","Vacuum","Oxygen"], answer: 0 },
          { q: "Fire was considered:", options: ["Cold and wet","Hot and dry","Hot and wet","Cold and dry"], answer: 1 }
        ]
      },
      3: {
        intro: "Greek philosophers classified motion into three types: natural, violent, and celestial.",
        objectives: ["Distinguish natural, violent, and celestial motion","Explain why they thought celestial motion was perfect"],
        content: ["<h4>Three Types of Terrestrial Motion</h4><ul><li><strong>Natural</strong> — objects return to their natural place</li><li><strong>Violent</strong> — forced motion, ends when force stops</li><li><strong>Celestial</strong> — perfect circular motion of heavenly bodies</li></ul>"],
        activity: "Sort everyday examples of motion into the three Greek categories.",
        check: "Why did Greeks believe celestial motion was different from Earthly motion?",
        quiz: [
          { q: "According to Aristotle, a stone falling to the ground is an example of:", options: ["Natural motion","Violent motion","Celestial motion","Random motion"], answer: 0 },
          { q: "A cart pushed by a horse is an example of:", options: ["Natural motion","Violent motion","Celestial motion","Circular motion"], answer: 1 },
          { q: "The Ancient Greeks believed celestial bodies moved in:", options: ["Straight lines","Perfect circles","Ellipses","Random paths"], answer: 1 }
        ]
      },
      4: {
        intro: "The Greeks had several lines of evidence that the Earth is spherical—not flat.",
        objectives: ["Cite evidence for a spherical Earth","Explain the lunar eclipse argument"],
        content: ["<h4>Evidence for a Spherical Earth</h4><ul><li>Lunar eclipses: Earth's shadow on the Moon is always circular</li><li>Ships disappear hull-first over the horizon</li><li>Different constellations visible at different latitudes</li><li>Eratosthenes' measurement of Earth's circumference (~240 BC)</li></ul>"],
        activity: "Recreate Eratosthenes' method using two cities' shadow angles.",
        check: "Which evidence for a spherical Earth is the most convincing?",
        quiz: [
          { q: "Which observation provided evidence that the Earth is spherical?", options: ["The Moon rises in the east","Earth's shadow on the Moon during an eclipse is circular","The Sun is bright","Stars twinkle at night"], answer: 1 },
          { q: "Eratosthenes estimated Earth's circumference using:", options: ["A telescope","Shadow angles in two cities","A pendulum","The Moon's orbit"], answer: 1 },
          { q: "Ships disappearing hull-first over the horizon is evidence that:", options: ["The Earth is flat","The Earth is spherical","The ocean is shallow","Ships sink"], answer: 1 }
        ]
      }
    },
    3: {
      1: {
        intro: "Alchemy was a medieval forerunner of chemistry. Alchemists sought to turn base metals into gold and to find the elixir of life.",
        objectives: ["Describe the goals of alchemy","Explain alchemy's contributions to modern chemistry"],
        content: ["<h4>Goals of Alchemy</h4><ul><li>Transmutation of base metals into gold</li><li>The Philosopher's Stone</li><li>The Elixir of Life</li></ul>","<h4>Contributions to Chemistry</h4><ul><li>Discovery of acids</li><li>Lab techniques (distillation, filtration, sublimation)</li><li>Discovery of phosphorus, zinc, arsenic</li></ul>"],
        activity: "Research one alchemist and present findings.",
        check: "How did alchemy's failures lead to chemistry's successes?",
        quiz: [
          { q: "What was the primary goal of alchemists?", options: ["To discover electrons","To transform base metals into gold","To build telescopes","To classify organisms"], answer: 1 },
          { q: "Which lab technique was developed by alchemists?", options: ["Spectroscopy","Distillation","Chromatography","Electrophoresis"], answer: 1 },
          { q: "Alchemy is considered the forerunner of:", options: ["Astronomy","Modern chemistry","Biology","Physics"], answer: 1 }
        ]
      },
      2: {
        intro: "Alchemists developed many laboratory tools and techniques that are still used in modern chemistry.",
        objectives: ["Identify alchemical tools","Describe distillation, filtration, and sublimation"],
        content: ["<h4>Key Techniques</h4><ul><li><strong>Distillation</strong> — separating liquids by boiling point</li><li><strong>Filtration</strong> — separating solids from liquids</li><li><strong>Sublimation</strong> — solid → gas directly</li><li><strong>Calcination</strong> — heating to drive off volatiles</li></ul>"],
        activity: "Perform a simple distillation or filtration in the lab.",
        check: "Which alchemical technique is most used in modern labs?",
        quiz: [
          { q: "Which technique separates liquids by boiling point?", options: ["Filtration","Distillation","Sublimation","Calcination"], answer: 1 },
          { q: "Which process goes directly from solid to gas?", options: ["Melting","Evaporation","Sublimation","Condensation"], answer: 2 },
          { q: "Filtration separates:", options: ["Liquids from liquids","Solids from liquids","Gases from gases","Metals from nonmetals"], answer: 1 }
        ]
      },
      3: {
        intro: "Diurnal motion is the daily apparent motion of celestial objects across the sky. Annual motion is the yearly cycle. Precession is the slow wobble of Earth's axis.",
        objectives: ["Define diurnal, annual, and precession motion","Explain their causes"],
        content: ["<h4>Three Motions</h4><ul><li><strong>Diurnal</strong> — daily east-to-west motion due to Earth's rotation</li><li><strong>Annual</strong> — yearly motion due to Earth's revolution around the Sun</li><li><strong>Precession</strong> — 26,000-year wobble of Earth's axis</li></ul>"],
        activity: "Observe and record the Sun's position at the same time across several days.",
        check: "What causes the precession of the equinoxes?",
        quiz: [
          { q: "Diurnal motion refers to:", options: ["Yearly motion of stars","Daily east-to-west motion of the sky","Wobble of Earth's axis","Orbit of the Moon"], answer: 1 },
          { q: "Precession of the equinoxes takes about:", options: ["1 year","100 years","26,000 years","1 million years"], answer: 2 },
          { q: "Diurnal motion is caused by:", options: ["Earth's revolution","Earth's rotation","The Moon's orbit","The Sun's motion"], answer: 1 }
        ]
      },
      4: {
        intro: "Alchemy was not 'bad science'—it was the ancestral laboratory of modern chemistry. Its tools and curiosity set the stage for the Scientific Revolution.",
        objectives: ["Trace alchemy's transition into chemistry","Name key figures in the transition"],
        content: ["<h4>From Alchemy to Chemistry</h4><ul><li>Robert Boyle (1661) — <em>The Sceptical Chymist</em>, rejected four elements</li><li>Antoine Lavoisier (1789) — Law of Conservation of Mass</li><li>John Dalton (1803) — Atomic theory</li></ul>"],
        activity: "Create a timeline: alchemy → Boyle → Lavoisier → Dalton.",
        check: "Who is considered the 'father of modern chemistry' and why?",
        quiz: [
          { q: "Who wrote The Sceptical Chymist (1661)?", options: ["Dalton","Lavoisier","Boyle","Newton"], answer: 2 },
          { q: "Lavoisier is known for the Law of:", options: ["Universal Gravitation","Conservation of Mass","Thermodynamics","Definite Proportions"], answer: 1 },
          { q: "Which scientist proposed atomic theory in 1803?", options: ["Boyle","Lavoisier","Dalton","Mendeleev"], answer: 2 }
        ]
      }
    },
    4: {
      1: {
        intro: "John Dalton (1766–1844) revived the atomic theory with quantitative evidence. His work explained the laws of chemical combination.",
        objectives: ["State Dalton's atomic theory postulates","Explain how his theory explained chemical laws"],
        content: ["<h4>Dalton's Atomic Theory (1803)</h4><ol><li>All matter is made of atoms.</li><li>Atoms of the same element are identical.</li><li>Atoms of different elements differ in mass.</li><li>Atoms combine in whole-number ratios.</li><li>Atoms are neither created nor destroyed in chemical reactions.</li></ol>"],
        activity: "Illustrate each postulate with a diagram.",
        check: "Which of Dalton's postulates is now known to be false?",
        quiz: [
          { q: "Which is a postulate of Dalton's atomic theory?", options: ["Atoms are divisible","Atoms combine in whole-number ratios","Atoms change identity in reactions","Atoms have no mass"], answer: 1 },
          { q: "Which of Dalton's postulates is now known to be false?", options: ["All matter is made of atoms","Atoms of the same element are identical","Atoms cannot be created or destroyed in reactions","Atoms combine in fixed ratios"], answer: 1 },
          { q: "In what year did Dalton propose his atomic theory?", options: ["1661","1789","1803","1897"], answer: 2 }
        ]
      },
      2: {
        intro: "Dalton's postulates explained the Law of Definite Proportions and the Law of Multiple Proportions.",
        objectives: ["Explain how Dalton's theory explained the laws of chemical combination","Solve problems using the laws of proportions"],
        content: ["<h4>Laws Explained</h4><ul><li><strong>Definite Proportions</strong> — a compound always has the same ratio of elements by mass</li><li><strong>Multiple Proportions</strong> — when two elements form multiple compounds, the ratios are small whole numbers</li></ul>"],
        activity: "Analyze data showing CO vs CO₂ to verify multiple proportions.",
        check: "How did Dalton's theory explain Proust's Law?",
        quiz: [
          { q: "The Law of Definite Proportions states that:", options: ["Any two elements combine in any ratio","A compound always has the same mass ratio of elements","Elements can be created","Atoms are indivisible"], answer: 1 },
          { q: "Which law explains why CO and CO₂ have different mass ratios of C:O?", options: ["Definite Proportions","Multiple Proportions","Conservation of Mass","Universal Gravitation"], answer: 1 },
          { q: "Dalton's theory supported Proust's law because:", options: ["Atoms are continuous","Compounds are made of fixed whole-number ratios of atoms","Atoms are negatively charged","Matter is empty"], answer: 1 }
        ]
      },
      3: {
        intro: "With atomic theory established, chemists could systematically discover and identify new elements.",
        objectives: ["Describe how new elements were discovered after Dalton","Explain the role of atomic weights"],
        content: ["<h4>Element Discovery</h4><ul><li>Atomic weights became the fingerprint of each element</li><li>New elements (Na, K, Cl, Br, I) isolated via electrochemistry and spectroscopy</li></ul>","<h4>Mendeleev (1869)</h4><p>Arranged elements by atomic weight and predicted undiscovered ones (Ga, Sc, Ge).</p>"],
        activity: "Recreate Mendeleev's 1871 periodic table and predict missing elements.",
        check: "Why did Mendeleev leave gaps in his periodic table?",
        quiz: [
          { q: "Who arranged the first widely accepted periodic table?", options: ["Dalton","Mendeleev","Boyle","Lavoisier"], answer: 1 },
          { q: "Mendeleev arranged elements by:", options: ["Atomic number","Atomic mass","Electron count","Color"], answer: 1 },
          { q: "Mendeleev left gaps in his table to:", options: ["Save space","Predict undiscovered elements","Avoid publishing","Please his critics"], answer: 1 }
        ]
      },
      4: {
        intro: "The periodic table evolved from Dalton's atomic theory through Mendeleev's arrangement to Moseley's atomic number ordering.",
        objectives: ["Trace periodic table evolution","Distinguish atomic weight vs atomic number ordering"],
        content: ["<h4>Periodic Table Timeline</h4><ul><li>1803 — Dalton: atomic weights</li><li>1869 — Mendeleev: by atomic weight</li><li>1913 — Moseley: by atomic number</li><li>Modern — by electron configuration</li></ul>"],
        activity: "Create a 4-stage timeline showing how the periodic table evolved.",
        check: "Why is the modern periodic table ordered by atomic number?",
        quiz: [
          { q: "Who first arranged the periodic table by atomic number?", options: ["Dalton","Mendeleev","Moseley","Bohr"], answer: 2 },
          { q: "Modern periodic tables are ordered by:", options: ["Atomic mass","Atomic number","Color","Density"], answer: 1 },
          { q: "Moseley's contribution came in:", options: ["1803","1869","1913","1932"], answer: 2 }
        ]
      }
    },
    5: {
      1: {
        intro: "The discovery of the electron, proton, and neutron revolutionized our understanding of atomic structure.",
        objectives: ["Name the three subatomic particles and their properties","Explain the experiments that discovered them"],
        content: ["<h4>Subatomic Particles</h4><ul><li><strong>Electron</strong> — Thomson, 1897 (cathode rays)</li><li><strong>Proton</strong> — Rutherford, 1919 (gold foil)</li><li><strong>Neutron</strong> — Chadwick, 1932</li></ul>"],
        activity: "Draw and label the atom as understood after each discovery.",
        check: "Which discovery most changed the model of the atom?",
        quiz: [
          { q: "Who discovered the electron in 1897?", options: ["Rutherford","Thomson","Bohr","Chadwick"], answer: 1 },
          { q: "Who discovered the neutron in 1932?", options: ["Thomson","Rutherford","Chadwick","Moseley"], answer: 2 },
          { q: "Which subatomic particle has a negative charge?", options: ["Proton","Neutron","Electron","Positron"], answer: 2 }
        ]
      },
      2: {
        intro: "Four scientists—Thomson, Rutherford, Moseley, and Bohr—each contributed a crucial piece to atomic theory.",
        objectives: ["Match each scientist to their contribution","Compare atomic models"],
        content: ["<h4>Key Contributions</h4><ul><li><strong>J.J. Thomson</strong> — Plum pudding model, discovered electron</li><li><strong>Ernest Rutherford</strong> — Nuclear model, gold foil experiment</li><li><strong>Henry Moseley</strong> — Atomic number = proton count</li><li><strong>Niels Bohr</strong> — Quantized electron orbits</li></ul>"],
        activity: "Create a timeline card for each scientist with model diagrams.",
        check: "How did Rutherford's model differ from Thomson's?",
        quiz: [
          { q: "Who proposed the plum pudding model?", options: ["Rutherford","Thomson","Bohr","Dalton"], answer: 1 },
          { q: "Rutherford's model is called the:", options: ["Plum pudding model","Nuclear model","Bohr model","Quantum model"], answer: 1 },
          { q: "Moseley showed that atomic number equals the number of:", options: ["Neutrons","Protons","Electrons","Nucleons"], answer: 1 }
        ]
      },
      3: {
        intro: "The nuclear model places protons and neutrons in the nucleus, with electrons orbiting in shells.",
        objectives: ["Describe the nuclear model","Locate protons, neutrons, and electrons in the atom"],
        content: ["<h4>Nuclear Model (Rutherford–Bohr)</h4><ul><li>Nucleus — small, dense, positive (protons + neutrons)</li><li>Electrons — orbiting in shells (Bohr) or probability clouds (modern)</li><li>Most of the atom is empty space</li></ul>"],
        activity: "Build a physical or digital Bohr model of carbon.",
        check: "Why is the atom mostly empty space?",
        quiz: [
          { q: "The nucleus of an atom contains:", options: ["Only protons","Protons and neutrons","Protons and electrons","Only electrons"], answer: 1 },
          { q: "In the nuclear model, electrons are found:", options: ["Inside the nucleus","Orbiting the nucleus","In the protons","Nowhere"], answer: 1 },
          { q: "The atom is mostly:", options: ["Solid matter","Empty space","Made of electrons","Made of neutrons"], answer: 1 }
        ]
      },
      4: {
        intro: "Today we consolidate all atomic models into a single timeline—from Democritus to the quantum model.",
        objectives: ["Summarize the historical progression of atomic models","Present the timeline creatively"],
        content: ["<h4>Atomic Model Timeline</h4><ul><li>400 BC — Democritus: atomos</li><li>1803 — Dalton: solid sphere</li><li>1897 — Thomson: plum pudding</li><li>1911 — Rutherford: nuclear</li><li>1913 — Bohr: planetary</li><li>1926 — Schrödinger: quantum</li></ul>"],
        activity: "Create a poster timeline of atomic models (Performance Task).",
        check: "Which model is currently accepted?",
        quiz: [
          { q: "Which is the correct order of atomic models?", options: ["Dalton → Thomson → Rutherford → Bohr","Bohr → Dalton → Thomson → Rutherford","Rutherford → Dalton → Bohr → Thomson","Thomson → Dalton → Bohr → Rutherford"], answer: 0 },
          { q: "Which model is currently accepted?", options: ["Plum pudding","Nuclear","Bohr planetary","Quantum mechanical"], answer: 3 },
          { q: "The quantum model was proposed by:", options: ["Bohr","Schrödinger","Rutherford","Dalton"], answer: 1 }
        ]
      }
    },
    6: {
      1: {
        intro: "Atomic number (Z) — the number of protons — is the identity of an element. Changing Z creates a new element.",
        objectives: ["Explain the concept of atomic number","Describe how new elements are synthesized"],
        content: ["<h4>Atomic Number & Transmutation</h4><p>Rutherford (1919) bombarded nitrogen with alpha particles and produced oxygen—the first artificial transmutation.</p>","<h4>Synthetic Elements</h4><ul><li>Technetium (1937) — first synthetic</li><li>Plutonium (1940)</li><li>Oganesson (2002, Z=118) — latest</li></ul>"],
        activity: "Research one synthetic element and how it was made.",
        check: "How is the atomic number of a new element confirmed?",
        quiz: [
          { q: "The atomic number equals the number of:", options: ["Neutrons","Protons","Nucleons","Electrons in the outer shell"], answer: 1 },
          { q: "Which was the FIRST synthetic element?", options: ["Plutonium","Technetium","Oganesson","Americium"], answer: 1 },
          { q: "Rutherford's 1919 experiment transmuted nitrogen into:", options: ["Oxygen","Carbon","Helium","Hydrogen"], answer: 0 }
        ]
      },
      2: {
        intro: "Nuclear reactions can be written as equations. Mass number and atomic number must balance on both sides.",
        objectives: ["Write nuclear reactions for transmutation","Balance mass number and atomic number"],
        content: ["<h4>Transmutation Reactions</h4><p>Example: ¹⁴N + ⁴He → ¹⁷O + ¹H</p>","<h4>Practice</h4><ul><li>²³⁸U + n → ²³⁹Pu + γ</li><li>²⁴²Pu + ²²Ne → ²⁶⁰Rf + 4n</li></ul>"],
        activity: "Write 5 nuclear reactions for synthesizing known elements.",
        check: "What is conserved in a nuclear reaction?",
        quiz: [
          { q: "Which is a balanced nuclear reaction?", options: ["¹⁴N + ⁴He → ¹⁷O + ¹H","¹H → ²H","⁴He → ²H + ²H","²³⁸U → ²³⁹Pu"], answer: 0 },
          { q: "In a nuclear reaction, what must be conserved?", options: ["Only mass number","Only atomic number","Both mass number and atomic number","Neither"], answer: 2 },
          { q: "The alpha particle emitted is equivalent to:", options: ["A hydrogen nucleus","A helium nucleus","An electron","A neutron"], answer: 1 }
        ]
      },
      3: {
        intro: "Radioactive decay produces alpha, beta, and gamma radiation—each has distinct properties and effects on the nucleus.",
        objectives: ["Distinguish alpha, beta, and gamma decay","Write balanced nuclear decay equations"],
        content: ["<h4>Types of Decay</h4><ul><li><strong>Alpha (α)</strong> — emits ⁴He nucleus</li><li><strong>Beta-minus (β⁻)</strong> — neutron → proton + electron</li><li><strong>Beta-plus (β⁺)</strong> — proton → neutron + positron</li><li><strong>Gamma (γ)</strong> — energy only, no mass change</li></ul>"],
        activity: "Balance 10 decay equations and identify the type.",
        check: "How does beta decay change the atomic number?",
        quiz: [
          { q: "Which type of decay emits a helium nucleus?", options: ["Alpha","Beta","Gamma","Electron capture"], answer: 0 },
          { q: "Beta-minus decay changes the atomic number by:", options: ["+1","−1","+2","0"], answer: 0 },
          { q: "Which type of decay involves only energy?", options: ["Alpha","Beta","Gamma","Fission"], answer: 2 }
        ]
      },
      4: {
        intro: "Synthetic elements have applications in medicine, energy, and research.",
        objectives: ["Identify uses of synthetic elements","Evaluate benefits and risks"],
        content: ["<h4>Applications</h4><ul><li>Tc-99m — medical imaging</li><li>Pu-239 — nuclear fuel and weapons</li><li>Am-241 — smoke detectors</li><li>Cf-252 — neutron source</li></ul>"],
        activity: "Debate: Should we keep synthesizing new elements?",
        check: "What is the most beneficial synthetic element?",
        quiz: [
          { q: "Tc-99m is used in:", options: ["Smoke detectors","Medical imaging","Nuclear weapons","Agriculture"], answer: 1 },
          { q: "Am-241 is used in:", options: ["Medical imaging","Smoke detectors","Batteries","Fertilizers"], answer: 1 },
          { q: "Which of the following is a risk of synthetic elements?", options: ["Radioactivity exposure","Too cheap energy","Overpopulation","Food spoilage"], answer: 0 }
        ]
      }
    },
    7: {
      1: {
        intro: "The polarity of a molecule depends on its shape and the electronegativity of its atoms.",
        objectives: ["Determine molecular polarity from structure","Use VSEPR and electronegativity differences"],
        content: ["<h4>Polarity Rules</h4><ul><li>Symmetrical + no lone pairs = non-polar</li><li>Asymmetrical = polar</li><li>Electronegativity difference > 0.4 = polar bond</li></ul>","<h4>Examples</h4><ul><li>CO₂ — non-polar</li><li>H₂O — polar</li><li>CH₄ — non-polar</li></ul>"],
        activity: "Draw Lewis structures for 5 molecules and classify their polarity.",
        check: "Why is CO₂ non-polar despite polar bonds?",
        quiz: [
          { q: "Which molecule is POLAR?", options: ["CO₂","CH₄","H₂O","CCl₄"], answer: 2 },
          { q: "CO₂ is non-polar because:", options: ["Its bonds are nonpolar","It is symmetrical and the dipoles cancel","It has lone pairs","It is linear"], answer: 1 },
          { q: "A polar molecule has:", options: ["Symmetrical charge","Asymmetrical charge distribution","No charge","Only ionic bonds"], answer: 1 }
        ]
      },
      2: {
        intro: "Polarity determines solubility, boiling point, and other physical properties.",
        objectives: ["Relate polarity to physical properties","Predict solubility using 'like dissolves like'"],
        content: ["<h4>Polarity and Properties</h4><ul><li>Polar dissolves polar (water + salt)</li><li>Non-polar dissolves non-polar (oil + grease)</li><li>Polar molecules have higher boiling points</li></ul>"],
        activity: "Predict which of 5 solutes dissolve in water and which dissolve in oil.",
        check: "Why doesn't oil mix with water?",
        quiz: [
          { q: "'Like dissolves like' means:", options: ["All liquids mix","Polar dissolves polar; non-polar dissolves non-polar","Water dissolves everything","Only acids dissolve"], answer: 1 },
          { q: "Water cannot dissolve oil because:", options: ["Oil is too heavy","Oil is non-polar while water is polar","Oil evaporates","Water is acidic"], answer: 1 },
          { q: "Polar molecules generally have:", options: ["Lower boiling points","Higher boiling points","No boiling point","The same boiling point as non-polar ones"], answer: 1 }
        ]
      },
      3: {
        intro: "Intermolecular forces (IMFs) are the attractions between molecules—weaker than chemical bonds but crucial for physical properties.",
        objectives: ["Name the three types of IMFs","Rank them by strength"],
        content: ["<h4>Types of IMFs</h4><ol><li><strong>London dispersion</strong> — weakest, all molecules</li><li><strong>Dipole–dipole</strong> — polar molecules</li><li><strong>Hydrogen bonding</strong> — strongest, H bonded to N/O/F</li></ol>"],
        activity: "Identify the dominant IMF in 6 substances.",
        check: "Which IMF explains water's high boiling point?",
        quiz: [
          { q: "Which IMF is the strongest?", options: ["London dispersion","Dipole–dipole","Hydrogen bonding","Ionic"], answer: 2 },
          { q: "Hydrogen bonding occurs when H is bonded to:", options: ["C, Si, Ge","N, O, or F","Any metal","Only H"], answer: 1 },
          { q: "London dispersion forces are present in:", options: ["Only polar molecules","All molecules","Only ionic compounds","Only water"], answer: 1 }
        ]
      },
      4: {
        intro: "The type of IMF present in a substance determines its melting point, boiling point, viscosity, and surface tension.",
        objectives: ["Identify IMFs in given substances","Explain IMF effects on physical properties"],
        content: ["<h4>IMF Effects on Properties</h4><ul><li>Stronger IMF = higher melting/boiling point</li><li>Hydrogen bonding in water → high surface tension</li><li>Weak London forces in noble gases → very low boiling points</li></ul>"],
        activity: "Compare boiling points of 5 substances and explain differences.",
        check: "Why does water have a higher boiling point than methane?",
        quiz: [
          { q: "As IMFs increase, boiling point:", options: ["Increases","Decreases","Stays the same","Becomes zero"], answer: 0 },
          { q: "Water boils at 100°C while methane boils at −162°C because:", options: ["Water has hydrogen bonds","Methane has hydrogen bonds","Water is heavier","Methane is polar"], answer: 0 },
          { q: "Noble gases have very low boiling points because:", options: ["They are ionic","Their London forces are very weak","They have hydrogen bonds","They are polar"], answer: 1 }
        ]
      }
    },
    8: {
      1: {
        intro: "Collision theory explains how concentration, temperature, and particle size affect reaction rates.",
        objectives: ["State the postulates of collision theory","Explain the effect of concentration, temperature, and surface area"],
        content: ["<h4>Collision Theory</h4><p>Reactions occur when reactant particles collide with enough energy (activation energy) and correct orientation.</p>","<h4>Effects on Rate</h4><ul><li>Higher concentration → more collisions → faster rate</li><li>Higher temperature → more energy → faster rate</li><li>Smaller particle size → more surface area → faster rate</li></ul>"],
        activity: "Observe Alka-Seltzer in hot vs cold water and in crushed vs whole form.",
        check: "Why does food spoil faster at room temperature than in the fridge?",
        quiz: [
          { q: "Which factor INCREASES reaction rate?", options: ["Lower temperature","Higher concentration","Larger particle size","Adding inhibitor"], answer: 1 },
          { q: "Smaller particle size increases reaction rate because:", options: ["It cools the reaction","It increases surface area","It lowers temperature","It adds catalyst"], answer: 1 },
          { q: "Collision theory says reactions occur when particles collide with:", options: ["Any energy","Enough energy and correct orientation","No energy","Only at low temperature"], answer: 1 }
        ]
      },
      2: {
        intro: "A catalyst is a substance that speeds up a reaction without being consumed. It provides an alternative pathway with lower activation energy.",
        objectives: ["Define catalyst","Explain how catalysts lower activation energy"],
        content: ["<h4>Catalysts</h4><ul><li>Not consumed in the reaction</li><li>Lowers activation energy</li><li>Enzymes are biological catalysts</li></ul>","<h4>Example</h4><p>MnO₂ catalyzes H₂O₂ → H₂O + O₂</p>"],
        activity: "Demonstrate MnO₂ catalysis of H₂O₂ decomposition.",
        check: "How does a catalyst differ from a reactant?",
        quiz: [
          { q: "A catalyst:", options: ["Is consumed","Lowers activation energy","Increases reaction time","Is always solid"], answer: 1 },
          { q: "Enzymes are examples of:", options: ["Reactants","Biological catalysts","Inhibitors","Products"], answer: 1 },
          { q: "MnO₂ catalyzes the decomposition of:", options: ["H₂O","H₂O₂","NaCl","CH₄"], answer: 1 }
        ]
      },
      3: {
        intro: "Stoichiometry is the calculation of quantities in a chemical reaction using the balanced equation.",
        objectives: ["Balance chemical equations","Calculate moles and masses of reactants and products"],
        content: ["<h4>Stoichiometry Steps</h4><ol><li>Balance the equation</li><li>Convert given mass to moles</li><li>Use mole ratio from the equation</li><li>Convert moles back to mass</li></ol>","<h4>Example</h4><p>2H₂ + O₂ → 2H₂O. How many grams of water form from 4 g of H₂?</p>"],
        activity: "Solve 5 stoichiometry problems.",
        check: "Why must the equation be balanced before doing stoichiometry?",
        quiz: [
          { q: "Stoichiometry uses the ______ ratio from the balanced equation.", options: ["Volume","Mole","Temperature","Density"], answer: 1 },
          { q: "In 2H₂ + O₂ → 2H₂O, the mole ratio of H₂ to H₂O is:", options: ["1:1","2:2","1:2","2:1"], answer: 1 },
          { q: "Before doing stoichiometry, you must:", options: ["Heat the mixture","Balance the equation","Add catalyst","Measure pressure"], answer: 1 }
        ]
      },
      4: {
        intro: "Percent yield is the ratio of actual yield to theoretical yield, expressed as a percentage.",
        objectives: ["Calculate theoretical yield","Calculate percent yield"],
        content: ["<h4>Percent Yield</h4><p>% Yield = (Actual Yield ÷ Theoretical Yield) × 100%</p>","<h4>Why Yields Are Less Than 100%</h4><ul><li>Side reactions</li><li>Incomplete reactions</li><li>Loss during transfer</li></ul>"],
        activity: "Given data, calculate percent yield for 3 reactions.",
        check: "Can percent yield exceed 100%? Why or why not?",
        quiz: [
          { q: "Percent yield = (Actual / ______) × 100%", options: ["Theoretical","Molar","Atomic","Molecular"], answer: 0 },
          { q: "Yields are often less than 100% because of:", options: ["Side reactions and losses","Excess catalyst","High temperature","Too much reactant"], answer: 0 },
          { q: "If theoretical yield is 50 g and actual is 40 g, % yield is:", options: ["40%","50%","80%","90%"], answer: 2 }
        ]
      }
    },
    9: {
      1: {
        intro: "Cleaning materials are chemicals designed to remove dirt, grease, and germs from surfaces and bodies.",
        objectives: ["Give examples of household and personal care cleaning products","Classify them by function"],
        content: ["<h4>Common Cleaning Materials</h4><ul><li>Soap</li><li>Detergent</li><li>Bleach</li><li>Ammonia</li><li>Vinegar</li><li>Baking soda</li></ul>"],
        activity: "List 10 cleaning products at home and identify their purpose.",
        check: "What is the difference between soap and detergent?",
        quiz: [
          { q: "Which is a cleaning material?", options: ["Shampoo","Detergent","Perfume","All of the above"], answer: 3 },
          { q: "Soap and detergent differ mainly in:", options: ["Color","Chemical composition","Price","Smell"], answer: 1 },
          { q: "Bleach is used for:", options: ["Softening skin","Disinfecting and whitening","Adding shine","Adding color"], answer: 1 }
        ]
      },
      2: {
        intro: "Product labels list active ingredients and other components. Understanding them helps consumers make safe choices.",
        objectives: ["Read and interpret product labels","Identify active ingredients"],
        content: ["<h4>Reading Labels</h4><ul><li>Active ingredient = the one that does the work</li><li>Inert ingredients = carriers, preservatives, colorants</li><li>Warning symbols: toxic, corrosive, flammable</li></ul>"],
        activity: "Bring 3 product labels and identify their active ingredients.",
        check: "Why should you never mix bleach and ammonia?",
        quiz: [
          { q: "The active ingredient in bleach is:", options: ["Sodium chloride","Sodium hypochlorite","Ammonia","Vinegar"], answer: 1 },
          { q: "Mixing bleach and ammonia produces:", options: ["Safe cleaner","Toxic chloramine gas","Soap","Air freshener"], answer: 1 },
          { q: "Which is NOT typically listed on a cleaning label?", options: ["Active ingredient","Warning symbols","Manufacturer address","Singer name"], answer: 3 }
        ]
      },
      3: {
        intro: "Personal care products are designed to enhance the appearance and hygiene of the human body.",
        objectives: ["Give examples of personal care products","Describe their functions"],
        content: ["<h4>Personal Care Products</h4><ul><li>Body lotion</li><li>Skin whitener</li><li>Deodorant</li><li>Shaving cream</li><li>Perfume</li><li>Shampoo</li><li>Toothpaste</li></ul>"],
        activity: "Make a poster classifying personal care products by function.",
        check: "What is the main purpose of a deodorant?",
        quiz: [
          { q: "Which is a personal care product?", options: ["Bleach","Shampoo","Laundry detergent","Glass cleaner"], answer: 1 },
          { q: "Deodorant is used to:", options: ["Whiten skin","Reduce body odor","Clean floors","Polish shoes"], answer: 1 },
          { q: "Which is a humectant commonly found in lotions?", options: ["Glycerin","Ammonia","Vinegar","Bleach"], answer: 0 }
        ]
      },
      4: {
        intro: "Cosmetics contain a mix of ingredients—each with a specific role in the product's look, feel, or shelf life.",
        objectives: ["Identify major cosmetic ingredients","Explain each ingredient's function"],
        content: ["<h4>Cosmetic Ingredients</h4><ul><li><strong>Emollients</strong> — soften skin (oils, lanolin)</li><li><strong>Humectants</strong> — retain moisture (glycerin)</li><li><strong>Emulsifiers</strong> — blend oil and water</li><li><strong>Preservatives</strong> — prevent spoilage</li><li><strong>Fragrance</strong> — scent</li></ul>"],
        activity: "Analyze a lotion label and classify each ingredient.",
        check: "Why do cosmetics need preservatives?",
        quiz: [
          { q: "Emollients are used to:", options: ["Soften skin","Add color","Add scent","Preserve product"], answer: 0 },
          { q: "Preservatives in cosmetics:", options: ["Add color","Prevent spoilage","Add scent","Soften skin"], answer: 1 },
          { q: "Emulsifiers are used to:", options: ["Soften skin","Blend oil and water","Add color","Preserve"], answer: 1 }
        ]
      }
    },
    10: {
      1: {
        intro: "Plato's problem of 'Saving the Appearances' required Greek astronomers to explain all observed celestial motions using perfect circular paths.",
        objectives: ["Explain Plato's challenge","Describe how it constrained Greek astronomy"],
        content: ["<h4>Saving the Appearances</h4><p>Plato argued that celestial bodies must move in perfect circles. Any observed deviation had to be explained without abandoning circles.</p>","<h4>Consequence</h4><p>This led to complex models with epicycles and deferents (Ptolemy).</p>"],
        activity: "Draw the epicycle model for Mars' retrograde motion.",
        check: "Why did Plato insist on circular motion?",
        quiz: [
          { q: "Plato's challenge to astronomers was called:", options: ["Circle Theory","Saving the Appearances","Retrograde Problem","Perfect Motion"], answer: 1 },
          { q: "Plato insisted that celestial bodies move in:", options: ["Ellipses","Straight lines","Perfect circles","Random paths"], answer: 2 },
          { q: "The Ptolemaic model used ______ to explain retrograde motion.", options: ["Ellipses","Epicycles","Gravity","Wormholes"], answer: 1 }
        ]
      },
      2: {
        intro: "Greek astronomers proposed several competing models of the universe before the telescope was invented.",
        objectives: ["Compare Eudoxus, Aristotle, Aristarchus, Ptolemy, and Copernicus","Identify geocentric vs heliocentric views"],
        content: ["<h4>Competing Models</h4><ul><li><strong>Eudoxus</strong> — concentric spheres</li><li><strong>Aristotle</strong> — 55 crystalline spheres, Earth at center</li><li><strong>Aristarchus</strong> — heliocentric</li><li><strong>Ptolemy</strong> — epicycles, geocentric</li><li><strong>Copernicus</strong> — heliocentric, circular orbits</li></ul>"],
        activity: "Create a comparison chart of all 5 models.",
        check: "Who was the first to propose a heliocentric model?",
        quiz: [
          { q: "Which ancient astronomer first proposed a heliocentric model?", options: ["Ptolemy","Aristotle","Aristarchus","Eudoxus"], answer: 2 },
          { q: "The Ptolemaic model was:", options: ["Heliocentric","Geocentric with epicycles","Sun-centered","Elliptical"], answer: 1 },
          { q: "Copernicus proposed that:", options: ["Earth is the center","The Sun is the center","There is no center","The Moon is the center"], answer: 1 }
        ]
      },
      3: {
        intro: "Kepler's 3rd law relates a planet's orbital period to its distance from the Sun: T² ∝ a³.",
        objectives: ["State Kepler's 3rd law","Apply it to solar system objects"],
        content: ["<h4>Kepler's 3rd Law</h4><p>T² = a³ (with T in years, a in AU)</p>","<h4>Examples</h4><ul><li>Earth: a = 1 AU → T = 1 year</li><li>Mars: a = 1.52 AU → T = 1.88 years</li><li>Jupiter: a = 5.2 AU → T = 11.9 years</li></ul>"],
        activity: "Calculate the orbital period of 3 planets.",
        check: "Does Kepler's 3rd law work for moons orbiting planets?",
        quiz: [
          { q: "Kepler's 3rd law states that:", options: ["T² ∝ a³","T ∝ a","F = ma","E = mc²"], answer: 0 },
          { q: "If a planet's distance from the Sun doubles, its period:", options: ["Doubles","Stays the same","Increases by a factor of √8 ≈ 2.83","Halves"], answer: 2 },
          { q: "T is measured in years and a in:", options: ["Meters","Kilometers","AU (astronomical units)","Light-years"], answer: 2 }
        ]
      },
      4: {
        intro: "Newton's laws of motion and universal gravitation unified terrestrial and celestial mechanics, showing that the same laws govern Earth and the heavens.",
        objectives: ["State Newton's 2nd Law and Universal Gravitation","Show that all objects fall with the same acceleration"],
        content: ["<h4>Newton's 2nd Law</h4><p>F = ma</p>","<h4>Universal Gravitation</h4><p>F = G m₁m₂ / r²</p>","<h4>Combined</h4><p>ma = G m M / r² → a = G M / r² (independent of m)</p>"],
        activity: "Derive that g = 9.8 m/s² and explain why a feather and hammer fall together on the Moon.",
        check: "Why do all objects fall with the same acceleration in a vacuum?",
        quiz: [
          { q: "Newton's 2nd law is:", options: ["F = ma","E = mc²","F = Gm₁m₂/r²","T² = a³"], answer: 0 },
          { q: "In a vacuum, a feather and a hammer fall:", options: ["At different rates","At the same rate","Feather first","Hammer first"], answer: 1 },
          { q: "The acceleration due to gravity on Earth is about:", options: ["1.6 m/s²","9.8 m/s²","100 m/s²","0 m/s²"], answer: 1 }
        ]
      }
    }
  };

  // ============================================================
  // RENDER HELPERS
  // ============================================================
  function escapeHtml(str) {
    if (str == null) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function renderHeader(day, cfg) {
    return `
      <div class="lesson-hero">
        <div class="lesson-era">Week ${cfg.week} · ${escapeHtml(cfg.era)} · ${escapeHtml(cfg.period || '')}</div>
        <h2>Day ${day.day}: ${escapeHtml(day.competency)}</h2>
        <div class="lesson-code">${escapeHtml(day.code)} · ${escapeHtml(day.duration)}</div>
      </div>
    `;
  }

  function renderXPBar() {
    if (!window.Gamify) return '';
    const xp = Gamify.getXP();
    const lvl = Gamify.getLevel();
    const streak = Gamify.getStreak();

    return `
      <div class="xp-bar">
        <div class="xp-bar-row">
          <div class="xp-chip">⚡ <strong>${xp}</strong> XP</div>
          <div class="xp-chip">🏅 Level <strong>${lvl.level}</strong></div>
          <div class="xp-chip ${streak.count >= 3 ? 'hot' : ''}">🔥 <strong>${streak.count}</strong> day streak</div>
        </div>
        <div class="xp-progress">
          <div class="xp-progress-fill" style="width:${lvl.percent}%"></div>
        </div>
        <div class="xp-progress-label">${lvl.intoLevel} / ${lvl.nextLevelAt} XP to Level ${lvl.level + 1}</div>
      </div>
    `;
  }

  function renderBody(content) {
    if (!content) return `<div class="alert alert-warning">Lesson content not yet available for this day.</div>`;
    return `
      <div class="lesson-section">
        <h3>📖 Introduction</h3>
        <p>${escapeHtml(content.intro)}</p>
      </div>
      <div class="lesson-section">
        <h3>🎯 Objectives</h3>
        <ul>${content.objectives.map(o => `<li>${escapeHtml(o)}</li>`).join('')}</ul>
      </div>
      <div class="lesson-section">
        <h3>📚 Lesson Content</h3>
        ${content.content.join('')}
      </div>
      <div class="lesson-section">
        <h3>🧪 Activity</h3>
        <p>${escapeHtml(content.activity)}</p>
      </div>
      <div class="lesson-section">
        <h3>✅ Check for Understanding</h3>
        <p>${escapeHtml(content.check)}</p>
      </div>
    `;
  }

  function renderQuiz(week, day, questions) {
    if (!questions || !questions.length) return '';
    return `
      <div class="lesson-quiz" id="lesson-quiz">
        <div class="lesson-quiz-header">
          <h3>🎮 Quick Check — Gamified Quiz</h3>
          <div class="lesson-quiz-reward">+${Gamify.XP.quiz_pass} XP · Perfect: +${Gamify.XP.quiz_perfect} XP</div>
        </div>
        <div id="lesson-quiz-questions">
          ${questions.map((q, qi) => `
            <div class="lesson-quiz-q" data-qindex="${qi}">
              <div class="lesson-quiz-qtext"><strong>Q${qi + 1}.</strong> ${escapeHtml(q.q)}</div>
              <div class="lesson-quiz-options">
                ${q.options.map((opt, oi) => `
                  <label class="lesson-quiz-option" data-oi="${oi}">
                    <input type="radio" name="lq${qi}" value="${oi}" />
                    <span>${String.fromCharCode(65 + oi)}. ${escapeHtml(opt)}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
        <button id="lesson-quiz-submit" class="btn btn-primary btn-full" style="margin-top:16px;">🎯 Submit Answers</button>
        <div id="lesson-quiz-result" class="lesson-quiz-result hidden"></div>
      </div>
    `;
  }

  function renderCompletion(week, day) {
    const score = window.Gamify ? Gamify.getDayScore(week, day) : null;
    const alreadyDone = window.Store ? Store.isDayComplete(week, day) : false;
    const quizDone = !!score;
    return `
      <div class="lesson-complete-block">
        ${alreadyDone
          ? `<div class="lesson-complete-badge">✅ Day already completed</div>`
          : `<button id="btn-complete-day" class="btn btn-primary btn-full" ${!quizDone ? 'disabled' : ''}>
              ${quizDone ? '🎉 Mark Day as Complete (+' + Gamify.XP.day_complete + ' XP)' : '🔒 Take the quiz first to unlock'}
            </button>`}
      </div>
    `;
  }

  function renderNav(weekNum, dayNum) {
    const prev = dayNum > 1
      ? `<a class="btn btn-outline" href="day.html?d=${dayNum - 1}">← Day ${dayNum - 1}</a>`
      : `<a class="btn btn-outline" href="index.html">← Week ${weekNum}</a>`;
    const next = dayNum < 4
      ? `<a class="btn btn-primary" href="day.html?d=${dayNum + 1}">Day ${dayNum + 1} →</a>`
      : `<a class="btn btn-primary" href="../index.html">Back to Timeline →</a>`;
    return `<div class="lesson-nav">${prev}${next}</div>`;
  }

  // ============================================================
  // QUIZ HANDLING
  // ============================================================
  function bindQuiz(week, day, questions) {
    const submit = document.getElementById('lesson-quiz-submit');
    if (!submit) return;

    submit.addEventListener('click', () => {
      let correct = 0;
      const results = [];
      questions.forEach((q, qi) => {
        const sel = document.querySelector(`input[name="lq${qi}"]:checked`);
        const chosen = sel ? Number(sel.value) : -1;
        const isCorrect = chosen === q.answer;
        if (isCorrect) correct++;
        results.push({ qi, chosen, correct: q.answer, isCorrect });
      });

      const total = questions.length;
      const percent = Math.round((correct / total) * 100);

      // Highlight
      results.forEach(r => {
        const qEl = document.querySelector(`.lesson-quiz-q[data-qindex="${r.qi}"]`);
        if (!qEl) return;
        qEl.querySelectorAll('.lesson-quiz-option').forEach(optEl => {
          const oi = Number(optEl.dataset.oi);
          if (oi === r.correct) optEl.classList.add('correct');
          if (oi === r.chosen && !r.isCorrect) optEl.classList.add('incorrect');
        });
      });

      // Save score + award XP
      if (window.Gamify) {
        Gamify.saveDayScore(week, day, correct, total);

        const xpAward = (correct === total) ? Gamify.XP.quiz_perfect : (percent >= 67 ? Gamify.XP.quiz_pass : 0);
        if (xpAward > 0) {
          Gamify.addXP(xpAward, `quiz:${week}-${day}`);
          if (window.UI) UI.toast(`+${xpAward} XP for passing the quiz!`, 'success', 3000);
        }

        // Trigger perfect-quiz badge check
        Gamify.checkBadges({ quizResult: { correct, total }, daysCompleted: Gamify.countDaysCompleted() });
      }

      // Show result panel
      const resultEl = document.getElementById('lesson-quiz-result');
      resultEl.classList.remove('hidden');
      resultEl.innerHTML = `
        <div class="lesson-quiz-result-inner ${percent >= 67 ? 'pass' : 'fail'}">
          <div class="lqr-score">${correct} / ${total} (${percent}%)</div>
          <div class="lqr-msg">
            ${percent === 100 ? '🌟 Perfect score! +' + Gamify.XP.quiz_perfect + ' XP' :
              percent >= 67 ? '👍 Nice work! +' + Gamify.XP.quiz_pass + ' XP' :
              '📚 Review the lesson and try again — best score is kept.'}
          </div>
        </div>
      `;

      // Refresh XP bar
      refreshXPBar();

      // Enable complete button
      const btnComplete = document.getElementById('btn-complete-day');
      if (btnComplete) btnComplete.disabled = false;

      submit.disabled = true;
      submit.textContent = '✔ Submitted';
    });
  }

  function refreshXPBar() {
    if (!window.Gamify) return;
    const bar = document.querySelector('.xp-bar');
    if (!bar) return;
    bar.outerHTML = renderXPBar();
  }

  // ============================================================
  // COMPLETE DAY
  // ============================================================
  function bindComplete(week, day) {
    const btn = document.getElementById('btn-complete-day');
    if (!btn) return;
    btn.addEventListener('click', () => {
      if (!window.Gamify) return;
      const result = Gamify.completeDay(week, day);

      btn.disabled = true;
      btn.textContent = '✅ Day Completed!';

      if (window.UI) {
        UI.toast(`🎉 Day complete! You now have ${result.xp} XP.`, 'success', 4000);
      }

      // Show badges if any were newly unlocked
      const badges = Gamify.getBadges().filter(b => b.unlocked);
      if (badges.length) {
        console.log('Unlocked badges:', badges.map(b => b.name).join(', '));
      }
    });
  }

  // ============================================================
  // PUBLIC
  // ============================================================
  return {
    init(cfg) {
      const weekNum = cfg.week;
      const dayNum = cfg.day.day;
      const content = (CONTENT[weekNum] || {})[dayNum];

      document.getElementById('lesson-header').innerHTML =
        renderXPBar() + renderHeader(cfg.day, cfg);

      const body = document.getElementById('lesson-body');
      body.innerHTML =
        renderBody(content) +
        renderQuiz(weekNum, dayNum, content ? content.quiz : []) +
        renderCompletion(weekNum, dayNum);

      document.getElementById('lesson-nav').innerHTML =
        renderNav(weekNum, dayNum);

      // Bind interactions
      if (content && content.quiz) bindQuiz(weekNum, dayNum, content.quiz);
      bindComplete(weekNum, dayNum);

      if (window.ActivityTracker) {
        ActivityTracker.log({ subject: cfg.subject, week: weekNum, day: dayNum, code: cfg.day.code });
      }
    }
  };
})();
