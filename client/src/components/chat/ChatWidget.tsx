import React, { useState } from 'react';
import clsx from 'clsx';
import { Send } from 'lucide-react';
import { useChatStore } from '../../store/useChatStore';
import { useCharacterStore } from '../../store/useCharacterStore';
import type { ChatChannel } from '../../store/useChatStore';

export const ChatWidget: React.FC = () => {
  const { messages, activeChannel, setActiveChannel, addMessage } = useChatStore();
  const { character } = useCharacterStore();
  const [inputValue, setInputValue] = useState('');

  const filteredMessages = messages.filter(msg => msg.channel === activeChannel);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    addMessage({
      sender: character?.name || 'You',
      senderId: character?.id || 'me',
      text: inputValue,
      channel: activeChannel
    });
    setInputValue('');
  };

  const Tab = ({ channel, label }: { channel: ChatChannel, label: string }) => (
    <button
      onClick={() => setActiveChannel(channel)}
      className={clsx(
        "px-4 py-1 text-xs font-bold uppercase tracking-wider border-t-2 transition-colors",
        activeChannel === channel
          ? "border-terra-gold bg-terra-gray text-terra-gold"
          : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5"
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-terra-dark border-r border-gray-800">
      {/* Tabs */}
      <div className="flex bg-black/40 border-b border-gray-800">
        <Tab channel="GENERAL" label="Общий" />
        <Tab channel="CLAN" label="Клан" />
        <Tab channel="PRIVATE" label="Приват" />
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-xs">
        {filteredMessages.map((msg) => (
          <div key={msg.id} className="break-words leading-tight">
            <span className="text-gray-500 mr-2">
              [{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]
            </span>
            {!msg.isSystem && (
              <span className={clsx(
                "font-bold mr-1 cursor-pointer hover:underline",
                msg.senderId === 'me' ? "text-terra-green" : "text-blue-400"
              )}>
                {msg.sender}
              </span>
            )}
            <span className={clsx(msg.isSystem ? "text-yellow-500 italic" : "text-terra-text")}>
              {msg.isSystem ? "" : ": "}
              {msg.text}
            </span>
          </div>
        ))}
        {filteredMessages.length === 0 && (
          <div className="text-gray-600 italic p-2">В этом канале пока тихо...</div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-2 bg-black/20 border-t border-gray-800 flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`Сообщение в ${activeChannel === 'GENERAL' ? 'общий' : activeChannel === 'CLAN' ? 'клановый' : 'приватный'} чат...`}
          className="flex-1 bg-black/40 border border-gray-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-terra-gold"
        />
        <button 
          type="submit"
          className="bg-terra-gray hover:bg-gray-700 text-terra-gold p-1 rounded border border-gray-700 transition-colors"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
};
