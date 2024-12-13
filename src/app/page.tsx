'use client';

import React, { useState, useEffect } from 'react';
import { ChatWindow } from '../components/chat-window';
import { 
  Container, 
  Paper, 
  Typography, 
  Select,
  SelectChangeEvent,
  MenuItem, 
  Button, 
  Box,
  FormControl,
  InputLabel,
  Stack,
  OutlinedInput
} from '@mui/material';

type SingleModel = 'openai' | 'anthropic' | 'gemini';
type ModelSelection = SingleModel | 'all' | SingleModel[];

interface Message {
  role: 'user' | 'assistant';
  content: string;
  model?: SingleModel;
}

interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  model: ModelSelection;
}

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  selectedModel: SingleModel;
  isLoading?: boolean;
}

// Create a type for the model descriptions
type ModelDescriptions = {
  [K in SingleModel]: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelSelection>('openai');
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('default');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Try to load existing sessions from localStorage
    const savedSessions = localStorage.getItem('chatSessions');
    
    if (savedSessions) {
      // If there are saved sessions, load them
      const parsedSessions = JSON.parse(savedSessions);
      setSessions(parsedSessions);
      
      // Set current session to the first session
      if (parsedSessions.length > 0) {
        const lastSession = parsedSessions[0];
        setCurrentSessionId(lastSession.id);
        setMessages(lastSession.messages);
        setSelectedModel(lastSession.model);
      }
    } else {
      // If no saved sessions, create default session
      const defaultSession: ChatSession = {
        id: 'default',
        name: 'New Chat',
        messages: [],
        model: 'openai'
      };
      setSessions([defaultSession]);
      setCurrentSessionId(defaultSession.id);
      setMessages([]);
      setSelectedModel('openai');
    }
    
    setIsInitialized(true);
  }, []); // Run only once on mount

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to clear chat
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        handleClearChat();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      // Update the current session with latest messages
      const updatedSessions = sessions.map(session => 
        session.id === currentSessionId 
          ? { ...session, messages, model: selectedModel }
          : session
      );
      
      // Save to localStorage
      localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
      setSessions(updatedSessions);
    }
  }, [messages, currentSessionId, selectedModel]); // Add messages and selectedModel as dependencies

  const getConversationContext = (messages: Message[]) => {
    // Get the last few messages with clear speaker labels and relationships
    return messages.slice(-5).map(m => {
      const speaker = m.model ? 
        `${m.model.toUpperCase()} (AI Assistant)` : 
        'User (Human)';
      return `${speaker}: ${m.content}`;
    }).join('\n\n');
  };

  const getModelSystemPrompt = (model: SingleModel) => {
    const modelDescriptions: ModelDescriptions = {
      openai: 'GPT-4, known for comprehensive and detailed responses',
      anthropic: 'Claude, known for analytical and nuanced responses',
      gemini: 'Gemini, known for creative and technical responses'
    };

    return `You are part of an interactive multi-AI conversation system where multiple AI models can communicate with each other and the user.

Your Identity: You are ${model.toUpperCase()} (${modelDescriptions[model]})

Other participants in this system:
- User (Human): The person you're interacting with
- ${Object.entries(modelDescriptions)
    .filter(([key]) => key !== model)
    .map(([key, desc]) => `${key.toUpperCase()} (${desc})`)
    .join('\n- ')}

Interaction Capabilities:
- Users can mention any AI using @ (e.g., @${model}, @openai, @anthropic, @gemini)
- When mentioned, you should respond directly to the mention and reference relevant context
- You can acknowledge and reference other AIs' responses
- You should maintain your unique characteristics while being aware of the conversation flow

Please:
1. Stay aware of the conversation context
2. Reference previous relevant points made by others
3. Maintain conversation continuity
4. Be direct when responding to @ mentions
5. Acknowledge other AIs' perspectives when relevant`;
  };

  const getDefaultModel = (selection: ModelSelection): SingleModel => {
    if (Array.isArray(selection)) {
      return selection[0] || 'openai';
    }
    return selection === 'all' ? 'openai' : selection;
  };

  const getModelContext = (messages: Message[], mentionedModel: SingleModel) => {
    // Get recent conversation with clear model attributions and relationships
    const recentMessages = messages.slice(-5).map(m => {
      const speaker = m.model ? m.model.toUpperCase() : 'USER';
      return {
        speaker,
        content: m.content,
        isRelevant: m.model === mentionedModel || 
                    m.content.toLowerCase().includes(`@${mentionedModel}`) ||
                    m.content.toLowerCase().includes(mentionedModel)
      };
    });

    // Build context summary
    const contextSummary = recentMessages
      .map(m => `${m.speaker}${m.isRelevant ? ' (Relevant to you)' : ''}: "${m.content}"`)
      .join('\n\n');

    // Find related discussions
    const relatedMessages = messages.filter(m => 
      m.content.toLowerCase().includes(mentionedModel) ||
      m.content.toLowerCase().includes(`@${mentionedModel}`)
    );

    // Build model relationships
    const modelInteractions = new Set(messages
      .filter(m => m.model)
      .map(m => m.model as string));

    return `You are participating in a multi-model AI conversation. Here's the relevant context:

CONVERSATION PARTICIPANTS:
- You (${mentionedModel.toUpperCase()})
- Other AI Models Present: ${Array.from(modelInteractions)
    .filter(m => m !== mentionedModel)
    .map(m => m.toUpperCase())
    .join(', ')}
- Human User

RECENT CONVERSATION HISTORY:
${contextSummary}

${relatedMessages.length > 0 ? `
PREVIOUS RELEVANT DISCUSSIONS:
${relatedMessages.map(m => `${m.model?.toUpperCase() || 'USER'}: "${m.content}"`).join('\n')}
` : ''}

INTERACTION GUIDELINES:
1. You can reference and build upon other models' responses
2. Maintain awareness of the ongoing discussion
3. Acknowledge relevant points made by others
4. Stay focused on parts specifically mentioning you
5. Provide your unique perspective while being collaborative

Current message where you were mentioned:`;
  };

  const handleSendMessage = async (content: string) => {
    try {
      setIsLoading(true);
      
      const userMessage: Message = { role: 'user', content };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      // Handle @ mentions
      const mentions = content.match(/@(openai|anthropic|gemini|user)/gi);
      const mentionedModels = mentions?.map(m => m.slice(1).toLowerCase()) || [];

      if (mentionedModels.length > 0) {
        const validModels = mentionedModels.filter(m => m !== 'user') as SingleModel[];
        
        for (const mentionedModel of validModels) {
          const response = await fetch(`/api/${mentionedModel}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              messages: [
                {
                  role: 'system',
                  content: getModelSystemPrompt(mentionedModel)
                },
                {
                  role: 'user',
                  content: getModelContext(messages, mentionedModel)
                },
                {
                  role: 'user',
                  content: `${content}

Please respond considering:
1. The specific context of why you were mentioned
2. Your previous interactions in this conversation
3. Relevant points made by other models
4. The current topic and its evolution
5. Your unique perspective while acknowledging others' contributions`
                }
              ]
            }),
          });

          if (!response.ok) {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: `Note: ${mentionedModel.toUpperCase()} was mentioned but is unavailable.`,
              model: getDefaultModel(selectedModel)
            } as Message]);
            continue;
          }

          const data = await response.json();
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: data.content,
            model: mentionedModel
          } as Message]);
        }
      } else {
        // Handle non-mention case as before...
        const currentModel = getDefaultModel(selectedModel);
        const response = await fetch(`/api/${currentModel}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            messages: [
              {
                role: 'system',
                content: getModelSystemPrompt(currentModel)
              },
              ...updatedMessages
            ]
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get response');
        }

        const data = await response.json();
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.content,
          model: currentModel
        } as Message]);
      }

    } catch (error) {
      console.error('Error:', error);
      const errorModel = getDefaultModel(selectedModel);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error processing your request.',
        model: errorModel
      } as Message]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    // Update current session to have empty messages
    setSessions(prev => prev.map(session => 
      session.id === currentSessionId 
        ? { ...session, messages: [] }
        : session
    ));
  };

  const handleNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      name: `Chat ${sessions.length + 1}`, // Give it a numbered name
      messages: [],
      model: selectedModel
    };
    setSessions(prev => [...prev, newSession]);
    setCurrentSessionId(newSession.id);
    setMessages([]);
    setSelectedModel(newSession.model);
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
    if (currentSessionId === sessionId) {
      const remainingSessions = sessions.filter(session => session.id !== sessionId);
      if (remainingSessions.length > 0) {
        setCurrentSessionId(remainingSessions[0].id);
        setMessages(remainingSessions[0].messages);
      } else {
        handleNewSession();
      }
    }
  };

  const handleRenameSession = (sessionId: string, newName: string) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId ? { ...session, name: newName } : session
    ));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    setCurrentSessionId(e.target.value);
    const session = sessions.find(s => s.id === e.target.value);
    if (session) {
      setMessages(session.messages);
      setSelectedModel(session.model);
    }
  };

  const handleModelChange = (e: SelectChangeEvent<string>) => {
    setSelectedModel(e.target.value as SingleModel);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          AI Chat Aggregator
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Compare responses from multiple AI models
        </Typography>
      </Box>

      {isInitialized && (
        <Paper elevation={3} sx={{ overflow: 'hidden' }}>
          <Box p={2} borderBottom={1} borderColor="divider">
            <Stack spacing={2}>
              <Box display="flex" gap={2}>
                <FormControl fullWidth>
                  <InputLabel>Chat Session</InputLabel>
                  <Select
                    value={currentSessionId}
                    label="Chat Session"
                    onChange={handleSelectChange}
                  >
                    {sessions.map(session => (
                      <MenuItem key={session.id} value={session.id}>
                        {session.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button 
                  variant="contained" 
                  onClick={handleNewSession}
                >
                  New Chat
                </Button>
              </Box>

              <Box display="flex" justifyContent="space-between" gap={2}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Model</InputLabel>
                  <Select
                    multiple
                    value={Array.isArray(selectedModel) ? selectedModel : [selectedModel]}
                    onChange={(e) => {
                      const value = e.target.value as string[];
                      // If no models selected, default to first one
                      if (value.length === 0) {
                        setSelectedModel('openai');
                        return;
                      }
                      // If 'all' is selected, use all models
                      if (value.includes('all')) {
                        setSelectedModel('all');
                        return;
                      }
                      // Otherwise use selected models
                      setSelectedModel(value as SingleModel[]);
                    }}
                    input={<OutlinedInput label="Model" />}
                    renderValue={(selected) => {
                      const selectedArray = Array.isArray(selected) ? selected : [selected];
                      return selectedArray.map(model => {
                        switch(model) {
                          case 'openai': return '🤖 GPT-4';
                          case 'anthropic': return '🧠 Claude';
                          case 'gemini': return '💫 Gemini';
                          case 'all': return 'All Models';
                          default: return model;
                        }
                      }).join(', ');
                    }}
                  >
                    <MenuItem value="all">🤖 All Models</MenuItem>
                    <MenuItem value="openai">🤖 OpenAI (GPT-4)</MenuItem>
                    <MenuItem value="anthropic">🧠 Anthropic (Claude)</MenuItem>
                    <MenuItem value="gemini">💫 Google (Gemini)</MenuItem>
                  </Select>
                </FormControl>
                
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      const newName = prompt('Enter new name for chat:', 
                        sessions.find(s => s.id === currentSessionId)?.name
                      );
                      if (newName) handleRenameSession(currentSessionId, newName);
                    }}
                  >
                    Rename
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleClearChat}
                    title="Clear chat (Ctrl/Cmd + K)"
                  >
                    Clear (⌘K)
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Box>

          <Box height="calc(100vh - 16rem)">
            <ChatWindow
              messages={messages}
              onSendMessage={handleSendMessage}
              selectedModel={Array.isArray(selectedModel) ? selectedModel[0] : selectedModel}
              isLoading={isLoading}
            />
          </Box>
        </Paper>
      )}
    </Container>
  );
} 