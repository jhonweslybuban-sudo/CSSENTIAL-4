import { LessonContent } from '../types';
import { api } from './api';

export interface PresentationSlide {
  id: string;
  slideNumber: number;
  totalSlides: number;
  type: 'title' | 'objectives' | 'concept' | 'procedure_step' | 'safety' | 'troubleshooting' | 'summary';
  category: string;
  badge?: string;
  title: string;
  subtitle?: string;
  data: any;
  presenterNotes: string;
}

export function buildLessonSlides(lesson: LessonContent): PresentationSlide[] {
  const slides: Omit<PresentationSlide, 'slideNumber' | 'totalSlides'>[] = [];

  // 1. Title / Cover Slide
  slides.push({
    id: `slide-${lesson.id}-cover`,
    type: 'title',
    category: 'LECTURE PRESENTATION',
    badge: `TOPIC 0${lesson.topicNumber}`,
    title: lesson.title,
    subtitle: lesson.shortDesc,
    data: {
      topicNumber: lesson.topicNumber,
      courseCode: `CSIC-30${lesson.topicNumber}`,
      courseName: 'Computer Systems Installation and Configuration',
      program: 'National Competency Standards Aligned Curriculum',
      duration: lesson.duration || '15:00',
      academicYear: 'Academic Year 2025–2026',
      accreditation: 'TESDA National Certificate II (NC II) Core Competency'
    },
    presenterNotes: `Welcome students to Topic ${lesson.topicNumber}: ${lesson.title}. Introduce the scope, emphasizing practical laboratory execution and diagnostic standards required in professional computer hardware engineering.`
  });

  // 2. Learning Objectives & Outcomes Slide
  slides.push({
    id: `slide-${lesson.id}-objectives`,
    type: 'objectives',
    category: 'COMPETENCY FRAMEWORK',
    badge: 'LEARNING OUTCOMES',
    title: 'Module Objectives & Performance Targets',
    subtitle: 'Demonstrated mastery required for laboratory qualification and practicum completion',
    data: {
      objectives: lesson.objectives,
      competencies: [
        { label: 'Cognitive Knowledge', detail: 'Technical terminology, socket standards, electrical safety rules' },
        { label: 'Psychomotor Skill', detail: 'Component alignment, tool handling, physical mounting and cable routing' },
        { label: 'Affective & Safety', detail: 'Strict ESD compliance, OHS hazard mitigation, workstation cleanliness' }
      ]
    },
    presenterNotes: 'Review each objective with the class. Highlight that all three domains—cognitive theory, psychomotor assembly, and safety compliance—will be tested during the hands-on laboratory evaluation.'
  });

  // 3. Theoretical Concepts Slides (one per contentSection)
  lesson.contentSections.forEach((section, index) => {
    slides.push({
      id: `slide-${lesson.id}-concept-${index + 1}`,
      type: 'concept',
      category: 'TECHNICAL FOUNDATIONS',
      badge: `PART ${index + 1} OF ${lesson.contentSections.length}`,
      title: section.heading,
      subtitle: `Key engineering concepts, architectural standards, and practical implications`,
      data: {
        body: section.body,
        keyPoints: section.keyPoints || [],
        sectionIndex: index + 1,
        totalSections: lesson.contentSections.length
      },
      presenterNotes: `Explain the technical rationale behind ${section.heading}. Connect theoretical concepts to real-world technician troubleshooting scenarios and hardware reliability.`
    });
  });

  // 4. Practical Hands-On Step-by-Step Procedure Slides
  if (lesson.steps && lesson.steps.length > 0) {
    lesson.steps.forEach((step, sIdx) => {
      slides.push({
        id: `slide-${lesson.id}-step-${step.step}`,
        type: 'procedure_step',
        category: 'HANDS-ON LABORATORY PROCEDURE',
        badge: `STEP ${step.step} OF ${lesson.steps?.length}`,
        title: step.title,
        subtitle: `Procedural action item for laboratory bench assembly and configuration`,
        data: {
          stepNumber: step.step,
          totalSteps: lesson.steps?.length,
          title: step.title,
          details: step.details,
          warning: step.warning,
          technicianTip: getStepTechnicianTip(lesson.topicNumber, step.step)
        },
        presenterNotes: `Demonstrate Step ${step.step}: ${step.title}. Emphasize proper hand positioning, torque control on screws, and zero-force socket insertion.`
      });
    });
  }

  // 5. Safety Protocols & OHS / ESD Precautions Slide
  slides.push({
    id: `slide-${lesson.id}-safety`,
    type: 'safety',
    category: 'SAFETY PROTOCOLS',
    badge: 'OHS & ESD COMPLIANCE',
    title: 'Occupational Health, Safety & ESD Guardrails',
    subtitle: 'Mandatory technician safety measures to protect personnel and sensitive electronics',
    data: {
      reminders: lesson.reminders,
      ppeChecklist: [
        'Anti-static wrist strap with 1MΩ current-limiting resistor attached to bare metal chassis ground',
        'ESD bench mat with grounded banana plug interconnect',
        'Safety glasses during chassis cutting, wire trimming, and power supply testing',
        'Closed-toe rubber-soled footwear to prevent floor electrical grounding loops'
      ],
      hazardMitigation: 'Never work with wet hands, energized AC line voltage, or metallic jewelry around high-amperage switching power circuits.'
    },
    presenterNotes: 'Remind students: ESD damage is microscopic and silent. A chip can degrade without failing immediately, leading to intermittent customer crashes weeks later.'
  });

  // 6. Troubleshooting & Diagnostic Matrix Slide
  slides.push({
    id: `slide-${lesson.id}-troubleshooting`,
    type: 'troubleshooting',
    category: 'DIAGNOSTIC BENCHMARK',
    badge: 'FIELD TROUBLESHOOTING',
    title: 'Laboratory Troubleshooting & Problem Resolution',
    subtitle: 'Rapid diagnosis protocols for common installation errors and assembly faults',
    data: {
      tips: lesson.troubleshootingTips,
      diagnosticFlow: getDiagnosticFlow(lesson.topicNumber)
    },
    presenterNotes: 'Walk students through the troubleshooting matrix. Ask them how they would identify these symptoms using sensory inspection (auditory beeps, LED indicators, smell of ozone, tactile seating).'
  });

  // 7. Summary & Competency Takeaways Slide
  slides.push({
    id: `slide-${lesson.id}-summary`,
    type: 'summary',
    category: 'MODULE RECAP',
    badge: 'COMPETENCY CHECKPOINT',
    title: 'Summary of Key Concepts & Sign-Off',
    subtitle: 'Preparation for laboratory practicum assessment and diagnostic quiz',
    data: {
      topicTitle: lesson.title,
      topicNumber: lesson.topicNumber,
      takeaways: [
        'Strict procedural sequencing prevents physical and electrical damage during assembly.',
        'Proper standoff isolation and ground integrity are essential before initial power-on.',
        'Always confirm hardware recognition in UEFI/BIOS before initiating operating system installation.',
        'Complete written documentation and inspection logs for every bench installation.'
      ],
      nextSteps: [
        'Review the downloadable formal laboratory manual (PDF / DOCX)',
        'Complete the Interactive Diagnostic Games & Word Scrambles in the Games Hub',
        'Practice the Computer System Assembly interactive simulation'
      ]
    },
    presenterNotes: 'Conclude the presentation. Direct students to the next intervention activity: interactive simulation, retrieval gaming, and laboratory manual evaluation.'
  });

  // Inject computed slideNumber and totalSlides
  const total = slides.length;
  return slides.map((s, idx) => ({
    ...s,
    slideNumber: idx + 1,
    totalSlides: total
  }));
}

