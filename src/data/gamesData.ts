export interface SortItem {
  id: string;
  name: string;
  category: 'Input Devices' | 'Output Devices' | 'Storage Devices' | 'Tools & Safety';
  iconType: string;
}

export const SORT_ITEMS: SortItem[] = [
  { id: 's1', name: 'Mechanical Keyboard', category: 'Input Devices', iconType: 'keyboard' },
  { id: 's2', name: 'Optical Mouse', category: 'Input Devices', iconType: 'mouse' },
  { id: 's3', name: 'Flatbed Scanner', category: 'Input Devices', iconType: 'scan' },
  { id: 's4', name: 'Webcam 1080p', category: 'Input Devices', iconType: 'camera' },
  { id: 's5', name: 'Bar Code Reader', category: 'Input Devices', iconType: 'barcode' },
  
  { id: 's6', name: 'LED Monitor', category: 'Output Devices', iconType: 'monitor' },
  { id: 's7', name: 'LaserJet Printer', category: 'Output Devices', iconType: 'printer' },
  { id: 's8', name: 'Studio Speakers', category: 'Output Devices', iconType: 'speaker' },
  { id: 's9', name: 'Multimedia Projector', category: 'Output Devices', iconType: 'projector' },
  { id: 's10', name: 'Headphones', category: 'Output Devices', iconType: 'headphones' },

  { id: 's11', name: 'NVMe M.2 SSD', category: 'Storage Devices', iconType: 'hard-drive' },
  { id: 's12', name: '3.5" SATA HDD', category: 'Storage Devices', iconType: 'disc' },
  { id: 's13', name: 'USB Flash Drive 64GB', category: 'Storage Devices', iconType: 'usb' },
  { id: 's14', name: 'External Backup Drive', category: 'Storage Devices', iconType: 'database' },
  { id: 's15', name: 'MicroSD Memory Card', category: 'Storage Devices', iconType: 'sd-card' },

  { id: 's16', name: 'Phillips #2 Screwdriver', category: 'Tools & Safety', iconType: 'wrench' },
  { id: 's17', name: 'Anti-Static Wrist Strap', category: 'Tools & Safety', iconType: 'shield' },
  { id: 's18', name: 'RJ45 Cable Tester', category: 'Tools & Safety', iconType: 'activity' },
  { id: 's19', name: 'Digital Multimeter', category: 'Tools & Safety', iconType: 'gauge' },
  { id: 's20', name: 'Thermal Paste Syringe', category: 'Tools & Safety', iconType: 'droplet' },
];

export const CODE_CRACKER_QUESTIONS = [
  {
    question: '1. Which storage device uses non-volatile flash memory and has no moving mechanical parts?',
    options: ['RAM', 'SSD', 'CPU', 'Power Supply'],
    correctIndex: 1, // SSD -> Code digit: 4
    digitRevealed: '4',
    hint: 'Solid State Drive provides high-speed permanent storage.'
  },
  {
    question: '2. What is the standard DC voltage supplied by the yellow wires on an ATX power connector for high-draw components?',
    options: ['+3.3V', '+5V', '+12V', '-12V'],
    correctIndex: 2, // +12V -> Code digit: 8
    digitRevealed: '8',
    hint: 'Yellow ATX wires power the CPU VRM and GPU PCIe rails.'
  },
  {
    question: '3. Which memory module type loses its stored information immediately when power is turned off?',
    options: ['ROM', 'RAM', 'NVMe SSD', 'BIOS EEPROM'],
    correctIndex: 1, // RAM -> Code digit: 2
    digitRevealed: '2',
    hint: 'Random Access Memory is volatile working memory.'
  },
  {
    question: '4. In CompTIA troubleshooting, how many standard steps are defined in the systematic diagnostic model?',
    options: ['Three', 'Four', 'Six', 'Ten'],
    correctIndex: 2, // Six -> Code digit: 6
    digitRevealed: '6',
    hint: 'Identify, Theory, Test, Plan/Action, Verify, Document (6 steps).'
  }
];

export interface SearchTarget {
  id: string;
  name: string;
  description: string;
  category: string;
  visualClue: string;
  keyFeatures: string[];
  bbox: { x: number; y: number; width: number; height: number }; // percentage coords
}

