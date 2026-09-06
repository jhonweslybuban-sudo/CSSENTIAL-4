export interface ActivityItem {
  title: string;
  scenario: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint: string;
}

export interface ActivityDefinition {
  id: string;
  name: string;
  type: string;
  iconName: string;
  description: string;
  lessonId?: string;
  lessonBadge: string;
  totalItems: number;
  items: ActivityItem[];
}

export const ACTIVITIES_DATA: ActivityDefinition[] = [
  // =========================================================================
  // ACTIVITY 1: PREPARING FOR INSTALLATION (10 QUESTIONS)
  // =========================================================================
  {
    id: 'act-lesson-1',
    name: 'Lesson 1 Activity Quiz: Preparing for Installation',
    type: 'Safety & Tools Assessment',
    iconName: 'ShieldAlert',
    lessonId: 'topic-1',
    lessonBadge: 'Lesson 1 Quiz',
    description: 'Activity quiz evaluating Occupational Health and Safety (OHS), ESD grounding protocols, workplace preparation, and hand tool safety for Lesson 1.',
    totalItems: 10,
    items: [
      {
        title: 'Question 1: Electrostatic Discharge (ESD) Prevention',
        scenario: 'A technician is preparing to unbox sensitive computer hardware including a modern motherboard and DDR4 memory modules. What is the essential personal protective device required to prevent ESD damage?',
        options: [
          'Anti-static wrist strap connected to an unpainted grounded metal surface',
          'Standard rubber household dishwashing gloves',
          'Heavy wool winter gloves',
          'Wearing athletic shoes on carpet'
        ],
        correctIndex: 0,
        explanation: 'An anti-static wrist strap contains a 1-Megaohm safety resistor that harmlessly bleeds static electricity to ground before voltage can destroy microscopic transistors on PCB circuitry.',
        hint: 'Which wearable safety item connects directly to the metal chassis of the computer to equalize electrical potential?'
      },
      {
        title: 'Question 2: Tool Selection: Screwdriver Magnetism',
        scenario: 'When mounting delicate M.2 NVMe SSDs and motherboard standoff screws, which screwdriver recommendation complies with Occupational Health and Safety (OHS) standards?',
        options: [
          'Use a precision magnetized tip screwdriver designed specifically for electronics with low magnetic field strength',
          'Use an industrial neodymium magnet attached to a wrench',
          'Use a flathead butter knife from the cafeteria',
          'Use an electric corded drywall impact driver'
        ],
        correctIndex: 0,
        explanation: 'Low-strength magnetic precision screwdrivers hold miniature screws in place without generating strong magnetic flux that could harm magnetic media or induce unwanted currents.',
        hint: 'Select the tool that safely prevents dropped screws in the chassis while protecting delicate circuits.'
      },
      {
        title: 'Question 3: Workspace Preparation: Electrical Safety',
        scenario: 'Before beginning computer disassembly or component installation in the hardware laboratory, what is the mandatory first step for electrical safety?',
        options: [
          'Turn off the PSU rocker switch, disconnect the AC power cord from the wall, and press the chassis power button for 5 seconds to drain residual capacitor charge',
          'Keep the computer plugged in so you can test fans while reaching inside',
          'Spray water onto the motherboard to cool it down',
          'Wear metal jewelry and rings to dissipate heat'
        ],
        correctIndex: 0,
        explanation: 'Power supplies retain hazardous capacitor charges even after power-down. Unplugging from AC mains and holding the power button discharges remaining energy safely.',
        hint: 'How do you ensure zero electrical energy remains in the power supply before touching internal parts?'
      },
      {
        title: 'Question 4: Component Handling: Physical Protection of Contact Pads',
        scenario: 'How should a technician physically handle a processor, RAM module, or expansion card when removing it from its anti-static packaging?',
        options: [
          'Hold the component strictly by its outer PCB edges without touching gold pins, socket contacts, or surface-mount capacitors',
          'Touch the gold contact fingers to check if they are sticky',
          'Place the component on a metal foil sheet or wool blanket',
          'Clean the gold contacts with steel wool'
        ],
        correctIndex: 0,
        explanation: 'Skin oils, moisture, and static potential can corrode or short out sensitive contact pins. Components must always be handled by their non-conductive fiberglass edges.',
        hint: 'Think about which part of the PCB is safe from oils and electrostatic transfer.'
      },
      {
        title: 'Question 5: Fire Safety Classification',
        scenario: 'If an electrical short circuit causes an open flame inside a power supply unit or computer casing, which fire extinguisher classification must be deployed?',
        options: [
          'Class C fire extinguisher (designed for energized electrical equipment)',
          'Class A fire extinguisher (plain pressurized water)',
          'Class K fire extinguisher (cooking oils and animal fats)',
          'Pour a bucket of tap water directly over the power supply'
        ],
        correctIndex: 0,
        explanation: 'Class C extinguishers contain non-conductive dry chemical or carbon dioxide (CO2) agents formulated specifically to extinguish electrical equipment fires without conducting electricity back to the operator.',
        hint: 'Which extinguisher rating is specifically designated for energized electrical devices?'
      },
      {
        title: 'Question 6: Anti-Static Storage Bags',
        scenario: 'When storing spare motherboards or discrete graphics cards in the laboratory, which packaging prevents electrostatic buildup?',
        options: [
          'Silver metallized anti-static shielding bags',
          'Standard household plastic grocery bags',
          'Clear bubble wrap without anti-static coating',
          'Brown cardboard shipping boxes without insulation'
        ],
        correctIndex: 0,
        explanation: 'Silver metallized bags create a Faraday cage effect, shielding sensitive semiconductor components from external electrical fields and static discharge.',
        hint: 'Look for the silver semi-reflective shielding material used by hardware manufacturers.'
      },
      {
        title: 'Question 7: Personal Safety & Jewelry',
        scenario: 'Why are technicians required to remove rings, watches, necklaces, and metal bracelets before working inside an energized or newly unplugged PC?',
        options: [
          'Metal jewelry acts as an excellent electrical conductor that can accidentally bridge live contacts and cause severe electrical burns',
          'Jewelry might scratch the exterior paint of the computer case',
          'Metal items make clicking noises that disrupt other students',
          'Jewelry absorbs Wi-Fi radio frequencies from the motherboard'
        ],
        correctIndex: 0,
        explanation: 'Conductive jewelry can bridge live power circuits (such as 12V rails or high-amperage lines), causing rapid thermal heating, severe burns, or catastrophic component destruction.',
        hint: 'What physical danger occurs when conductive metals accidentally bridge electrical contacts?'
      },
      {
        title: 'Question 8: Electrical Grounding and Wall Outlets',
        scenario: 'What type of electrical outlet is mandatory for safely powering diagnostic test benches and computer workstations in a certified laboratory?',
        options: [
          'A three-prong grounded AC outlet with verified ground continuity',
          'A two-prong ungrounded extension cord with the ground pin snapped off',
          'Daisy-chained multi-plug adapters with no surge protection',
          'An ungrounded generator with unstable voltage fluctuations'
        ],
        correctIndex: 0,
        explanation: 'A three-prong outlet provides hot, neutral, and a dedicated low-resistance earth ground path that directs fault current away from users and sensitive components to ground.',
        hint: 'Which plug type includes a round third pin specifically for grounding?'
      },
      {
        title: 'Question 9: Chemical Cleaning Solvents',
        scenario: 'Which chemical agent is approved for cleaning old thermal compound from CPU heat spreaders and gold contact fingers?',
        options: [
          '99% pure Isopropyl Alcohol (IPA)',
          'Tap water mixed with household liquid dish soap',
          'Acetone or paint lacquer thinner',
          'Glass cleaner with ammonia'
        ],
        correctIndex: 0,
        explanation: 'High-purity (99%) Isopropyl alcohol dissolves silicon and metal-oxide thermal paste efficiently, leaves zero conductive mineral residue, and evaporates almost immediately.',
        hint: 'Identify the high-purity alcohol widely used in electronics servicing.'
      },
      {
        title: 'Question 10: Ergonomics and Cable Management',
        scenario: 'Under OHS laboratory regulations, how should power cables and diagnostic cords trailing across work surfaces and walkways be secured?',
        options: [
          'Bundled, organized with hook-and-loop ties, and protected with floor cord covers to eliminate tripping hazards',
          'Allowed to hang loosely over the edge of the workbench',
          'Tied with metal copper wire wrapped around water pipes',
          'Stretched tightly across open aisles at shin height'
        ],
        correctIndex: 0,
        explanation: 'Proper cable management prevents trip hazards, prevents accidental yanking of equipment off workstations, and maintains an orderly, compliant workplace.',
        hint: 'How do you prevent people from tripping over cords while protecting equipment?'
      }
    ]
  },

  // =========================================================================
  // ACTIVITY 2: INSTALLING COMPUTER SYSTEMS (10 QUESTIONS)
  // =========================================================================
  {
    id: 'act-lesson-2',
    name: 'Lesson 2 Activity Quiz: Installing Computer Systems',
    type: 'Assembly & Hardware Assessment',
    iconName: 'Cpu',
    lessonId: 'topic-2',
    lessonBadge: 'Lesson 2 Quiz',
    description: 'Activity quiz evaluating hardware assembly sequence, CPU socket zero insertion force, dual-channel RAM slots, and PSU mounting for Lesson 2.',
    totalItems: 10,
    items: [
      {
        title: 'Question 1: CPU Installation: LGA Socket Alignment',
        scenario: 'Which is the correct sequence when seating an LGA (Land Grid Array) desktop processor into the motherboard socket?',
        options: [
          'Release socket lever -> Align gold triangle marking -> Seat CPU with zero force -> Close retention plate and lock lever',
          'Apply paste -> Open latch -> Drop CPU in -> Lock latch -> Put fan on',
          'Screw cooler to motherboard -> Slide CPU beneath heatsink -> Lock socket lever',
          'Drop CPU into socket -> Force lever down without checking notch alignment'
        ],
        correctIndex: 0,
        explanation: 'Proper LGA socket installation requires releasing the tension arm, matching the corner alignment triangle with the socket index mark, resting the chip gently without force, and latching the retention plate.',
        hint: 'Never use force on a CPU socket. Alignment markers must match before closing the retention lever.'
      },
      {
        title: 'Question 2: Dual-Channel Memory: 4-Slot Motherboard Configuration',
        scenario: 'A motherboard has four DIMM slots labeled A1, A2, B1, B2. What is the standard configuration recommended by motherboard manufacturers for installing two memory sticks?',
        options: [
          'Install into slots A2 and B2 (Slots 2 and 4 away from CPU)',
          'Install into slots A1 and A2 (Slots 1 and 2)',
          'Install into slots A1 and B1 (Slots 1 and 3)',
          'Install both sticks stacked into slot A1'
        ],
        correctIndex: 0,
        explanation: 'Utilizing slots A2 and B2 (slots 2 and 4 away from the processor) optimizes signal trace reflection and activates dual-channel memory mode, doubling available memory bandwidth.',
        hint: 'Check the standard recommendation for 2 sticks on a 4-slot board (alternating slots, usually slots 2 and 4).'
      },
      {
        title: 'Question 3: Power Supply Unit: Airflow & Fan Orientation',
        scenario: 'When mounting an ATX power supply in the bottom compartment of a modern chassis equipped with a bottom dust filter, which orientation is correct?',
        options: [
          'PSU intake fan facing downwards toward the filtered chassis bottom opening',
          'PSU intake fan facing upwards directly suffocated against the GPU shroud',
          'Remove the fan guard and mount the PSU upside-down',
          'Leave the power supply hanging freely outside the chassis'
        ],
        correctIndex: 0,
        explanation: 'With a bottom intake vent and dust filter, facing the fan down creates an isolated cooling loop: drawing cool ambient air from outside the case and exhausting heat out the back without heating the internal chassis.',
        hint: 'Where can the power supply pull fresh, cool outside air from without disturbing the interior graphics card airflow?'
      },
      {
        title: 'Question 4: Motherboard Mounting: Standoff Alignment',
        scenario: 'Prior to placing the motherboard inside the chassis, why is it critical to check that brass standoffs are installed ONLY where corresponding motherboard screw holes exist?',
        options: [
          'An extra standoff in an incorrect position will touch the rear PCB solder joints, causing a catastrophic short circuit',
          'Motherboard standoffs are purely decorative and can be placed anywhere',
          'Extra standoffs improve audio output quality',
          'Standoffs are only needed for liquid cooling radiators'
        ],
        correctIndex: 0,
        explanation: 'Motherboard standoffs elevate the PCB above bare chassis metal. A rogue standoff contacting live copper traces or solder balls on the back of the motherboard will short out power rails upon startup.',
        hint: 'What happens when grounded metal contacts live electrical traces on the back of a motherboard?'
      },
      {
        title: 'Question 5: Thermal Interface Material (TIM) Application',
        scenario: 'What is the most reliable method for applying thermal paste on a standard desktop CPU heat spreader prior to mounting the heatsink?',
        options: [
          'A small pea-sized or grain-of-rice dot in the center of the CPU heat spreader',
          'Emptying the entire tube across the motherboard PCB',
          'Spreading thermal paste under the CPU pins inside the socket',
          'Applying paste directly to the fan blades'
        ],
        correctIndex: 0,
        explanation: 'A pea-sized bead in the center allows mounting pressure from the heatsink bracket to evenly spread a thin, bubble-free layer of compound across the contact surface without spilling over edges.',
        hint: 'Think about how mounting pressure spreads a small centered dot across flat metal surfaces.'
      },
      {
        title: 'Question 6: CPU Cooler Plastic Protective Film',
        scenario: 'What critical step must be executed on a brand-new CPU heatsink or AIO liquid cooler block before fastening it to the CPU socket?',
        options: [
          'Peel off the transparent protective plastic sticker from the copper base plate',
          'Scuff the copper base with coarse sandpaper',
          'Coat the copper base with household motor oil',
          'Submerge the heatsink base in boiling water'
        ],
        correctIndex: 0,
        explanation: 'New heatsinks ship with a clear protective film over the polished copper base. Leaving it on acts as a thermal insulator, preventing heat transfer and causing emergency thermal shutdowns within seconds.',
        hint: 'What transparent barrier commonly gets forgotten on the bottom of new coolers?'
      },
      {
        title: 'Question 7: M.2 NVMe SSD Installation',
        scenario: 'When installing an M.2 NVMe SSD into its slot on the motherboard, at what angle should the card be inserted before gently pushing down to secure it with the standoff screw?',
        options: [
          'Insert at approximately a 30-degree angle into the M.2 key slot, then press down flat onto the standoff',
          'Force it vertically downward at 90 degrees directly into the slot',
          'Slide it in completely flat along the motherboard surface without angling',
          'Bend the SSD in half so both ends touch the motherboard'
        ],
        correctIndex: 0,
        explanation: 'M.2 connectors are keyed and designed for insertion at approximately 30 degrees until fully seated, after which the card swings down flat onto the standoff screw mount.',
        hint: 'M.2 connectors require an angled approach before being secured flat.'
      },
      {
        title: 'Question 8: Motherboard Main Power Cabling',
        scenario: 'Which power cable connector provides primary electrical power from the power supply to the motherboard circuitry?',
        options: [
          'The 24-pin (or 20+4 pin) ATX main power connector',
          'The 4-pin peripheral Molex connector',
          'A 6-pin PCIe auxiliary connector',
          'A single SATA power connector'
        ],
        correctIndex: 0,
        explanation: 'The ATX 24-pin connector delivers +3.3V, +5V, +12V, -12V, +5VSB, and the PS_ON power management signals necessary to boot and run the motherboard.',
        hint: 'Identify the largest multi-pin power connector on the motherboard.'
      },
      {
        title: 'Question 9: CPU Auxiliary Power Connection',
        scenario: 'In addition to the main 24-pin power connector, which connector near the top-left of the motherboard is mandatory to power the processor VRMs?',
        options: [
          'The 8-pin (or 4+4 pin) EPS / CPU +12V power connector',
          'A standard USB 2.0 9-pin header',
          'The front panel audio HD_AUDIO header',
          'The system speaker SPK header'
        ],
        correctIndex: 0,
        explanation: 'The EPS12V 8-pin (or 4+4 pin) connector supplies dedicated high-amperage +12V current directly to the voltage regulator modules (VRMs) that power the CPU.',
        hint: 'Look for the 8-pin connector located directly adjacent to the CPU socket.'
      },
      {
        title: 'Question 10: Front Panel Headers (F_PANEL)',
        scenario: 'Which front panel header connection is non-polarized (can be connected in either orientation without reversing functionality)?',
        options: [
          'Power Switch (PWR_SW) and Reset Switch (RESET_SW)',
          'Hard Drive Activity LED (HDD_LED)',
          'Power Indicator LED (PWR_LED)',
          'All LED indicator connections'
        ],
        correctIndex: 0,
        explanation: 'Switches (PWR_SW and RESET_SW) are momentary contact closures that simply complete an electrical loop; polarity does not matter. LEDs, however, are diodes and strictly require positive (+) and negative (-) matching.',
        hint: 'Which controls are momentary push switches rather than light-emitting diodes?'
      }
    ]
  },

  // =========================================================================
  // ACTIVITY 3: CONFIGURING COMPUTER SYSTEMS (10 QUESTIONS)
  // =========================================================================
  {
    id: 'act-lesson-3',
    name: 'Lesson 3 Activity Quiz: Configuring Computer Systems',
    type: 'Firmware & OS Configuration',
    iconName: 'Sliders',
    lessonId: 'topic-3',
    lessonBadge: 'Lesson 3 Quiz',
    description: 'Activity quiz evaluating UEFI/BIOS settings, boot device priority order, high-speed RAM XMP/EXPO profiles, and OS installation for Lesson 3.',
    totalItems: 10,
    items: [
      {
        title: 'Question 1: UEFI Setup: Boot Device Priority',
        scenario: 'You need to install an operating system from a bootable USB flash drive onto a clean NVMe SSD. How should the boot priority list be arranged in UEFI firmware?',
        options: [
          '1st: UEFI USB Flash Drive, 2nd: Internal NVMe SSD, 3rd: Disabled',
          '1st: Internal NVMe SSD, 2nd: Network PXE Boot, 3rd: USB Drive',
          'Disable all boot options and let BIOS guess',
          '1st: CD-ROM, 2nd: Floppy Drive, 3rd: Hard Drive'
        ],
        correctIndex: 0,
        explanation: 'To execute the operating system setup environment, the computer must boot from the installation USB media first. Once installation is complete, the internal SSD is designated as Boot Option #1.',
        hint: 'Which device contains the installation setup wizard that needs to load first?'
      },
      {
        title: 'Question 2: Memory Frequency: Enabling XMP / EXPO Profiles',
        scenario: 'A student technician installs DDR4-3600 MHz memory, but Task Manager reports it is running at the default JEDEC speed of 2133 MHz. What configuration must be enabled in UEFI/BIOS?',
        options: [
          'Enable XMP (Extreme Memory Profile) or DOCP/EXPO in BIOS overclocking settings',
          'Increase the CPU fan RPM to 100%',
          'Change the SATA controller from AHCI to IDE',
          'Turn off the TPM 2.0 security module'
        ],
        correctIndex: 0,
        explanation: 'High-speed RAM ships at standard safe JEDEC defaults. Enabling Intel XMP or AMD DOCP/EXPO activates the manufacturer tested factory timings, voltage, and advertised 3600 MHz clock speed.',
        hint: 'Look for the profile setting named for "Extreme Memory Profile".'
      },
      {
        title: 'Question 3: Security Requirements: Windows 11 Firmware Prerequisites',
        scenario: 'During system configuration, the Windows 11 installer states the PC does not meet minimum system requirements. Which two firmware features must be enabled in UEFI?',
        options: [
          'TPM 2.0 (fTPM/Intel PTT) and UEFI Secure Boot',
          'Legacy BIOS CSM Mode and IDE Emulation',
          'Overclocked CPU Ratio and Disabling Windows Defender',
          'Static IP Address and RAID 0 striping'
        ],
        correctIndex: 0,
        explanation: 'Windows 11 requires a Trusted Platform Module (TPM 2.0) for hardware-rooted cryptographic security and UEFI Secure Boot to prevent bootkits and untrusted bootloaders from executing.',
        hint: 'Which security features protect encryption keys and verify digitally signed bootloaders?'
      },
      {
        title: 'Question 4: Driver Installation: Post-OS Deployment Order',
        scenario: 'Immediately after Windows installation finishes, what is the best practice for installing peripheral and chipset drivers?',
        options: [
          'Install the Motherboard Chipset driver first, followed by Network/LAN, GPU Display driver, and Audio',
          'Install audio drivers first, then play music at maximum volume',
          'Never install drivers and rely solely on default basic display adapters',
          'Install third-party driver cleaners before testing hardware'
        ],
        correctIndex: 0,
        explanation: 'The chipset driver instructs the operating system on how to manage the CPU-to-chipset bus, PCIe lanes, and power states. Installing it first ensures subsequent hardware drivers configure accurately.',
        hint: 'Which foundational driver establishes communication between the operating system and the motherboard chipset architecture?'
      },
      {
        title: 'Question 5: Partition Table Scheme: GPT vs. MBR',
        scenario: 'When initializing a 4 TB NVMe SSD for a modern UEFI system installation, which partition style must be chosen?',
        options: [
          'GUID Partition Table (GPT)',
          'Master Boot Record (MBR)',
          'FAT16 Allocation Table',
          'Dynamic Floppy Disk'
        ],
        correctIndex: 0,
        explanation: 'GPT supports drives larger than 2.2 TB (up to 9.4 ZB), allows up to 128 primary partitions in Windows, and is mandatory for native UEFI Secure Boot installations.',
        hint: 'Which partition scheme overcomes MBR\'s 2.2 TB limit and supports modern UEFI?'
      },
      {
        title: 'Question 6: Storage Controller Interface Mode',
        scenario: 'Before installing the operating system onto a SATA SSD, what mode should the SATA controller be set to in the UEFI configuration?',
        options: [
          'AHCI (Advanced Host Controller Interface)',
          'IDE / Legacy Compatible Mode',
          'Floppy Emulation Mode',
          'SCSI Tape Drive Mode'
        ],
        correctIndex: 0,
        explanation: 'AHCI enables advanced SATA features such as Native Command Queuing (NCQ), hot-plugging, and maximum bus throughput, whereas IDE mode throttles SSD performance.',
        hint: 'Select the modern host controller interface protocol that replaces legacy IDE.'
      },
      {
        title: 'Question 7: Clearing CMOS Settings',
        scenario: 'A technician accidentally set an unstable memory overclock, and the motherboard will no longer POST into BIOS. How can UEFI settings be reset to factory defaults?',
        options: [
          'Unplug the AC power cord, remove the CR2032 coin battery or short the CLR_CMOS jumper pins for 10 seconds',
          'Shake the computer case vigorously',
          'Replace the monitor and keyboard',
          'Blow hot air onto the graphics card'
        ],
        correctIndex: 0,
        explanation: 'Shorting the CLR_CMOS jumper or removing the coin battery cuts volatile backup power to the CMOS SRAM, reverting all UEFI configuration parameters to safe factory defaults.',
        hint: 'How do you reset the volatile memory chip that stores custom BIOS settings?'
      },
      {
        title: 'Question 8: Fan Curve Configuration in BIOS',
        scenario: 'A workstation CPU fan runs at full 100% speed continuously even when the computer is completely idle. What BIOS setting should be configured to enable dynamic speed control?',
        options: [
          'Set CPU_FAN control mode to PWM (Pulse Width Modulation) and enable Smart Fan / Silent Curve',
          'Change the power supply voltage switch to 220V',
          'Unplug the CPU fan cable entirely',
          'Disable CPU C-States in advanced power options'
        ],
        correctIndex: 0,
        explanation: 'Setting fan headers to PWM mode allows the motherboard to dynamically adjust 4-pin fan RPM based on real-time temperature sensors, keeping the system quiet at idle.',
        hint: 'Which 4-pin fan modulation technology regulates motor speed based on temperature?'
      },
      {
        title: 'Question 9: Virtualization Technology in Firmware',
        scenario: 'A user needs to run virtual machines (Hyper-V / VirtualBox). What setting must be enabled in the CPU configuration menu of the UEFI firmware?',
        options: [
          'Intel VT-x / AMD SVM (AMD-V)',
          'Intel SpeedStep / AMD Cool\'n\'Quiet',
          'Legacy USB Support',
          'Internal Speaker Beeper'
        ],
        correctIndex: 0,
        explanation: 'Hardware virtualization extensions (Intel VT-x or AMD SVM) allow hypervisors direct access to CPU execution rings for high-performance guest OS virtualization.',
        hint: 'Look for hardware virtualization support (VT-x for Intel or SVM for AMD).'
      },
      {
        title: 'Question 10: Device Manager Driver Verification',
        scenario: 'In Windows Device Manager after a fresh installation, a yellow exclamation mark appears next to "PCI Simple Communications Controller". What driver is missing?',
        options: [
          'Intel Management Engine Interface (IMEI) or AMD PSP driver',
          'Optical mouse driver',
          'High Definition Audio jack driver',
          'Monitor stand driver'
        ],
        correctIndex: 0,
        explanation: 'PCI Simple Communications Controller with a yellow warning mark almost universally corresponds to the Intel Management Engine (ME) or AMD Platform Security Processor (PSP) driver from the motherboard support page.',
        hint: 'Which chipset sub-component manages out-of-band communication with the CPU platform?'
      }
    ]
  },

  // =========================================================================
  // ACTIVITY 4: COMMON PROBLEMS IN COMPUTER SYSTEMS (10 QUESTIONS)
  // =========================================================================
  {
    id: 'act-lesson-4',
    name: 'Lesson 4 Activity Quiz: Common Problems in Computer Systems',
    type: 'Problem Identification Assessment',
    iconName: 'ClipboardCheck',
    lessonId: 'topic-4',
    lessonBadge: 'Lesson 4 Quiz',
    description: 'Activity quiz evaluating recognition of common hardware and software problems, thermal shutdowns, and storage errors for Lesson 4.',
    totalItems: 10,
    items: [
      {
        title: 'Question 1: Storage Error: "INACCESSIBLE_BOOT_DEVICE" BSOD',
        scenario: 'After modifying UEFI settings, Windows fails to boot and immediately crashes with the stop code "INACCESSIBLE_BOOT_DEVICE". Prior to this, the SATA controller mode was changed.',
        options: [
          'The SATA controller mode was switched from AHCI to IDE/RAID, breaking storage driver compatibility',
          'The RAM modules are operating at an unsupported frequency',
          'The CPU cooling fan is spinning too slowly',
          'The front panel audio header is loose'
        ],
        correctIndex: 0,
        explanation: 'Changing SATA mode between AHCI and IDE/RAID changes how the storage controller communicates with the OS. Windows cannot load the appropriate storage driver at boot, throwing this stop code.',
        hint: 'Which setting directly affects how the motherboard talks to storage hard drives and SSDs?'
      },
      {
        title: 'Question 2: CMOS Failure: Date and Time Reset on Power Loss',
        scenario: 'Whenever the computer is unplugged from the wall socket or the power strip is switched off, the system BIOS date and time resets to January 1, 2015, and boot settings revert to defaults.',
        options: [
          'The CMOS battery (CR2032 3V coin cell) is depleted and needs replacement',
          'The NVMe SSD is worn out',
          'The power supply 24-pin cable is defective',
          'The processor clock multiplier is broken'
        ],
        correctIndex: 0,
        explanation: 'The CR2032 lithium coin cell battery maintains the real-time clock (RTC) and volatile CMOS memory settings when mains AC power is removed. When it dies, time and settings reset.',
        hint: 'What small round component powers the motherboard memory when the PC is disconnected from the wall?'
      },
      {
        title: 'Question 3: Memory Anomaly: 8 GB Usable Out of 16 GB Installed',
        scenario: 'A technician installed two 8 GB DDR4 sticks. In Windows System Properties, it displays: "Installed RAM: 16.0 GB (7.95 GB usable)" and Task Manager shows "Hardware reserved: 8.1 GB".',
        options: [
          'One RAM module is seated in an improper slot channel or not fully engaged by the memory controller',
          'The computer monitor is taking 8 GB of video memory',
          'The CPU thermal paste has leaked into the PCI slot',
          'The hard drive has run out of virtual swap memory'
        ],
        correctIndex: 0,
        explanation: 'When one stick is detected electrically by SPD but cannot be trained by the memory controller (often due to non-optimal slot population or unseated pins), Windows marks it as "Hardware Reserved".',
        hint: 'Check dual-channel slot recommendations (usually slots A2 and B2) and seating.'
      },
      {
        title: 'Question 4: Mechanical Drive: Rhythmic Clicking Sound ("Click of Death")',
        scenario: 'While running lab tasks, a loud rhythmic clicking sound originates from inside the chassis, followed by an operating system freeze and the error "Disk Read Error Occurred".',
        options: [
          'Mechanical HDD read/write head actuator arm assembly failure',
          'CPU water cooler pump cavitation',
          'Graphics card fan bearing dust accumulation',
          'Power supply relay overload'
        ],
        correctIndex: 0,
        explanation: 'Rhythmic clicking in a mechanical hard drive occurs when read/write heads repeatedly try and fail to calibrate onto track sectors. This indicates imminent physical HDD failure.',
        hint: 'Which mechanical component contains spinning platters and moving magnetic actuator arms?'
      },
      {
        title: 'Question 5: Video Artifacts & Checkerboarding',
        scenario: 'During 3D gaming or CAD rendering, the screen displays pink and green checkerboard squares, screen flickering, and crashing to desktop with "Display driver nvlddmkm stopped responding".',
        options: [
          'Dedicated GPU VRAM failure or severe overheating of the graphics memory chips',
          'The monitor power cable has high resistance',
          'The computer mouse optical sensor has dust',
          'The audio driver is transmitting corrupt stereo signals'
        ],
        correctIndex: 0,
        explanation: 'Checkerboarding, colored lines, and polygons (artifacts) are classic symptoms of video memory (VRAM) degradation, unstable memory clocks, or damaged GPU silicon.',
        hint: 'What dedicated component renders 3D frames and stores frame buffers in VRAM?'
      },
      {
        title: 'Question 6: Bulging or Leaking Motherboard Capacitors',
        scenario: 'During visual inspection of a legacy PC that suffers from random freezing, several aluminum cylindrical capacitors near the CPU socket have domed, bulging tops and brown crusty residue.',
        options: [
          'Blown electrolytic capacitors suffering from electrolyte breakdown and internal pressure',
          'Normal capacitor venting intended for moisture release',
          'Factory thermal adhesive applied by the manufacturer',
          'Excess flux from lead-free soldering'
        ],
        correctIndex: 0,
        explanation: 'Electrolytic capacitors bulge and leak when dielectric breakdown occurs due to age, ripple voltage, or excessive heat. Leaking capacitors cause electrical instability and random system crashes.',
        hint: 'What happens when electrolytic fluid inside cylindrical motherboard capacitors overheats?'
      },
      {
        title: 'Question 7: Stop Error (BSOD): "IRQL_NOT_LESS_OR_EQUAL"',
        scenario: 'A workstation randomly experiences blue screen crashes with the stop code "IRQL_NOT_LESS_OR_EQUAL". What are the two most probable root causes?',
        options: [
          'Faulty/corrupt device drivers attempting access to invalid memory addresses, or unstable RAM',
          'Monitor HDMI cable version is outdated',
          'Power button spring is jammed',
          'Computer case thumbscrews are too loose'
        ],
        correctIndex: 0,
        explanation: 'IRQL_NOT_LESS_OR_EQUAL indicates kernel-mode code or a driver attempted to access pageable memory at an invalid interrupt request level, commonly caused by bad drivers or failing memory.',
        hint: 'This common stop code points to device drivers or system memory conflicts.'
      },
      {
        title: 'Question 8: High Pitch Squealing (Coil Whine)',
        scenario: 'When running high frame-rate applications, a loud, high-pitched electrical squeal emanates from the GPU or power supply. The noise changes pitch when moving the camera in-game.',
        options: [
          'Coil whine: electromagnetic vibration in inductors and chokes under high electrical load',
          'Mechanical hard drive head collision',
          'CPU fan hitting a loose SATA cable',
          'Audio sound card amplifier clipping'
        ],
        correctIndex: 0,
        explanation: 'Coil whine occurs when rapid current pulses pass through copper wire windings in inductors, causing them to physically vibrate against their magnetic cores at audible frequencies.',
        hint: 'What harmless but annoying acoustic phenomenon occurs when inductors vibrate under electrical current?'
      },
      {
        title: 'Question 9: Boot Loop (Power Cycles Every 3 Seconds)',
        scenario: 'Upon turning on the computer, fans spin for 3 seconds, the system powers off, and then restarts on its own repeatedly without ever showing a display.',
        options: [
          'Memory training failure, improperly seated RAM stick, or corrupted BIOS configuration',
          'The optical drive tray is slightly open',
          'The USB mouse DPI switch is set too high',
          'The monitor refresh rate is set to 60Hz'
        ],
        correctIndex: 0,
        explanation: 'A 3-second power cycling boot loop indicates the motherboard failed the initial hardware initialization stage (usually memory training or CPU power good signal) and is resetting to retry.',
        hint: 'Which component initialization failure typically causes repeated 3-second reboot cycles?'
      },
      {
        title: 'Question 10: Missing Storage Drive in Windows Explorer',
        scenario: 'A technician installs a brand new 2 TB secondary SATA hard drive. BIOS detects it, but the drive does not appear in Windows File Explorer ("This PC"). What is the problem?',
        options: [
          'The new drive has not been partitioned and formatted in Windows Disk Management',
          'The SATA power cable was plugged in backwards',
          'Windows Explorer cannot read drives larger than 1 TB',
          'The CPU lacks enough PCIe lanes for SATA drives'
        ],
        correctIndex: 0,
        explanation: 'New uninitialized drives contain no file system or partition table. They must be opened in Disk Management, initialized (GPT), and assigned a formatted volume (NTFS) with a drive letter.',
        hint: 'What Windows administrative tool manages partitioning and volume assignment for new drives?'
      }
    ]
  },

  // =========================================================================
  // ACTIVITY 5: TROUBLESHOOTING COMPUTER SYSTEMS (10 QUESTIONS)
  // =========================================================================
  {
    id: 'act-lesson-5',
    name: 'Lesson 5 Activity Quiz: Troubleshooting Computer Systems',
    type: 'Diagnostic Flowchart Assessment',
    iconName: 'Wrench',
    lessonId: 'topic-5',
    lessonBadge: 'Lesson 5 Quiz',
    description: 'Activity quiz evaluating diagnostic isolation techniques, POST beep codes, debug LEDs, and systematic problem solving for Lesson 5.',
    totalItems: 10,
    items: [
      {
        title: 'Question 1: Display Failure: Fans Spin, Monitor Stays Black',
        scenario: 'A student technician completed installing a new dedicated graphics card. When powering on the PC, case fans and CPU cooler spin, but the monitor displays "No Signal". The HDMI cable is currently plugged into the motherboard back I/O plate.',
        options: [
          'Connect the HDMI cable directly into the dedicated graphics card port',
          'Replace the power supply with a higher wattage model',
          'Flash the motherboard BIOS with an emergency flash drive',
          'Remove the CPU and check for bent pins'
        ],
        correctIndex: 0,
        explanation: 'When a dedicated GPU is installed, motherboards automatically disable the CPU integrated graphics on the motherboard I/O panel. The display cable must be plugged into the discrete graphics card output.',
        hint: 'Think about which component is generating the video display signal when a discrete graphics card is installed.'
      },
      {
        title: 'Question 2: POST Beep Codes: Continuous Repeating Beeping',
        scenario: 'Immediately after pressing the power button, the computer produces a continuous, repeating sequence of beeps and will not complete POST. The motherboard debug LED is glowing solid amber.',
        options: [
          'Unplug the AC power cord and reseat the RAM modules firmly into slots A2 and B2',
          'Replace the SATA cable connecting the operating system SSD',
          'Reapply thermal paste to the CPU heat spreader',
          'Change the CMOS CR2032 coin cell battery'
        ],
        correctIndex: 0,
        explanation: 'Continuous repeating beeps and an amber diagnostic LED typically indicate an unseated or improperly configured RAM module. Reseating the memory until both latches click firmly resolves the issue.',
        hint: 'Which component is associated with memory channels and the amber debug indicator?'
      },
      {
        title: 'Question 3: Thermal Shutdown: System Shuts Off After 30 Seconds',
        scenario: 'The freshly built computer boots into the BIOS successfully, but abruptly powers off completely after 30 to 45 seconds. Touching the CPU cooler heatsink reveals it is cool to the touch.',
        options: [
          'The CPU cooler still has its protective transparent plastic peel attached, causing instant thermal shutdown',
          'The PSU wattage is insufficient for idle BIOS operations',
          'The keyboard USB port is short-circuiting the motherboard',
          'The SATA SSD boot sector is corrupt'
        ],
        correctIndex: 0,
        explanation: 'Modern CPUs reach 100°C within seconds without proper heat conduction. If the clear plastic film was not removed from the heatsink base, heat cannot transfer, triggering emergency thermal shutdown.',
        hint: 'Look at why the processor might rapidly overheat even when the metal heatsink feels cold.'
      },
      {
        title: 'Question 4: No Signs of Life: Front Power Button Does Nothing',
        scenario: 'You flip the power supply rocker switch to "I" and press the case power button on top of the chassis. Absolutely nothing happens: no fans spin, no LEDs blink.',
        options: [
          'Verify the 2-pin PWR_SW connector is plugged into the correct front panel header pins on the motherboard',
          'Replace the monitor display cable with a DisplayPort cable',
          'Reinstall the operating system using UEFI boot media',
          'Check the hard drive partition style using Disk Management'
        ],
        correctIndex: 0,
        explanation: 'If the system shows no signs of life, the momentary switch cable labeled PWR_SW is likely disconnected or misaligned on the front panel header pins (F_PANEL).',
        hint: 'What physical wiring carries the press signal from the chassis button to the motherboard?'
      },
      {
        title: 'Question 5: Diagnostic Isolation: Out-of-Case Bench Testing',
        scenario: 'A freshly assembled PC will not complete POST inside the steel chassis. What is the standard diagnostic procedure to rule out chassis grounding shorts?',
        options: [
          'Remove the motherboard and assemble a minimum configuration outside the case on top of a non-conductive surface (such as the motherboard cardboard box)',
          'Wrap the chassis in aluminum foil and try again',
          'Hit the side panel with a rubber mallet',
          'Immerse the power supply in distilled water'
        ],
        correctIndex: 0,
        explanation: 'Bench testing (or "breadboarding") the motherboard on top of its non-conductive cardboard packaging isolates components from any accidental chassis grounding or rogue standoff short circuits.',
        hint: 'How do technicians test hardware outside the metal case to eliminate short circuits?'
      },
      {
        title: 'Question 6: Four-Stage Motherboard Debug LEDs',
        scenario: 'Many modern motherboards feature four diagnostic status LEDs labeled: CPU, DRAM, VGA, BOOT. If the VGA LED stays illuminated solid white and POST halts, which component is faulty or unseated?',
        options: [
          'The graphics card (GPU) or PCIe display subsystem',
          'The central processor (CPU)',
          'The system RAM (DRAM)',
          'The bootable storage drive (BOOT)'
        ],
        correctIndex: 0,
        explanation: 'The VGA debug LED specifically signals failure in the video subsystem: an unseated graphics card, missing PCIe auxiliary power cables, or an incompatible display connection.',
        hint: 'VGA is the universal indicator for the video graphics adapter subsystem.'
      },
      {
        title: 'Question 7: Power Supply Paperclip Test',
        scenario: 'To test if an uninstalled power supply turns on without connecting it to a motherboard, which two pins on the 24-pin ATX connector are shorted together?',
        options: [
          'Pin 16 (Green wire / PS_ON) and any adjacent Ground (Black wire)',
          'Pin 1 (+3.3V Orange) and Pin 10 (+12V Yellow)',
          'Pin 4 (+5V Red) and Pin 19 (+5V Red)',
          'Pin 12 (-12V Blue) and Pin 24 (+12V Yellow)'
        ],
        correctIndex: 0,
        explanation: 'Shorting PS_ON (Green, Pin 16) to COM/Ground (Black) mimics the motherboard power-on signal, commanding the PSU internal relays to energize and spin its cooling fan.',
        hint: 'PS_ON is the green wire on standard ATX harnesses, pulled low to ground to power up.'
      },
      {
        title: 'Question 8: RAM Module Isolation Protocol',
        scenario: 'A computer with two sticks of RAM fails to boot. How should a technician determine if one specific RAM stick or slot is defective?',
        options: [
          'Test one RAM stick at a time in slot A2, attempting boot on each, then rotate sticks through other slots',
          'Replace the power cord and clean the keyboard',
          'Reinstall Windows using safe mode',
          'Overclock the memory voltage in BIOS'
        ],
        correctIndex: 0,
        explanation: 'The single-stick isolation technique tests each memory stick individually in a known good primary slot (typically A2) to isolate whether a failure is caused by a bad stick or a bad motherboard DIMM slot.',
        hint: 'Test components individually in a single slot to isolate the exact defective part.'
      },
      {
        title: 'Question 9: Safe Mode Diagnostic Booting',
        scenario: 'Windows crashes to a blue screen immediately after logging in, but boots successfully into Safe Mode. What does this indicate about the underlying issue?',
        options: [
          'The issue is caused by a third-party software service, driver, or startup program rather than critical core hardware',
          'The CPU silicon has suffered permanent physical destruction',
          'The monitor refresh rate is too high for the graphics card',
          'The power supply has lost its 5V rail'
        ],
        correctIndex: 0,
        explanation: 'Safe Mode loads Windows with a minimal set of generic drivers and services. Successful boot into Safe Mode demonstrates hardware is functioning and points to third-party drivers or software.',
        hint: 'Safe Mode runs on minimal basic drivers. If it boots, core hardware is functional.'
      },
      {
        title: 'Question 10: CompTIA 6-Step Troubleshooting Methodology',
        scenario: 'According to industry-standard CompTIA diagnostic methodology, after establishing a theory of probable cause, what is the immediate next step?',
        options: [
          'Test the theory to determine cause',
          'Document findings, actions, and outcomes',
          'Verify full system functionality',
          'Establish a plan of action and implement the solution'
        ],
        correctIndex: 0,
        explanation: 'The standard troubleshooting sequence is: 1. Identify problem -> 2. Establish theory of probable cause -> 3. Test the theory -> 4. Establish plan of action -> 5. Verify system functionality -> 6. Document findings.',
        hint: 'What do you do right after thinking of a probable cause? You test it!'
      }
    ]
  },

  // =========================================================================
  // ACTIVITY 6: TESTING COMPUTER SYSTEMS (10 QUESTIONS)
  // =========================================================================
  {
    id: 'act-lesson-6',
    name: 'Lesson 6 Activity Quiz: Testing Computer Systems',
    type: 'Benchmarking & Quality Assurance',
    iconName: 'CheckCircle2',
    lessonId: 'topic-6',
    lessonBadge: 'Lesson 6 Quiz',
    description: 'Activity quiz evaluating multimeter power rail testing, memory stability (MemTest86), and thermal stress testing for Lesson 6.',
    totalItems: 10,
    items: [
      {
        title: 'Question 1: Multimeter Testing: ATX DC Voltage Rail Tolerances',
        scenario: 'Using a digital multimeter to test an ATX 24-pin power connector jumped with a paperclip between Pin 16 (PS_ON Green) and Ground (Black), what are the three primary DC voltage rails to measure?',
        options: [
          '+12V (Yellow), +5V (Red), and +3.3V (Orange)',
          '+24V (Blue), +10V (Green), and -10V (White)',
          '+120V AC, +220V AC, and 0V Ground',
          '+9V Battery, +1.5V Cell, and +50V DC'
        ],
        correctIndex: 0,
        explanation: 'Standard ATX specifications supply +12V DC (Yellow wires for CPU/GPU/motors), +5V DC (Red wires for logic/USB/drives), and +3.3V DC (Orange wires for memory/chipset). All must be within ±5% tolerance.',
        hint: 'Identify the three standard ATX low-voltage direct current rails.'
      },
      {
        title: 'Question 2: Memory Stability Testing: Standalone Boot Verification',
        scenario: 'Which dedicated diagnostic tool should be booted from a USB drive before installing production software to verify that the memory contains zero parity or bit-flip errors?',
        options: [
          'MemTest86',
          'Windows Media Player',
          'Adobe Photoshop Benchmark',
          'Disk Defragmenter'
        ],
        correctIndex: 0,
        explanation: 'MemTest86 runs standalone outside any OS, writing and reading alternating bit patterns across every memory address byte to ensure memory chips and timings are 100% stable.',
        hint: 'What classic memory testing utility runs directly from USB before booting an OS?'
      },
      {
        title: 'Question 3: Thermal Throttling Verification Under Heavy Load',
        scenario: 'During a 15-minute Prime95 stress test on a freshly built workstation, the CPU clock drops from 4.2 GHz down to 1.8 GHz, and HWMonitor shows core temps at 98°C. What does this test reveal?',
        options: [
          'Thermal throttling: the cooling solution is inadequate or improperly mounted',
          'The power supply is supplying too much clean voltage',
          'The operating system has finished indexing files',
          'The monitor resolution is configured too high'
        ],
        correctIndex: 0,
        explanation: 'When a CPU reaches its thermal maximum (Tjunction, typically 95-100°C), thermal throttling reduces clock speeds to prevent physical destruction, signaling inadequate heat dissipation.',
        hint: 'Why does a processor drop its operating frequency when temperatures approach 100°C?'
      },
      {
        title: 'Question 4: Storage Health: S.M.A.R.T. Telemetry Analysis',
        scenario: 'Which utility is used to inspect S.M.A.R.T. health metrics such as Reallocated Sectors Count, Power-On Hours, and SSD Remaining Lifetime Percentage?',
        options: [
          'CrystalDiskInfo',
          'Notepad',
          'Windows Calculator',
          'Paint 3D'
        ],
        correctIndex: 0,
        explanation: 'CrystalDiskInfo reads drive S.M.A.R.T. (Self-Monitoring, Analysis, and Reporting Technology) attributes directly from the drive controller firmware to report operational health.',
        hint: 'Identify the industry-standard disk telemetry reporting tool.'
      },
      {
        title: 'Question 5: GPU Stress Testing and Stability',
        scenario: 'To stress-test a dedicated graphics card at 100% GPU core and memory power limits to verify thermal cooling and VRM stability, which utility is widely utilized?',
        options: [
          'FurMark / 3DMark Time Spy Stress Test',
          'Microsoft Word spell-check',
          'Windows Solitaire',
          'Command Prompt directory listing'
        ],
        correctIndex: 0,
        explanation: 'FurMark and 3DMark stress tests apply extreme rendering workloads to verify graphics card stability, maximum thermal equilibrium, and power supply headroom.',
        hint: 'Which intensive graphics benchmark pushes the GPU to its thermal limit?'
      },
      {
        title: 'Question 6: ATX Voltage Rail ±5% Tolerance Limits',
        scenario: 'When measuring the +12V rail on a power supply with a digital multimeter under heavy load, which reading indicates an out-of-spec power rail that can cause hardware instability?',
        options: [
          '11.20 Volts (below the acceptable 11.40V minimum)',
          '12.05 Volts',
          '11.95 Volts',
          '12.10 Volts'
        ],
        correctIndex: 0,
        explanation: 'The ATX specification mandates a ±5% tolerance on the +12V rail, which establishes an acceptable operating voltage range between 11.40V and 12.60V. 11.20V is dangerously low.',
        hint: 'Calculate 5% of 12V: 12 x 0.05 = 0.6V. The minimum allowable is 11.4V.'
      },
      {
        title: 'Question 7: Hardware Sensor Telemetry Monitoring',
        scenario: 'Which comprehensive utility provides real-time sensor readouts for CPU core temperatures, fan RPMs, VRM temperatures, and rail voltages simultaneously in Windows?',
        options: [
          'HWiNFO64 or HWMonitor',
          'Windows Disk Cleanup',
          'Paint',
          'Registry Editor'
        ],
        correctIndex: 0,
        explanation: 'HWiNFO64 provides granular sensor telemetry across all motherboard, processor, GPU, and drive monitoring chips in real time.',
        hint: 'Look for the sensor information tool named HWiNFO.'
      },
      {
        title: 'Question 8: Built-in Windows Memory Diagnostics',
        scenario: 'If a technician does not have a bootable MemTest86 USB drive available, which native Windows utility can be scheduled to run on the next restart?',
        options: [
          'Windows Memory Diagnostic (mdsched.exe)',
          'System Restore (rstrui.exe)',
          'Remote Desktop Connection (mstsc.exe)',
          'Volume Mixer (sndvol.exe)'
        ],
        correctIndex: 0,
        explanation: 'Running mdsched.exe opens Windows Memory Diagnostic, which reboots into a pre-OS environment to test system RAM for physical memory errors.',
        hint: 'Command: mdsched.exe executes this built-in memory tool.'
      },
      {
        title: 'Question 9: Network Latency and Packet Loss Testing',
        scenario: 'To diagnose intermittent network drops and packet loss on a freshly configured computer workstation, which command-line diagnostic tool is executed?',
        options: [
          'ping -t 8.8.8.8 (continuous ICMP echo requests)',
          'format C:',
          'shutdown /s',
          'taskkill /f /im explorer.exe'
        ],
        correctIndex: 0,
        explanation: 'The ping command sends ICMP Echo Request packets to test round-trip latency, connection consistency, and packet drop percentages.',
        hint: 'Which command tests network latency using ICMP echo requests?'
      },
      {
        title: 'Question 10: Burn-In Quality Assurance Testing',
        scenario: 'What is the primary purpose of executing an automated 2-to-4 hour burn-in stress test before deploying newly assembled computers to an educational lab?',
        options: [
          'To reveal early hardware component failures (infant mortality) under controlled conditions prior to delivery',
          'To run down the motherboard battery',
          'To generate heat in the laboratory',
          'To test how loud the fans sound'
        ],
        correctIndex: 0,
        explanation: 'The bathtub curve of electronic component failure shows the highest failure rates occur in the first few hours of operation ("infant mortality"). Burn-in testing catches defective parts before deployment.',
        hint: 'Why do manufacturers stress test new electronics before shipping them to clients?'
      }
    ]
  },

  // =========================================================================
  // ACTIVITY 7: CAPSTONE CASE STUDIES (10 QUESTIONS)
  // =========================================================================
  {
    id: 'act-lesson-7',
    name: 'Capstone Quiz: Practical Case Studies',
    type: 'Practical Case Scenarios',
    iconName: 'BookOpen',
    lessonBadge: 'Case Studies',
    description: 'Activity quiz analyzing realistic laboratory renovation upgrades, rogue standoff short circuits, and environmental maintenance challenges.',
    totalItems: 10,
    items: [
      {
        title: 'Case Study 1: Laboratory Renovation Standoff Short Circuit',
        scenario: 'Technicians are upgrading 30 legacy desktop systems by replacing old HDDs with SATA SSDs and adding a second RAM module. After installing on PC #12, the PC will not boot and emits a burning smell. Inspection shows a standoff was screwed into a position where no motherboard mounting hole existed.',
        options: [
          'The rogue standoff created a dead short circuit between the chassis and live motherboard power traces; remove it immediately and inspect PCB for damage',
          'Add a second standoff next to it to balance the weight',
          'Replace the monitor cable and ignore the smell',
          'Increase the fan speed to blow away the smoke'
        ],
        correctIndex: 0,
        explanation: 'Brass standoffs must strictly match motherboard screw locations. An extra standoff contacts live solder pins on the underside of the PCB, grounding power rails directly to chassis metal and causing severe short circuits.',
        hint: 'What happens when a metal brass standoff touches live circuit traces on the back of a motherboard?'
      },
      {
        title: 'Case Study 2: Intermittent Freezing in Humid Climate',
        scenario: 'During rainy season, a computer lab reports intermittent freeze-ups and memory corruption. Inspection shows excessive dust caked across the RAM slots and PCIe lanes, absorbing moisture from the air.',
        options: [
          'Perform preventive maintenance: safely blow dust away using dry compressed air / ESD-safe vacuum and clean contacts with 99% isopropyl alcohol',
          'Spray water on the components to clean them',
          'Wrap the computer case in aluminum foil',
          'Disable memory error checking in Windows'
        ],
        correctIndex: 0,
        explanation: 'Dust combined with atmospheric humidity becomes conductive, creating resistive leakage paths across high-frequency memory bus traces. Thorough cleaning with isopropyl alcohol and dry air restores signal integrity.',
        hint: 'What is the standard professional cleaning agent for electronics and slot contacts?'
      },
      {
        title: 'Case Study 3: Headphone Audio Buzzing (Ground Loop)',
        scenario: 'Whenever a user moves the mouse or the graphics card renders 3D graphics, a high-pitched buzzing and whining is heard in headphones plugged into the front chassis 3.5mm jack. The rear motherboard audio jack is crystal clear.',
        options: [
          'The front panel HD_AUDIO cable is routed directly alongside high-current 12V GPU cables, picking up electromagnetic interference (EMI)',
          'The mouse laser is out of focus',
          'The monitor power button is stuck',
          'The CPU needs to be underclocked'
        ],
        correctIndex: 0,
        explanation: 'Front panel audio cables in budget cases often lack adequate shielding. Rerouting the audio cable away from high-amperage PCIe power cables eliminates induced EMI noise.',
        hint: 'Audio cables routed near high-power graphics cables pick up electromagnetic noise.'
      },
      {
        title: 'Case Study 4: Uneven CPU Cooler Mounting Pressure',
        scenario: 'After installing an aftermarket dual-tower CPU cooler, the computer will not detect RAM in Channel B (slots B1 and B2). When the cooler mounting screws are loosened slightly, all 16 GB is detected normally.',
        options: [
          'Uneven or excessive cooler mounting pressure bent the motherboard socket pins slightly, losing contact with the CPU memory controller bus',
          'The CPU fan was spinning backwards',
          'The thermal paste needed 24 hours to cure',
          'The RAM sticks were installed upside down'
        ],
        correctIndex: 0,
        explanation: 'LGA sockets rely on hundreds of spring contact pins. Excessive or uneven torque on cooler screws can flex the socket and PCB, causing pin detachment from the CPU memory channel contacts.',
        hint: 'What happens when heatsink screws are tightened unevenly across an LGA socket?'
      },
      {
        title: 'Case Study 5: BIOS Flash Power Interruption',
        scenario: 'During a firmware update, power flickered in the building and the PC shut down mid-flash. Upon reboot, the motherboard displays a black screen and will not POST. How can this be recovered on a modern motherboard?',
        options: [
          'Use the motherboard USB BIOS Flashback button with a formatted USB drive containing the renamed BIOS ROM file',
          'Throw the entire computer into the trash',
          'Press the spacebar 50 times quickly',
          'Install an older version of Windows'
        ],
        correctIndex: 0,
        explanation: 'USB BIOS Flashback utilizes an independent dedicated micro-controller on the motherboard that can read a BIOS file from USB and reflash the EEPROM without requiring CPU, RAM, or POST.',
        hint: 'What emergency hardware feature allows flashing BIOS without CPU or display?'
      },
      {
        title: 'Case Study 6: Mismatched RAM Timings and Voltages',
        scenario: 'A technician mixes two RAM sticks from different manufacturers: one rated DDR4-2666 at 1.2V and another rated DDR4-3200 at 1.35V. The system crashes randomly during heavy multitasking.',
        options: [
          'The motherboard is struggling with incompatible SPD timings; set memory clock manually to the lowest common speed (2666 MHz) with conservative timings',
          'Force both sticks to run at 4000 MHz',
          'Remove the CPU heatsink',
          'Replace the computer casing'
        ],
        correctIndex: 0,
        explanation: 'Mixing RAM with different JEDEC/XMP profiles requires the memory controller to run at the lowest common denominator speed and voltage to maintain stability.',
        hint: 'When mixing different memory sticks, the system must run at the speed of the slowest stick.'
      },
      {
        title: 'Case Study 7: PCIe Lane Sharing & Missing Secondary SSD',
        scenario: 'A student installs a secondary M.2 SATA SSD into slot M2_2. Afterwards, the SATA hard drive connected to SATA port 5 disappears completely from Windows.',
        options: [
          'Motherboard PCIe/SATA lane sharing: using slot M2_2 automatically disables SATA ports 5 and 6 as documented in the manual',
          'The hard drive suffered an electromagnetic pulse',
          'The SSD absorbed all the data from the hard drive',
          'SATA cables can only transmit data for 30 minutes'
        ],
        correctIndex: 0,
        explanation: 'Chipsets have finite HSIO lanes. Motherboard manufacturers frequently share bandwidth between secondary M.2 slots and SATA ports; consulting the manual reveals port multiplexing rules.',
        hint: 'Check the motherboard manual for lane sharing between M.2 slots and SATA ports.'
      },
      {
        title: 'Case Study 8: System Shuts Down Only During GPU Gaming',
        scenario: 'A computer runs office tasks and web browsing flawlessly for hours, but instantly cuts power completely (clicking off) within 5 seconds of launching an intense 3D benchmark.',
        options: [
          'The power supply has insufficient wattage or its Over-Current Protection (OCP) is tripped by transient GPU power spikes',
          'The computer monitor resolution is too high',
          'The wireless keyboard battery is low',
          'The operating system license has expired'
        ],
        correctIndex: 0,
        explanation: 'Instant complete power loss under heavy 3D load without a BSOD indicates power supply protection circuits (OCP/OPP) triggered due to high transient current draw on the +12V rail.',
        hint: 'What safety protection trips in a power supply when a graphics card draws more power than available?'
      },
      {
        title: 'Case Study 9: Counterfeit / Dried Thermal Paste Degradation',
        scenario: 'A workstation that previously operated at 45°C idle and 75°C load now hits 95°C at idle after 6 months. Upon removing the cooler, the thermal compound is hardened like chalk and flaking off.',
        options: [
          'Cheap or counterfeit thermal paste pump-out and dry-out: clean with 99% IPA and apply high-quality carbon/metal-oxide compound',
          'The CPU internal cache has evaporated',
          'The copper heatsink has turned into iron',
          'The operating system has too many desktop icons'
        ],
        correctIndex: 0,
        explanation: 'Low-quality silicon-based thermal grease dries out rapidly under thermal cycles. Cleaning thoroughly with IPA and reapplying high-durability thermal compound restores thermal transfer.',
        hint: 'What happens to low-grade thermal paste after months of high heat?'
      },
      {
        title: 'Case Study 10: Intermittent USB Device Dropouts',
        scenario: 'A technician notices USB keyboards and mice intermittently disconnect and reconnect every few minutes under heavy load on an AMD AM4 motherboard. How was this widely resolved?',
        options: [
          'Updating the motherboard UEFI to the latest AGESA firmware update that resolved PCIe Gen 4 / USB interoperability drops',
          'Cutting the USB cord with scissors',
          'Replacing all USB ports with PS/2 adapters',
          'Uninstalling all web browsers'
        ],
        correctIndex: 0,
        explanation: 'A known USB drop-out issue on certain chipset revisions was resolved by motherboard vendors through AGESA microcode updates in BIOS, stabilizing power and bus timing on PCIe/USB controllers.',
        hint: 'Which motherboard firmware update resolves chipset compatibility bugs?'
      }
    ]
  },

  // =========================================================================
  // ACTIVITY 8: COMPREHENSIVE CERTIFICATION QUIZ (10 QUESTIONS)
  // =========================================================================
  {
    id: 'act-lesson-8',
    name: 'Final Assessment: Comprehensive Certification Quiz',
    type: 'Summative Assessment Quiz',
    iconName: 'HelpCircle',
    lessonBadge: 'Summative Quiz',
    description: 'Comprehensive multiple-choice assessment covering all lessons from preparation and installation to configuration, troubleshooting, and testing.',
    totalItems: 10,
    items: [
      {
        title: 'Question 1: Thermal Conduction Interface',
        scenario: 'What is the primary technical function of thermal paste between the CPU integrated heat spreader (IHS) and the heatsink base?',
        options: [
          'To fill microscopic air gaps between the metal surfaces for optimal heat conduction',
          'To glue the CPU permanently to the motherboard so it cannot fall out',
          'To insulate the CPU electrically so voltage cannot escape into the cooler',
          'To provide a pleasant scent inside the computer case'
        ],
        correctIndex: 0,
        explanation: 'Air is an extremely poor conductor of heat (thermal insulator). Thermal compound fills microscopic imperfections between the CPU heat spreader and copper cooler base.',
        hint: 'Think about microscopic roughness on metal surfaces and how air pockets block heat transfer.'
      },
      {
        title: 'Question 2: Electrostatic Discharge Safety',
        scenario: 'Which device is used to safely ground a technician and prevent electrostatic discharge (ESD) during sensitive motherboard handling?',
        options: [
          'Anti-static wrist strap with alligator clip attached to chassis ground',
          'Rubber dishwashing gloves',
          'Cotton gardening gloves',
          'Plastic apron'
        ],
        correctIndex: 0,
        explanation: 'An anti-static wrist strap contains a 1-megaohm resistor and grounding cord that safely drains static electricity from the technician to the grounded chassis metal.',
        hint: 'What personal safety device attaches to your wrist and clips to unpainted chassis metal?'
      },
      {
        title: 'Question 3: Firmware POST Routine',
        scenario: 'What does the acronym POST stand for in computer startup terminology?',
        options: [
          'Power-On Self-Test',
          'Primary Operating System Transfer',
          'Programmable Output System Terminal',
          'Peripheral Operation Standard Timing'
        ],
        correctIndex: 0,
        explanation: 'POST stands for Power-On Self-Test, the built-in diagnostic routine performed by the BIOS/UEFI firmware immediately upon receiving power.',
        hint: 'P-O-S-T: The self-test conducted immediately when power is turned on.'
      },
      {
        title: 'Question 4: High-Performance Storage Bus',
        scenario: 'Which storage connection interface protocol provides the highest data transfer bandwidth for modern M.2 solid-state drives?',
        options: [
          'PCIe NVMe (Non-Volatile Memory Express)',
          'SATA III (6 Gbps)',
          'IDE / PATA ribbon cable',
          'Floppy Disk Controller'
        ],
        correctIndex: 0,
        explanation: 'NVMe utilizes direct PCI Express lanes (PCIe 4.0/5.0), reaching speeds over 7,000 MB/s, compared to legacy SATA III which caps out at ~550 MB/s.',
        hint: 'Which protocol communicates directly over PCI Express lanes rather than SATA cables?'
      },
      {
        title: 'Question 5: Fundamental Troubleshooting First Step',
        scenario: 'If a computer does not power on at all, what is the very first logical step in the troubleshooting sequence?',
        options: [
          'Verify the power cable is firmly connected and the PSU rocker switch is set to "I" (On)',
          'Immediately purchase a new processor and motherboard',
          'Format the primary storage drive using command prompt',
          'Desolder the BIOS chip from the motherboard'
        ],
        correctIndex: 0,
        explanation: 'In the CompTIA diagnostic model, always "question the obvious" first: check power plugs, wall outlets, surge protectors, and the PSU power toggle switch before disassembling hardware.',
        hint: 'Always check the simplest, most obvious power source connections first.'
      },
      {
        title: 'Question 6: CPU Architecture and Socket Types',
        scenario: 'In an LGA (Land Grid Array) socket, where are the delicate electrical contact pins physically located?',
        options: [
          'On the motherboard socket itself, resting against gold contact pads on the processor underside',
          'On the processor package, protruding into holes in the motherboard',
          'Inside the power supply cable connector',
          'Inside the system memory slots'
        ],
        correctIndex: 0,
        explanation: 'In LGA sockets (used by modern Intel and AMD AM5 platforms), the fragile spring pins are housed on the motherboard socket, while the processor package features flat contact pads.',
        hint: 'LGA stands for Land Grid Array, where the pins live on the motherboard.'
      },
      {
        title: 'Question 7: Dual-Channel Memory Bandwidth',
        scenario: 'What is the primary architectural benefit of installing identical RAM modules in matched dual-channel slots (e.g. A2 and B2)?',
        options: [
          'It doubles the memory bus communication width from 64-bit to 128-bit, doubling theoretical data transfer throughput',
          'It halves the power consumption of the monitor',
          'It converts DDR4 memory into DDR5 memory automatically',
          'It eliminates the need for an operating system storage drive'
        ],
        correctIndex: 0,
        explanation: 'Dual-channel memory allows the memory controller to read and write across two independent 64-bit channels simultaneously, effectively doubling memory bandwidth to 128 bits.',
        hint: 'Two channels working simultaneously double the data path width.'
      },
      {
        title: 'Question 8: Power Supply Efficiency Ratings',
        scenario: 'What does an "80 PLUS Gold" certification on an ATX computer power supply indicate?',
        options: [
          'The power supply operates at 87% to 92% electrical efficiency under typical loads, reducing wasted heat and power draw',
          'The power supply is constructed from solid 24-karat gold metal',
          'The power supply will last for exactly 80 years',
          'The power supply only outputs 80 Watts maximum'
        ],
        correctIndex: 0,
        explanation: '80 PLUS certifications evaluate AC-to-DC conversion efficiency. An 80 PLUS Gold rating guarantees 87-90% efficiency at 20%, 50%, and 100% rated load.',
        hint: '80 PLUS measures how efficiently AC wall electricity is converted into DC computer power.'
      },
      {
        title: 'Question 9: Blue Screen of Death Dump Analysis',
        scenario: 'When a computer experiences a Blue Screen crash in Windows, which memory dump file provides detailed debugging information for crash analysis?',
        options: [
          'MEMORY.DMP or Minidump (.dmp files in C:\\Windows\\Minidump)',
          'pagefile.sys',
          'explorer.exe',
          'hosts.txt in system32'
        ],
        correctIndex: 0,
        explanation: 'Windows writes kernel memory contents to a Minidump or full MEMORY.DMP file upon crashing, which can be analyzed with WinDbg to pinpoint the exact offending driver or hardware fault.',
        hint: 'What type of crash dump file has the .dmp extension?'
      },
      {
        title: 'Question 10: Final Quality Inspection Protocol',
        scenario: 'Before handing over a freshly serviced or assembled computer to an end user, what final verification step is mandatory?',
        options: [
          'Complete all hardware diagnostic stress tests, verify cable clearances around fan blades, ensure all panel screws are secured, and document the intervention',
          'Leave the side panel off so the user can see the lights',
          'Delete the operating system recovery partition',
          'Disconnect the CPU cooler fan'
        ],
        correctIndex: 0,
        explanation: 'Final inspection confirms the physical build integrity, verifies that cables cannot hit rotating fan blades, completes stress testing, and documents the completed work.',
        hint: 'What thorough steps ensure both physical and operational quality before delivery?'
      }
    ]
  }
];
