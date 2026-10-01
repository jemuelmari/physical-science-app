/* ============================================================
   lesson-engine.js — Physical Science · Lesson Engine
   Version: 1.0.0
   Reads weekN.json + renders day content dynamically.
   ============================================================ */

window.LessonEngine = (function () {

  // ---- Content bank: [weekNum][dayNum] => { intro, objectives, content, activity, check } ----
  const CONTENT = {
    1: {
      1: {
        intro: "The Big Bang theory explains how the universe began as a hot, dense point and expanded. The lightest elements—hydrogen and helium—were the first to form.",
        objectives: [
          "Explain the Big Bang theory's formation of light elements",
          "Cite evidence: cosmic microwave background, H/He abundance"
        ],
        content: [
          "<h4>Big Bang Nucleosynthesis</h4><p>Within the first three minutes after the Big Bang, protons and neutrons fused to form hydrogen, helium, and traces of lithium. The observed 75% hydrogen / 25% helium ratio in the universe matches predictions.</p>",
          "<h4>Key Evidence</h4><ul><li>Cosmic Microwave Background (CMB) radiation — the leftover heat of the Big Bang</li><li>Redshift of distant galaxies — the universe is expanding</li><li>Primordial abundances of H and He</li></ul>"
        ],
        activity: "Draw a diagram showing the timeline of the Big Bang from 10⁻⁴³ s to 380,000 years.",
        check: "Why is hydrogen the most abundant element in the universe?"
      },
      2: {
        intro: "Stars are the factories where heavier elements are forged. Hydrogen fuses into helium, and in more massive stars, helium fuses into carbon, oxygen, and beyond.",
        objectives: [
          "Describe stellar nucleosynthesis",
          "Explain the proton-proton chain and CNO cycle"
        ],
        content: [
          "<h4>Stellar Nucleosynthesis</h4><p>In main-sequence stars, hydrogen nuclei fuse into helium. Massive stars continue fusion to form carbon, oxygen, neon, silicon, and iron.</p>",
          "<h4>Fusion Steps</h4><ul><li>H → He (main sequence)</li><li>He → C, O (red giant)</li><li>C → Ne, Na, Mg</li><li>O → Si, S</li><li>Si → Fe (final stage)</li></ul>"
        ],
        activity: "Illustrate the onion-layer structure of a massive star before supernova.",
        check: "Why does fusion stop at iron?"
      },
      3: {
        intro: "Nuclear fusion reactions can be written as balanced equations, just like chemical equations—but with mass numbers and atomic numbers on both sides.",
        objectives: [
          "Write nuclear fusion equations",
          "Balance mass number (A) and atomic number (Z)"
        ],
        content: [
          "<h4>Writing Fusion Reactions</h4><p>Example: ¹H + ¹H → ²H + e⁺ + ν (proton-proton chain step 1)</p>",
          "<h4>Practice Reactions</h4><ul><li>²H + ¹H → ³He + γ</li><li>³He + ³He → ⁴He + 2¹H</li><li>⁴He + ⁴He → ⁸Be + γ</li></ul>"
        ],
        activity: "Write and balance 5 fusion reactions that occur in stars.",
        check: "What must be conserved when writing a nuclear reaction?"
      },
      4: {
        intro: "Elements heavier than iron cannot be formed by ordinary stellar fusion—they require the extreme conditions of supernovae or neutron star mergers.",
        objectives: [
          "Describe supernova nucleosynthesis",
          "Explain the r-process and s-process"
        ],
        content: [
          "<h4>Beyond Iron</h4><p>Iron is the most tightly bound nucleus—fusion beyond it absorbs energy instead of releasing it. Heavier elements form during supernova explosions via rapid neutron capture (r-process).</p>",
          "<h4>Formation Mechanisms</h4><ul><li>s-process (slow neutron capture) — in AGB stars</li><li>r-process (rapid neutron capture) — in supernovae</li><li>Neutron star mergers — gold, platinum</li></ul>"
        ],
        activity: "Trace the origin of gold on Earth back to a neutron star merger.",
        check: "Why are elements heavier than iron rare in the universe?"
      }
    },
    2: {
      1: {
        intro: "Ancient Greek philosophers were the first to speculate about the nature of matter. Democritus proposed that matter is made of indivisible particles called atomos.",
        objectives: [
          "Describe Democritus' atomic idea",
          "Compare it with Aristotle's view"
        ],
        content: [
          "<h4>Democritus (~460–370 BC)</h4><p>Proposed that all matter is made of tiny, indivisible, indestructible particles called <em>atomos</em>.</p>",
          "<h4>Aristotle's Counter-View</h4><p>Aristotle rejected atomism, arguing matter was continuous and made of four elements (earth, water, air, fire). His view dominated for ~2000 years.</p>"
        ],
        activity: "Debate: Was Democritus 'right' even without experiments?",
        check: "Why did Aristotle's view win over Democritus'?"
      },
      2: {
        intro: "The Ancient Greeks believed all matter was composed of four fundamental elements: earth, water, air, and fire.",
        objectives: [
          "Identify the four classical elements",
          "Explain their properties and combinations"
        ],
        content: [
          "<h4>The Four Elements</h4><ul><li><strong>Earth</strong> — cold and dry, moves downward</li><li><strong>Water</strong> — cold and wet, moves downward</li><li><strong>Air</strong> — hot and wet, moves upward</li><li><strong>Fire</strong> — hot and dry, moves upward</li></ul>",
          "<h4>Aether</h4><p>A fifth element, <em>aether</em>, was thought to fill the heavens.</p>"
        ],
        activity: "Classify common materials by their supposed Greek element composition.",
        check: "Why did the four-element theory persist for so long?"
      },
      3: {
        intro: "Greek philosophers classified motion into three types: natural, violent, and celestial.",
        objectives: [
          "Distinguish natural, violent, and celestial motion",
          "Explain why they thought celestial motion was perfect"
        ],
        content: [
          "<h4>Three Types of Terrestrial Motion</h4><ul><li><strong>Natural</strong> — objects return to their natural place (earth falls, fire rises)</li><li><strong>Violent</strong> — forced motion, ends when force stops</li><li><strong>Celestial</strong> — perfect circular motion of heavenly bodies</li></ul>"
        ],
        activity: "Sort everyday examples of motion into the three Greek categories.",
        check: "Why did Greeks believe celestial motion was different from Earthly motion?"
      },
      4: {
        intro: "The Greeks had several lines of evidence that the Earth is spherical—not flat.",
        objectives: [
          "Cite evidence for a spherical Earth",
          "Explain the lunar eclipse argument"
        ],
        content: [
          "<h4>Evidence for a Spherical Earth</h4><ul><li>Lunar eclipses: Earth's shadow on the Moon is always circular</li><li>Ships disappear hull-first over the horizon</li><li>Different constellations visible at different latitudes</li><li>Eratosthenes' measurement of Earth's circumference (~240 BC)</li></ul>"
        ],
        activity: "Recreate Eratosthenes' method using two cities' shadow angles.",
        check: "Which evidence for a spherical Earth is the most convincing?"
      }
    },
    3: {
      1: {
        intro: "Alchemy was a medieval forerunner of chemistry. Alchemists sought to turn base metals into gold and to find the elixir of life.",
        objectives: [
          "Describe the goals of alchemy",
          "Explain alchemy's contributions to modern chemistry"
        ],
        content: [
          "<h4>Goals of Alchemy</h4><ul><li>Transmutation of base metals into gold</li><li>The Philosopher's Stone</li><li>The Elixir of Life</li></ul>",
          "<h4>Contributions to Chemistry</h4><ul><li>Discovery of acids (nitric, sulfuric, hydrochloric)</li><li>Development of lab techniques (distillation, filtration, sublimation)</li><li>Discovery of phosphorus, zinc, arsenic</li></ul>"
        ],
        activity: "Research one alchemist (e.g., Paracelsus, Jabir ibn Hayyan) and present findings.",
        check: "How did alchemy's failures lead to chemistry's successes?"
      },
      2: {
        intro: "Alchemists developed many laboratory tools and techniques that are still used in modern chemistry.",
        objectives: [
          "Identify alchemical tools",
          "Describe distillation, filtration, and sublimation"
        ],
        content: [
          "<h4>Key Techniques</h4><ul><li><strong>Distillation</strong> — separating liquids by boiling point</li><li><strong>Filtration</strong> — separating solids from liquids</li><li><strong>Sublimation</strong> — solid → gas directly</li><li><strong>Calcination</strong> — heating to drive off volatiles</li></ul>"
        ],
        activity: "Perform a simple distillation or filtration in the lab.",
        check: "Which alchemical technique is most used in modern labs?"
      },
      3: {
        intro: "Diurnal motion is the daily apparent motion of celestial objects across the sky. Annual motion is the yearly cycle of the Sun and stars. Precession is the slow wobble of Earth's axis.",
        objectives: [
          "Define diurnal, annual, and precession motion",
          "Explain their causes"
        ],
        content: [
          "<h4>Three Motions</h4><ul><li><strong>Diurnal</strong> — daily east-to-west motion due to Earth's rotation</li><li><strong>Annual</strong> — yearly motion due to Earth's revolution around the Sun</li><li><strong>Precession of the Equinoxes</strong> — 26,000-year wobble of Earth's axis</li></ul>"
        ],
        activity: "Observe and record the Sun's position at the same time across several days.",
        check: "What causes the precession of the equinoxes?"
      },
      4: {
        intro: "Alchemy was not 'bad science'—it was the ancestral laboratory of modern chemistry. Its language, tools, and curiosity set the stage for the Scientific Revolution.",
        objectives: [
          "Trace alchemy's transition into chemistry",
          "Name key figures in the transition"
        ],
        content: [
          "<h4>From Alchemy to Chemistry</h4><ul><li>Robert Boyle (1661) — <em>The Sceptical Chymist</em>, rejected four elements</li><li>Antoine Lavoisier (1789) — Law of Conservation of Mass</li><li>John Dalton (1803) — Atomic theory</li></ul>"
        ],
        activity: "Create a timeline: alchemy → Boyle → Lavoisier → Dalton.",
        check: "Who is considered the 'father of modern chemistry' and why?"
      }
    },
    4: {
      1: {
        intro: "John Dalton (1766–1844) revived the atomic theory with quantitative evidence. His work explained the laws of chemical combination.",
        objectives: [
          "State Dalton's atomic theory postulates",
          "Explain how his theory explained chemical laws"
        ],
        content: [
          "<h4>Dalton's Atomic Theory (1803)</h4><ol><li>All matter is made of atoms.</li><li>Atoms of the same element are identical.</li><li>Atoms of different elements differ in mass.</li><li>Atoms combine in whole-number ratios to form compounds.</li><li>Atoms are neither created nor destroyed in chemical reactions.</li></ol>"
        ],
        activity: "Illustrate each postulate with a diagram.",
        check: "Which of Dalton's postulates is now known to be false?"
      },
      2: {
        intro: "Dalton's postulates explained the Law of Definite Proportions and the Law of Multiple Proportions.",
        objectives: [
          "Explain how Dalton's theory explained the laws of chemical combination",
          "Solve problems using the laws of proportions"
        ],
        content: [
          "<h4>Laws Explained</h4><ul><li><strong>Definite Proportions</strong> — a compound always has the same ratio of elements by mass</li><li><strong>Multiple Proportions</strong> — when two elements form multiple compounds, the ratios are small whole numbers</li></ul>"
        ],
        activity: "Analyze data showing CO vs CO₂ to verify multiple proportions.",
        check: "How did Dalton's theory explain Proust's Law?"
      },
      3: {
        intro: "With atomic theory established, chemists could systematically discover and identify new elements.",
        objectives: [
          "Describe how new elements were discovered after Dalton",
          "Explain the role of atomic weights"
        ],
        content: [
          "<h4>Element Discovery</h4><ul><li>Atomic weights became the fingerprint of each element</li><li>New elements (Na, K, Cl, Br, I) isolated via electrochemistry and spectroscopy</li></ul>",
          "<h4>Mendeleev (1869)</h4><p>Arranged elements by atomic weight and predicted undiscovered ones (Ga, Sc, Ge).</p>"
        ],
        activity: "Recreate Mendeleev's 1871 periodic table and predict missing elements.",
        check: "Why did Mendeleev leave gaps in his periodic table?"
      },
      4: {
        intro: "The periodic table evolved from Dalton's atomic theory through Mendeleev's arrangement to Moseley's atomic number ordering.",
        objectives: [
          "Trace periodic table evolution",
          "Distinguish atomic weight vs atomic number ordering"
        ],
        content: [
          "<h4>Periodic Table Timeline</h4><ul><li>1803 — Dalton: atomic weights</li><li>1869 — Mendeleev: by atomic weight</li><li>1913 — Moseley: by atomic number</li><li>Modern — by electron configuration</li></ul>"
        ],
        activity: "Create a 4-stage timeline showing how the periodic table evolved.",
        check: "Why is the modern periodic table ordered by atomic number?"
      }
    },
    5: {
      1: {
        intro: "The discovery of the electron, proton, and neutron revolutionized our understanding of atomic structure.",
        objectives: [
          "Name the three subatomic particles and their properties",
          "Explain the experiments that discovered them"
        ],
        content: [
          "<h4>Subatomic Particles</h4><ul><li><strong>Electron</strong> — Thomson, 1897 (cathode rays)</li><li><strong>Proton</strong> — Rutherford, 1919 (gold foil)</li><li><strong>Neutron</strong> — Chadwick, 1932</li></ul>"
        ],
        activity: "Draw and label the atom as understood after each discovery.",
        check: "Which discovery most changed the model of the atom?"
      },
      2: {
        intro: "Four scientists—Thomson, Rutherford, Moseley, and Bohr—each contributed a crucial piece to atomic theory.",
        objectives: [
          "Match each scientist to their contribution",
          "Compare atomic models"
        ],
        content: [
          "<h4>Key Contributions</h4><ul><li><strong>J.J. Thomson</strong> — Plum pudding model, discovered electron</li><li><strong>Ernest Rutherford</strong> — Nuclear model, gold foil experiment</li><li><strong>Henry Moseley</strong> — Atomic number = proton count</li><li><strong>Niels Bohr</strong> — Quantized electron orbits</li></ul>"
        ],
        activity: "Create a timeline card for each scientist with model diagrams.",
        check: "How did Rutherford's model differ from Thomson's?"
      },
      3: {
        intro: "The nuclear model places protons and neutrons in the nucleus, with electrons orbiting in shells.",
        objectives: [
          "Describe the nuclear model",
          "Locate protons, neutrons, and electrons in the atom"
        ],
        content: [
          "<h4>Nuclear Model (Rutherford–Bohr)</h4><ul><li>Nucleus — small, dense, positive (protons + neutrons)</li><li>Electrons — orbiting in shells (Bohr) or probability clouds (modern)</li><li>Most of the atom is empty space</li></ul>"
        ],
        activity: "Build a physical or digital Bohr model of carbon.",
        check: "Why is the atom mostly empty space?"
      },
      4: {
        intro: "Today we consolidate all atomic models into a single timeline—from Democritus to the quantum model.",
        objectives: [
          "Summarize the historical progression of atomic models",
          "Present the timeline creatively"
        ],
        content: [
          "<h4>Atomic Model Timeline</h4><ul><li>400 BC — Democritus: atomos</li><li>1803 — Dalton: solid sphere</li><li>1897 — Thomson: plum pudding</li><li>1911 — Rutherford: nuclear</li><li>1913 — Bohr: planetary</li><li>1926 — Schrödinger: quantum</li></ul>"
        ],
        activity: "Create a poster timeline of atomic models (Performance Task).",
        check: "Which model is currently accepted?"
      }
    },
    6: {
      1: {
        intro: "Atomic number (Z) — the number of protons — is the identity of an element. Changing Z creates a new element.",
        objectives: [
          "Explain the concept of atomic number",
          "Describe how new elements are synthesized"
        ],
        content: [
          "<h4>Atomic Number & Transmutation</h4><p>Rutherford (1919) bombarded nitrogen with alpha particles and produced oxygen—the first artificial transmutation.</p>",
          "<h4>Synthetic Elements</h4><ul><li>Technetium (1937) — first synthetic</li><li>Plutonium (1940)</li><li>Oganesson (2002, Z=118) — latest</li></ul>"
        ],
        activity: "Research one synthetic element and how it was made.",
        check: "How is the atomic number of a new element confirmed?"
      },
      2: {
        intro: "Nuclear reactions can be written as equations. Mass number and atomic number must balance on both sides.",
        objectives: [
          "Write nuclear reactions for transmutation",
          "Balance mass number and atomic number"
        ],
        content: [
          "<h4>Transmutation Reactions</h4><p>Example: ¹⁴N + ⁴He → ¹⁷O + ¹H</p>",
          "<h4>Practice</h4><ul><li>²³⁸U + n → ²³⁹Pu + γ</li><li>²⁴²Pu + ²²Ne → ²⁶⁰Rf + 4n</li></ul>"
        ],
        activity: "Write 5 nuclear reactions for synthesizing known elements.",
        check: "What is conserved in a nuclear reaction?"
      },
      3: {
        intro: "Radioactive decay produces alpha, beta, and gamma radiation—each has distinct properties and effects on the nucleus.",
        objectives: [
          "Distinguish alpha, beta, and gamma decay",
          "Write balanced nuclear decay equations"
        ],
        content: [
          "<h4>Types of Decay</h4><ul><li><strong>Alpha (α)</strong> — emits ⁴He nucleus</li><li><strong>Beta-minus (β⁻)</strong> — neutron → proton + electron</li><li><strong>Beta-plus (β⁺)</strong> — proton → neutron + positron</li><li><strong>Gamma (γ)</strong> — energy only, no mass change</li></ul>"
        ],
        activity: "Balance 10 decay equations and identify the type.",
        check: "How does beta decay change the atomic number?"
      },
      4: {
        intro: "Synthetic elements have applications in medicine, energy, and research.",
        objectives: [
          "Identify uses of synthetic elements",
          "Evaluate benefits and risks"
        ],
        content: [
          "<h4>Applications</h4><ul><li>Tc-99m — medical imaging</li><li>Pu-239 — nuclear fuel and weapons</li><li>Am-241 — smoke detectors</li><li>Cf-252 — neutron source</li></ul>"
        ],
        activity: "Debate: Should we keep synthesizing new elements?",
        check: "What is the most beneficial synthetic element?"
      }
    },
    7: {
      1: {
        intro: "The polarity of a molecule depends on its shape and the electronegativity of its atoms.",
        objectives: [
          "Determine molecular polarity from structure",
          "Use VSEPR and electronegativity differences"
        ],
        content: [
          "<h4>Polarity Rules</h4><ul><li>Symmetrical + no lone pairs = non-polar</li><li>Asymmetrical = polar</li><li>Electronegativity difference > 0.4 = polar bond</li></ul>",
          "<h4>Examples</h4><ul><li>CO₂ — non-polar (linear, symmetrical)</li><li>H₂O — polar (bent, asymmetrical)</li><li>CH₄ — non-polar (tetrahedral, symmetrical)</li></ul>"
        ],
        activity: "Draw Lewis structures for 5 molecules and classify their polarity.",
        check: "Why is CO₂ non-polar despite polar bonds?"
      },
      2: {
        intro: "Polarity determines solubility, boiling point, and other physical properties.",
        objectives: [
          "Relate polarity to physical properties",
          "Predict solubility using 'like dissolves like'"
        ],
        content: [
          "<h4>Polarity and Properties</h4><ul><li>Polar dissolves polar (water + salt)</li><li>Non-polar dissolves non-polar (oil + grease)</li><li>Polar molecules have higher boiling points</li></ul>"
        ],
        activity: "Predict which of 5 solutes dissolve in water and which dissolve in oil.",
        check: "Why doesn't oil mix with water?"
      },
      3: {
        intro: "Intermolecular forces (IMFs) are the attractions between molecules—weaker than chemical bonds but crucial for physical properties.",
        objectives: [
          "Name the three types of IMFs",
          "Rank them by strength"
        ],
        content: [
          "<h4>Types of IMFs</h4><ol><li><strong>London dispersion</strong> — weakest, all molecules</li><li><strong>Dipole–dipole</strong> — polar molecules</li><li><strong>Hydrogen bonding</strong> — strongest, H bonded to N/O/F</li></ol>"
        ],
        activity: "Identify the dominant IMF in 6 substances.",
        check: "Which IMF explains water's high boiling point?"
      },
      4: {
        intro: "The type of IMF present in a substance determines its melting point, boiling point, viscosity, and surface tension.",
        objectives: [
          "Identify IMFs in given substances",
          "Explain IMF effects on physical properties"
        ],
        content: [
          "<h4>IMF Effects on Properties</h4><ul><li>Stronger IMF = higher melting/boiling point</li><li>Hydrogen bonding in water → high surface tension</li><li>Weak London forces in noble gases → very low boiling points</li></ul>"
        ],
        activity: "Compare boiling points of 5 substances and explain differences.",
        check: "Why does water have a higher boiling point than methane?"
      }
    },
    8: {
      1: {
        intro: "Collision theory explains how concentration, temperature, and particle size affect reaction rates.",
        objectives: [
          "State the postulates of collision theory",
          "Explain the effect of concentration, temperature, and surface area"
        ],
        content: [
          "<h4>Collision Theory</h4><p>Reactions occur when reactant particles collide with enough energy (activation energy) and correct orientation.</p>",
          "<h4>Effects on Rate</h4><ul><li>Higher concentration → more collisions → faster rate</li><li>Higher temperature → more energy → faster rate</li><li>Smaller particle size → more surface area → faster rate</li></ul>"
        ],
        activity: "Observe Alka-Seltzer in hot vs cold water and in crushed vs whole form.",
        check: "Why does food spoil faster at room temperature than in the fridge?"
      },
      2: {
        intro: "A catalyst is a substance that speeds up a reaction without being consumed. It provides an alternative pathway with lower activation energy.",
        objectives: [
          "Define catalyst",
          "Explain how catalysts lower activation energy"
        ],
        content: [
          "<h4>Catalysts</h4><ul><li>Not consumed in the reaction</li><li>Lowers activation energy</li><li>Enzymes are biological catalysts</li></ul>",
          "<h4>Example</h4><p>MnO₂ catalyzes H₂O₂ → H₂O + O₂</p>"
        ],
        activity: "Demonstrate MnO₂ catalysis of H₂O₂ decomposition.",
        check: "How does a catalyst differ from a reactant?"
      },
      3: {
        intro: "Stoichiometry is the calculation of quantities in a chemical reaction using the balanced equation.",
        objectives: [
          "Balance chemical equations",
          "Calculate moles and masses of reactants and products"
        ],
        content: [
          "<h4>Stoichiometry Steps</h4><ol><li>Balance the equation</li><li>Convert given mass to moles</li><li>Use mole ratio from the equation</li><li>Convert moles back to mass</li></ol>",
          "<h4>Example</h4><p>2H₂ + O₂ → 2H₂O. How many grams of water form from 4 g of H₂?</p>"
        ],
        activity: "Solve 5 stoichiometry problems.",
        check: "Why must the equation be balanced before doing stoichiometry?"
      },
      4: {
        intro: "Percent yield is the ratio of actual yield to theoretical yield, expressed as a percentage.",
        objectives: [
          "Calculate theoretical yield",
          "Calculate percent yield"
        ],
        content: [
          "<h4>Percent Yield</h4><p>% Yield = (Actual Yield ÷ Theoretical Yield) × 100%</p>",
          "<h4>Why Yields Are Less Than 100%</h4><ul><li>Side reactions</li><li>Incomplete reactions</li><li>Loss during transfer</li></ul>"
        ],
        activity: "Given data, calculate percent yield for 3 reactions.",
        check: "Can percent yield exceed 100%? Why or why not?"
      }
    },
    9: {
      1: {
        intro: "Cleaning materials are chemicals designed to remove dirt, grease, and germs from surfaces and bodies.",
        objectives: [
          "Give examples of household and personal care cleaning products",
          "Classify them by function"
        ],
        content: [
          "<h4>Common Cleaning Materials</h4><ul><li>Soap</li><li>Detergent</li><li>Bleach</li><li>Ammonia</li><li>Vinegar</li><li>Baking soda</li></ul>"
        ],
        activity: "List 10 cleaning products at home and identify their purpose.",
        check: "What is the difference between soap and detergent?"
      },
      2: {
        intro: "Product labels list active ingredients and other components. Understanding them helps consumers make safe choices.",
        objectives: [
          "Read and interpret product labels",
          "Identify active ingredients"
        ],
        content: [
          "<h4>Reading Labels</h4><ul><li>Active ingredient = the one that does the work</li><li>Inert ingredients = carriers, preservatives, colorants</li><li>Warning symbols: toxic, corrosive, flammable</li></ul>"
        ],
        activity: "Bring 3 product labels and identify their active ingredients.",
        check: "Why should you never mix bleach and ammonia?"
      },
      3: {
        intro: "Personal care products are designed to enhance the appearance and hygiene of the human body.",
        objectives: [
          "Give examples of personal care products",
          "Describe their functions"
        ],
        content: [
          "<h4>Personal Care Products</h4><ul><li>Body lotion</li><li>Skin whitener</li><li>Deodorant</li><li>Shaving cream</li><li>Perfume</li><li>Shampoo</li><li>Toothpaste</li></ul>"
        ],
        activity: "Make a poster classifying personal care products by function.",
        check: "What is the main purpose of a deodorant?"
      },
      4: {
        intro: "Cosmetics contain a mix of ingredients—each with a specific role in the product's look, feel, or shelf life.",
        objectives: [
          "Identify major cosmetic ingredients",
          "Explain each ingredient's function"
        ],
        content: [
          "<h4>Cosmetic Ingredients</h4><ul><li><strong>Emollients</strong> — soften skin (oils, lanolin)</li><li><strong>Humectants</strong> — retain moisture (glycerin)</li><li><strong>Emulsifiers</strong> — blend oil and water</li><li><strong>Preservatives</strong> — prevent spoilage</li><li><strong>Fragrance</strong> — scent</li></ul>"
        ],
        activity: "Analyze a lotion label and classify each ingredient.",
        check: "Why do cosmetics need preservatives?"
      }
    },
    10: {
      1: {
        intro: "Plato's problem of 'Saving the Appearances' required Greek astronomers to explain all observed celestial motions using perfect circular paths.",
        objectives: [
          "Explain Plato's challenge",
          "Describe how it constrained Greek astronomy"
        ],
        content: [
          "<h4>Saving the Appearances</h4><p>Plato argued that celestial bodies must move in perfect circles—the 'most perfect' shape. Any observed deviation (like retrograde motion) had to be explained without abandoning circles.</p>",
          "<h4>Consequence</h4><p>This led to complex models with epicycles and deferents (Ptolemy).</p>"
        ],
        activity: "Draw the epicycle model for Mars' retrograde motion.",
        check: "Why did Plato insist on circular motion?"
      },
      2: {
        intro: "Greek astronomers proposed several competing models of the universe before the telescope was invented.",
        objectives: [
          "Compare Eudoxus, Aristotle, Aristarchus, Ptolemy, and Copernicus",
          "Identify geocentric vs heliocentric views"
        ],
        content: [
          "<h4>Competing Models</h4><ul><li><strong>Eudoxus</strong> — concentric spheres</li><li><strong>Aristotle</strong> — 55 crystalline spheres, Earth at center</li><li><strong>Aristarchus</strong> — heliocentric (ahead of his time!)</li><li><strong>Ptolemy</strong> — epicycles, geocentric</li><li><strong>Copernicus</strong> — heliocentric, circular orbits</li></ul>"
        ],
        activity: "Create a comparison chart of all 5 models.",
        check: "Who was the first to propose a heliocentric model?"
      },
      3: {
        intro: "Kepler's 3rd law relates a planet's orbital period to its distance from the Sun: T² ∝ a³.",
        objectives: [
          "State Kepler's 3rd law",
          "Apply it to solar system objects"
        ],
        content: [
          "<h4>Kepler's 3rd Law</h4><p>T² = a³ (with T in years, a in AU)</p>",
          "<h4>Examples</h4><ul><li>Earth: a = 1 AU → T = 1 year</li><li>Mars: a = 1.52 AU → T = 1.88 years</li><li>Jupiter: a = 5.2 AU → T = 11.9 years</li></ul>"
        ],
        activity: "Calculate the orbital period of 3 planets.",
        check: "Does Kepler's 3rd law work for moons orbiting planets?"
      },
      4: {
        intro: "Newton's laws of motion and universal gravitation unified terrestrial and celestial mechanics, showing that the same laws govern Earth and the heavens.",
        objectives: [
          "State Newton's 2nd Law and Universal Gravitation",
          "Show that all objects fall with the same acceleration (in vacuum)"
        ],
        content: [
          "<h4>Newton's 2nd Law</h4><p>F = ma</p>",
          "<h4>Universal Gravitation</h4><p>F = G m₁m₂ / r²</p>",
          "<h4>Combined</h4><p>ma = G m M / r² → a = G M / r² (independent of m)</p>"
        ],
        activity: "Derive that g = 9.8 m/s² and explain why a feather and hammer fall together on the Moon.",
        check: "Why do all objects fall with the same acceleration in a vacuum?"
      }
    }
  };

  // ---- Render helpers ----
  function renderHeader(day, data) {
    return `
      <div class="lesson-hero">
        <div class="lesson-era">Week ${data.week} · ${data.era} · ${data.period}</div>
        <h2>Day ${day.day}: ${day.competency}</h2>
        <div class="lesson-code">${day.code} · ${day.duration}</div>
      </div>
    `;
  }

  function renderBody(content) {
    if (!content) {
      return `<div class="alert alert-warning">Lesson content not yet available for this day.</div>`;
    }
    return `
      <div class="lesson-section">
        <h3>📖 Introduction</h3>
        <p>${content.intro}</p>
      </div>

      <div class="lesson-section">
        <h3>🎯 Objectives</h3>
        <ul>${content.objectives.map(o => `<li>${o}</li>`).join('')}</ul>
      </div>

      <div class="lesson-section">
        <h3>📚 Lesson Content</h3>
        ${content.content.join('')}
      </div>

      <div class="lesson-section">
        <h3>🧪 Activity</h3>
        <p>${content.activity}</p>
      </div>

      <div class="lesson-section">
        <h3>✅ Check for Understanding</h3>
        <p>${content.check}</p>
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

  // ---- Public API ----
  return {
    init(cfg) {
      const weekNum = cfg.week;
      const dayNum = cfg.day.day;
      const content = (CONTENT[weekNum] || {})[dayNum];

      document.getElementById('lesson-header').innerHTML =
        renderHeader(cfg.day, cfg);
      document.getElementById('lesson-body').innerHTML =
        renderBody(content);
      document.getElementById('lesson-nav').innerHTML =
        renderNav(weekNum, dayNum);

      if (window.ActivityTracker) {
        ActivityTracker.log({
          subject: cfg.subject,
          week: weekNum,
          day: dayNum,
          code: cfg.day.code
        });
      }
    }
  };
})();