function getStepTechnicianTip(topicNumber: number, stepNumber: number): string {
  const tips: Record<string, string> = {
    '1-1': 'Keep workspace ambient relative humidity between 35% and 50% to naturally reduce electrostatic charge accumulation.',
    '1-2': 'Never use magnetic screwdrivers with high magnetic flux near unshielded mechanical hard drive platters or BIOS flash chips.',
    '1-3': 'Always place unboxed motherboards directly onto their non-conductive cardboard packaging, never on top of the shiny anti-static bag exterior.',
    '2-1': 'Before placing the motherboard inside the chassis, test POST on the test bench with CPU, Cooler, and 1 stick of RAM installed.',
    '2-2': 'Count the brass standoffs installed in the chassis tray—make sure they match the exact mounting holes of your motherboard form factor.',
    '2-3': 'A pea-sized dot of thermal paste at the center of the CPU heatspreader provides optimal spread without overflowing onto the socket.',
    '3-1': 'Press Del or F2 rapidly during boot to enter UEFI. If entering fast-boot mode, hold Shift while clicking Restart in Windows.',
    '3-2': 'Set storage controller mode to AHCI / NVMe to enable NCQ (Native Command Queuing) and TRIM support.',
    '3-3': 'Always initialize modern drives >2TB using GPT (GUID Partition Table) to support UEFI booting and multiple partitions.',
    '4-1': 'A single short beep indicates successful POST pass. Continuous long beeps usually signify missing or unseated RAM memory.',
    '4-2': 'Monitor CPU temperatures during prime synthetic load; temps should stabilize below 85°C on modern air/liquid coolers.',
    '4-3': 'Run at least 2 complete passes of MemTest86 before certifying any computer build for production or office deployment.'
  };

  return tips[`${topicNumber}-${stepNumber}`] || 'Follow standardized torque and visual inspection protocols on all hardware fasteners.';
}

