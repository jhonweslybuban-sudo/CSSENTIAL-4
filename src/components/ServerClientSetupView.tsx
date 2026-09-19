import React, { useState } from 'react';
import {
  ArrowLeft,
  Server,
  Laptop,
  Users,
  Shield,
  FolderLock,
  Network,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Info,
  Layers,
  Terminal,
  Key,
  HardDrive,
  Share2,
  Lock,
  Unlock,
  Check
} from 'lucide-react';
import { api } from '../services/api';

interface ServerClientSetupViewProps {
  studentId: string;
  sessionId: string;
  onBack: () => void;
}

type TabMode = 'ARCHITECTURE' | 'SERVER_ROLES' | 'DOMAIN_JOIN' | 'FILE_PERMISSIONS';

export const ServerClientSetupView: React.FC<ServerClientSetupViewProps> = ({
  studentId,
  sessionId,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<TabMode>('ARCHITECTURE');

  // Permission Simulator State
  const [sharePerm, setSharePerm] = useState<'READ' | 'CHANGE' | 'FULL_CONTROL'>('READ');
  const [ntfsPerm, setNtfsPerm] = useState<'READ' | 'MODIFY' | 'FULL_CONTROL'>('MODIFY');

  // Domain Join Simulator State
  const [domainName, setDomainName] = useState('cssential.local');
  const [adminUser, setAdminUser] = useState('Administrator');
  const [adminPassword, setAdminPassword] = useState('');
  const [domainJoinStatus, setDomainJoinStatus] = useState<'IDLE' | 'JOINING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [domainJoinMessage, setDomainJoinMessage] = useState<string | null>(null);

  // Calculate Effective Permission (Most Restrictive Rule)
  const getEffectivePermission = () => {
    // Ranking: READ < CHANGE/MODIFY < FULL_CONTROL
    if (sharePerm === 'READ') return { level: 'READ', text: 'Read-Only (Limited by Share Permission)' };
    if (ntfsPerm === 'READ') return { level: 'READ', text: 'Read-Only (Limited by NTFS Permission)' };
    if (sharePerm === 'CHANGE' || ntfsPerm === 'MODIFY') return { level: 'MODIFY', text: 'Read, Write & Modify (Change files, but cannot take ownership)' };
    return { level: 'FULL_CONTROL', text: 'Full Control (Read, Write, Delete & Modify Security Permissions)' };
  };

  const handleSimulateDomainJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword) {
      setDomainJoinStatus('ERROR');
      setDomainJoinMessage('Error: Active Directory domain joining requires domain administrator credentials.');
      return;
    }
    setDomainJoinStatus('JOINING');
    setTimeout(() => {
      setDomainJoinStatus('SUCCESS');
      setDomainJoinMessage(`Welcome to the ${domainName} domain! You must restart your computer to apply these changes.`);
      api.logAction(studentId, sessionId, `Simulated joining client computer to Active Directory domain: ${domainName}`);
      api.saveGameResult({
        student_id: studentId,
        session_id: sessionId,
        game_name: 'Server Client Setup Lab',
        start_time: new Date(Date.now() - 150000).toISOString(),
        end_time: new Date().toISOString(),
        duration_seconds: 150,
        score: 100,
        level: 1,
        completed: true,
        extra_stats: { domainName, adminUser }
      });
    }, 1200);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[750px] animate-in fade-in duration-300">
      
      {/* Header Bar */}
      <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Back to Hub"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-wide text-white">
                Server/Client Infrastructure &amp; Network Setup Guide
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded-full">
                Item #13 Practice
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Active Directory Domain Services, DHCP/DNS roles, client workstation domain joining, and Share vs. NTFS security permissions.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setActiveTab('ARCHITECTURE')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              activeTab === 'ARCHITECTURE'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            Workgroup vs. Domain
          </button>
          <button
            onClick={() => setActiveTab('SERVER_ROLES')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              activeTab === 'SERVER_ROLES'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            Server Roles (DHCP/DNS)
          </button>
          <button
            onClick={() => setActiveTab('DOMAIN_JOIN')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              activeTab === 'DOMAIN_JOIN'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            Client Domain Join Simulator
          </button>
          <button
            onClick={() => setActiveTab('FILE_PERMISSIONS')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              activeTab === 'FILE_PERMISSIONS'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            Share vs. NTFS Permissions
          </button>
        </div>
      </div>

      {/* TAB 1: WORKGROUP VS DOMAIN ARCHITECTURE */}
      {activeTab === 'ARCHITECTURE' && (
        <div className="p-4 sm:p-6 bg-slate-50 text-slate-900 space-y-6">
          <div className="border-b border-gray-200 pb-3">
            <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-700" />
              <span>Architectural Comparison: Peer-to-Peer Workgroup vs. Client-Server Domain</span>
            </h2>
            <p className="text-xs text-gray-600 mt-0.5">
              Understanding decentralized peer networks versus enterprise centralized directory management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Workgroup Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Laptop className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-bold text-gray-900">Workgroup (Peer-to-Peer)</h3>
                </div>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-full">
                  Decentralized (&lt; 10 PCs)
                </span>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-gray-700">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <strong>User Accounts:</strong> Every single computer maintains its own local Security Accounts Manager (SAM) database. If a user needs access to 5 PCs, 5 separate user accounts must be created manually.
                </div>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <strong>Administration:</strong> No central server. Each machine is configured independently.
                </div>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <strong>Security &amp; Policies:</strong> Group Policy Objects (GPO) cannot be pushed across the network. Security settings must be maintained locally via <code>secpol.msc</code>.
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
                  <strong>Ideal Use Case:</strong> Small home offices, temporary lab environments, or isolated testbenches with 10 or fewer computers.
                </div>
              </div>
            </div>

            {/* Domain Card */}
            <div className="bg-white border-2 border-purple-300 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-purple-600" />
                  <h3 className="text-base font-bold text-gray-900">Client-Server Domain (Active Directory)</h3>
                </div>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-purple-100 text-purple-800 rounded-full">
                  Centralized (Enterprise Scalable)
                </span>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-gray-700">
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <strong>User Accounts:</strong> Centralized inside the Active Directory database (<code>ntds.dit</code>) running on Domain Controllers. A user account created once allows the employee to log into any authorized workstation on the domain.
                </div>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <strong>Administration:</strong> Centralized administration by IT Network Administrators using Active Directory Users and Computers (ADUC).
                </div>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <strong>Security &amp; Policies:</strong> Administrators configure centralized Group Policies (GPO) to enforce password complexity, lock down USB drives, map network printers, and deploy software across thousands of workstations simultaneously.
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900">
                  <strong>Ideal Use Case:</strong> Academic campuses (like TUP), corporate offices, hospital networks, and multi-department enterprise institutions.
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: SERVER ROLES (DHCP & DNS) */}
      {activeTab === 'SERVER_ROLES' && (
        <div className="p-4 sm:p-6 bg-slate-50 text-slate-900 space-y-6">
          <div className="border-b border-gray-200 pb-3">
            <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-purple-700" />
              <span>Core Windows Server Infrastructure Roles</span>
            </h2>
            <p className="text-xs text-gray-600 mt-0.5">
              Step-by-step guidance for provisioning DHCP IP leasing and DNS name resolution services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* DHCP Role */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Network className="w-4 h-4 text-blue-600" />
                  <span>DHCP Server Role (Dynamic Host Configuration)</span>
                </h3>
                <span className="text-[11px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                  Port UDP 67/68
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-gray-700">
                  The DHCP role automatically assigns IP addresses, subnet masks, default gateways, and DNS server IPs to client computers via the 4-step <strong>DORA</strong> sequence (Discover, Offer, Request, Acknowledge).
                </p>

                <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-[11px] space-y-1">
                  <div className="text-blue-400 font-bold">// Standard Scope Configuration:</div>
                  <div>Scope Name: CSSENTIAL-STUDENT-LAB</div>
                  <div>IP Address Pool: 192.168.1.100 - 192.168.1.200</div>
                  <div>Subnet Mask: 255.255.255.0 (/24)</div>
                  <div>Exclusion Range: 192.168.1.1 - 192.168.1.20 (Servers, Routers)</div>
                  <div>Lease Duration: 8 Days (Wired) / 8 Hours (Wireless)</div>
                  <div>Option 003 (Router / Default Gateway): 192.168.1.1</div>
                  <div>Option 006 (DNS Servers): 192.168.1.10 (Local AD DNS)</div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
                  <strong>Technician Rule:</strong> A Windows DHCP server must always be assigned a <em>static IP address</em> and must be authorized in Active Directory before it begins leasing IP addresses.
                </div>
              </div>
            </div>

            {/* DNS Role */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>DNS Server Role (Domain Name System)</span>
                </h3>
                <span className="text-[11px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                  Port UDP/TCP 53
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-gray-700">
                  Active Directory <em>cannot function</em> without DNS. DNS translates human-friendly hostnames (e.g. <code>server01.cssential.local</code>) into numerical IP addresses (<code>192.168.1.10</code>) and registers SRV records that client computers use to locate Domain Controllers.
                </p>

                <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-[11px] space-y-1">
                  <div className="text-emerald-400 font-bold">// Common DNS Record Types:</div>
                  <div><strong>Host (A) Record:</strong> Maps hostname to IPv4 (e.g., dc01 -&gt; 192.168.1.10)</div>
                  <div><strong>Host (AAAA) Record:</strong> Maps hostname to IPv6 address</div>
                  <div><strong>Alias (CNAME):</strong> Canonical alias name (e.g., www -&gt; dc01)</div>
                  <div><strong>Service (SRV):</strong> Locates domain services like Kerberos (_kerberos._tcp) and LDAP</div>
                  <div><strong>Reverse Lookup (PTR):</strong> Maps IP address back to hostname</div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900">
                  <strong>Active Directory Integrated Zones:</strong> Store DNS records directly inside AD DS partitions, encrypting replication traffic and synchronizing across all Domain Controllers automatically.
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: DOMAIN JOIN SIMULATOR */}
      {activeTab === 'DOMAIN_JOIN' && (
        <div className="p-4 sm:p-6 bg-slate-100 flex-1 flex flex-col items-center justify-center">
          
          <div className="w-full max-w-md bg-white border border-gray-400 rounded shadow-xl overflow-hidden text-xs text-gray-800 font-sans">
            <div className="bg-gray-100 px-3 py-2 border-b border-gray-300 flex items-center justify-between">
              <span className="font-semibold text-gray-700">Computer Name/Domain Changes</span>
              <button className="text-gray-400 hover:text-gray-700 font-bold">✕</button>
            </div>

            <form onSubmit={handleSimulateDomainJoin} className="p-4 space-y-4">
              <p className="text-[11px] text-gray-600">
                You can change the name and the membership of this computer. Changes might affect access to network resources.
              </p>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Computer name:</label>
                <input
                  type="text"
                  readOnly
                  value="CSSENTIAL-WORKSTATION-01"
                  className="w-full bg-gray-100 border border-gray-300 rounded px-2 py-1 font-mono text-gray-700"
                />
              </div>

              <div className="border-t border-gray-200 pt-3 space-y-2">
                <span className="font-semibold text-gray-700 block">Member of:</span>
                
                <div className="space-y-2 pl-2">
                  <div className="flex items-center gap-2">
                    <input type="radio" id="mem-domain" name="member-type" defaultChecked className="cursor-pointer" />
                    <label htmlFor="mem-domain" className="font-semibold cursor-pointer">Domain:</label>
                  </div>
                  <input
                    type="text"
                    value={domainName}
                    onChange={(e) => setDomainName(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1 font-mono ml-4"
                  />

                  <div className="flex items-center gap-2 opacity-50">
                    <input type="radio" id="mem-wg" name="member-type" disabled className="cursor-not-allowed" />
                    <label htmlFor="mem-wg">Workgroup: WORKGROUP</label>
                  </div>
                </div>
              </div>

              {/* Credentials Prompt */}
              <div className="p-3 bg-purple-50 border border-purple-200 rounded space-y-2">
                <span className="font-bold text-purple-950 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-purple-700" />
                  Domain Administrator Credentials Required
                </span>
                <div>
                  <label className="text-[11px] text-gray-600 block">Username:</label>
                  <input
                    type="text"
                    value={adminUser}
                    onChange={(e) => setAdminUser(e.target.value)}
                    className="w-full bg-white border border-purple-200 rounded px-2 py-1 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-600 block">Password:</label>
                  <input
                    type="password"
                    placeholder="Enter domain admin password..."
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full bg-white border border-purple-200 rounded px-2 py-1 text-xs"
                  />
                </div>
              </div>

              {domainJoinMessage && (
                <div className={`p-2.5 rounded text-xs leading-relaxed ${
                  domainJoinStatus === 'SUCCESS'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                    : 'bg-red-50 text-red-900 border border-red-300'
                }`}>
                  {domainJoinMessage}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={domainJoinStatus === 'JOINING'}
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold cursor-pointer"
                >
                  {domainJoinStatus === 'JOINING' ? 'Joining Domain...' : 'OK (Join Domain)'}
                </button>
              </div>
            </form>
          </div>

          <p className="text-xs text-gray-500 mt-4 text-center max-w-md">
            Prerequisite check: Before joining a workstation to an Active Directory domain, you MUST configure the workstation's Preferred DNS Server to point to the Domain Controller's IP address.
          </p>

        </div>
      )}

      {/* TAB 4: SHARE VS NTFS PERMISSIONS */}
      {activeTab === 'FILE_PERMISSIONS' && (
        <div className="p-4 sm:p-6 bg-slate-50 text-slate-900 space-y-6">
          <div className="border-b border-gray-200 pb-3">
            <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
              <FolderLock className="w-5 h-5 text-purple-700" />
              <span>Network Resource Sharing: Share vs. NTFS Permissions Matrix</span>
            </h2>
            <p className="text-xs text-gray-600 mt-0.5">
              When accessing a shared folder over the network, Windows evaluates both permissions. The <strong>MOST RESTRICTIVE</strong> permission always wins!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Interactive Calculator Controls */}
            <div className="lg:col-span-6 bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-5">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-blue-600" />
                <span>Simulate Folder: <code>\\SERVER-01\EngineeringDocs</code></span>
              </h3>

              {/* Share Permission Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-blue-950 block">
                  1. Network Share Permission (Applied at SMB Protocol Layer):
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'READ', label: 'Read' },
                    { id: 'CHANGE', label: 'Change' },
                    { id: 'FULL_CONTROL', label: 'Full Control' }
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      onClick={() => setSharePerm(lvl.id as any)}
                      className={`py-2 px-3 rounded-lg border text-center font-bold cursor-pointer transition-all ${
                        sharePerm === lvl.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* NTFS Permission Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-purple-950 block">
                  2. Local NTFS File System Permission (Security Tab):
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'READ', label: 'Read & Execute' },
                    { id: 'MODIFY', label: 'Modify' },
                    { id: 'FULL_CONTROL', label: 'Full Control' }
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      onClick={() => setNtfsPerm(lvl.id as any)}
                      className={`py-2 px-3 rounded-lg border text-center font-bold cursor-pointer transition-all ${
                        ntfsPerm === lvl.id
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Command for Mapping Network Drive */}
              <div className="p-3 bg-slate-900 text-slate-200 rounded-lg text-xs font-mono space-y-1">
                <div className="text-slate-400">// Command to Map Network Drive in Windows CLI:</div>
                <div className="text-emerald-400">net use Z: \\SERVER-01\EngineeringDocs /persistent:yes</div>
              </div>
            </div>

            {/* Right Output Result: Effective Permission */}
            <div className="lg:col-span-6 bg-white border-2 border-purple-300 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-purple-100 text-purple-800 rounded-full">
                  Resulting User Access
                </span>
                <h3 className="text-lg font-black text-gray-900 mt-2">
                  Effective Network Access Level
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Evaluated using the Most Restrictive Rule between Share ({sharePerm}) and NTFS ({ntfsPerm}).
                </p>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-center space-y-2">
                <div className="inline-flex p-3 bg-purple-600 text-white rounded-full">
                  <FolderLock className="w-6 h-6" />
                </div>
                <div className="text-base font-black text-purple-950">
                  {getEffectivePermission().level}
                </div>
                <div className="text-xs text-purple-800 font-medium">
                  {getEffectivePermission().text}
                </div>
              </div>

              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 space-y-1">
                <strong>Industry Best Practice:</strong> Set Network Share permissions to <em>"Authenticated Users: Change"</em> or <em>"Full Control"</em>, and manage granular security strictly using <strong>NTFS permissions</strong> on the folder's Security tab.
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