export const WORKSPACE_OBJECTS: SearchTarget[] = [
  {
    id: 'ram',
    name: 'RAM Memory Sticks',
    description: 'Dual DDR4 memory modules with blue heatspreaders & gold contact pins',
    category: 'System Memory',
    visualClue: 'Look for two parallel blue rectangular sticks with cooling ridges & a notch along the golden edge pins.',
    keyFeatures: ['Two parallel dual-channel sticks', 'Blue aluminum heatsink fins', 'Gold contact edge with notch'],
    bbox: { x: 10, y: 16, width: 16, height: 26 }
  },
  {
    id: 'cpu',
    name: 'CPU Processor',
    description: 'Square central processor with metallic nickel heat spreader & silicon PCB',
    category: 'Processing Unit',
    visualClue: 'Look for a square chip with a shiny silver metallic top (IHS) and gold corner triangle marker.',
    keyFeatures: ['Nickel-plated heatspreader', 'Laser-etched speed markings', 'Gold pin-1 orientation triangle'],
    bbox: { x: 38, y: 22, width: 14, height: 16 }
  },
  {
    id: 'motherboard',
    name: 'Motherboard PCB',
    description: 'Main printed circuit board with copper trace buses, capacitors, and sockets',
    category: 'System Board',
    visualClue: 'Look for the large dark-green ATX board with intricate gold/copper circuit traces and round capacitor cans.',
    keyFeatures: ['Deep green printed circuit board', 'Interconnecting copper traces', 'Silver VRM heatsink fins & silver CMOS battery'],
    bbox: { x: 28, y: 14, width: 44, height: 52 }
  },
  {
    id: 'sata',
    name: 'SATA Data Cable',
    description: 'Flat red 7-pin storage data transmission cable with metal locking clips',
    category: 'Storage Data Cable',
    visualClue: 'Look for a flexible, bright red ribbon cable ending in black L-shaped connectors with silver metal spring clips.',
    keyFeatures: ['Bright red flat ribbon body', 'Black 7-pin L-keyed connector', 'Silver metal locking latch clip'],
    bbox: { x: 73, y: 26, width: 16, height: 20 }
  },
  {
    id: 'power_cable',
    name: '24-Pin ATX Power Harness',
    description: 'Main multi-wire power supply bundle with dual-row keyed connector block',
    category: 'Power Delivery',
    visualClue: 'Look for a thick bundle of yellow (+12V), red (+5V), and orange (+3.3V) wires entering a white dual-row 24-pin socket.',
    keyFeatures: ['24 multi-color colored insulated wires', 'Dual-row 2x12 pin keyed block', 'Plastic retention latch clip'],
    bbox: { x: 68, y: 53, width: 18, height: 22 }
  },
  {
    id: 'screwdriver',
    name: 'Magnetic Technician Screwdriver',
    description: 'Phillips cross-head insulated assembly tool with magnetized steel tip',
    category: 'Technician Tool',
    visualClue: 'Look for a hand tool with a red ribbed rubber handle, chrome shaft, and darkened magnetic cross-shaped tip.',
    keyFeatures: ['Ergonomic ribbed red rubber grip', 'Chrome vanadium steel shaft', 'Darkened magnetic #2 Phillips tip'],
    bbox: { x: 6, y: 66, width: 20, height: 18 }
  },
  {
    id: 'ssd',
    name: '2.5" Solid State Drive (SSD)',
    description: 'High-speed flash storage drive in a brushed aluminum casing with SATA ports',
    category: 'Solid State Storage',
    visualClue: 'Look for a thin, dark rectangular drive with a bright label ("SSD FLASH") and L-shaped SATA data/power pins.',
    keyFeatures: ['Brushed matte metal enclosure', 'Compact 2.5-inch form factor', 'SATA data & power notch connectors'],
    bbox: { x: 30, y: 70, width: 17, height: 20 }
  },
  {
    id: 'hdd',
    name: '3.5" Mechanical Hard Disk (HDD)',
    description: 'Cast metal hard drive with visible circular platter spindle hub & breather hole',
    category: 'Magnetic Storage',
    visualClue: 'Look for a heavy metal drive with a prominent circular platter spindle in the center and green logic PCB.',
    keyFeatures: ['Heavy cast metal alloy frame', 'Circular magnetic platter spindle', 'Green exposed controller PCB'],
    bbox: { x: 49, y: 70, width: 19, height: 22 }
  },
  {
    id: 'cooling_fan',
    name: 'CPU Cooling Fan & Heatsink',
    description: 'Radial axial cooling fan mounted atop an aluminum finned heatsink',
    category: 'Thermal Management',
    visualClue: 'Look for a circular blue cooling fan with curved aerodynamic blades and a multi-pin power wire lead.',
    keyFeatures: ['Radial 9-blade axial fan hub', 'Aluminum cooling fin block', '4-pin PWM braided fan header cable'],
    bbox: { x: 38, y: 38, width: 16, height: 18 }
  },
  {
    id: 'network_cable',
    name: 'RJ-45 Ethernet Network Cable',
    description: 'Blue twisted-pair patch cord with clear 8P8C modular connector plug',
    category: 'Network Connectivity',
    visualClue: 'Look for a flexible royal-blue cord ending in a clear crystal plastic plug showing 8 tiny gold pins.',
    keyFeatures: ['Royal blue insulated jacket', 'Clear 8P8C plastic modular plug', '8 visible internal gold-plated pins'],
    bbox: { x: 76, y: 75, width: 18, height: 18 }
  }
];

