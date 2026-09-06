import { LessonContent } from '../types';

export const LESSONS: LessonContent[] = [
  {
    id: 'lesson-1',
    topicNumber: 1,
    title: 'Preparing for Installation',
    shortDesc: 'Safety guidelines, workplace preparation, ESD protection, and essential tools.',
    objectives: [
      'Identify and select appropriate tools and testing equipment for computer assembly.',
      'Explain Occupational Health and Safety (OHS) standards and ESD precautions.',
      'Prepare a secure, static-free workspace for hardware assembly.'
    ],
    contentSections: [
      {
        heading: '1. Occupational Health and Safety (OHS) Protocols',
        body: 'Prior to handling any electronic device or computer chassis, technicians must observe essential safety precautions. Always disconnect AC mains power cords and discharge residual power by holding down the chassis power button for 5 seconds.',
        keyPoints: [
          'Wear Personal Protective Equipment (PPE) suitable for laboratory assembly.',
          'Never wear loose clothing or metallic jewelry that could cause short circuits.',
          'Always ground yourself before touching sensitive CMOS components.'
        ]
      },
      {
        heading: '2. Electrostatic Discharge (ESD) Prevention',
        body: 'ESD can destroy integrated circuits without visible smoke or audible sparking. Humans can store static charges of over 3,000 volts, whereas a microchip can be ruined by as little as 30 volts.',
        keyPoints: [
          'Use an anti-static wrist strap clipped to an unpainted metal chassis surface.',
          'Place components on an anti-static mat, never on the metallic foil bags or plastic wrap.',
          'Maintain room relative humidity between 35% and 50% where feasible.'
        ]
      },
      {
        heading: '3. Essential Hand Tools & Diagnostics',
        body: 'Having proper hand tools prevents stripping screw threads and damaging fragile solder joints.',
        keyPoints: [
          'Phillips #1 and #2 screwdrivers (magnetic tips should have very low magnetic field).',
          'Anti-static wrist strap and grounding cord.',
          'Digital multimeter for measuring rail voltages (12V, 5V, 3.3V).',
          'Cable ties, wire cutters, and non-conductive thermal paste spatula.'
        ]
      }
    ],
    steps: [
      {
        step: 1,
        title: 'Clear and Clean Work Area',
        details: 'Ensure a clean, flat, well-lit surface free from clutter, liquids, and carpets that generate static electricity.'
      },
      {
        step: 2,
        title: 'Inspect Tools & Equipment',
        details: 'Check all tools for insulated handles, ensure ESD wrist strap continuity, and organize screws in a magnetic tray.'
      },
      {
        step: 3,
        title: 'Unpack and Verify Components',
        details: 'Cross-reference packing lists with parts: Motherboard, CPU, Cooler, RAM, Storage (SSD/NVMe/HDD), PSU, Case, and thermal compound.',
        warning: 'Hold circuit boards by their edges only; never touch exposed gold contact pins.'
      }
    ],
    reminders: [
      'Always unplug the AC wall cord before working inside the computer case.',
      'Keep thermal paste away from motherboard socket pins and skin.'
    ],
    troubleshootingTips: [
      'If static wrist strap is missing, frequently touch the unpainted metal frame of the grounded case before touching components.'
    ],
    videoUrl: 'https://www.youtube-nocookie.com/embed/BL4DCEp7blY'
  },
  {
    id: 'lesson-2',
    topicNumber: 2,
    title: 'Installing Computer Systems',
    shortDesc: 'Step-by-step physical assembly of motherboard, CPU, thermal paste, RAM, PSU, and drives.',
    objectives: [
      'Master the correct order of mounting core components into the ATX/mATX chassis.',
      'Demonstrate proper CPU zero-insertion force (ZIF) or LGA alignment and latching.',
      'Correctly route 24-pin ATX, 8-pin EPS CPU, PCIe, and SATA power cables.'
    ],
    contentSections: [
      {
        heading: '1. Bench Assembling (Pre-Chassis Test)',
        body: 'Experienced technicians often perform a "breadboard" or bench test outside the chassis by placing the motherboard on its non-conductive cardboard box to verify POST before screwing it into the case.',
        keyPoints: [
          'Install CPU, CPU cooler, and one stick of RAM first.',
          'Connect 24-pin ATX and 8-pin CPU power from the PSU.',
          'Connect monitor to GPU or motherboard output and check for display.'
        ]
      },
      {
        heading: '2. Standoffs and Motherboard Mounting',
        body: 'Brass standoffs prevent the solder traces on the back of the motherboard from touching the metallic chassis plate, preventing catastrophic short circuits.',
        keyPoints: [
          'Verify standoff positions match the motherboard screw holes exactly.',
          'Never leave an extra standoff installed where no mounting hole exists.',
          'Tighten screws gently in an X pattern until snug—do not overtighten.'
        ]
      },
      {
        heading: '3. Front Panel Headers & Cabling',
        body: 'The front panel header block connects the chassis Power Switch (PWR_SW), Reset Switch (RESET_SW), Power LED (PWR_LED), and Drive Activity LED (HDD_LED).',
        keyPoints: [
          'LED connectors are polarized (positive pin usually colored or marked with +).',
          'Switches (Power & Reset) are momentary contacts and can be plugged in either orientation.'
        ]
      }
    ],
    steps: [
      {
        step: 1,
        title: 'Install CPU into Socket',
        details: 'Open socket retention lever. Align the gold triangle indicator on the CPU with the mark on the socket. Drop the CPU in without forcing, then latch the retention lever.'
      },
      {
        step: 2,
        title: 'Apply Thermal Compound & Mount Cooler',
        details: 'Apply a pea-sized dot of thermal paste onto the center of the CPU IHS (Integrated Heat Spreader). Fasten cooler bracket evenly.'
      },
      {
        step: 3,
        title: 'Insert RAM Modules in Dual-Channel Slots',
        details: 'Open slot clips. Align notch on the RAM stick with slot key. Press down firmly on both ends until the retention tabs snap shut with an audible click (typically slots A2 and B2).'
      },
      {
        step: 4,
        title: 'Install I/O Shield and Mount Motherboard into Case',
        details: 'Snap the I/O shield firmly into the rear case opening. Guide motherboard ports through the shield and secure into aligned brass standoffs.'
      },
      {
        step: 5,
        title: 'Install Power Supply and Connect Cables',
        details: 'Mount PSU with fan facing ventilation intake. Connect 24-pin ATX motherboard, 8-pin CPU EPS, PCIe GPU power, and SATA storage power.'
      }
    ],
    reminders: [
      'Do not apply excessive thermal paste; an overflow onto motherboard circuitry can cause short circuits.',
      'Check that motherboard standoffs are installed only where mounting holes exist.'
    ],
    troubleshootingTips: [
      'If CPU fan does not spin on initial power-on, verify it is connected to CPU_FAN and not SYS_FAN or AIO_PUMP header.'
    ],
    videoUrl: 'https://www.youtube-nocookie.com/embed/s1HBDtz3m_A'
  },
  {
    id: 'lesson-3',
    topicNumber: 3,
    title: 'Configuring Systems',
    shortDesc: 'BIOS/UEFI setup, boot priority, AHCI/NVMe modes, XMP/DOCP memory profiles, and OS installation.',
    objectives: [
      'Navigate UEFI/BIOS setup utility using keyboard shortcuts (DEL, F2, F10, F12).',
      'Configure boot device priority for bootable USB media.',
      'Enable secure boot, TPM 2.0, and configure SATA/NVMe operating modes.'
    ],
    contentSections: [
      {
        heading: '1. UEFI / BIOS Configuration Essentials',
        body: 'Unified Extensible Firmware Interface (UEFI) replaces legacy BIOS, offering a graphical interface, mouse support, GPT partitioning, and 64-bit boot capabilities.',
        keyPoints: [
          'Access UEFI setup by pressing DEL or F2 during early power-on.',
          'Verify that CPU temperature, fan RPMs, and detected RAM capacity match installed specs.',
          'Enable XMP (Extreme Memory Profile) or EXPO/DOCP to run RAM at rated speed.'
        ]
      },
      {
        heading: '2. Storage Controllers: AHCI vs. RAID & NVMe',
        body: 'Ensure the storage controller is set to AHCI (Advanced Host Controller Interface) or native NVMe mode rather than legacy IDE mode for optimal performance and SSD TRIM support.'
      },
      {
        heading: '3. Operating System Deployment',
        body: 'Create UEFI-compliant boot media (FAT32/NTFS with GPT schema). During Windows/Linux setup, partition storage properly (EFI system partition, MSR, and Primary NTFS/EXT4).'
      }
    ],
    steps: [
      {
        step: 1,
        title: 'First Power-On & Enter BIOS',
        details: 'Turn on power switch, tap DEL or F2 repeatedly until UEFI setup appears.'
      },
      {
        step: 2,
        title: 'Set Date, Time & Hardware Recognition',
        details: 'Check that all connected storage drives, CPU model, and full RAM capacity are recognized.'
      },
      {
        step: 3,
        title: 'Set Boot Sequence Order',
        details: 'Set the Bootable USB Drive as Boot Option #1 and Internal SSD as Boot Option #2.'
      },
      {
        step: 4,
        title: 'Save & Exit (F10)',
        details: 'Press F10 to save configuration and restart system into the installation installer.'
      }
    ],
    reminders: [
      'Never interrupt or cut power during a BIOS firmware flash update.',
      'Use GPT (GUID Partition Table) partitioning for modern UEFI systems.'
    ],
    troubleshootingTips: [
      'If bootable USB is not detected, disable "Fast Boot" in BIOS and check USB format.'
    ],
    videoUrl: 'https://www.youtube-nocookie.com/embed/hQc_Y3K7ZlU'
  },
  {
    id: 'lesson-4',
    topicNumber: 4,
    title: 'Common Problems in Installation and Configuration',
    shortDesc: 'Analysis of hardware incompatibility, improper seating, POST beep codes, and no display issues.',
    objectives: [
      'Recognize common physical errors: unseated RAM, missing CPU 8-pin power, front-panel miswiring.',
      'Interpret motherboard debug LEDs (CPU, DRAM, VGA, BOOT) and audible POST beep codes.',
      'Differentiate between physical hardware faults and configuration/firmware conflicts.'
    ],
    contentSections: [
      {
        heading: '1. "No POST / No Video" (Black Screen)',
        body: 'The most frequent issue encountered by students after assembling a computer is that fans spin up, but no video signal appears on the monitor.',
        keyPoints: [
          'Monitor cable plugged into motherboard video port instead of dedicated GPU card.',
          'Missing 4-pin/8-pin ATX12V / EPS CPU power cable near the upper left of the motherboard.',
          'RAM stick not fully seated (tabs did not click all the way in).'
        ]
      },
      {
        heading: '2. Continuous Beep Codes & Debug LEDs',
        body: 'Motherboards signal early boot progress through beep codes or four diagnostic LEDs (CPU, DRAM, VGA, BOOT).',
        keyPoints: [
          'DRAM LED solid: Faulty or improperly seated RAM module, or bent CPU socket pins.',
          'CPU LED solid: Processor power missing, cooler mounted with uneven pressure, or incompatible BIOS.',
          'VGA LED solid: Graphics card auxiliary 6-pin/8-pin power disconnected or GPU seated incorrectly.'
        ]
      }
    ],
    steps: [
      {
        step: 1,
        title: 'Verify Display Output Connection',
        details: 'Ensure the HDMI/DisplayPort cable connects directly to the dedicated graphics card if one is installed, not the motherboard.'
      },
      {
        step: 2,
        title: 'Inspect Power Delivery Connections',
        details: 'Confirm 24-pin ATX and 8-pin CPU power connectors are clicked in with retaining latches locked.'
      },
      {
        step: 3,
        title: 'Reseat Memory in Dual-Channel Slots',
        details: 'Remove RAM sticks, blow dust with compressed air, and re-insert into slots A2 and B2.'
      }
    ],
    reminders: [
      'Always listen for audible beep codes or check motherboard diagnostic LEDs before dismantling parts.',
      'Do not force expansion cards or RAM into incompatible slots.'
    ],
    troubleshootingTips: [
      'If debug LED is stuck on DRAM, test with only ONE RAM stick in slot A2 to isolate a faulty module.'
    ],
    videoUrl: 'https://www.youtube-nocookie.com/embed/7V3Y9uUqfWw'
  },
  {
    id: 'lesson-5',
    topicNumber: 5,
    title: 'Troubleshooting Procedures',
    shortDesc: 'Systematic 6-step troubleshooting methodology, component isolation, and diagnostic flowcharts.',
    objectives: [
      'Apply the CompTIA 6-step diagnostic methodology to computer systems.',
      'Perform CMOS resets via jumper or battery removal.',
      'Perform minimum configuration boot (Breadboarding) to isolate defective components.'
    ],
    contentSections: [
      {
        heading: '1. The 6-Step Systematic Troubleshooting Model',
        body: 'Technicians must follow a logical, documented diagnostic sequence rather than randomly replacing parts.',
        keyPoints: [
          'Step 1: Identify the problem (gather info from user/symptoms).',
          'Step 2: Establish a theory of probable cause (question the obvious).',
          'Step 3: Test the theory to determine the cause.',
          'Step 4: Establish a plan of action to resolve the problem and implement the solution.',
          'Step 5: Verify full system functionality and implement preventive measures.',
          'Step 6: Document findings, actions, and outcomes.'
        ]
      },
      {
        heading: '2. Clearing CMOS Settings (Hardware Reset)',
        body: 'When incorrect BIOS configuration (e.g. invalid memory timings or CPU overclock) prevents booting, clearing the CMOS restores factory safe defaults.',
        keyPoints: [
          'Unplug AC power, locate CLR_CMOS jumper, short pins with screwdriver for 5-10 seconds.',
          'Alternatively, remove CR2032 coin cell battery for 2-3 minutes.'
        ]
      }
    ],
    steps: [
      {
        step: 1,
        title: 'Step 1: Interview and Observe',
        details: 'Ask what was changed recently. Observe power LEDs, fan rotation, error messages, or smell of burnt electronics.'
      },
      {
        step: 2,
        title: 'Step 2: Check Power and External Factors',
        details: 'Verify power strip switch, wall socket voltage, and PSU I/O toggle switch.'
      },
      {
        step: 3,
        title: 'Step 3: Minimum System Boot (Isolation)',
        details: 'Disconnect all peripherals, external USB drives, secondary storage drives, and extra RAM. Leave only CPU, 1 RAM stick, and Motherboard connected to PSU.'
      }
    ],
    reminders: [
      'Never open a computer power supply (PSU); capacitors store lethal high-voltage charges for hours.',
      'Change only ONE variable at a time during troubleshooting to identify the root cause.'
    ],
    troubleshootingTips: [
      'Keep a spare known-good power supply and single test RAM stick in the lab for fast verification.'
    ],
    videoUrl: 'https://www.youtube-nocookie.com/embed/hJ8yM0Yg9qE'
  },
  {
    id: 'lesson-6',
    topicNumber: 6,
    title: 'Testing and Verification',
    shortDesc: 'Stress testing, hardware health monitoring, burn-in diagnostics, thermal checks, and sign-off.',
    objectives: [
      'Execute hardware diagnostic benchmarks (MemTest86, Prime95, FurMark).',
      'Monitor CPU and GPU core temperatures under full synthetic load using HWMonitor.',
      'Verify device manager driver installation and complete a technician verification checklist.'
    ],
    contentSections: [
      {
        heading: '1. Memory Integrity Testing (MemTest86)',
        body: 'Unstable RAM can cause silent data corruption and sporadic Blue Screens of Death (BSOD). Running a bootable MemTest86 pass ensures memory cells and address lines are free of bit flips.',
        keyPoints: [
          'Zero errors allowed on test passes.',
          'If errors appear, retest each stick individually in the primary slot.'
        ]
      },
      {
        heading: '2. Thermal Performance & Stress Testing',
        body: 'Run stress tools like Prime95 (CPU) and FurMark (GPU) for 15-30 minutes while monitoring sensor telemetry.',
        keyPoints: [
          'CPU maximum temperature should remain under 85°C for standard cooling.',
          'Check for thermal throttling where CPU clocks drop dramatically to prevent overheating.',
          'Inspect fan curves in BIOS to ensure quiet yet responsive cooling.'
        ]
      },
      {
        heading: '3. Device Manager & Driver Verification',
        body: 'Every onboard controller must have signed vendor drivers installed (Chipset, Audio, LAN, Wi-Fi, GPU).',
        keyPoints: [
          'No yellow exclamation marks or "Unknown Device" in Windows Device Manager.',
          'Verify storage SMART status using CrystalDiskInfo.'
        ]
      }
    ],
    steps: [
      {
        step: 1,
        title: 'Inspect Device Manager',
        details: 'Open devmgmt.msc and confirm all device drivers are installed without error flags.'
      },
      {
        step: 2,
        title: 'Launch Hardware Monitor (HWMonitor)',
        details: 'Check 12V, 5V, 3.3V rail tolerances (must be within ±5%) and verify idle temperatures (30°C - 45°C).'
      },
      {
        step: 3,
        title: 'Run 15-Minute Load Test',
        details: 'Execute combined CPU/GPU load to verify power supply stability and adequate chassis airflow.'
      }
    ],
    reminders: [
      'Always run thermal stress tests with the computer case side panels fully closed to simulate realistic airflow.',
      'Document all benchmark scores and temperature maximums in the laboratory sign-off sheet.'
    ],
    troubleshootingTips: [
      'If CPU immediately hits 95°C+ within 10 seconds of starting a stress test, the cooler protective plastic peel was likely left on!'
    ],
    videoUrl: 'https://www.youtube-nocookie.com/embed/0X6vY1-8g68'
  }
];

export { ACTIVITIES_DATA, type ActivityDefinition, type ActivityItem } from './activities';

export const LESSONS_DATA: LessonContent[] = LESSONS.map(lesson => ({
  ...lesson,
  description: lesson.shortDesc,
  duration: '12:45'
}));
