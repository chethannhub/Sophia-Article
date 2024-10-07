import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, X, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ChatHeader = ({ title, clearChat, closeModal }) => (
  <DialogHeader className="border-b border-gray-700 pb-4">
    <DialogTitle className="flex items-center justify-between">
      <span className="text-xl font-semibold truncate">Chat: {title}</span>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" onClick={clearChat} className="text-gray-400 hover:text-white">
          <Trash2 className="h-4 w-4 mr-1" />
          Clear
        </Button>
        <Button variant="ghost" size="icon" onClick={closeModal} className="text-gray-400 hover:text-white">
          <X className="h-5 w-5" />
        </Button>
      </div>
    </DialogTitle>
  </DialogHeader>
);

const ChatMessages = ({ messages, chatEndRef }) => (
  <ScrollArea className="flex-grow pr-4">
    <div className="space-y-4 p-4">
        {messages.map((message, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
      >
        <div className={`max-w-[80%] p-3 rounded-lg shadow-md ${
          message.role === 'user' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-700 text-gray-200'
        }`}>
          {typeof message.content === 'string' ? (
            <p className="text-sm">{message.content}</p>
          ) : (
            <div>{message.content}</div> // Render JSX content if not a string
          )}
          <span className="text-xs opacity-50 mt-1 block">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
      </motion.div>
    ))}
      <div ref={chatEndRef} />
    </div>
  </ScrollArea>
);

const ChatInput = ({ chatInput, setChatInput, handleChatSubmit }) => (
  <form onSubmit={handleChatSubmit} className="flex gap-2 p-4 border-t border-gray-700">
    <Input
      value={chatInput}
      onChange={(e) => setChatInput(e.target.value)}
      placeholder="Type your message..."
      className="flex-grow bg-gray-800 text-white border-gray-600 focus:border-blue-500"
    />
    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
      <MessageCircle className="h-4 w-4 mr-1" />
      Send
    </Button>
  </form>
);

const ChatDialog = ({ isChatModalOpen, setIsChatModalOpen, currentChatArticle, chatMessages, chatEndRef, chatInput, setChatInput, handleChatSubmit, clearChat }) => (
  <Dialog open={isChatModalOpen} onOpenChange={setIsChatModalOpen}>
    {currentChatArticle && (
      <DialogContent className="sm:max-w-[500px] h-[80vh] flex flex-col bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <ChatHeader 
          title={currentChatArticle.title} 
          clearChat={clearChat} 
          closeModal={() => setIsChatModalOpen(false)} 
        />
        <ChatMessages 
          messages={chatMessages[currentChatArticle.id] || []} 
          chatEndRef={chatEndRef} 
        />
        <ChatInput 
          chatInput={chatInput} 
          setChatInput={setChatInput} 
          handleChatSubmit={handleChatSubmit} 
        />
      </DialogContent>
    )}
  </Dialog>
);

export default ChatDialog;