export const INSTALLATION_LEVELS = [
  {
    level: 1,
    title: 'Core Hardware Assembly Order',
    steps: [
      { id: 's1', text: '1. Prepare clean, ESD-safe workstation and wear anti-static wrist strap' },
      { id: 's2', text: '2. Install CPU into motherboard socket and close retention latch' },
      { id: 's3', text: '3. Apply thermal paste and mount CPU cooler firmly' },
      { id: 's4', text: '4. Insert RAM modules into dual-channel DIMM slots until clips snap' },
      { id: 's5', text: '5. Install I/O shield and secure motherboard onto case standoffs' },
      { id: 's6', text: '6. Install Power Supply Unit (PSU) and route main power cables' },
      { id: 's7', text: '7. Mount storage drives and connect SATA data/power lines' },
      { id: 's8', text: '8. Close case side panels, connect monitor/power, and run initial POST' }
    ]
  },
  {
    level: 2,
    title: 'Post-Assembly & Software Setup Order',
    steps: [
      { id: 'p1', text: '1. Power on computer and press DEL/F2 to access UEFI/BIOS Setup' },
      { id: 'p2', text: '2. Verify recognized CPU model, RAM capacity, and drive detections' },
      { id: 'p3', text: '3. Set USB installation media as primary boot device' },
      { id: 'p4', text: '4. Save settings and boot into Operating System Setup Wizard' },
      { id: 'p5', text: '5. Partition target SSD and complete OS installation' },
      { id: 'p6', text: '6. Install official Motherboard Chipset, Audio, and LAN drivers' },
      { id: 'p7', text: '7. Install Dedicated Graphics Card Display Drivers' },
      { id: 'p8', text: '8. Execute stress testing (MemTest86 / Prime95) to verify stability' }
    ]
  }
];

export const FLASHCARDS_DATA = [
  {
    id: 'f1',
    question: 'What does RAM do in a computer system?',
    answer: 'RAM (Random Access Memory) provides high-speed, volatile temporary workspace for the CPU to hold active program instructions and currently open data files.',
    category: 'Hardware'
  },
  {
    id: 'f2',
    question: 'Why is thermal paste required between the CPU and cooler?',
    answer: 'Thermal paste fills microscopic air pockets between the metal heat spreader of the CPU and the cooler baseplate, ensuring efficient thermal conductivity and preventing overheat throttling.',
    category: 'Assembly'
  },
  {
    id: 'f3',
    question: 'What is the function of the CMOS battery on the motherboard?',
    answer: 'The 3V CR2032 lithium coin cell provides continuous low-power to the Real-Time Clock (RTC) and CMOS memory, retaining system time, date, and hardware BIOS settings when the PC is unplugged.',
    category: 'Hardware'
  },
  {
    id: 'f4',
    question: 'What does a solid DRAM debug LED on the motherboard indicate?',
    answer: 'It indicates a memory initialization failure. This is commonly caused by an unseated RAM module, dirt on the gold contacts, wrong slot pairing, or bent CPU socket pins.',
    category: 'Troubleshooting'
  },
  {
    id: 'f5',
    question: 'What does the CompTIA troubleshooting rule "Question the Obvious" mean?',
    answer: 'Check the most fundamental, simple things first: verify the power cord is plugged in, the PSU switch is on, wall outlets are active, and monitor cables are connected before tearing hardware apart.',
    category: 'Troubleshooting'
  },
  {
    id: 'f6',
    question: 'Why must brass standoffs be installed between motherboard and chassis?',
    answer: 'Standoffs raise the motherboard off the metallic chassis tray, preventing electrical solder joints and traces on the bottom of the PCB from grounding out and causing catastrophic short circuits.',
    category: 'Safety & Installation'
  },
  {
    id: 'f7',
    question: 'What is the difference between SATA III and NVMe M.2 SSDs?',
    answer: 'SATA III uses the legacy storage controller protocol limited to ~550–600 MB/s, whereas NVMe connects directly to PCIe lanes, achieving speeds from 3,500 to over 7,000 MB/s.',
    category: 'Components'
  },
  {
    id: 'f8',
    question: 'What is UEFI and how does it improve over legacy BIOS?',
    answer: 'UEFI (Unified Extensible Firmware Interface) offers a modern GUI, mouse navigation, support for drives larger than 2.2 TB using GPT partition tables, Secure Boot verification, and faster boot speeds.',
    category: 'Configuration'
  }
];

export const MEMORY_CARDS = [
  { id: 'm1', pairId: 'cpu', content: 'CPU (Processor)', isConcept: true },
  { id: 'm2', pairId: 'cpu', content: 'Executes instructions & calculations', isConcept: false },
  
  { id: 'm3', pairId: 'ram', content: 'RAM Module', isConcept: true },
  { id: 'm4', pairId: 'ram', content: 'Volatile fast working memory', isConcept: false },

  { id: 'm5', pairId: 'ssd', content: 'Solid State Drive (SSD)', isConcept: true },
  { id: 'm6', pairId: 'ssd', content: 'Non-volatile flash file storage', isConcept: false },

  { id: 'm7', pairId: 'keyboard', content: 'Keyboard & Mouse', isConcept: true },
  { id: 'm8', pairId: 'keyboard', content: 'Primary User Input Devices', isConcept: false },

  { id: 'm9', pairId: 'monitor', content: 'Monitor & Display', isConcept: true },
  { id: 'm10', pairId: 'monitor', content: 'Visual Graphical Output Device', isConcept: false },

  { id: 'm11', pairId: 'sata', content: 'SATA Cable', isConcept: true },
  { id: 'm12', pairId: 'sata', content: 'Storage Drive Data Interconnect', isConcept: false }
];