function getDiagnosticFlow(topicNumber: number): { symptom: string; cause: string; resolution: string }[] {
  switch (topicNumber) {
    case 1:
      return [
        {
          symptom: 'Technician receives static shock upon touching chassis',
          cause: 'Poor grounding path or dry carpet environment',
          resolution: 'Attach ESD alligator clamp to earth ground point; spray anti-static solution on carpet.'
        },
        {
          symptom: 'Stripped screw thread in case tray',
          cause: 'Wrong screwdriver size (#1 used instead of #2) or cross-threading',
          resolution: 'Extract with screw removal pliers; replace standoff and re-thread carefully.'
        }
      ];
    case 2:
      return [
        {
          symptom: 'System powers on for 1 second, then immediately shuts off (power cycling)',
          cause: 'Missing 8-pin CPU power cable or missing motherboard standoff causing short',
          resolution: 'Inspect motherboard standoffs; ensure 8-pin EPS 12V is securely latched.'
        },
        {
          symptom: 'CPU hits 95°C+ within 15 seconds of boot',
          cause: 'Heatsink protective plastic film was left attached to cooler copper base',
          resolution: 'Remove cooler, peel protective sticker, clean old paste with 99% isopropyl alcohol, reapply.'
        }
      ];
    case 3:
      return [
        {
          symptom: '"No Bootable Device Found" error after OS installation',
          cause: 'Boot mode mismatch (Legacy BIOS vs UEFI) or incorrect SATA controller mode',
          resolution: 'Switch UEFI boot order to Windows Boot Manager; ensure drive is formatted with GPT.'
        },
        {
          symptom: 'Ethernet or Wi-Fi shows yellow exclamation mark in Device Manager',
          cause: 'Generic OS installer lacks native network controller chipset driver',
          resolution: 'Download network driver from motherboard vendor via USB drive and install offline.'
        }
      ];
    case 4:
    default:
      return [
        {
          symptom: 'No display signal, 3 long beeps during POST',
          cause: 'Memory module unseated or installed in non-primary dual-channel slot',
          resolution: 'Reseat RAM in slots DIMM_A2 and DIMM_B2 until both side latches click firmly.'
        },
        {
          symptom: 'Random Blue Screen of Death (BSOD) during heavy computing load',
          cause: 'Memory timing instability or overheating voltage regulator modules (VRMs)',
          resolution: 'Check RAM voltage in BIOS; ensure chassis intake fans provide active airflow across VRM heatsinks.'
        }
      ];
  }
}

/**
 * Generates an executive-grade, standalone HTML presentation file.
 * Completely self-contained with offline CSS, keyboard navigation,
 * fullscreen mode, slide drawer, and print-to-PDF ready styling.
 */
