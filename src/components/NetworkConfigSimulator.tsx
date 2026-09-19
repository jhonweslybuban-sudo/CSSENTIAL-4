import React, { useState } from 'react';
import {
  ArrowLeft,
  Network,
  Terminal,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Award,
  ChevronRight,
  Info,
  Layers,
  Cable,
  Globe,
  Server,
  Laptop,
  Wifi,
  Radio,
  Play,
  Check
} from 'lucide-react';
import { api } from '../services/api';

interface NetworkConfigSimulatorProps {
  studentId: string;
  sessionId: string;
  onBack: () => void;
}

type TabMode = 'ADAPTER_GUI' | 'CLI_TERMINAL' | 'CABLING_PINOUT';

export const NetworkConfigSimulator: React.FC<NetworkConfigSimulatorProps> = ({
  studentId,
  sessionId,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<TabMode>('ADAPTER_GUI');

  // Adapter GUI State
  const [ipMode, setIpMode] = useState<'DHCP' | 'STATIC'>('STATIC');
  const [dnsMode, setDnsMode] = useState<'DHCP' | 'STATIC'>('STATIC');
  const [ipAddress, setIpAddress] = useState('192.168.1.50');
  const [subnetMask, setSubnetMask] = useState('255.255.255.0');
  const [defaultGateway, setDefaultGateway] = useState('192.168.1.1');
  const [primaryDns, setPrimaryDns] = useState('8.8.8.8');
  const [secondaryDns, setSecondaryDns] = useState('1.1.1.1');
  const [connectionStatus, setConnectionStatus] = useState<'CONNECTED' | 'DISCONNECTED' | 'LIMITED'>('CONNECTED');
  const [validationResult, setValidationResult] = useState<string | null>(null);

  // CLI Terminal State
  const [commandInput, setCommandInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<Array<{ command: string; output: string[] }>>([
    {
      command: 'system-init',
      output: [
        'Microsoft Windows [Version 10.0.22631.3296]',
        '(c) Microsoft Corporation. All rights reserved.',
        '',
        'CSSENTIAL Network Diagnostic Environment Initialized.',
        'Type "help" to see available commands (e.g., ipconfig, ping, tracert, nslookup, netstat).'
      ]
    }
  ]);

  // Cabling State
  const [cablingStandard, setCablingStandard] = useState<'T568B' | 'T568A'>('T568B');
  const [cableTesterActive, setCableTesterActive] = useState(false);
  const [testerLedIndex, setTesterLedIndex] = useState(0);

  // Run Cable Tester Animation
  const runCableTester = () => {
    setCableTesterActive(true);
    setTesterLedIndex(1);
    let current = 1;
    const interval = setInterval(() => {
      current++;
      if (current > 8) {
        clearInterval(interval);
        setCableTesterActive(false);
        setTesterLedIndex(8);
      } else {
        setTesterLedIndex(current);
      }
    }, 250);
  };

  // Validate Subnet Math
  const handleApplyNetworkConfig = () => {
    if (ipMode === 'DHCP') {
      setIpAddress('192.168.1.142');
      setSubnetMask('255.255.255.0');
      setDefaultGateway('192.168.1.1');
      setPrimaryDns('192.168.1.1');
      setSecondaryDns('8.8.8.8');
      setConnectionStatus('CONNECTED');
      setValidationResult('DHCP Lease successfully obtained from Gateway router (192.168.1.1). Internet status: Online (1 Gbps Full Duplex).');
      return;
    }

    // Basic IP validation
    const ipParts = ipAddress.split('.').map(Number);
    const gwParts = defaultGateway.split('.').map(Number);

    if (ipParts.length !== 4 || ipParts.some(p => isNaN(p) || p < 0 || p > 255)) {
      setValidationResult('Error: Invalid IPv4 Address format.');
      setConnectionStatus('DISCONNECTED');
      return;
    }

    if (gwParts.length !== 4 || gwParts.some(p => isNaN(p) || p < 0 || p > 255)) {
      setValidationResult('Error: Invalid Default Gateway format.');
      setConnectionStatus('DISCONNECTED');
      return;
    }

    // Subnet matching (for /24)
    if (subnetMask === '255.255.255.0') {
      if (ipParts[0] !== gwParts[0] || ipParts[1] !== gwParts[1] || ipParts[2] !== gwParts[2]) {
        setValidationResult('Warning: IP Address and Default Gateway are on different subnets! Local packets cannot route to the internet.');
        setConnectionStatus('LIMITED');
        return;
      }
    }

    setConnectionStatus('CONNECTED');
    setValidationResult('Network configuration valid! Verified routing to Default Gateway (192.168.1.1) and Public DNS (8.8.8.8).');

    api.logAction(studentId, sessionId, `Configured IPv4 Address: ${ipAddress}, Gateway: ${defaultGateway}`);
    api.saveGameResult({
      student_id: studentId,
      session_id: sessionId,
      game_name: 'Network Configuration Simulator',
      start_time: new Date(Date.now() - 120000).toISOString(),
      end_time: new Date().toISOString(),
      duration_seconds: 120,
      score: 100,
      level: 1,
      completed: true,
      extra_stats: { ipAddress, defaultGateway, subnetMask }
    });
  };

  // Command Execution
  const executeCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    let output: string[] = [];
    const parts = trimmed.split(' ');
    const main = parts[0].toLowerCase();

    if (main === 'help') {
      output = [
        'Supported Network Diagnostic Commands:',
        '  ipconfig           Display current IP address, subnet mask, and default gateway',
        '  ipconfig /all      Display detailed adapter information including MAC address & DNS',
        '  ipconfig /release  Release current DHCP lease',
        '  ipconfig /renew    Request new DHCP configuration from router',
        '  ipconfig /flushdns Clear the DNS resolver cache',
        '  ping <target>      Test ICMP packet connectivity (e.g., ping 192.168.1.1, ping 8.8.8.8)',
        '  tracert <target>   Trace packet route hops to destination',
        '  nslookup <domain>  Query DNS server for domain IP records (e.g., nslookup google.com)',
        '  netstat -ano       Display active TCP/UDP connections and listening ports',
        '  cls                Clear the command prompt terminal screen'
      ];
    } else if (main === 'cls' || main === 'clear') {
      setTerminalHistory([]);
      setCommandInput('');
      return;
    } else if (main === 'ipconfig') {
      const isAll = parts[1] && parts[1].toLowerCase() === '/all';
      const isFlush = parts[1] && parts[1].toLowerCase() === '/flushdns';
      const isRelease = parts[1] && parts[1].toLowerCase() === '/release';
      const isRenew = parts[1] && parts[1].toLowerCase() === '/renew';

      if (isFlush) {
        output = [
          'Windows IP Configuration',
          '',
          'Successfully flushed the DNS Resolver Cache.'
        ];
      } else if (isRelease) {
        output = [
          'Windows IP Configuration',
          '',
          'Ethernet adapter Ethernet 1:',
          '   Connection-specific DNS Suffix  . : localdomain',
          '   IPv4 Address. . . . . . . . . . . : 0.0.0.0',
          '   Subnet Mask . . . . . . . . . . . : 0.0.0.0',
          '   Default Gateway . . . . . . . . . : '
        ];
      } else if (isRenew) {
        output = [
          'Windows IP Configuration',
          '',
          'Ethernet adapter Ethernet 1:',
          '   Connection-specific DNS Suffix  . : localdomain',
          '   IPv4 Address. . . . . . . . . . . : 192.168.1.142',
          '   Subnet Mask . . . . . . . . . . . : 255.255.255.0',
          '   Default Gateway . . . . . . . . . : 192.168.1.1'
        ];
      } else if (isAll) {
        output = [
          'Windows IP Configuration',
          '',
          '   Host Name . . . . . . . . . . . . : CSSENTIAL-LAB-PC',
          '   Primary Dns Suffix  . . . . . . . : cssential.local',
          '   Node Type . . . . . . . . . . . . : Hybrid',
          '   IP Routing Enabled. . . . . . . . : No',
          '   WINS Proxy Enabled. . . . . . . . : No',
          '',
          'Ethernet adapter Ethernet 1:',
          '   Connection-specific DNS Suffix  . : localdomain',
          '   Description . . . . . . . . . . . : Intel(R) Ethernet Controller I225-V (2.5 Gbps)',
          '   Physical Address. . . . . . . . . : 00-1B-44-11-3A-B7',
          `   DHCP Enabled. . . . . . . . . . . : ${ipMode === 'DHCP' ? 'Yes' : 'No'}`,
          '   Autoconfiguration Enabled . . . . : Yes',
          `   IPv4 Address. . . . . . . . . . . : ${ipAddress}(Preferred)`,
          `   Subnet Mask . . . . . . . . . . . : ${subnetMask}`,
          `   Default Gateway . . . . . . . . . : ${defaultGateway}`,
          `   DNS Servers . . . . . . . . . . . : ${primaryDns}`,
          `                                       ${secondaryDns}`,
          '   NetBIOS over Tcpip. . . . . . . . : Enabled'
        ];
      } else {
        output = [
          'Windows IP Configuration',
          '',
          'Ethernet adapter Ethernet 1:',
          '   Connection-specific DNS Suffix  . : localdomain',
          `   IPv4 Address. . . . . . . . . . . : ${ipAddress}`,
          `   Subnet Mask . . . . . . . . . . . : ${subnetMask}`,
          `   Default Gateway . . . . . . . . . : ${defaultGateway}`
        ];
      }
    } else if (main === 'ping') {
      const target = parts[1] || '127.0.0.1';
      if (connectionStatus === 'DISCONNECTED') {
        output = [
          `Pinging ${target} with 32 bytes of data:`,
          'Destination host unreachable.',
          'Destination host unreachable.',
          'Destination host unreachable.',
          'Destination host unreachable.',
          '',
          `Ping statistics for ${target}:`,
          '    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss)'
        ];
      } else {
        output = [
          `Pinging ${target} with 32 bytes of data:`,
          `Reply from ${target}: bytes=32 time=2ms TTL=128`,
          `Reply from ${target}: bytes=32 time=1ms TTL=128`,
          `Reply from ${target}: bytes=32 time=2ms TTL=128`,
          `Reply from ${target}: bytes=32 time=1ms TTL=128`,
          '',
          `Ping statistics for ${target}:`,
          '    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),',
          'Approximate round trip times in milli-seconds:',
          '    Minimum = 1ms, Maximum = 2ms, Average = 1ms'
        ];
      }
    } else if (main === 'tracert') {
      const target = parts[1] || '8.8.8.8';
      output = [
        `Tracing route to ${target} over a maximum of 30 hops:`,
        '',
        `  1     1 ms     1 ms     1 ms  ${defaultGateway} (Local Gateway Router)`,
        '  2     9 ms     8 ms     8 ms  10.240.0.1 (ISP Aggregation Gateway)',
        '  3    12 ms    11 ms    11 ms  172.16.88.1 (Metro Fiber Backbone)',
        `  4    14 ms    13 ms    13 ms  ${target} (Destination reached)`,
        '',
        'Trace complete.'
      ];
    } else if (main === 'nslookup') {
      const domain = parts[1] || 'google.com';
      output = [
        `Server:  ${primaryDns}`,
        `Address:  ${primaryDns}#53`,
        '',
        'Non-authoritative answer:',
        `Name:    ${domain}`,
        'Addresses:  142.250.190.46',
        '          2607:f8b0:4005:805::200e'
      ];
    } else if (main === 'netstat') {
      output = [
        'Active Connections',
        '',
        '  Proto  Local Address          Foreign Address        State           PID',
        '  TCP    0.0.0.0:135            0.0.0.0:0              LISTENING       844',
        '  TCP    0.0.0.0:445            0.0.0.0:0              LISTENING       4',
        `  TCP    ${ipAddress}:52341     142.250.190.46:443     ESTABLISHED     3412`,
        `  TCP    ${ipAddress}:52342     52.96.166.130:443      ESTABLISHED     5104`,
        '  UDP    0.0.0.0:5353           *:*                                    2188'
      ];
    } else {
      output = [
        `'${cmd}' is not recognized as an internal or external command,`,
        'operable program or batch file. Type "help" for a list of available commands.'
      ];
    }

    setTerminalHistory(prev => [...prev, { command: cmd, output }]);
    setCommandInput('');
  };

  // Wire Color Map for T568B & T568A
  const t568bPinout = [
    { pin: 1, name: 'White / Orange stripe', color: '#ea580c', stripe: true, function: 'TX+ (Transmit Data Positive)' },
    { pin: 2, name: 'Solid Orange', color: '#ea580c', stripe: false, function: 'TX- (Transmit Data Negative)' },
    { pin: 3, name: 'White / Green stripe', color: '#16a34a', stripe: true, function: 'RX+ (Receive Data Positive)' },
    { pin: 4, name: 'Solid Blue', color: '#2563eb', stripe: false, function: 'Unused / Gigabit 4-5+' },
    { pin: 5, name: 'White / Blue stripe', color: '#2563eb', stripe: true, function: 'Unused / Gigabit 4-5-' },
    { pin: 6, name: 'Solid Green', color: '#16a34a', stripe: false, function: 'RX- (Receive Data Negative)' },
    { pin: 7, name: 'White / Brown stripe', color: '#78350f', stripe: true, function: 'Unused / Gigabit 7-8+' },
    { pin: 8, name: 'Solid Brown', color: '#78350f', stripe: false, function: 'Unused / Gigabit 7-8-' }
  ];

  const t568aPinout = [
    { pin: 1, name: 'White / Green stripe', color: '#16a34a', stripe: true, function: 'RX+ (Receive Data Positive)' },
    { pin: 2, name: 'Solid Green', color: '#16a34a', stripe: false, function: 'RX- (Receive Data Negative)' },
    { pin: 3, name: 'White / Orange stripe', color: '#ea580c', stripe: true, function: 'TX+ (Transmit Data Positive)' },
    { pin: 4, name: 'Solid Blue', color: '#2563eb', stripe: false, function: 'Unused / Gigabit 4-5+' },
    { pin: 5, name: 'White / Blue stripe', color: '#2563eb', stripe: true, function: 'Unused / Gigabit 4-5-' },
    { pin: 6, name: 'Solid Orange', color: '#ea580c', stripe: false, function: 'TX- (Transmit Data Negative)' },
    { pin: 7, name: 'White / Brown stripe', color: '#78350f', stripe: true, function: 'Unused / Gigabit 7-8+' },
    { pin: 8, name: 'Solid Brown', color: '#78350f', stripe: false, function: 'Unused / Gigabit 7-8-' }
  ];

  const currentPins = cablingStandard === 'T568B' ? t568bPinout : t568aPinout;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[750px] animate-in fade-in duration-300">
      
      {/* Header Bar */}
      <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Back to Games & Simulators Hub"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-wide text-white">
                Network Configuration &amp; Troubleshooting Simulator
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full">
                Item #12 Practice
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive IPv4 TCP/IP configuration, command prompt diagnostics (ping, ipconfig, tracert), and RJ45 crimping standards.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setActiveTab('ADAPTER_GUI')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              activeTab === 'ADAPTER_GUI'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            Adapter IPv4 GUI (ncpa.cpl)
          </button>
          <button
            onClick={() => setActiveTab('CLI_TERMINAL')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              activeTab === 'CLI_TERMINAL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            CLI Diagnostics Terminal
          </button>
          <button
            onClick={() => setActiveTab('CABLING_PINOUT')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              activeTab === 'CABLING_PINOUT'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            RJ45 Cabling (T568A / T568B)
          </button>
        </div>
      </div>

      {/* TAB 1: ADAPTER IPV4 PROPERTIES GUI */}
      {activeTab === 'ADAPTER_GUI' && (
        <div className="p-4 sm:p-6 bg-slate-100 flex-1 flex flex-col items-center justify-center">
          
          {/* Windows Dialog Chrome Box */}
          <div className="w-full max-w-lg bg-white border border-gray-400 rounded shadow-xl overflow-hidden text-xs text-gray-800 font-sans">
            
            {/* Title bar */}
            <div className="bg-gray-100 px-3 py-2 border-b border-gray-300 flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-gray-700">
                <Network className="w-3.5 h-3.5 text-blue-600" />
                <span>Internet Protocol Version 4 (TCP/IPv4) Properties</span>
              </div>
              <button className="text-gray-400 hover:text-gray-700 px-1 font-bold">✕</button>
            </div>

            {/* Dialog Body */}
            <div className="p-4 space-y-4">
              <p className="text-[11px] text-gray-600">
                You can get IP settings assigned automatically if your network supports this capability. Otherwise, you need to ask your network administrator for the appropriate IP settings.
              </p>

              {/* IP Selection Radio */}
              <div className="space-y-2 border-b border-gray-200 pb-3">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="ip-dhcp"
                    name="ip-type"
                    checked={ipMode === 'DHCP'}
                    onChange={() => setIpMode('DHCP')}
                    className="cursor-pointer"
                  />
                  <label htmlFor="ip-dhcp" className="font-semibold cursor-pointer">
                    Obtain an IP address automatically (DHCP)
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="ip-static"
                    name="ip-type"
                    checked={ipMode === 'STATIC'}
                    onChange={() => setIpMode('STATIC')}
                    className="cursor-pointer"
                  />
                  <label htmlFor="ip-static" className="font-semibold cursor-pointer">
                    Use the following IP address:
                  </label>
                </div>

                {/* Static IP Inputs */}
                <div className="pl-6 space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className={ipMode === 'STATIC' ? 'text-gray-800' : 'text-gray-400'}>IP address:</span>
                    <input
                      type="text"
                      disabled={ipMode !== 'STATIC'}
                      value={ipAddress}
                      onChange={(e) => setIpAddress(e.target.value)}
                      className="w-48 px-2 py-1 border border-gray-300 rounded font-mono text-xs disabled:bg-gray-100 disabled:text-gray-400"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={ipMode === 'STATIC' ? 'text-gray-800' : 'text-gray-400'}>Subnet mask:</span>
                    <input
                      type="text"
                      disabled={ipMode !== 'STATIC'}
                      value={subnetMask}
                      onChange={(e) => setSubnetMask(e.target.value)}
                      className="w-48 px-2 py-1 border border-gray-300 rounded font-mono text-xs disabled:bg-gray-100 disabled:text-gray-400"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={ipMode === 'STATIC' ? 'text-gray-800' : 'text-gray-400'}>Default gateway:</span>
                    <input
                      type="text"
                      disabled={ipMode !== 'STATIC'}
                      value={defaultGateway}
                      onChange={(e) => setDefaultGateway(e.target.value)}
                      className="w-48 px-2 py-1 border border-gray-300 rounded font-mono text-xs disabled:bg-gray-100 disabled:text-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* DNS Radio */}
              <div className="space-y-2 border-b border-gray-200 pb-3">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="dns-dhcp"
                    name="dns-type"
                    checked={dnsMode === 'DHCP'}
                    onChange={() => setDnsMode('DHCP')}
                    className="cursor-pointer"
                  />
                  <label htmlFor="dns-dhcp" className="font-semibold cursor-pointer">
                    Obtain DNS server address automatically
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="dns-static"
                    name="dns-type"
                    checked={dnsMode === 'STATIC'}
                    onChange={() => setDnsMode('STATIC')}
                    className="cursor-pointer"
                  />
                  <label htmlFor="dns-static" className="font-semibold cursor-pointer">
                    Use the following DNS server addresses:
                  </label>
                </div>

                <div className="pl-6 space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className={dnsMode === 'STATIC' ? 'text-gray-800' : 'text-gray-400'}>Preferred DNS server:</span>
                    <input
                      type="text"
                      disabled={dnsMode !== 'STATIC'}
                      value={primaryDns}
                      onChange={(e) => setPrimaryDns(e.target.value)}
                      className="w-48 px-2 py-1 border border-gray-300 rounded font-mono text-xs disabled:bg-gray-100 disabled:text-gray-400"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={dnsMode === 'STATIC' ? 'text-gray-800' : 'text-gray-400'}>Alternate DNS server:</span>
                    <input
                      type="text"
                      disabled={dnsMode !== 'STATIC'}
                      value={secondaryDns}
                      onChange={(e) => setSecondaryDns(e.target.value)}
                      className="w-48 px-2 py-1 border border-gray-300 rounded font-mono text-xs disabled:bg-gray-100 disabled:text-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Status Indicator */}
              {validationResult && (
                <div className={`p-2.5 rounded text-xs leading-relaxed ${
                  connectionStatus === 'CONNECTED'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                    : connectionStatus === 'LIMITED'
                    ? 'bg-amber-50 text-amber-900 border border-amber-300'
                    : 'bg-red-50 text-red-900 border border-red-300'
                }`}>
                  {validationResult}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={handleApplyNetworkConfig}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold cursor-pointer shadow-xs"
                >
                  OK (Apply Settings)
                </button>
                <button
                  onClick={() => {
                    setIpAddress('192.168.1.50');
                    setDefaultGateway('192.168.1.1');
                    setSubnetMask('255.255.255.0');
                    setPrimaryDns('8.8.8.8');
                    setSecondaryDns('1.1.1.1');
                    setValidationResult(null);
                  }}
                  className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-bold cursor-pointer"
                >
                  Cancel / Reset
                </button>
              </div>

            </div>
          </div>

          <p className="text-xs text-gray-500 mt-4 text-center max-w-md">
            Technician Tip: Apply settings, then switch to the <strong>CLI Diagnostics Terminal</strong> tab to test routing with <code>ping 192.168.1.1</code> or view full adapter parameters with <code>ipconfig /all</code>.
          </p>

        </div>
      )}

      {/* TAB 2: CLI DIAGNOSTICS TERMINAL */}
      {activeTab === 'CLI_TERMINAL' && (
        <div className="flex-1 bg-black text-emerald-400 font-mono p-4 flex flex-col text-xs sm:text-sm">
          
          {/* Output log */}
          <div className="flex-1 overflow-y-auto space-y-2 mb-3">
            {terminalHistory.map((item, idx) => (
              <div key={idx} className="space-y-1">
                {item.command !== 'system-init' && (
                  <div className="text-slate-300 flex items-center gap-1 font-bold">
                    <span className="text-blue-400">C:\Users\StudentTechnician&gt;</span>
                    <span>{item.command}</span>
                  </div>
                )}
                {item.output.map((line, lIdx) => (
                  <div key={lIdx} className="text-emerald-300 whitespace-pre-wrap">
                    {line}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Quick command suggestion pills */}
          <div className="flex flex-wrap items-center gap-2 py-2 border-t border-slate-800 text-xs">
            <span className="text-slate-400 font-sans">Quick Commands:</span>
            {['ipconfig', 'ipconfig /all', 'ping 192.168.1.1', 'ping 8.8.8.8', 'tracert 8.8.8.8', 'nslookup google.com', 'ipconfig /flushdns', 'help'].map((cmd) => (
              <button
                key={cmd}
                onClick={() => executeCommand(cmd)}
                className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-slate-300 hover:text-emerald-300 cursor-pointer font-mono"
              >
                {cmd}
              </button>
            ))}
          </div>

          {/* Prompt input row */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              executeCommand(commandInput);
            }}
            className="flex items-center gap-2 pt-2 border-t border-slate-800"
          >
            <span className="text-blue-400 font-bold shrink-0">C:\Users\StudentTechnician&gt;</span>
            <input
              type="text"
              autoFocus
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="Type diagnostic command (e.g. ipconfig /all or ping 192.168.1.1)..."
              className="flex-1 bg-transparent text-emerald-300 border-none outline-none font-mono text-xs sm:text-sm focus:ring-0"
            />
            <button
              type="submit"
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-black font-bold rounded text-xs cursor-pointer"
            >
              Send
            </button>
          </form>

        </div>
      )}

      {/* TAB 3: RJ45 CABLING & COLOR PINOUT GUIDE */}
      {activeTab === 'CABLING_PINOUT' && (
        <div className="p-4 sm:p-6 bg-slate-50 text-slate-900 space-y-6">
          <div className="border-b border-gray-200 pb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
                <Cable className="w-5 h-5 text-blue-700" />
                <span>Twisted-Pair RJ45 Ethernet Standards (TIA/EIA-568)</span>
              </h2>
              <p className="text-xs text-gray-600 mt-0.5">
                Standard wire color codes for Category 5e/6/6A 8P8C modular connectors and crimping protocols.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCablingStandard('T568B')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  cablingStandard === 'T568B'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white border border-gray-300 text-gray-700'
                }`}
              >
                T568B (Standard Modern)
              </button>
              <button
                onClick={() => setCablingStandard('T568A')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  cablingStandard === 'T568A'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white border border-gray-300 text-gray-700'
                }`}
              >
                T568A (Alternative Standard)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Visual Pinout diagram */}
            <div className="lg:col-span-7 bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">
                  {cablingStandard} Modular Connector Pin Order (Clip Facing Downward)
                </h3>
                <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  Pins 1 through 8 (Left to Right)
                </span>
              </div>

              {/* Wire Strip Graphic */}
              <div className="space-y-2">
                {currentPins.map((wire) => (
                  <div
                    key={wire.pin}
                    className="flex items-center gap-3 p-2 rounded-lg border border-gray-200 hover:bg-slate-50 transition-colors"
                  >
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {wire.pin}
                    </span>

                    {/* Visual Wire bar */}
                    <div
                      className="w-16 h-4 rounded shrink-0 border border-gray-400 shadow-inner"
                      style={{
                        backgroundColor: wire.color,
                        backgroundImage: wire.stripe ? `repeating-linear-gradient(45deg, #ffffff, #ffffff 4px, ${wire.color} 4px, ${wire.color} 8px)` : 'none'
                      }}
                    ></div>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-gray-900">{wire.name}</div>
                      <div className="text-[11px] text-gray-500 font-mono">{wire.function}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cable Tester Simulator */}
              <div className="p-4 bg-slate-900 rounded-xl text-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold">RJ45 Continuity Cable Tester</span>
                  </div>
                  <button
                    onClick={runCableTester}
                    disabled={cableTesterActive}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded text-xs font-bold cursor-pointer"
                  >
                    {cableTesterActive ? 'Testing Pairs...' : 'Run Test Scan'}
                  </button>
                </div>

                {/* 8 LED Indicator Lights */}
                <div className="grid grid-cols-8 gap-2 pt-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <div key={num} className="text-center">
                      <div
                        className={`w-7 h-7 mx-auto rounded-full border flex items-center justify-center text-xs font-bold transition-all ${
                          testerLedIndex >= num
                            ? 'bg-emerald-500 border-emerald-300 text-black shadow-lg shadow-emerald-500/50'
                            : 'bg-slate-800 border-slate-700 text-slate-500'
                        }`}
                      >
                        {num}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">Pin {num}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Guide Information */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-gray-900">Cable Types Comparison</h3>
                
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="font-bold text-blue-900 mb-1">Straight-Through Cable:</div>
                    <div className="text-blue-800 leading-relaxed">
                      Both ends terminated using the same standard (<strong>T568B to T568B</strong> or T568A to T568A). Used to connect <em>different</em> devices:
                      <ul className="list-disc pl-4 mt-1 space-y-0.5">
                        <li>PC workstation to Network Switch</li>
                        <li>Switch to Router</li>
                        <li>Server to Patch Panel</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="font-bold text-purple-900 mb-1">Crossover Cable:</div>
                    <div className="text-purple-800 leading-relaxed">
                      One end terminated with <strong>T568A</strong> and the opposite end with <strong>T568B</strong>. Transmit (TX) pins connect directly to Receive (RX) pins. Used for <em>identical</em> devices:
                      <ul className="list-disc pl-4 mt-1 space-y-0.5">
                        <li>PC to PC direct peer communication</li>
                        <li>Switch to Switch (legacy non-Auto-MDIX)</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="font-bold text-emerald-900 mb-1">Auto-MDIX Technology:</div>
                    <div className="text-emerald-800 leading-relaxed">
                      Almost all modern Gigabit and 2.5G network adapters automatically detect and internally cross over transmit/receive lines, allowing straight-through cables to work in place of crossover cables.
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