export interface DragDropPart {
  id: string;
  label: string;
  category: string;
  visualCue: string;
  socketDescription: string;
  keyIndicators: string[];
  targetX: number;
  targetY: number;
  radius: number;
  accentColor: string;
}

export const DRAG_DROP_PARTS: DragDropPart[] = [
  {
    id: 'cpu',
    label: 'CPU Socket',
    category: 'Processor Interface',
    visualCue: 'Square socket with dense gold pin contact grid and chrome retention load lever.',
    socketDescription: 'Located in the upper-center area of the motherboard, directly between the VRM heatsinks and RAM slots.',
    keyIndicators: ['Square grid of pins/pads', 'Metal locking load arm', 'Alignment triangle notch'],
    targetX: 48,
    targetY: 30,
    radius: 9,
    accentColor: '#f59e0b'
  },
  {
    id: 'ram',
    label: 'RAM DIMM Slots',
    category: 'Memory Interface',
    visualCue: 'Long vertical dual-channel slots equipped with snap-lock clips on the ends and an off-center key notch.',
    socketDescription: 'Positioned vertically to the right of the CPU socket for high-speed direct trace routing to memory channels.',
    keyIndicators: ['Dual or quad parallel slots', 'White/black dual-channel coloring', 'Snap-in retention latches'],
    targetX: 67,
    targetY: 30,
    radius: 9,
    accentColor: '#3b82f6'
  },
  {
    id: 'cooler',
    label: 'CPU Cooling Fan',
    category: 'Thermal Solution',
    visualCue: 'Circular 9-blade axial fan mounted directly over an aluminum cooling fin heatsink with 4 copper heatpipes.',
    socketDescription: 'Mounts squarely on top of the CPU socket brackets to draw heat away from the processor heat spreader.',
    keyIndicators: ['Radial fan blade blades', 'Aluminum cooling fin stack', '4-pin PWM motherboard header wire'],
    targetX: 48,
    targetY: 46,
    radius: 9,
    accentColor: '#06b6d4'
  },
  {
    id: 'pcie',
    label: 'PCIe Expansion Slot',
    category: 'Expansion Bus',
    visualCue: 'Long horizontal PCIe x16 slot with reinforced metal shielding and a plastic locking hook at the right rear.',
    socketDescription: 'Runs horizontally across the lower motherboard, aligning directly with rear chassis I/O expansion bracket cutouts.',
    keyIndicators: ['Long PCIe x16 connector channel', 'Rear retention latch lever', 'Aligns with case expansion slots'],
    targetX: 48,
    targetY: 64,
    radius: 9,
    accentColor: '#8b5cf6'
  },
  {
    id: 'motherboard',
    label: 'Motherboard PCB',
    category: 'Main System Board',
    visualCue: 'Large emerald-green printed circuit board secured to chassis standoffs, carrying copper trace buses and chipset.',
    socketDescription: 'Fastened into the chassis backplate tray via brass standoffs to prevent electrical contact with the case frame.',
    keyIndicators: ['Full ATX PCB form factor', 'Copper ground plane traces', 'Rear I/O port shield block'],
    targetX: 32,
    targetY: 17,
    radius: 10,
    accentColor: '#10b981'
  },
  {
    id: 'sata_port',
    label: 'SATA Storage Ports',
    category: 'Storage Data Bus',
    visualCue: 'Dual stacked 7-pin L-shaped keyed SATA data headers with metallic locking latch catches.',
    socketDescription: 'Clustered along the lower-right perimeter edge of the motherboard for tidy right-angle SATA cable routing.',
    keyIndicators: ['L-shaped 7-pin interior notch', 'Right-angle header shroud', 'SATA 6Gb/s bus label'],
    targetX: 71,
    targetY: 54,
    radius: 8,
    accentColor: '#ef4444'
  },
  {
    id: 'psu',
    label: 'Power Supply Unit (PSU)',
    category: 'Main Power Source',
    visualCue: 'Heavy metallic chassis box with hexagonal honeycomb ventilation mesh, AC power receptacle, and power switch.',
    socketDescription: 'Housed in the isolated bottom chassis basement shroud to isolate thermal exhaust and hide thick cable bundles.',
    keyIndicators: ['Honeycomb fan exhaust grill', 'AC power inlet & toggle switch', 'Bottom basement mounting bay'],
    targetX: 18,
    targetY: 84,
    radius: 11,
    accentColor: '#eab308'
  },
  {
    id: 'storage',
    label: 'Storage Drive Bay',
    category: 'Drive Enclosure',
    visualCue: 'Chassis drive cage fitted with slide-out drive caddies for 2.5" solid-state drives and 3.5" mechanical hard drives.',
    socketDescription: 'Located in the front lower compartment of the desktop chassis behind the front intake fans for cool airflow.',
    keyIndicators: ['Slide-out drive sled caddies', 'Dual 2.5" / 3.5" drive bays', 'Tool-less retention clip rails'],
    targetX: 84,
    targetY: 80,
    radius: 10,
    accentColor: '#64748b'
  }
];

