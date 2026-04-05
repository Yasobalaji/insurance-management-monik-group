
import React, { useState } from 'react';
import { Bell, MessageSquare, CheckCircle, Clock, Trash2, MailOpen, Eye, Info, AlertTriangle, Send, X, CornerUpLeft } from 'lucide-react';
import { AppNotification } from '../types';

interface Props {
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onSendReply: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => void;
  currentUser: { name: string, role: string } | null;
}

const NotificationInterface: React.FC<Props> = ({ notifications, onMarkAsRead, onDelete, onClearAll, onSendReply, currentUser }) => {
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  
  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'CLAIM_UPDATE': return <CheckCircle size={20} className="text-blue-600" />;
      case 'ENQUIRY': return <MessageSquare size={20} className="text-red-600" />;
      case 'REPLY': return <CornerUpLeft size={20} className="text-emerald-600" />;
      default: return <Info size={20} className="text-slate-400" />;
    }
  };

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const handleReplySubmit = (n: AppNotification) => {
    if (!replyText.trim()) return;

    onSendReply({
      type: 'REPLY',
      title: `RE: ${n.title}`,
      message: replyText,
      claimId: n.claimId,
      senderName: currentUser?.name || 'System User',
      senderRole: currentUser?.role || 'User',
      recipientRole: n.senderRole // Reply to original sender's role
    });

    setReplyTargetId(null);
    setReplyText('');
    onMarkAsRead(n.id);
  };

  const sortedNotifications = [...notifications].sort((a, b) => b.timestamp - a.timestamp);

  const cardClass = "bg-white rounded-3xl shadow-xl border border-blue-100 overflow-hidden mb-8";

  return (
    <div className="max-w-4xl mx-auto pb-32 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <div className="bg-red-600 p-4 rounded-2xl shadow-xl border-b-4 border-blue-900">
            <Bell className="text-white w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-blue-900 uppercase tracking-tighter">NOTIFICATION LOG</h1>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">System Events & User Communications</p>
          </div>
        </div>
        {notifications.length > 0 && (
          <button 
            onClick={onClearAll}
            className="px-6 py-2.5 bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 border border-slate-200"
          >
            <Trash2 size={14} /> Clear All
          </button>
        )}
      </div>

      <div className={cardClass}>
        <div className="divide-y divide-blue-50">
          {sortedNotifications.length === 0 ? (
            <div className="py-32 text-center">
              <Bell size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No notifications logged</p>
            </div>
          ) : (
            sortedNotifications.map((n) => (
              <div 
                key={n.id} 
                className={`p-6 flex flex-col gap-4 transition-all group ${n.isRead ? 'opacity-70 bg-white' : 'bg-blue-50/30'}`}
              >
                <div className="flex items-start gap-6">
                  <div className={`p-3 rounded-2xl ${n.isRead ? 'bg-slate-100' : 'bg-white shadow-md'}`}>
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`text-sm font-black uppercase tracking-tight ${n.isRead ? 'text-slate-600' : 'text-blue-900'}`}>
                        {n.title}
                      </h3>
                      <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                        <Clock size={10} /> {getTimeAgo(n.timestamp)}
                      </span>
                    </div>
                    <p className={`text-xs font-medium leading-relaxed mb-3 ${n.isRead ? 'text-slate-400' : 'text-slate-600'}`}>
                      {n.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-black text-slate-400 uppercase">From: {n.senderName} ({n.senderRole?.replace('_', ' ') || 'SYSTEM'})</span>
                         {n.claimId && (
                           <span className="text-[10px] font-mono font-black text-red-600/60 bg-red-50 px-2 rounded-md">#{n.claimId.slice(-8)}</span>
                         )}
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!n.isRead && (
                          <button 
                            onClick={() => onMarkAsRead(n.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Mark as read"
                          >
                            <MailOpen size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => {setReplyTargetId(n.id === replyTargetId ? null : n.id); setReplyText('');}}
                          className={`p-2 rounded-lg transition-colors ${replyTargetId === n.id ? 'bg-emerald-600 text-white' : 'text-emerald-600 hover:bg-emerald-50'}`}
                          title="Reply to user"
                        >
                          <CornerUpLeft size={16} />
                        </button>
                        <button 
                          onClick={() => onDelete(n.id)}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-lg"
                          title="Delete notification"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {replyTargetId === n.id && (
                  <div className="ml-16 mt-2 p-6 bg-white rounded-2xl border border-emerald-100 shadow-lg animate-in slide-in-from-top-2 duration-300">
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">SENDING REPLY TO {n.senderName.toUpperCase()}</p>
                      <button onClick={() => setReplyTargetId(null)} className="text-slate-400 hover:text-red-500"><X size={14} /></button>
                    </div>
                    <textarea 
                      className="w-full h-24 p-4 text-xs font-bold uppercase bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none transition-all"
                      placeholder="Type your message here..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                    <div className="flex justify-end mt-4">
                      <button 
                        onClick={() => handleReplySubmit(n)}
                        disabled={!replyText.trim()}
                        className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-900/20 hover:bg-emerald-700 disabled:bg-slate-300 flex items-center gap-2 transition-all active:scale-95"
                      >
                        <Send size={14} /> Dispatch Reply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationInterface;