export function generatePresentationHtml(
  lesson: LessonContent,
  studentName: string = 'Registered Student'
): string {
  const slides = buildLessonSlides(lesson);
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const slidesJson = JSON.stringify(slides);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Topic 0${lesson.topicNumber}: ${lesson.title} - Presentation Slides</title>
  <style>
    :root {
      --primary: #1e3a8a;
      --primary-dark: #0f172a;
      --accent: #f59e0b;
      --accent-glow: rgba(245, 158, 11, 0.25);
      --bg: #0b0f19;
      --card-bg: #131b2e;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --border: #1e293b;
      --success: #10b981;
      --danger: #ef4444;
      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: var(--font-sans);
      height: 100vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      user-select: none;
    }

    /* Top Control Bar */
    header {
      background: #080c14;
      border-bottom: 1px solid var(--border);
      padding: 10px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 10;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .badge-topic {
      background: var(--primary);
      color: #fff;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 6px;
      letter-spacing: 0.5px;
    }

    .brand-title {
      font-size: 14px;
      font-weight: 700;
      color: #e2e8f0;
    }

    .controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    button {
      background: #1e293b;
      color: #e2e8f0;
      border: 1px solid #334155;
      padding: 7px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }

    button:hover {
      background: #334155;
      color: #fff;
      border-color: #475569;
    }

    button.btn-primary {
      background: var(--primary);
      border-color: #2563eb;
      color: #fff;
    }

    button.btn-primary:hover {
      background: #1d4ed8;
    }

    /* Main Presentation Canvas (16:9 aspect container) */
    main {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      position: relative;
    }

    .slide-wrapper {
      width: 100%;
      max-width: 1120px;
      aspect-ratio: 16 / 9;
      max-height: 82vh;
      background: linear-gradient(135deg, #0d1527 0%, #080c17 100%);
      border: 1px solid #1e293b;
      border-radius: 18px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
      transition: opacity 0.2s ease, transform 0.2s ease;
    }

    /* Slide Header */
    .slide-header {
      padding: 24px 36px 12px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .slide-category {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #38bdf8;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .slide-category span.pill {
      background: rgba(56, 189, 248, 0.15);
      border: 1px solid rgba(56, 189, 248, 0.3);
      padding: 2px 8px;
      border-radius: 4px;
    }

    .slide-heading {
      font-size: 26px;
      font-weight: 900;
      color: #ffffff;
      margin-top: 6px;
      letter-spacing: -0.5px;
      line-height: 1.2;
    }

    .slide-subheading {
      font-size: 13px;
      color: var(--text-muted);
      margin-top: 4px;
    }

    .slide-counter-badge {
      font-family: monospace;
      font-size: 12px;
      color: #94a3b8;
      background: rgba(255, 255, 255, 0.06);
      padding: 6px 12px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      font-weight: bold;
    }

    /* Slide Body */
    .slide-body {
      flex: 1;
      padding: 24px 36px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    /* Content components */
    .hero-title {
      font-size: 42px;
      font-weight: 900;
      line-height: 1.15;
      background: linear-gradient(135deg, #ffffff 0%, #93c5fd 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 16px;
    }

    .hero-desc {
      font-size: 17px;
      color: #cbd5e1;
      max-width: 800px;
      line-height: 1.6;
      margin-bottom: 24px;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 14px;
      margin-top: 10px;
    }

    .meta-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 12px 16px;
      border-radius: 12px;
    }

    .meta-label {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: bold;
      color: #64748b;
      letter-spacing: 0.5px;
    }

    .meta-value {
      font-size: 13px;
      font-weight: bold;
      color: #f1f5f9;
      margin-top: 3px;
    }

    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
    }

    .glass-card {
      background: #111a2e;
      border: 1px solid #1e293b;
      padding: 18px 20px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .glass-card h4 {
      font-size: 14px;
      font-weight: 800;
      color: #38bdf8;
      margin-bottom: 8px;
    }

    .glass-card p {
      font-size: 13px;
      color: #cbd5e1;
      line-height: 1.5;
    }

    .list-checks {
      list-style: none;
      margin-top: 10px;
    }

    .list-checks li {
      position: relative;
      padding-left: 24px;
      margin-bottom: 8px;
      font-size: 13px;
      color: #e2e8f0;
      line-height: 1.45;
    }

    .list-checks li::before {
      content: "✓";
      position: absolute;
      left: 0;
      top: 0;
      color: var(--success);
      font-weight: 900;
    }

    .warning-box {
      background: rgba(239, 68, 68, 0.12);
      border-left: 4px solid var(--danger);
      padding: 12px 16px;
      border-radius: 0 8px 8px 0;
      margin-top: 16px;
      font-size: 12px;
      color: #fca5a5;
    }

    .warning-box strong {
      color: #fee2e2;
    }

    .tip-box {
      background: rgba(245, 158, 11, 0.12);
      border-left: 4px solid var(--accent);
      padding: 12px 16px;
      border-radius: 0 8px 8px 0;
      margin-top: 16px;
      font-size: 12px;
      color: #fde68a;
    }

    .step-big-number {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: var(--primary);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      font-weight: 900;
      margin-right: 16px;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(30, 58, 138, 0.5);
    }

    /* Bottom Navigation Bar */
    footer {
      background: #080c14;
      border-top: 1px solid var(--border);
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 10;
    }

    .nav-buttons {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .progress-bar-container {
      flex: 1;
      max-width: 400px;
      height: 6px;
      background: #1e293b;
      border-radius: 999px;
      overflow: hidden;
      margin: 0 20px;
    }

    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #2563eb, #38bdf8);
      transition: width 0.25s ease;
    }

    .notes-drawer {
      background: #0f172a;
      border-top: 1px solid #334155;
      padding: 12px 24px;
      font-size: 12px;
      color: #94a3b8;
      display: none;
    }

    .notes-drawer.open {
      display: block;
    }

    /* Print Styles (1 slide per landscape page) */
    @media print {
      body {
        height: auto;
        overflow: visible;
        background: #fff;
        color: #111;
      }

      header, footer, .notes-drawer {
        display: none !important;
      }

      main {
        display: block;
        padding: 0;
      }

      .slide-wrapper {
        width: 100%;
        max-width: 100%;
        aspect-ratio: 16 / 9;
        page-break-after: always;
        break-after: page;
        border: none;
        border-radius: 0;
        box-shadow: none;
        background: #ffffff !important;
        color: #111827 !important;
        margin-bottom: 0;
      }

      .slide-header {
        border-bottom: 2px solid #1e3a8a;
      }

      .slide-heading {
        color: #1e3a8a !important;
      }

      .hero-title {
        background: none !important;
        -webkit-text-fill-color: #1e3a8a !important;
        color: #1e3a8a !important;
      }

      .hero-desc, .slide-subheading, p {
        color: #374151 !important;
      }

      .glass-card {
        background: #f8fafc !important;
        border: 1px solid #cbd5e1 !important;
        color: #1e293b !important;
      }

      .glass-card h4 {
        color: #1e3a8a !important;
      }

      .glass-card p {
        color: #334155 !important;
      }

      .meta-card {
        background: #f1f5f9 !important;
        border: 1px solid #cbd5e1 !important;
      }

      .meta-label {
        color: #64748b !important;
      }

      .meta-value {
        color: #0f172a !important;
      }

      .list-checks li {
        color: #1e293b !important;
      }
    }
  </style>
</head>
<body>

  <!-- Top Header -->
  <header>
    <div class="brand">
      <span class="badge-topic">TOPIC 0${lesson.topicNumber}</span>
      <span class="brand-title">CSIC-30${lesson.topicNumber}: ${lesson.title}</span>
    </div>

    <div class="controls">
      <button onclick="toggleNotes()" title="Toggle Presenter Notes">
        📝 Notes
      </button>
      <button onclick="window.print()" title="Print or Save as PDF Slides">
        🖨️ Print / Save PDF
      </button>
      <button class="btn-primary" onclick="toggleFullscreen()" title="Full Screen Presentation (F)">
        ⛶ Fullscreen
      </button>
    </div>
  </header>

  <!-- Presentation Stage -->
  <main>
    <div class="slide-wrapper" id="slideContainer">
      <!-- Dynamic slide content injected by JavaScript -->
    </div>
  </main>

  <!-- Presenter Notes Drawer -->
  <div class="notes-drawer" id="notesDrawer">
    <strong>Presenter Notes: </strong>
    <span id="notesContent"></span>
  </div>

  <!-- Bottom Nav -->
  <footer>
    <div class="nav-buttons">
      <button onclick="prevSlide()" id="btnPrev">← Previous</button>
      <span style="font-size: 12px; font-weight: bold; font-family: monospace; color: #94a3b8;" id="slideNumberDisplay">
        1 / 8
      </span>
      <button onclick="nextSlide()" id="btnNext">Next →</button>
    </div>

    <div class="progress-bar-container">
      <div class="progress-bar-fill" id="progressBar" style="width: 12%;"></div>
    </div>

    <div style="display: flex; gap: 8px; align-items: center;">
      <select id="slideSelect" onchange="goToSlide(parseInt(this.value))" style="background: #1e293b; color: #e2e8f0; border: 1px solid #334155; padding: 6px 10px; border-radius: 6px; font-size: 11px; font-weight: bold;">
        ${slides.map((s, idx) => `<option value="${idx}">${idx + 1}. ${s.title.substring(0, 32)}...</option>`).join('')}
      </select>
    </div>
  </footer>

  <script>
    const slides = ${slidesJson};
    let currentSlide = 0;
    let notesOpen = false;

    function renderSlide(index) {
      if (index < 0) index = 0;
      if (index >= slides.length) index = slides.length - 1;
      currentSlide = index;

      const slide = slides[index];
      const container = document.getElementById('slideContainer');
      const notes = document.getElementById('notesContent');
      const display = document.getElementById('slideNumberDisplay');
      const progress = document.getElementById('progressBar');
      const select = document.getElementById('slideSelect');
      const btnPrev = document.getElementById('btnPrev');
      const btnNext = document.getElementById('btnNext');

      display.innerText = (index + 1) + ' / ' + slides.length;
      progress.style.width = (((index + 1) / slides.length) * 100) + '%';
      select.value = index;
      notes.innerText = slide.presenterNotes || 'No notes for this slide.';

      btnPrev.disabled = index === 0;
      btnNext.disabled = index === slides.length - 1;

      // Render based on slide type
      let html = '';

      if (slide.type === 'title') {
        html = \`
          <div class="slide-body" style="justify-content: center; padding: 48px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
              <span class="badge-topic">\${slide.badge}</span>
              <span style="font-size: 12px; font-weight: bold; color: #38bdf8; letter-spacing: 1px;">\${slide.category}</span>
            </div>
            <h1 class="hero-title">\${slide.title}</h1>
            <p class="hero-desc">\${slide.subtitle}</p>
            
            <div class="meta-grid">
              <div class="meta-card">
                <div class="meta-label">Course Standard</div>
                <div class="meta-value">\${slide.data.courseCode}</div>
              </div>
              <div class="meta-card">
                <div class="meta-label">Academic Program</div>
                <div class="meta-value">\${slide.data.accreditation}</div>
              </div>
              <div class="meta-card">
                <div class="meta-label">Expected Duration</div>
                <div class="meta-value">\${slide.data.duration}</div>
              </div>
              <div class="meta-card">
                <div class="meta-label">Curriculum Term</div>
                <div class="meta-value">\${slide.data.academicYear}</div>
              </div>
            </div>
          </div>
        \`;
      } else if (slide.type === 'objectives') {
        html = \`
          <div class="slide-header">
            <div>
              <div class="slide-category"><span class="pill">\${slide.badge}</span> \${slide.category}</div>
              <h2 class="slide-heading">\${slide.title}</h2>
              <div class="slide-subheading">\${slide.subtitle}</div>
            </div>
            <div class="slide-counter-badge">\${index + 1} / \${slides.length}</div>
          </div>
          <div class="slide-body">
            <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px;">
              <div>
                <h4 style="font-size: 13px; font-weight: 800; color: #38bdf8; text-transform: uppercase; margin-bottom: 12px;">
                  Laboratory Behavioral Outcomes
                </h4>
                <ul class="list-checks">
                  \${slide.data.objectives.map(obj => '<li>' + obj + '</li>').join('')}
                </ul>
              </div>
              <div style="display: flex; flex-direction: column; gap: 12px;">
                <h4 style="font-size: 13px; font-weight: 800; color: #fbbf24; text-transform: uppercase; margin-bottom: 4px;">
                  Evaluation Criteria
                </h4>
                \${slide.data.competencies.map(c => \`
                  <div class="glass-card" style="padding: 12px 16px;">
                    <div style="font-size: 11px; font-weight: 800; color: #38bdf8;">\${c.label}</div>
                    <div style="font-size: 12px; color: #cbd5e1; margin-top: 2px;">\${c.detail}</div>
                  </div>
                \`).join('')}
              </div>
            </div>
          </div>
        \`;
      } else if (slide.type === 'concept') {
        html = \`
          <div class="slide-header">
            <div>
              <div class="slide-category"><span class="pill">\${slide.badge}</span> \${slide.category}</div>
              <h2 class="slide-heading">\${slide.title}</h2>
              <div class="slide-subheading">\${slide.subtitle}</div>
            </div>
            <div class="slide-counter-badge">\${index + 1} / \${slides.length}</div>
          </div>
          <div class="slide-body">
            <div class="glass-card" style="margin-bottom: 16px; background: rgba(30, 58, 138, 0.15); border-color: rgba(59, 130, 246, 0.3);">
              <p style="font-size: 14px; line-height: 1.6; color: #f1f5f9;">\${slide.data.body}</p>
            </div>
            <h4 style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #38bdf8; margin-bottom: 10px;">
              Core Technical Principles & Standards
            </h4>
            <div class="card-grid">
              \${slide.data.keyPoints.map(kp => \`
                <div class="glass-card">
                  <p style="font-size: 13px; color: #e2e8f0;">\${kp}</p>
                </div>
              \`).join('')}
            </div>
          </div>
        \`;
      } else if (slide.type === 'procedure_step') {
        html = \`
          <div class="slide-header">
            <div>
              <div class="slide-category"><span class="pill">\${slide.badge}</span> \${slide.category}</div>
              <h2 class="slide-heading">Step \${slide.data.stepNumber}: \${slide.data.title}</h2>
              <div class="slide-subheading">\${slide.subtitle}</div>
            </div>
            <div class="slide-counter-badge">\${index + 1} / \${slides.length}</div>
          </div>
          <div class="slide-body">
            <div style="display: flex; align-items: flex-start; margin-bottom: 20px;">
              <div class="step-big-number">\${slide.data.stepNumber}</div>
              <div>
                <h3 style="font-size: 20px; font-weight: 800; color: #ffffff; margin-bottom: 8px;">\${slide.data.title}</h3>
                <p style="font-size: 15px; color: #cbd5e1; line-height: 1.6;">\${slide.data.details}</p>
              </div>
            </div>

            \${slide.data.warning ? \`
              <div class="warning-box">
                <strong>CRITICAL CAUTION: </strong> \${slide.data.warning}
              </div>
            \` : ''}

            <div class="tip-box">
              <strong>TECHNICIAN PRO-TIP: </strong> \${slide.data.technicianTip}
            </div>
          </div>
        \`;
      } else if (slide.type === 'safety') {
        html = \`
          <div class="slide-header">
            <div>
              <div class="slide-category"><span class="pill">\${slide.badge}</span> \${slide.category}</div>
              <h2 class="slide-heading">\${slide.title}</h2>
              <div class="slide-subheading">\${slide.subtitle}</div>
            </div>
            <div class="slide-counter-badge">\${index + 1} / \${slides.length}</div>
          </div>
          <div class="slide-body">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div class="glass-card" style="border-left: 4px solid #ef4444;">
                <h4 style="color: #f87171;">Mandatory Safety Directives</h4>
                <ul class="list-checks" style="margin-top: 10px;">
                  \${slide.data.reminders.map(r => '<li>' + r + '</li>').join('')}
                </ul>
              </div>

              <div class="glass-card" style="border-left: 4px solid #38bdf8;">
                <h4 style="color: #38bdf8;">Personal Protective Equipment (PPE)</h4>
                <ul class="list-checks" style="margin-top: 10px;">
                  \${slide.data.ppeChecklist.map(p => '<li>' + p + '</li>').join('')}
                </ul>
              </div>
            </div>

            <div class="warning-box" style="margin-top: 20px;">
              <strong>ELECTRICAL HAZARD MITIGATION: </strong> \${slide.data.hazardMitigation}
            </div>
          </div>
        \`;
      } else if (slide.type === 'troubleshooting') {
        html = \`
          <div class="slide-header">
            <div>
              <div class="slide-category"><span class="pill">\${slide.badge}</span> \${slide.category}</div>
              <h2 class="slide-heading">\${slide.title}</h2>
              <div class="slide-subheading">\${slide.subtitle}</div>
            </div>
            <div class="slide-counter-badge">\${index + 1} / \${slides.length}</div>
          </div>
          <div class="slide-body">
            <h4 style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #fbbf24; margin-bottom: 12px;">
              Symptom & Remediation Diagnostic Matrix
            </h4>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              \${slide.data.diagnosticFlow.map(d => \`
                <div class="glass-card" style="display: grid; grid-template-columns: 1.2fr 1fr 1.2fr; gap: 14px; padding: 12px 18px;">
                  <div>
                    <span style="font-size: 10px; font-weight: bold; color: #f87171; text-transform: uppercase;">Observed Symptom</span>
                    <div style="font-size: 12px; font-weight: bold; color: #fff; margin-top: 2px;">\${d.symptom}</div>
                  </div>
                  <div>
                    <span style="font-size: 10px; font-weight: bold; color: #fbbf24; text-transform: uppercase;">Probable Cause</span>
                    <div style="font-size: 12px; color: #cbd5e1; margin-top: 2px;">\${d.cause}</div>
                  </div>
                  <div>
                    <span style="font-size: 10px; font-weight: bold; color: #34d399; text-transform: uppercase;">Corrective Action</span>
                    <div style="font-size: 12px; color: #e2e8f0; margin-top: 2px;">\${d.resolution}</div>
                  </div>
                </div>
              \`).join('')}
            </div>
          </div>
        \`;
      } else if (slide.type === 'summary') {
        html = \`
          <div class="slide-header">
            <div>
              <div class="slide-category"><span class="pill">\${slide.badge}</span> \${slide.category}</div>
              <h2 class="slide-heading">\${slide.title}</h2>
              <div class="slide-subheading">\${slide.subtitle}</div>
            </div>
            <div class="slide-counter-badge">\${index + 1} / \${slides.length}</div>
          </div>
          <div class="slide-body">
            <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px;">
              <div class="glass-card">
                <h4 style="color: #38bdf8; font-size: 14px; margin-bottom: 12px;">Key Lecture Takeaways</h4>
                <ul class="list-checks">
                  \${slide.data.takeaways.map(t => '<li>' + t + '</li>').join('')}
                </ul>
              </div>

              <div class="glass-card" style="border-left: 4px solid #10b981;">
                <h4 style="color: #34d399; font-size: 14px; margin-bottom: 12px;">Practicum Action Items</h4>
                <ul class="list-checks">
                  \${slide.data.nextSteps.map(s => '<li>' + s + '</li>').join('')}
                </ul>
              </div>
            </div>
          </div>
        \`;
      }

      container.innerHTML = html;
    }

    function prevSlide() {
      if (currentSlide > 0) renderSlide(currentSlide - 1);
    }

    function nextSlide() {
      if (currentSlide < slides.length - 1) renderSlide(currentSlide + 1);
    }

    function goToSlide(index) {
      renderSlide(index);
    }

    function toggleNotes() {
      notesOpen = !notesOpen;
      const drawer = document.getElementById('notesDrawer');
      drawer.className = notesOpen ? 'notes-drawer open' : 'notes-drawer';
    }

    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => alert(err.message));
      } else {
        document.exitFullscreen();
      }
    }

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        prevSlide();
      } else if (e.key === 'Home') {
        goToSlide(0);
      } else if (e.key === 'End') {
        goToSlide(slides.length - 1);
      } else if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      } else if (e.key.toLowerCase() === 'p' && (e.ctrlKey || e.metaKey)) {
        // let print handler proceed
      }
    });

    // Initialize slide 0
    renderSlide(0);
  </script>
</body>
</html>`;
}

/**
 * Downloads the self-contained interactive presentation HTML file
 */
export async function downloadPresentationDeck(
  lesson: LessonContent,
  studentId: string,
  sessionId: string,
  studentName?: string
): Promise<void> {
  const html = generatePresentationHtml(lesson, studentName);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `CSSENTIAL_Topic_0${lesson.topicNumber}_${lesson.title.replace(/\s+/g, '_')}_Presentation_Deck.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  // Record in research telemetry
  await api.recordDownload({
    student_id: studentId,
    session_id: sessionId,
    resource_name: `Topic 0${lesson.topicNumber}: ${lesson.title} Interactive Presentation Slide Deck`,
    file_type: 'HTML_SLIDES'
  });
}