export const COMPREHENSIVE_QUIZ_QUESTIONS = [
  {
    question: '1. Which internal computer component is often called the "brain" of the computer system?',
    options: ['Central Processing Unit (CPU)', 'Random Access Memory (RAM)', 'Hard Disk Drive (HDD)', 'Power Supply Unit (PSU)'],
    correct: 0,
    explanation: 'The CPU performs arithmetic, logical calculations, and control functions across the entire machine.'
  },
  {
    question: '2. What is the recommended personal safety device to prevent Electrostatic Discharge (ESD)?',
    options: ['Anti-static wrist strap connected to grounded metal', 'Rubber dishwashing gloves', 'Wool socks on carpet', 'Nylon laboratory coat'],
    correct: 0,
    explanation: 'Anti-static wrist straps drain excess static electrical voltage harmlessly before damage can occur.'
  },
  {
    question: '3. What tool is specifically designed to measure DC rail voltages (+12V, +5V, +3.3V) on power supply cables?',
    options: ['Digital Multimeter', 'Crimping Plier', 'Soldering Iron', 'Torx Screwdriver'],
    correct: 0,
    explanation: 'A digital multimeter set to DC Voltage (V=) measures voltage levels and verifies power tolerances.'
  },
  {
    question: '4. Why should you avoid touching the gold contact pins on RAM and expansion cards?',
    options: ['Natural skin oils and static electricity can corrode and damage conductive gold pads', 'They are coated with wet chemical adhesive', 'They will instantly magnetize the board', 'They emit harmful ultraviolet radiation'],
    correct: 0,
    explanation: 'Skin oils leave insulating residues and ESD charges from fingertips can permanently destroy chip transistors.'
  },
  {
    question: '5. Which key is most commonly pressed immediately upon system startup to enter UEFI/BIOS?',
    options: ['DEL or F2', 'CTRL + ALT + DEL', 'Spacebar', 'Caps Lock'],
    correct: 0,
    explanation: 'Most motherboards (ASUS, MSI, Gigabyte, ASRock) utilize the DEL key or F2 key to trigger UEFI setup.'
  },
  {
    question: '6. What does the term "POST" signify in computer hardware fundamentals?',
    options: ['Power-On Self-Test', 'Primary Output System Test', 'Peripheral Operating State Tool', 'Pre-Operating System Transfer'],
    correct: 0,
    explanation: 'POST is the initial diagnostic routine that checks CPU, memory, video, and storage before booting.'
  },
  {
    question: '7. What is the primary purpose of brass standoffs inside a computer chassis?',
    options: ['To isolate the underside of the motherboard PCB from metallic chassis contact, preventing shorts', 'To provide magnetic grounding for hard drives', 'To cool the rear of the processor', 'To mount the power supply in place'],
    correct: 0,
    explanation: 'Standoffs prevent exposed solder points on the motherboard backplate from shorting out against the metal frame.'
  },
  {
    question: '8. If the computer turns on with fans spinning, but the monitor shows "No Signal", what should you check first?',
    options: ['Verify display cable is connected directly to dedicated GPU, not the motherboard output', 'Replace the processor heatsink', 'Reinstall the operating system from flash drive', 'Replace the power switch cable'],
    correct: 0,
    explanation: 'Dedicated graphics cards disable integrated motherboard video ports; the cable must be plugged into the GPU.'
  },
  {
    question: '9. What does a continuous repeating series of long beep codes during startup usually mean?',
    options: ['Unseated or defective RAM memory module', 'Monitor is turned off', 'Keyboard USB port is unplugged', 'CD-ROM drive tray is open'],
    correct: 0,
    explanation: 'Continuous long beeps indicate an issue with system RAM memory detection or seating.'
  },
  {
    question: '10. How should thermal compound (paste) be applied on a consumer desktop processor?',
    options: ['A small pea-sized dot in the center of the CPU heat spreader', 'Spread across the entire motherboard surface', 'Poured into the CPU socket pin holes', 'Applied thickly on the fan blades'],
    correct: 0,
    explanation: 'A small pea-sized dot compresses evenly when the cooler mounting pressure is tightened.'
  },
  {
    question: '11. Which storage drive technology utilizes flash chips and zero mechanical moving parts?',
    options: ['Solid State Drive (SSD)', 'Hard Disk Drive (HDD)', 'Floppy Diskette', 'Optical CD-ROM'],
    correct: 0,
    explanation: 'SSDs use solid-state NAND flash silicon, making them resilient to shock and much faster than spinning magnetic disks.'
  },
  {
    question: '12. What does an active "DRAM" debug LED on the motherboard signify?',
    options: ['The system failed memory self-test; memory is missing or unseated', 'The graphics card has overheat protection', 'The hard drive partition is full', 'The internet cable is unplugged'],
    correct: 0,
    explanation: 'Motherboard EZ Debug LEDs flag the specific subsystem failing POST: CPU, DRAM, VGA, or BOOT.'
  },
  {
    question: '13. What is the standard voltage of a motherboard CMOS battery (CR2032)?',
    options: ['3.0 Volts DC', '12.0 Volts DC', '1.5 Volts DC', '5.0 Volts DC'],
    correct: 0,
    explanation: 'The CR2032 is a 3-volt lithium manganese dioxide coin cell.'
  },
  {
    question: '14. What happens if the protective clear plastic film on the base of a CPU cooler is not removed?',
    options: ['The CPU will rapidly overheat and initiate thermal shutdown within 30–60 seconds', 'The cooler fan will spin backwards', 'The motherboard BIOS will erase itself', 'The RAM speed will double'],
    correct: 0,
    explanation: 'Plastic is a strong thermal insulator; it prevents heat transfer from the CPU to the copper heatsink.'
  },
  {
    question: '15. In modern 4-slot motherboards, which slots are normally prioritized for a dual-stick RAM kit?',
    options: ['Slots A2 and B2 (Slots 2 and 4 from the CPU)', 'Slots A1 and A2', 'Slots B1 and B2', 'Slots 1 and 2'],
    correct: 0,
    explanation: 'Populating slots A2 and B2 terminates the signal trace correctly on daisy-chain motherboard topologies.'
  },
  {
    question: '16. Which interface is currently the fastest storage protocol for internal consumer M.2 drives?',
    options: ['PCIe NVMe', 'SATA III', 'PATA IDE', 'USB 2.0'],
    correct: 0,
    explanation: 'NVMe utilizes direct PCI Express lanes to achieve speeds exceeding 7,000 MB/s.'
  },
  {
    question: '17. What does the acronym ESD stand for in hardware assembly?',
    options: ['Electrostatic Discharge', 'Electronic System Diagnostic', 'External Solid Drive', 'Emergency Shutdown Device'],
    correct: 0,
    explanation: 'Electrostatic Discharge is the sudden flow of electricity between two objects caused by contact.'
  },
  {
    question: '18. What is the first step in the 6-step CompTIA systematic troubleshooting model?',
    options: ['Identify the problem', 'Establish a theory of probable cause', 'Test the theory', 'Document findings and outcomes'],
    correct: 0,
    explanation: 'Step 1 is always to identify the problem by questioning the user, identifying symptoms, and observing error codes.'
  },
  {
    question: '19. Which front panel header connection is sensitive to positive and negative polarity?',
    options: ['LED indicators (PWR_LED, HDD_LED)', 'Power Switch (PWR_SW)', 'Reset Switch (RESET_SW)', 'Case Chassis Speaker'],
    correct: 0,
    explanation: 'Light Emitting Diodes (LEDs) are diodes that only conduct in one direction; switches are momentary and have no polarity.'
  },
  {
    question: '20. What utility software runs outside the operating system to perform exhaustive RAM error testing?',
    options: ['MemTest86', 'Adobe Acrobat', 'Google Chrome Diagnostics', 'Disk Cleanup Utility'],
    correct: 0,
    explanation: 'MemTest86 boots from USB to test every memory address bit for faults without OS interference.'
  }
];

