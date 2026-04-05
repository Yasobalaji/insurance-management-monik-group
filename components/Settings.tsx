
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { BRANCHES, GOOGLE_CLIENT_ID } from '../constants';
import { Globe, Server, MapPin, Users, Database, Download, Upload, Plus, Trash2, Settings as SettingsIcon } from 'lucide-react';
import { User, BaseClaimData } from '../types';
import { apiService } from '../services/api';

interface Props {
  users: User[];
  setUsers: (users: User[]) => void;
  claims: BaseClaimData[];
  setClaims: (claims: BaseClaimData[]) => void;
  currentUser: User | null;
  onLogout: () => void;
}

const Settings: React.FC<Props> = ({ users, setUsers, claims, setClaims, currentUser }) => {
  const { t, language, setLanguage } = useLanguage();

  // User Management State
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserCompany, setNewUserCompany] = useState('MONIK');
  const [newUserRole, setNewUserRole] = useState<'Admin' | 'User'>('User');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserEpf, setNewUserEpf] = useState('');
  const [newUserMobile, setNewUserMobile] = useState('');

  const handleAddUser = async () => {
      if (!newUserEmail || !newUserName || !newUserUsername || !newUserPassword || !newUserEpf || !newUserMobile) {
          alert("PLEASE FILL ALL USER FIELDS");
          return;
      }
      const newUser: User = {
          id: Date.now().toString(),
          name: newUserName,
          username: newUserUsername,
          company: newUserCompany,
          email: newUserEmail,
          role: newUserRole,
          password: newUserPassword,
          epf: newUserEpf,
          mobile: newUserMobile
      };

      try {
          if (await apiService.healthCheck()) {
              await apiService.createUser(newUser);
          }
          setUsers([...users, newUser]);
          setNewUserEmail('');
          setNewUserName('');
          setNewUserUsername('');
          setNewUserPassword('');
          setNewUserEpf('');
          setNewUserMobile('');
      } catch (e) {
          alert("FAILED TO ADD USER TO BACKEND");
          setUsers([...users, newUser]);
      }
  };

  const handleDeleteUser = async (id: string) => {
      if (confirm('ARE YOU SURE YOU WANT TO DELETE THIS USER?')) {
          try {
              if (await apiService.healthCheck()) {
                  await apiService.deleteUser(id);
              }
              setUsers(users.filter(u => u.id !== id));
          } catch(e) {
              alert("FAILED TO DELETE USER FROM BACKEND");
          }
      }
  };

  // Data Management
  const handleExport = () => {
      const dataStr = JSON.stringify(claims, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `CMBSL_CLAIMS_BACKUP_${new Date().toISOString().slice(0,10)}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileReader = new FileReader();
      if (e.target.files && e.target.files[0]) {
          fileReader.readAsText(e.target.files[0], "UTF-8");
          fileReader.onload = (event) => {
              try {
                  if (event.target?.result) {
                      const importedData = JSON.parse(event.target.result as string);
                      if (Array.isArray(importedData)) {
                          setClaims(importedData);
                          alert(t('importSuccess').toUpperCase());
                      } else {
                          alert(t('importError').toUpperCase());
                      }
                  }
              } catch (error) {
                  console.error(error);
                  alert(t('importError').toUpperCase());
              }
          };
      }
  };

  const sectionHeaderClass = "px-8 py-5 border-b border-slate-100 bg-slate-50 flex items-center gap-3";
  const headerTextClass = "font-black text-slate-800 uppercase tracking-widest text-sm";
  const cardClass = "bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden";
  const labelClass = "block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1";
  const inputClass = "w-full border-slate-300 rounded-lg text-xs font-bold p-3 uppercase focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900";

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-3 rounded-xl shadow-lg shadow-indigo-200">
                <SettingsIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-widest">{t('settings')}</h1>
        </div>
      </div>

      {/* Language Settings */}
      <div className={cardClass}>
        <div className={sectionHeaderClass}>
            <Globe className="w-5 h-5 text-indigo-600" />
            <h2 className={headerTextClass}>{t('language')}</h2>
        </div>
        <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { code: 'en', label: 'English', sub: 'DEFAULT' },
                    { code: 'si', label: 'සිංහල', sub: 'SINHALA' },
                    { code: 'ta', label: 'தமிழ்', sub: 'TAMIL' }
                ].map((l) => (
                    <button 
                        key={l.code}
                        onClick={() => setLanguage(l.code as any)}
                        className={`p-6 rounded-xl border-2 text-center transition-all ${language === l.code ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md' : 'border-slate-100 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
                    >
                        <span className="block text-lg font-black uppercase tracking-wider mb-1">{l.label}</span>
                        <span className="text-[10px] font-bold opacity-60 tracking-widest">{l.sub}</span>
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* User Management (Admin Only) */}
      <div className={cardClass}>
        <div className={sectionHeaderClass}>
            <Users className="w-5 h-5 text-emerald-600" />
            <h2 className={headerTextClass}>{t('userManagement')}</h2>
        </div>
        <div className="p-8">
            {/* Add User Form */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 items-end bg-slate-50 p-6 rounded-xl border border-slate-100">
                <div className="flex-1 w-full">
                    <label className={labelClass}>{t('name')}</label>
                    <input type="text" className={inputClass} value={newUserName} onChange={e => setNewUserName(e.target.value)} />
                </div>
                <div className="flex-1 w-full">
                    <label className={labelClass}>Username</label>
                    <input type="text" className={inputClass} value={newUserUsername} onChange={e => setNewUserUsername(e.target.value)} />
                </div>
                <div className="flex-1 w-full">
                    <label className={labelClass}>Company</label>
                    <input type="text" className={inputClass} value={newUserCompany} onChange={e => setNewUserCompany(e.target.value)} />
                </div>
                <div className="flex-1 w-full">
                    <label className={labelClass}>{t('email')}</label>
                    <input type="email" className={inputClass} value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} />
                </div>
                <div className="flex-1 w-full">
                    <label className={labelClass}>EPF</label>
                    <input type="text" className={inputClass} value={newUserEpf} onChange={e => setNewUserEpf(e.target.value)} />
                </div>
                <div className="flex-1 w-full">
                    <label className={labelClass}>Mobile</label>
                    <input type="text" className={inputClass} value={newUserMobile} onChange={e => setNewUserMobile(e.target.value)} />
                </div>
                <div className="flex-1 w-full">
                    <label className={labelClass}>{t('password')}</label>
                    <input type="text" className={inputClass} value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} />
                </div>
                <div className="w-full md:w-32">
                     <label className={labelClass}>{t('role')}</label>
                    <select className={inputClass} value={newUserRole} onChange={(e) => setNewUserRole(e.target.value as any)}>
                        <option value="User">USER</option>
                        <option value="Admin">ADMIN</option>
                    </select>
                </div>
                <button onClick={handleAddUser} className="bg-emerald-600 text-white p-3 rounded-lg hover:bg-emerald-700 w-full md:w-auto flex justify-center items-center shadow-lg shadow-emerald-200">
                    <Plus size={20} />
                </button>
            </div>

            {/* User List */}
            <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('name')}</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('email')}</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('role')}</th>
                            <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('action')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {users.length > 0 ? users.map((u) => (
                            <tr key={u.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-900 uppercase">{u.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-500 uppercase">{u.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${u.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-800'}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    {u.id !== currentUser?.id && (
                                        <button onClick={() => handleDeleteUser(u.id)} className="text-rose-500 hover:text-rose-700 transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={4} className="text-center py-8 text-slate-400 font-bold uppercase text-xs">{t('noUsers')}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      {/* Data Management */}
      <div className={cardClass}>
        <div className={sectionHeaderClass}>
            <Database className="w-5 h-5 text-amber-600" />
            <h2 className={headerTextClass}>{t('dataManagement')}</h2>
        </div>
        <div className="p-8">
            <div className="flex flex-col md:flex-row gap-6">
                <button 
                    onClick={handleExport}
                    className="flex-1 flex items-center justify-center gap-3 p-6 border-2 border-slate-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-colors group"
                >
                    <Download className="text-indigo-600 group-hover:scale-110 transition-transform" />
                    <span className="font-black text-slate-700 uppercase tracking-wider text-xs">{t('exportData')}</span>
                </button>
                <div className="flex-1 relative">
                    <input 
                        type="file" 
                        accept=".json" 
                        onChange={handleImport} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-slate-300 rounded-xl hover:bg-emerald-50 hover:border-emerald-300 transition-colors h-full group">
                        <Upload className="text-emerald-600 group-hover:scale-110 transition-transform" />
                        <span className="font-black text-slate-700 uppercase tracking-wider text-xs">{t('importData')}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* System Status */}
      <div className={cardClass}>
        <div className={sectionHeaderClass}>
            <Server className="w-5 h-5 text-purple-600" />
            <h2 className={headerTextClass}>{t('systemInfo')}</h2>
        </div>
        <div className="p-8 space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('appVersion')}</span>
                <span className="font-mono font-bold text-slate-900">v5.0.0 (Open Access)</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
