/**
 * CSSENTIAL AI Learning & Platform Assistance Knowledge Base
 * 
 * Provides comprehensive, rule-based answers for:
 * 1. Academic Integrity: Strictly forbids giving direct answers to quizzes, assessments, and graded exercises.
 * 2. Platform Navigation & Tutorials: How to use, navigate, and explore every feature of CSSENTIAL.
 * 3. Page Overviews: Comprehensive explanations of Home, Activities, Collection, Games Hub, About Us, and Researcher Dashboard.
 * 4. Game Guides: Detailed rules and gameplay instructions for all 9 educational games.
 * 5. Video Demonstrations: How to watch, upload, and embed custom laboratory demonstration videos.
 * 6. Academic Lab Manuals: How to view, print, and export PDF/Word (.docx) laboratory manuals with rubrics.
 * 7. Hardware & Troubleshooting: Expert technical guidance on PC assembly, BIOS/UEFI setup, POST beep codes, EZ Debug LEDs, and diagnostic procedures.
 * 8. Research Credits: Accurate information on the student researchers and platform background.
 */

export interface AssistanceResult {
  reply: string;
  source: string;
  isDirectAnswerDenied?: boolean;
}

export function getPlatformAssistanceResponse(
  message: string,
  currentPage: string = 'HOME',
  currentContext: string = ''
): AssistanceResult {
  const lower = message.toLowerCase().trim();

  // =========================================================================
  // RULE 1: STRICT ANTI-CHEATING / DIRECT ANSWER RESTRICTION
  // =========================================================================
  const directAnswerPatterns = [
    'what is the answer',
    "what's the answer",
    'give me the answer',
    'give me answers',
    'tell me the answer',
    'tell me answer',
    'what is the correct answer',
    'what is the right answer',
    'which choice is correct',
    'which option is correct',
    'is the answer a',
    'is the answer b',
    'is the answer c',
    'is the answer d',
    'is it a or b',
    'is it c or d',
    'choice a, b, c',
    'quiz answer',
    'exam answer',
    'cheat',
    'hack the quiz',
    'solution key',
    'answer key',
    'answer for question',
    'answer to question',
    'solve question',
    'give me question 1',
    'give me question 2',
    'give me question 3',
    'give me question 4',
    'give me question 5',
    'answer for activity',
    'answers for the quiz'
  ];

  const isAskingDirectAnswer = directAnswerPatterns.some(pattern => lower.includes(pattern));

  if (isAskingDirectAnswer) {
    return {
      isDirectAnswerDenied: true,
      source: 'academic-integrity-rule',
      reply: `🚫 **Direct Answers Restricted (Academic Policy)**

As your **CSSENTIAL Learning Assistant**, I cannot provide direct answer keys, letters, or solutions to quizzes, assessments, or graded activities. This policy preserves academic integrity and ensures genuine mastery of Computer System Installation and Configuration competencies.

💡 **However, I am here to help you learn and solve it yourself!**
Tell me:
1. What technical symptom or hardware scenario is being described?
2. What component or procedure is involved (e.g., RAM dual-channel placement, POST beep codes, UEFI boot options, or ESD safety)?

Ask me about the **underlying technical concept**, and I will explain the diagnostic logic step-by-step so you can choose the correct answer with complete confidence!`
    };
  }

  // =========================================================================
  // RULE 2: WEBSITE TUTORIAL & HOW TO NAVIGATE CSSENTIAL
  // =========================================================================
  if (
    lower.includes('tutorial') ||
    lower.includes('how to navigate') ||
    lower.includes('how to use the website') ||
    lower.includes('how to use cssential') ||
    lower.includes('getting started') ||
    lower.includes('walkthrough') ||
    lower.includes('user guide') ||
    lower.includes('how do i start')
  ) {
    return {
      source: 'platform-tutorial',
      reply: `🧭 **CSSENTIAL Complete Website Tutorial & Navigation Guide**

Welcome to **CSSENTIAL**, your one-click platform for Computer System Installation, Configuration, and Troubleshooting! Here is a step-by-step tutorial on how to navigate and use every feature:

1. 👤 **Register Your Student Profile**:
   • In the top navigation bar, click the **Student Profile Badge** (showing your name or "Guest").
   • Enter your full **Name** and **Year & Section**. This ensures your activity attempts, quiz results, and game high scores are recorded to your academic transcript.

2. 🏠 **Home (Web Wall)**:
   • The central hub. Explore featured hardware anatomy, read course announcements, and click any of the 6 competency cards for a quick launch into that lesson.

3. 📚 **Curriculum Collection (Study & Resources)**:
   • Click **Collection** in the top navigation bar.
   • Pick any of the 6 core competency modules (Preparing, Assembly, Cabling, BIOS Setup, OS Installation, or Diagnostics).
   • Click **🖥 PRESENT** to launch full-screen interactive slide decks.
   • Click **▶ WATCH** to view HD laboratory video demonstrations.
   • Click **📄 Academic Lab Manual (PDF / DOCX)** to view, print, or export formal laboratory activity manuals with rubrics.

4. 🛠 **Activities & Practical Exercises**:
   • Click **Activities** to practice simulated troubleshooting scenarios, hardware identification drills, and practical diagnostics.
   • Follow the on-screen clues, make diagnostic choices, and earn competency badges.

5. 🎮 **Educational Games Hub**:
   • In the Activities view, click the prominent **🎮 PLAY** button (or select Games Hub in the menu).
   • Play any of the 9 interactive educational games to build speed and reinforce your hardware recall.

6. 📝 **Assessments & Quizzes**:
   • Test your practical and theoretical knowledge through timed quizzes with instant grading and explanations.

7. 📊 **Researcher Dashboard (Instructors & Researchers)**:
   • Click **Researcher Telemetry Dashboard** in the footer or menu. Enter the access password (**CSSENTIAL2026**).
   • View registered students, grade transcripts, action audit trails, upload custom videos, or configure data retention cleanup.

8. 💬 **Ask for Assistance Anytime**:
   • Whenever you need help, click the floating **"Ask for Assistance"** button on the bottom right to consult this assistant!`
    };
  }

  // =========================================================================
  // RULE 3: EXPLAINING THE WEBPAGES (HOME, ACTIVITIES, COLLECTION, ABOUT US, ETC.)
  // =========================================================================
  if (
    lower.includes('what is home') ||
    lower.includes('web wall') ||
    lower.includes('home page') ||
    lower.includes('home view')
  ) {
    return {
      source: 'page-explainer-home',
      reply: `🏠 **Webpage Guide: Home (Web Wall)**

The **Home (Web Wall)** serves as the main interactive entrance to CSSENTIAL:
• **Interactive Header**: Displays your active session, live student registration badge, and quick access to the Theme Selector.
• **Featured Hardware Anatomy**: Visual breakdown of core PC components (Motherboard, CPU, RAM, GPU, PSU, and Storage).
• **Core Competency Cards**: Direct launching points for all 6 curriculum modules (Safety/ESD, System Assembly, Cabling, UEFI/BIOS Setup, OS Installation, and Diagnostics).
• **Platform Statistics & Announcements**: Live system status, quick navigation shortcuts, and platform updates.`
    };
  }

  if (
    lower.includes('what is activities') ||
    lower.includes('activity page') ||
    lower.includes('activities view') ||
    lower.includes('exercises page')
  ) {
    return {
      source: 'page-explainer-activities',
      reply: `🛠 **Webpage Guide: Activities & Exercises**

The **Activities** page contains interactive, hands-on learning modules that simulate real-world technician challenges:
• **8 Diagnostic & Assembly Modules**:
  1. Safety & Preparation Drills
  2. Component Identification & Socket Placement
  3. Physical Assembly Sequencing
  4. Cable Routing & Front Panel Connections
  5. UEFI/BIOS Parameter Configuration
  6. OS Deployment & Partitioning Drills
  7. Fault Isolation & Diagnostic Decision Trees
  8. Case Studies & Verification Benchmarks
• **Live Feedback Engine**: Instant grading, hint explanations, and time tracking.
• **🎮 PLAY Games Hub Button**: Direct gateway to launch the 9 educational games.`
    };
  }

  if (
    lower.includes('what is collection') ||
    lower.includes('collection page') ||
    lower.includes('curriculum collection')
  ) {
    return {
      source: 'page-explainer-collection',
      reply: `📚 **Webpage Guide: Curriculum Collection**

The **Collection** page is the comprehensive academic knowledge repository for all 6 competencies in Computer System Installation and Configuration:
• **6 Complete Learning Units**: Full coverage from workshop OHS to advanced hardware fault isolation.
• **🖥 PRESENT Mode**: Interactive presentation viewer with slide navigation, visual diagrams, and key summary points for classroom or self-paced study.
• **▶ WATCH HD Demonstration Videos**: Watchable laboratory video demonstrations for every competency, plus an in-player **"Upload / Change Video"** studio to upload MP4/WebM files or embed YouTube/Vimeo links.
• **📄 Academic Lab Manuals (PDF & DOCX)**: University-grade laboratory manuals containing Bloom's Taxonomy learning outcomes, tool checklists, procedural matrices, a 100-point performance rubric, and instructor assessor sign-offs.`
    };
  }

  if (
    lower.includes('what is games') ||
    lower.includes('games hub') ||
    lower.includes('game page')
  ) {
    return {
      source: 'page-explainer-games',
      reply: `🎮 **Webpage Guide: Educational Games Hub**

The **Games Hub** provides 9 specialized educational games designed to reinforce hardware knowledge through active retrieval and gamification:
1. **Sort & Configure**: Fast-paced category classification.
2. **Code Cracker**: Terminal decryption via technical diagnostic Q&A.
3. **Troubleshooting Search**: Interactive motherboard fault locator.
4. **Installation Sequence**: Chronological PC assembly milestone ordering.
5. **Technical Flashcards**: Hardware acronyms, ports, and vocabulary mastery.
6. **Memory Match**: Hardware-to-function card pair matching.
7. **Drag & Drop PC Parts**: Socket and chassis assembly puzzle.
8. **Computer System Quiz**: Timed 10-question technical speed challenge.
9. **Tech Word Scramble**: Letter tile unscrambler for technical terms.
All scores, levels, and completion times are recorded to your student transcript!`
    };
  }

  if (
    lower.includes('what is about us') ||
    lower.includes('about page') ||
    lower.includes('who made') ||
    lower.includes('who created') ||
    lower.includes('researchers') ||
    lower.includes('authors') ||
    lower.includes('developer')
  ) {
    return {
      source: 'page-explainer-about',
      reply: `👥 **Webpage Guide: About Us (Researchers & System Background)**

The **About Us** page details the academic thesis and capstone research behind the CSSENTIAL platform.

**Development & Research Team**:
• **Jhon Wesly T. Buban** — Lead Developer & System Architect
• **Juliana Marizh B. Calaputpu** — Curriculum Researcher
• **Charlotte Mae H. Colon** — Content Researcher
• **Precious Lara M. Timoteo** — Evaluation & Testing Researcher

**Research Background**:
CSSENTIAL is developed as a "One-Click Multi-Intervention Learning Platform for Troubleshooting Computer System Installation and Configuration". It combines interactive simulations, structured curriculum presentations, gamified retrieval, formal laboratory manuals, and telemetry analytics to accelerate student learning and diagnostic competency.`
    };
  }

  if (
    lower.includes('what is researcher dashboard') ||
    lower.includes('dashboard page') ||
    lower.includes('admin page') ||
    lower.includes('telemetry')
  ) {
    return {
      source: 'page-explainer-dashboard',
      reply: `📊 **Webpage Guide: Researcher Telemetry Dashboard**

The **Researcher Dashboard** is an administrative and instructor console accessible via password (**CSSENTIAL2026**):
• **Student Roster & Profiles**: Real-time list of all registered student technicians with last-active timestamps.
• **Activity Attempts & Transcripts**: Detailed records of scores, durations, and percentage achievements across all modules.
• **Quiz & Game Telemetry**: Score distributions, time per round, and level progression data.
• **Audit Action Log**: Sequential timeline of student actions (downloads, views, games played).
• **Demonstration Videos Studio**: Upload custom MP4/WebM class demonstration videos or embed YouTube/Vimeo links for each of the 6 competencies.
• **Data Retention & Cleanup**: Automated tools to prune old records (7, 14, 30, 60, 90 days), wipe inactive guest records, or reset test data for a new academic semester.`
    };
  }

  if (
    lower.includes('different types of webpages') ||
    lower.includes('what are the pages') ||
    lower.includes('all pages') ||
    lower.includes('list of pages') ||
    lower.includes('website structure')
  ) {
    return {
      source: 'all-pages-overview',
      reply: `🗺 **Overview of CSSENTIAL Webpages & Sections**

CSSENTIAL is organized into clear, purposeful sections:
1. 🏠 **Home (Web Wall)**: Central dashboard, quick links, featured PC anatomy, and course announcements.
2. 🛠 **Activities**: 8 interactive practical exercises simulating real-world PC assembly, cabling, and troubleshooting cases.
3. 📚 **Collection**: Complete 6-module curriculum featuring **Interactive Presentations (🖥 PRESENT)**, **Academic Lab Manuals (PDF / DOCX)**, and **HD Demonstration Videos (▶ WATCH)**.
4. 🎮 **Games Hub**: 9 gamified educational learning games with real-time scoring and transcript logging.
5. 📝 **Quizzes**: Timed diagnostic assessments evaluating technical competency.
6. 👥 **About Us**: Academic research overview, objectives, and credits for researchers Jhon Wesly T. Buban, Juliana Marizh B. Calaputpu, Charlotte Mae H. Colon, and Precious Lara M. Timoteo.
7. 📊 **Researcher Dashboard**: Password-secured (**CSSENTIAL2026**) instructor portal for analytics, student transcripts, video management, and database retention cleanup.`
    };
  }

  // =========================================================================
  // RULE 4: HOW TO PLAY THE 9 EDUCATIONAL GAMES
  // =========================================================================
  if (
    lower.includes('how to play') ||
    lower.includes('game rules') ||
    lower.includes('how do i play') ||
    lower.includes('instructions for game')
  ) {
    // Specific games
    if (lower.includes('sort') || lower.includes('configure')) {
      return {
        source: 'game-guide-sort',
        reply: `🎮 **How to Play: Sort & Configure**

• **Objective**: Rapidly categorize incoming hardware components into their appropriate technical groups before the countdown expires.
• **Categories**: Input Devices, Output Devices, Storage Media, Processing Units, and Workshop Safety/Tools.
• **How to Play**:
  1. Look at the component name and icon appearing on screen.
  2. Click or drag the component into its matching category bin.
  3. Earn streak multipliers for consecutive correct placements without errors!`
      };
    }

    if (lower.includes('code cracker') || lower.includes('terminal') || lower.includes('decrypt')) {
      return {
        source: 'game-guide-codecracker',
        reply: `🎮 **How to Play: Code Cracker**

• **Objective**: Decrypt a high-security technician terminal passcode by solving technical hardware puzzles.
• **How to Play**:
  1. The terminal displays a diagnostic scenario or technical question.
  2. Select the correct diagnostic step or hardware answer from the choices.
  3. Each correct answer deciphers one digit of the master passcode.
  4. Avoid wrong answers to prevent security lockout penalties!`
      };
    }

    if (lower.includes('troubleshooting search') || lower.includes('motherboard search') || lower.includes('clue')) {
      return {
        source: 'game-guide-troublesearch',
        reply: `🎮 **How to Play: Troubleshooting Search**

• **Objective**: Inspect an interactive motherboard schematic and pinpoint the physical hardware fault causing the system failure.
• **How to Play**:
  1. Read the customer's symptom report (e.g., "No display, continuous beeping").
  2. Scan the motherboard visually for telltale physical anomalies (unseated RAM stick, missing 8-pin CPU cable, unseated GPU latch, or missing standoff).
  3. Click directly on the faulty hardware location on the board to confirm your diagnosis!`
      };
    }

    if (lower.includes('installation sequence') || lower.includes('order') || lower.includes('sequence')) {
      return {
        source: 'game-guide-sequence',
        reply: `🎮 **How to Play: Installation Sequence**

• **Objective**: Order the milestone steps of building and configuring a computer into their exact chronological sequence.
• **How to Play**:
  1. Review the shuffled procedural cards (e.g., "Wear ESD wrist strap", "Install brass standoffs", "Insert CPU into socket", "Mount cooler", "Connect 24-pin ATX", "First boot to UEFI BIOS").
  2. Drag cards or tap the up/down arrows to position them in logical assembly order.
  3. Click **Submit Order** to verify your procedural accuracy!`
      };
    }

    if (lower.includes('flashcard') || lower.includes('flash card')) {
      return {
        source: 'game-guide-flashcards',
        reply: `🎮 **How to Play: Technical Flashcards**

• **Objective**: Master computer system terminology, hardware specs, acronyms, and standard port definitions.
• **How to Play**:
  1. Read the front of the flashcard (e.g., "SATA III Transfer Rate" or "PCIe 4.0 x16 Bandwidth").
  2. Tap the card to flip it and reveal the full technical specification.
  3. Mark the card as "Mastered" or "Review Again" to track your study progress.`
      };
    }

    if (lower.includes('memory match') || lower.includes('pair')) {
      return {
        source: 'game-guide-memory',
        reply: `🎮 **How to Play: Memory Match**

• **Objective**: Flip face-down cards to discover and match pairs between computer hardware components and their primary technical function.
• **How to Play**:
  1. Click any card to reveal its image or technical description.
  2. Click a second card to find its matching pair (e.g., "CPU Integrated Heat Spreader" matches "Transfers heat to cooler baseplate").
  3. Match all cards with the fewest moves and fastest time to set a high score!`
      };
    }

    if (lower.includes('drag') && lower.includes('drop')) {
      return {
        source: 'game-guide-dragdrop',
        reply: `🎮 **How to Play: Drag & Drop PC Parts**

• **Objective**: Assemble a PC from scratch by dragging hardware parts onto their exact sockets and chassis slots.
• **How to Play**:
  1. Select components from the hardware inventory bench (CPU, Thermal Paste, Cooler, RAM, GPU, Power Supply, SSD).
  2. Drag each part over the computer chassis and drop it onto its designated target socket.
  3. The simulator verifies physical alignment, socket keying, and latch locking!`
      };
    }

    if (lower.includes('quiz') || lower.includes('speed challenge')) {
      return {
        source: 'game-guide-quiz',
        reply: `🎮 **How to Play: Computer System Quiz**

• **Objective**: Answer 10 randomized technical questions testing system installation, configuration, and troubleshooting under time pressure.
• **How to Play**:
  1. Read each question carefully and select your chosen answer.
  2. Watch the timer—fast, accurate answers award bonus speed points!
  3. Review your final percentage score and competency rating at the conclusion.`
      };
    }

    if (lower.includes('scramble') || lower.includes('word')) {
      return {
        source: 'game-guide-scramble',
        reply: `🎮 **How to Play: Tech Word Scramble**

• **Objective**: Unscramble randomized letter tiles to identify essential computer hardware, cabling, and diagnostic terms.
• **How to Play**:
  1. Read the provided clue (e.g., "High-speed solid-state interface that connects directly to PCIe lanes").
  2. Tap or drag the scrambled letters into the correct sequence to form the word (e.g., "NVME").
  3. Submit your word to advance to the next level!`
      };
    }

    // General guide for all 9 games
    return {
      source: 'games-hub-overview',
      reply: `🎮 **Guide: How to Play the 9 Educational Games**

To access the games, go to **Activities** and click the **🎮 PLAY Games** button.

Here is what you can play:
1. **Sort & Configure**: Classify parts into Input, Output, Storage, Processing, and Safety bins.
2. **Code Cracker**: Answer diagnostic questions to decrypt the terminal passcode.
3. **Troubleshooting Search**: Inspect a motherboard schematic and click the fault area.
4. **Installation Sequence**: Arrange PC assembly steps in chronological order.
5. **Technical Flashcards**: Flip cards to master hardware acronyms, port bandwidths, and specs.
6. **Memory Match**: Flip cards to pair hardware components with their functions.
7. **Drag & Drop PC Parts**: Drag components from the bench into their chassis sockets.
8. **Computer System Quiz**: 10-question timed technical speed test.
9. **Tech Word Scramble**: Unscramble letter tiles to reveal computer terms.

Ask me about any specific game (e.g. *"How to play Code Cracker"*) for detailed tips!`
    };
  }

  // =========================================================================
  // RULE 5: DEMONSTRATION VIDEOS & VIDEO MANAGEMENT
  // =========================================================================
  if (
    lower.includes('video') ||
    lower.includes('demonstration') ||
    lower.includes('watch') ||
    lower.includes('upload video') ||
    lower.includes('change video') ||
    lower.includes('embed video')
  ) {
    return {
      source: 'video-manager-guide',
      reply: `🎥 **Guide: Demonstration Videos & In-App Video Studio**

CSSENTIAL includes fully watchable educational demonstration videos for all 6 core competencies:
1. **Tool Safety & ESD Prevention Procedures**
2. **Motherboard, CPU, RAM & GPU Physical Installation**
3. **Cable Routing & Front Panel Connections (F_PANEL)**
4. **UEFI/BIOS Setup, Boot Order & TPM 2.0 / Secure Boot**
5. **Windows 10/11 Clean OS Installation & Partitioning**
6. **System Diagnostics, POST Beep Codes & Stress Testing**

**How to Watch Videos**:
• In the **Collection** view or from the **Home** topic cards, click the **▶ WATCH** button on any topic to open the HD video player.

**How Instructors & Students Can Upload / Change Videos**:
• **Option A (Inside the Video Player)**: Click the **"Upload / Change Video"** button directly beneath the video player.
• **Option B (Researcher Dashboard)**: Go to the **Researcher Dashboard** (password: \`CSSENTIAL2026\`) and click the **"Demonstration Videos"** tab.
• **Supported Formats**:
  1. Upload custom MP4 or WebM video files directly from your computer.
  2. Embed YouTube video links (e.g., \`https://www.youtube.com/watch?v=...\` or \`https://youtu.be/...\`).
  3. Embed Vimeo video links.
• **Reverting**: You can click **"Revert to Default"** at any time to restore the original curriculum demonstration video!`
    };
  }

  // =========================================================================
  // RULE 6: ACADEMIC LAB MANUALS (PDF & DOCX)
  // =========================================================================
  if (
    lower.includes('manual') ||
    lower.includes('lab manual') ||
    lower.includes('pdf') ||
    lower.includes('docx') ||
    lower.includes('download') ||
    lower.includes('word') ||
    lower.includes('rubric') ||
    lower.includes('handout') ||
    lower.includes('print')
  ) {
    return {
      source: 'lab-manual-guide',
      reply: `📄 **Guide: Academic Laboratory Manuals (PDF & DOCX)**

CSSENTIAL provides university-standard laboratory manuals for each of the 6 core competency modules:

**What Each Manual Contains**:
• **Institutional Header**: University/College header with course code, student name, year & section, and date fields.
• **Bloom's Taxonomy Learning Outcomes**: Cognitive, affective, and psychomotor competency goals.
• **Required Tools & OHS Safety Checklist**: Pre-flight checks (ESD strap, screwdrivers, multimeter, anti-static mat).
• **Step-by-Step Practical Procedures**: Chronological laboratory tasks with safety warnings.
• **Diagnostic Data Recording Matrix**: Observation tables for recorded voltages, temperatures, and POST codes.
• **100-Point Performance Rubric**: Comprehensive evaluation criteria across Technical Execution (30%), OHS & ESD Compliance (25%), Diagnostics & Accuracy (25%), and Cleanliness/Documentation (20%).
• **Assessor Sign-Off Block**: Formal signature and score lines for laboratory instructors.

**How to View and Download**:
1. Go to the **Collection** page.
2. On any topic card, click **"Academic Lab Manual (PDF / DOCX)"**.
3. In the preview modal, click **"Print / Save as PDF"** to generate an official PDF via your browser, or click **"Download Word (.docx)"** to get an editable file!`
    };
  }

  // =========================================================================
  // RULE 7: CURRICULUM TOPICS (THE 6 COMPETENCIES)
  // =========================================================================
  if (lower.includes('topic 1') || lower.includes('safety') || lower.includes('esd') || lower.includes('ohs') || lower.includes('preparation')) {
    return {
      source: 'topic-1-safety',
      reply: `🛡 **Topic 1: Preparing for Installation & Safety (OHS & ESD)**

• **Occupational Health & Safety (OHS)**:
  - Always unplug the computer power supply from AC wall power before opening the chassis.
  - Press the case power button once while unplugged to discharge lingering electricity stored in PSU capacitors.
  - Avoid loose jewelry, roll up sleeves, and maintain a clean, dry, well-lit work area.
• **Electrostatic Discharge (ESD) Prevention**:
  - Wear an **ESD anti-static wrist strap** with its alligator clip attached to unpainted chassis metal.
  - Work on an anti-static mat; never build a PC on carpet or synthetic bedsheets.
  - Handle motherboards and expansion cards strictly by their fiberglass edges; avoid touching delicate pins or soldered contacts.
• **Essential Technician Tools**:
  - #2 Phillips magnetic-tip screwdriver.
  - Digital multimeter for testing PSU voltage rails (+12V, +5V, +3.3V).
  - Thermal paste cleaner (90%+ isopropyl alcohol and lint-free wipes).
  - Anti-static tweezers and zip-ties for cable management.`
    };
  }

  if (lower.includes('topic 2') || lower.includes('assembly') || lower.includes('standoff') || lower.includes('socket') || lower.includes('thermal paste')) {
    return {
      source: 'topic-2-assembly',
      reply: `🔧 **Topic 2: Hardware Architecture & System Assembly**

• **Motherboard Mounting**:
  - Install **brass standoffs** into the chassis matching ONLY the screw hole positions of your motherboard form factor (ATX, Micro-ATX, Mini-ITX).
  - *Warning*: A stray standoff in the wrong position touches exposed solder joints underneath the motherboard, creating a dead short that prevents startup!
  - Install the rear I/O shield firmly into the chassis opening before mounting the motherboard.
• **CPU Installation**:
  - Intel (LGA): Open the socket lever, align the golden triangle marker on the CPU with the socket notch, drop in vertically without sliding, and close the load plate.
  - AMD (AM4/PGA or AM5/LGA): Align the triangle indicator, insert pins smoothly with Zero Insertion Force (ZIF).
• **Thermal Paste Application**:
  - Place a small pea-sized dot (or grain-of-rice) in the center of the CPU integrated heat spreader (IHS).
  - Mount the cooler straight down and tighten screws in a diagonal cross-pattern (X-pattern) for uniform contact pressure.
• **RAM Installation (Dual-Channel)**:
  - For motherboards with 4 DIMM slots, install dual-channel kits in **slots A2 and B2** (slots 2 and 4 from the CPU socket).
  - Open the slot latches, align the key notch on the gold contacts, and press both ends firmly until the latches click into place.`
    };
  }

  if (lower.includes('topic 3') || lower.includes('cable') || lower.includes('cabling') || lower.includes('front panel') || lower.includes('f_panel') || lower.includes('power supply')) {
    return {
      source: 'topic-3-cabling',
      reply: `🔌 **Topic 3: Power Distribution & Front Panel Connections**

• **Core Power Cables**:
  - **24-Pin ATX Main Power**: Supplies power to the motherboard chipset, PCIe slots, and onboard controllers.
  - **8-Pin (4+4) EPS CPU Power**: Plugs into the top-left corner of the motherboard to supply dedicated 12V power to the CPU VRMs. (Do not confuse with PCIe 8-pin!).
  - **6+2 Pin PCIe Power**: Connects directly to dedicated graphics cards (GPUs).
  - **SATA Power**: 15-pin flat connector for 2.5" SSDs, 3.5" HDDs, and RGB controllers.
• **Front Panel Headers (F_PANEL)**:
  - Located on the bottom right corner of the motherboard (typically a 9-pin block).
  - **POWER SW (PWR_SW)**: Connects to the case power button (momentary short; polarity does not matter).
  - **RESET SW**: Connects to the case reset button (polarity does not matter).
  - **HDD LED**: Hard drive activity light (polarity matters: positive [+] wire must match Pin 1).
  - **POWER LED**: Split into + and - single pins for the case power status LED.`
    };
  }

  if (lower.includes('topic 4') || lower.includes('bios') || lower.includes('uefi') || lower.includes('secure boot') || lower.includes('xmp') || lower.includes('tpm')) {
    return {
      source: 'topic-4-bios',
      reply: `💻 **Topic 4: UEFI/BIOS Setup & System Configuration**

• **Entering BIOS/UEFI**:
  - Power on the computer and repeatedly tap the **DEL** or **F2** key before the operating system begins loading.
• **Key Settings to Configure**:
  - **Boot Priority**: Set your bootable installation USB flash drive to Boot Option #1.
  - **Storage Controller Mode**: Verify SATA mode is set to **AHCI** (Advanced Host Controller Interface), not IDE/Legacy.
  - **XMP / DOCP / EXPO**: Enable memory profiling in BIOS so your RAM runs at its advertised frequency and timings instead of JEDEC baseline speeds (e.g., 3200MHz vs 2133MHz).
  - **TPM 2.0 (fTPM/PTT)**: Enable firmware TPM for Windows 11 hardware requirement compliance.
  - **Secure Boot**: Set to "Standard / Enabled" to protect the bootloader from rootkits.
• **Save & Exit**: Always press **F10** to save settings and restart.`
    };
  }

  if (lower.includes('topic 5') || lower.includes('operating system') || lower.includes('windows') || lower.includes('partition') || lower.includes('gpt') || lower.includes('mbr')) {
    return {
      source: 'topic-5-os',
      reply: `💿 **Topic 5: Operating System Deployment & Partitioning**

• **Preparing Bootable Media**:
  - Use the official Windows Media Creation Tool or Rufus to flash Windows 10/11 onto an 8GB+ USB flash drive using the **GPT partition scheme for UEFI**.
• **GPT vs MBR**:
  - **GPT (GUID Partition Table)**: Modern standard, supports drives larger than 2TB, up to 128 primary partitions, and integrates with UEFI Secure Boot.
  - **MBR (Master Boot Record)**: Legacy standard, limited to 2TB drive capacity and 4 primary partitions.
• **Installation Steps**:
  1. Boot from the USB drive by selecting it in the UEFI boot menu (F11/F12).
  2. Select Custom: Install Windows only (advanced).
  3. Select your unallocated target SSD drive and click Next (Windows automatically creates EFI System, MSR, and Primary NTFS partitions).
  4. Once desktop appears, install motherboard chipset drivers, LAN/Wi-Fi drivers, and dedicated GPU graphics drivers.`
    };
  }

  if (lower.includes('topic 6') || lower.includes('diagnostics') || lower.includes('troubleshoot') || lower.includes('beep') || lower.includes('ez debug') || lower.includes('black screen')) {
    return {
      source: 'topic-6-diagnostics',
      reply: `🔍 **Topic 6: Diagnostics, Testing & Hardware Troubleshooting**

• **CompTIA 6-Step Troubleshooting Methodology**:
  1. Identify the problem (gather info, question user, note symptoms).
  2. Establish a theory of probable cause (question the obvious).
  3. Test the theory to determine cause.
  4. Establish a plan of action and implement the solution.
  5. Verify full system functionality and implement preventive measures.
  6. Document findings, actions, and outcomes.

• **POST Beep Codes (Motherboard Speaker)**:
  - **1 Short Beep**: Normal successful POST.
  - **Continuous Beeps**: Power supply fault or short circuit.
  - **1 Long, 2 or 3 Short Beeps**: Video card (GPU) failure or unseated GPU.
  - **Repeating Long Beeps**: Memory (RAM) error or unseated DIMM modules.
  - **High-Low Siren**: CPU overheating or CPU fan disconnected.

• **EZ Debug LEDs**:
  - **CPU (Red)**: Missing/unseated CPU, bent socket pins, or missing 8-pin EPS cable.
  - **DRAM (Yellow/Amber)**: Unseated RAM, dirty contacts, or incompatible frequency.
  - **VGA (White)**: GPU not detected, missing PCIe power cable, or monitor plugged into motherboard instead of GPU.
  - **BOOT (Green)**: No operating system or bootable drive detected.

• **Diagnostic Stress Tools**:
  - **MemTest86**: Memory read/write integrity testing.
  - **Prime95 / FurMark**: CPU and GPU thermal stability and power regulation burn-in testing.
  - **HWMonitor**: Telemetry monitoring for voltage rails (+12V, +5V, +3.3V) and temperatures.`
    };
  }

  // =========================================================================
  // RULE 8: SPECIFIC COMMON TECHNICAL TROUBLESHOOTING QUESTIONS
  // =========================================================================
  if (lower.includes('no display') || lower.includes('black screen') || lower.includes('no video') || lower.includes('no post')) {
    return {
      source: 'troubleshoot-no-display',
      reply: `🖥 **Troubleshooting Guide: No Display / Black Screen / No POST**

Follow these step-by-step diagnostic checks:
1. **Check Video Cable Placement**: Ensure your HDMI or DisplayPort cable is plugged directly into the **dedicated graphics card (GPU)** at the bottom, NOT into the motherboard video ports (unless your CPU has integrated graphics).
2. **Verify Power Cables**: Check that both the **24-pin ATX** motherboard cable and the **8-pin CPU EPS** cable (top-left) are fully snapped in.
3. **Reseat RAM Sticks**: Turn off power, unlatch RAM, and firmly press sticks back into **slots A2 and B2** until the locking clips snap shut automatically.
4. **Inspect EZ Debug LEDs**: Look at the 4 LEDs on the right side of the motherboard (CPU, DRAM, VGA, BOOT) to see which component halts POST.
5. **Clear CMOS**: Unplug the computer from the wall, remove the CR2032 coin-cell battery on the motherboard for 5 minutes (or bridge the CLR_CMOS pins for 10 seconds), and reinstall to restore factory BIOS defaults.`
    };
  }

  if (lower.includes('overheat') || lower.includes('thermal throttling') || lower.includes('loud fan')) {
    return {
      source: 'troubleshoot-overheating',
      reply: `🔥 **Troubleshooting Guide: CPU Overheating & Thermal Throttling**

• **Normal Temperature Benchmarks**:
  - Idle: 30°C to 45°C.
  - Under Load: 65°C to 80°C.
  - Dangerous / Throttling: 90°C to 105°C+ (triggers thermal shutdown to prevent permanent silicon damage).
• **Most Common Causes & Solutions**:
  1. **Protective Plastic Film Peel**: Check if the transparent plastic warning film on the bottom of the CPU cooler heatsink baseplate was accidentally left on during installation!
  2. **Thermal Paste**: Ensure old paste was cleaned with 90%+ isopropyl alcohol, and apply a fresh pea-sized dot in the center.
  3. **Mounting Pressure**: Tighten cooler screws diagonally in an X-pattern so contact pressure across the CPU heat spreader is completely even.
  4. **Fan Header**: Ensure the cooler fan cable is plugged into the dedicated **CPU_FAN** header on the motherboard, not a generic chassis header.`
    };
  }

  if (lower.includes('power button') || lower.includes('wont turn on') || lower.includes('does not turn on')) {
    return {
      source: 'troubleshoot-no-power',
      reply: `⚡ **Troubleshooting Guide: PC Does Not Turn On (No Fan Movement)**

If pressing the case power button produces no response whatsoever:
1. **Power Supply Rocker Switch**: Check the switch on the back of the PSU. The line (|) must be pressed down, not the circle (O).
2. **Front Panel PWR_SW Connection**: Confirm that the 2-pin **POWER SW** connector from the computer case is plugged into the correct pins on the motherboard's 9-pin **F_PANEL** header.
3. **Screwdriver Jump Test**: Carefully touch the tip of a flathead screwdriver across the two **PWR_SW** pins on the motherboard for 1 second. If the PC starts, your case power switch cable is defective or improperly seated.
4. **Wall Outlet & AC Cord**: Test the power cable in another outlet or monitor to verify incoming AC power.`
    };
  }

  // =========================================================================
  // RULE 9: GREETINGS & CASUAL INTERACTION
  // =========================================================================
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('good morning') || lower.includes('good afternoon') || lower.includes('greetings')) {
    return {
      source: 'greeting-response',
      reply: `👋 **Hello! Welcome to CSSENTIAL Assistance.**

I am your **AI Learning & Platform Guide** for Computer System Installation, Configuration, and Troubleshooting.

Here is how I can assist you:
• 🧭 **Website Navigation**: How to use any page (Home, Activities, Collection, Games, Quizzes, About Us).
• 🎮 **How to Play Games**: Rules and gameplay for all 9 educational games.
• 📄 **Academic Lab Manuals**: How to view, print, or download PDF/Word (.docx) manuals with rubrics.
• 🎥 **Demonstration Videos**: How to watch HD lab videos or upload your own class demonstrations.
• 🛠 **Technical Troubleshooting**: Diagnosing black screens, POST beep codes, EZ Debug LEDs, RAM dual-channel rules, and UEFI/BIOS settings.

*(Note: In accordance with academic policy, I cannot give direct answers to quizzes or tests, but I will happily teach you the concepts so you can master them!)*

What would you like assistance with today?`
    };
  }

  if (lower.includes('thank') || lower.includes('salamat') || lower.includes('appreciate')) {
    return {
      source: 'gratitude-response',
      reply: `You're very welcome! Keep up the great work in your technical training. If you ever run into a puzzling diagnostic symptom, need help navigating the platform, or want to review hardware procedures, just ask for assistance anytime!`
    };
  }

  // =========================================================================
  // RULE 10: DEFAULT COMPREHENSIVE PLATFORM ASSISTANCE RESPONSE
  // =========================================================================
  return {
    source: 'platform-comprehensive-fallback',
    reply: `I am your **CSSENTIAL Learning & Platform Assistant**, ready to help you with anything inside the platform!

Here are popular questions you can ask me:
• 🧭 **Navigation & Tutorials**: *"How do I navigate the website?"* or *"Give me a tutorial of CSSENTIAL."*
• 🗺 **Webpages Explained**: *"What is the Collection page?"*, *"What is in Activities?"*, or *"Explain the Home page."*
• 🎮 **How to Play Games**: *"How to play Sort & Configure?"*, *"How to play Code Cracker?"*, or *"Explain all 9 games."*
• 🎥 **Demonstration Videos**: *"How do I watch or upload demonstration videos?"*
• 📄 **Laboratory Manuals**: *"How do I download or print the PDF/Word lab manuals?"*
• 🛠 **Hardware & Diagnostics**: *"Why is there no display on my monitor?"*, *"Explain POST beep codes"*, or *"How to configure UEFI/BIOS."*
• 👥 **Research Credits**: *"Who created CSSENTIAL?"*

*(Reminder: I provide conceptual guidance and troubleshooting hints, but cannot give away direct answers to quizzes or graded activities).*

What technical topic or feature can I assist you with?`
  };
}