export const SCRAMBLE_WORDS = [
  { scrambled: 'PUC', word: 'CPU', hint: 'Central Processing Unit', isFillBlank: false },
  { scrambled: 'MAR', word: 'RAM', hint: 'Volatile system memory', isFillBlank: false },
  { scrambled: 'DSS', word: 'SSD', hint: 'Fast solid state storage', isFillBlank: false },
  { scrambled: 'REVIDR', word: 'DRIVER', hint: 'Software that allows OS to talk to hardware', isFillBlank: false },
  { scrambled: 'NITOORM', word: 'MONITOR', hint: 'Visual display output device', isFillBlank: false },
  { scrambled: 'DROAMTHBEO', word: 'MOTHERBOARD', hint: 'Main circuit board connecting all parts', isFillBlank: false },
  { scrambled: 'ATAS', word: 'SATA', hint: 'Serial Advanced Technology Attachment', isFillBlank: false },
  { scrambled: 'SEPO', word: 'POST', hint: 'Power-On Self-Test', isFillBlank: false },
  { scrambled: 'SOCM', word: 'CMOS', hint: 'Complementary Metal-Oxide Semiconductor', isFillBlank: false },
  {
    scrambled: '',
    word: 'CPU',
    hint: 'Processing core',
    isFillBlank: true,
    sentence: 'The ______ is responsible for processing computer instructions and calculations.'
  },
  {
    scrambled: '',
    word: 'RAM',
    hint: 'Volatile memory',
    isFillBlank: true,
    sentence: 'Temporary working memory that clears when power is disconnected is known as ______.'
  },
  {
    scrambled: '',
    word: 'THERMAL',
    hint: 'Heat conducting compound',
    isFillBlank: true,
    sentence: '______ paste fills microscopic air gaps between the processor and heatsink.'
  }
];

