import { useState, useEffect, useRef } from 'react';
import { Send, X, MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  from: 'client' | 'professional' | 'system';
  text: string;
  at: string;
  type: 'text' | 'system';
}

interface ChatProps {
  orderId: string;
  currentUserId: string;
  currentUserRole: 'client' | 'professional';
  professionalName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function Chat({ orderId, currentUserId, currentUserRole, professionalName, isOpen, onClose }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      from: 'system',
      text: 'Chat iniciado. Todos los mensajes son monitorizados para garantizar la calidad del servicio.',
      at: new Date().toISOString(),
      type: 'system'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const msg: Message = {
      id: crypto.randomUUID(),
      from: currentUserRole,
      text: newMessage,
      at: new Date().toISOString(),
      type: 'text'
    };

    setMessages(prev => [...prev, msg]);
    setNewMessage('');

    // Simular respuesta automática del profesional
    if (currentUserRole === 'client') {
      setTimeout(() => {
        const responses = [
          'Entendido, estoy en camino.',
          'Perfecto, llegaré en 5 minutos.',
          '¿Puedes confirmarme la dirección exacta?',
          'De acuerdo, sin problema.',
          'Voy para allá ahora mismo.'
        ];
        const autoReply: Message = {
          id: crypto.randomUUID(),
          from: 'professional',
          text: responses[Math.floor(Math.random() * responses.length)],
          at: new Date().toISOString(),
          type: 'text'
        };
        setMessages(prev => [...prev, autoReply]);
      }, 1500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-medium text-sm">{professionalName}</div>
            <div className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full" /> En línea
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.from === currentUserRole ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
              msg.type === 'system'
                ? 'bg-slate-800 text-slate-400 text-xs italic w-full text-center'
                : msg.from === currentUserRole
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-800 text-slate-100'
            }`}>
              <div className="text-sm">{msg.text}</div>
              <div className={`text-[10px] mt-1 ${msg.type === 'system' ? 'text-slate-500' : 'opacity-70'}`}>
                {new Date(msg.at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:border-orange-500 focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-orange-500 p-2 rounded-lg transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