export interface CableChallenge {
  id: string;
  scenario: string;
  socketName: string;
  socketDescription: string;
  correctCableId: string;
  polaritySensitive: boolean;
  technicalNote: string;
  clue: string;
}

export interface CableOption {
  id: string;
  name: string;
  pinCount: string;
  voltageOrSpeed: string;
  formFactor: string;
  category: 'Power' | 'Data' | 'Front Panel' | 'Display';
  visualColor: string;
}

export const CABLE_OPTIONS: CableOption[] = [
  {
    id: 'atx-24',
    name: '24-Pin ATX Main Power',
    pinCount: '24 Pins (20+4)',
    voltageOrSpeed: '+3.3V, +5V, +12V, -12V, +5VSB',
    formFactor: 'Dual-row keyed latching block',
    category: 'Power',
    visualColor: 'bg-amber-600'
  },
  {
    id: 'eps-8',
    name: '8-Pin (4+4) EPS / CPU 12V Power',
    pinCount: '8 Pins (Splits into 4+4)',
    voltageOrSpeed: '+12V DC (Yellow/Black wires)',
    formFactor: 'Square/curved keyed connector near CPU VRM',
    category: 'Power',
    visualColor: 'bg-blue-600'
  },
  {
    id: 'pcie-8',
    name: '8-Pin (6+2) PCIe GPU Power',
    pinCount: '8 Pins (Splits into 6+2)',
    voltageOrSpeed: '+12V DC (Up to 150W per cable)',
    formFactor: 'Graphics card auxiliary power socket',
    category: 'Power',
    visualColor: 'bg-indigo-600'
  },
  {
    id: 'sata-power',
    name: '15-Pin SATA Power Connector',
    pinCount: '15 Pins Flat',
    voltageOrSpeed: '+3.3V, +5V, +12V rails',
    formFactor: 'L-shaped flat connector from PSU',
    category: 'Power',
    visualColor: 'bg-slate-700'
  },
  {
    id: 'sata-data',
    name: '7-Pin SATA III Data Cable',
    pinCount: '7 Pins Flat with L-key',
    voltageOrSpeed: '6 Gbps high-speed differential',
    formFactor: 'Slim flexible cable with metal retention latch',
    category: 'Data',
    visualColor: 'bg-red-600'
  },
  {
    id: 'front-pwr-sw',
    name: 'Front Panel Power Switch (PWR_SW)',
    pinCount: '2 Pins Female',
    voltageOrSpeed: 'Momentary 3.3V logic pull-down',
    formFactor: 'No polarity; shorts power pins to boot',
    category: 'Front Panel',
    visualColor: 'bg-emerald-600'
  },
  {
    id: 'front-hdd-led',
    name: 'Front Panel HDD LED (+ / -)',
    pinCount: '2 Pins Female (Polarity Sensitive)',
    voltageOrSpeed: '+3.3V / Ground cathode',
    formFactor: 'Anode must align with Pin + for activity light',
    category: 'Front Panel',
    visualColor: 'bg-amber-500'
  },
  {
    id: 'usb3-header',
    name: 'USB 3.0 (19-Pin / 20-Pin) Internal Header',
    pinCount: '19 Active Pins (1 blocked key hole)',
    voltageOrSpeed: '5 Gbps SuperSpeed dual-channel',
    formFactor: 'Thick blue cable with center polarization tab',
    category: 'Data',
    visualColor: 'bg-cyan-700'
  },
  {
    id: 'displayport',
    name: 'DisplayPort 1.4 / 2.1 Cable',
    pinCount: '20 Pins',
    voltageOrSpeed: '32.4 Gbps / 80 Gbps video bandwidth',
    formFactor: 'One rectangular corner, one angled corner with lock button',
    category: 'Display',
    visualColor: 'bg-purple-600'
  },
  {
    id: 'hdmi-cable',
    name: 'HDMI 2.1 Ultra High Speed Cable',
    pinCount: '19 Pins Trapezoidal',
    voltageOrSpeed: '48 Gbps uncompressed 4K 120Hz / 8K',
    formFactor: 'Symmetrical angled sides, friction fit',
    category: 'Display',
    visualColor: 'bg-rose-600'
  }
];

export const CABLE_CHALLENGES: CableChallenge[] = [
  {
    id: 'ch-1',
    scenario: 'You are completing the primary motherboard electrical connection. The ATX power supply has a wide harness with 24 colored wires.',
    socketName: 'Motherboard 24-Pin ATX_PWR1 Socket',
    socketDescription: 'Right edge of motherboard next to RAM slots. Supplies system standby power and primary motherboard bus voltages.',
    correctCableId: 'atx-24',
    polaritySensitive: false,
    technicalNote: 'Always verify the clip snaps over the retention tab securely to prevent loose 12V high-resistance contacts.',
    clue: 'Look for the widest dual-row connector (20+4 pins) designed to power the whole motherboard.'
  },
  {
    id: 'ch-2',
    scenario: 'A high-end dedicated NVIDIA RTX 4070 graphics card is seated in PCIe Slot 1. The GPU cooling fans require dedicated 12V auxiliary power.',
    socketName: 'Graphics Card PCIe Auxiliary 8-Pin Input',
    socketDescription: 'Top edge of the graphics card PCB requiring auxiliary 12V power (up to 150 Watts).',
    correctCableId: 'pcie-8',
    polaritySensitive: false,
    technicalNote: 'Never force an 8-pin CPU EPS cable into a GPU socket. PCIe 8-pin splits as 6+2 pins; CPU EPS splits as 4+4 pins!',
    clue: 'Choose the (6+2) pin cable labeled PCIe, engineered specifically for graphics expansion cards.'
  },
  {
    id: 'ch-3',
    scenario: 'A student pushes the front chassis power button, but the PC fails to respond at all. You inspect the F_PANEL header at the bottom right of the motherboard.',
    socketName: 'Motherboard F_PANEL Pins 6 & 8 (PWR_BTN# / GND)',
    socketDescription: 'Two horizontal pins designated for the momentary tactile front power switch.',
    correctCableId: 'front-pwr-sw',
    polaritySensitive: false,
    technicalNote: 'Push-button switches close a momentary circuit to ground. They do NOT have positive/negative polarity.',
    clue: 'The 2-pin connector labeled PWR SW that triggers the motherboard startup circuit.'
  },
  {
    id: 'ch-4',
    scenario: 'You are connecting a 2.5-inch Crucial MX500 SATA SSD to transmit OS and game files at 600 MB/s to the Intel B660 chipset.',
    socketName: 'SATA3_1 (6 Gbps) Port on Motherboard Edge',
    socketDescription: '7-pin keyed L-notch socket for high-speed serial storage communication.',
    correctCableId: 'sata-data',
    polaritySensitive: false,
    technicalNote: 'The 7-pin data cable only carries signal. The drive also requires a 15-pin flat SATA cable from the PSU for power.',
    clue: 'Select the 7-pin narrow cable with metal retention clips for drive data transfer.'
  },
  {
    id: 'ch-5',
    scenario: 'The computer case features two high-speed blue USB 3.0 ports on the front top panel. You need to connect them to the motherboard.',
    socketName: 'USB 3.2 Gen 1 Internal Header (F_USB30)',
    socketDescription: '20-pin dual row shroud with one pin omitted (Pin 20) and a center notch on one side.',
    correctCableId: 'usb3-header',
    polaritySensitive: false,
    technicalNote: 'Take extreme care when aligning this header! Thin pins bend easily if pushed at an angle.',
    clue: 'The 19-pin thick keyed cable that powers two front SuperSpeed ports simultaneously.'
  },
  {
    id: 'ch-6',
    scenario: 'The computer case has a front drive activity blinking light. If connected backward, the light will not flash when disk reads happen.',
    socketName: 'Motherboard F_PANEL Pins 1 & 3 (HDLED+ / HDLED-)',
    socketDescription: '2-pin header for storage read/write diode indicator with explicit polarity requirement.',
    correctCableId: 'front-hdd-led',
    polaritySensitive: true,
    technicalNote: 'LEDs are light-emitting diodes that only allow current in one direction. The colored wire is positive (+), white is ground (-).',
    clue: 'The 2-pin connector for hard disk activity that must respect positive (+) and negative (-) orientation.'
  },
  {
    id: 'ch-7',
    scenario: 'The Intel Core i7 13700K CPU requires up to 253 Watts of VRM power located at the top-left corner of the motherboard.',
    socketName: 'CPU_PWR1 (8-Pin EPS 12V) Socket',
    socketDescription: 'Located near the VRM heatsinks above the CPU socket. Dedicated solely to processor power delivery.',
    correctCableId: 'eps-8',
    polaritySensitive: false,
    technicalNote: 'EPS cables split into 4+4 pins so they can also fit older 4-pin ATX12V motherboard headers.',
    clue: 'The 8-pin (4+4) cable engineered to power the processor VRM.'
  },
  {
    id: 'ch-8',
    scenario: 'Connecting a high refresh rate 240Hz 1440p gaming monitor to the dedicated graphics card with physical retention locking teeth.',
    socketName: 'GPU DisplayPort 1.4 Output Port',
    socketDescription: 'Rectangular port with one beveled corner and dual mechanical retention latches.',
    correctCableId: 'displayport',
    polaritySensitive: false,
    technicalNote: 'Always press the push-button latch before pulling a DisplayPort cable to avoid ripping out the GPU port!',
    clue: 'The latching 20-pin digital video standard featuring a release push button.'
  }
];
