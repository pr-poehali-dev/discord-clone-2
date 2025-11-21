import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type View = 'dm' | 'friends' | 'settings' | 'notifications' | 'server';

interface Server {
  id: string;
  name: string;
  icon: string;
}

interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice';
}

interface Message {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  isOwn?: boolean;
}

interface DirectMessage {
  id: string;
  friendId: string;
  friendName: string;
  friendAvatar: string;
  lastMessage: string;
  timestamp: string;
  unread?: number;
  status: 'online' | 'offline';
}

interface Friend {
  id: string;
  name: string;
  status: 'online' | 'offline';
  avatar: string;
}

const Index = () => {
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<View>('dm');
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [selectedDM, setSelectedDM] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  
  const [inCall, setInCall] = useState(false);
  const [callWith, setCallWith] = useState<string>('');
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  
  const [username, setUsername] = useState('Мой профиль');
  const [userTag] = useState('#1234');

  const servers: Server[] = [
    { id: '1', name: 'Главный', icon: '🏠' },
    { id: '2', name: 'Работа', icon: '💼' },
    { id: '3', name: 'Друзья', icon: '🎮' },
    { id: '4', name: 'Проекты', icon: '🚀' },
  ];

  const channels: Channel[] = [
    { id: '1', name: 'общий', type: 'text' },
    { id: '2', name: 'важное', type: 'text' },
    { id: '3', name: 'Голосовой 1', type: 'voice' },
    { id: '4', name: 'Голосовой 2', type: 'voice' },
  ];

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        author: username,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
        content: messageInput,
        timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        isOwn: true,
      };
      setMessages([...messages, newMessage]);
      
      if (selectedDM && currentView === 'dm') {
        setDirectMessages(prev => prev.map(dm => 
          dm.id === selectedDM 
            ? { ...dm, lastMessage: messageInput, timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) }
            : dm
        ));
      }
      
      setMessageInput('');
    }
  };

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('New ICE candidate:', event.candidate);
      }
    };

    pc.ontrack = (event) => {
      console.log('Remote track received');
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    return pc;
  };

  const startCall = async (friendName: string, withVideo: boolean = false) => {
    try {
      const constraints = {
        audio: true,
        video: withVideo
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = createPeerConnection();
      peerConnectionRef.current = pc;

      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      setInCall(true);
      setCallWith(friendName);
      setIsMicOn(true);
      setIsVideoOn(withVideo);
      
      if (withVideo) {
        setShowVideoDialog(true);
      }

      toast({
        title: "Звонок начат",
        description: `Вызов ${friendName}...`,
      });
    } catch (error) {
      console.error('Error starting call:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось начать звонок. Проверьте доступ к камере и микрофону.",
        variant: "destructive",
      });
    }
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
      setRemoteStream(null);
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    setInCall(false);
    setCallWith('');
    setIsVideoOn(false);
    setIsScreenSharing(false);
    setShowVideoDialog(false);
    
    toast({
      title: "Звонок завершён",
      description: "Вы отключились",
    });
  };

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
        toast({
          description: audioTrack.enabled ? "Микрофон включён" : "Микрофон выключен",
        });
      }
    }
  };

  const toggleVideo = async () => {
    if (!isVideoOn) {
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        
        if (peerConnectionRef.current && localStream) {
          videoStream.getVideoTracks().forEach(track => {
            localStream.addTrack(track);
            peerConnectionRef.current?.addTrack(track, localStream);
          });
        }
        
        setIsVideoOn(true);
        setShowVideoDialog(true);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
        
        toast({
          description: "Камера включена",
        });
      } catch (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось получить доступ к камере",
          variant: "destructive",
        });
      }
    } else {
      if (localStream) {
        localStream.getVideoTracks().forEach(track => {
          track.stop();
          localStream.removeTrack(track);
        });
      }
      setIsVideoOn(false);
      toast({
        description: "Камера выключена",
      });
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true,
          audio: false
        });
        
        setIsScreenSharing(true);
        setShowVideoDialog(true);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          if (localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
          }
        };
        
        toast({
          description: "Демонстрация экрана включена",
        });
      } catch (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось начать демонстрацию экрана",
          variant: "destructive",
        });
      }
    } else {
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      setIsScreenSharing(false);
      
      if (localStream && localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
      
      toast({
        description: "Демонстрация экрана выключена",
      });
    }
  };

  const addFriend = () => {
    const newFriend: Friend = {
      id: Date.now().toString(),
      name: `Друг ${friends.length + 1}`,
      status: Math.random() > 0.5 ? 'online' : 'offline',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Friend${Date.now()}`,
    };
    setFriends([...friends, newFriend]);
    
    const newDM: DirectMessage = {
      id: Date.now().toString(),
      friendId: newFriend.id,
      friendName: newFriend.name,
      friendAvatar: newFriend.avatar,
      lastMessage: 'Начните общение',
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      status: newFriend.status,
    };
    setDirectMessages([...directMessages, newDM]);
    
    toast({
      title: "Друг добавлен",
      description: `${newFriend.name} теперь в вашем списке`,
    });
  };

  const removeFriend = (id: string) => {
    setFriends(friends.filter(f => f.id !== id));
    setDirectMessages(directMessages.filter(dm => dm.friendId !== id));
    toast({
      description: "Друг удалён из списка",
    });
  };

  const openDMChat = (dmId: string) => {
    setSelectedDM(dmId);
    setCurrentView('dm');
    setMessages([]);
  };

  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (remoteStream) {
        remoteStream.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [localStream, remoteStream]);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <div className="w-[72px] bg-sidebar flex flex-col items-center py-3 gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-2xl bg-primary hover:bg-primary/90 hover:rounded-xl transition-all duration-200"
          onClick={() => {
            setCurrentView('dm');
            setSelectedServer(null);
            setSelectedChannel(null);
          }}
        >
          <Icon name="Home" size={24} className="text-primary-foreground" />
        </Button>
        
        <Separator className="w-8 bg-border/50" />
        
        {servers.map((server) => (
          <Button
            key={server.id}
            variant="ghost"
            size="icon"
            className={`w-12 h-12 rounded-2xl hover:rounded-xl transition-all duration-200 text-2xl ${
              selectedServer === server.id ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-accent'
            }`}
            onClick={() => {
              setSelectedServer(server.id);
              setCurrentView('server');
              setSelectedChannel('1');
              setSelectedDM(null);
            }}
          >
            {server.icon}
          </Button>
        ))}
        
        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-2xl bg-muted hover:bg-accent hover:rounded-xl transition-all duration-200 mt-auto"
          onClick={() => {
            toast({
              title: "Создание сервера",
              description: "Введите название нового сервера",
            });
          }}
        >
          <Icon name="Plus" size={24} />
        </Button>
      </div>

      <div className="w-60 bg-card flex flex-col">
        {currentView === 'server' && selectedServer ? (
          <>
            <div className="h-12 px-4 flex items-center border-b border-border shadow-sm">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between px-2 hover:bg-accent">
                    <span className="font-semibold">{servers.find(s => s.id === selectedServer)?.name}</span>
                    <Icon name="ChevronDown" size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuItem onClick={() => toast({ description: "Отправьте ссылку друзьям" })}>
                    <Icon name="UserPlus" size={16} className="mr-2" />
                    Пригласить
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCurrentView('settings')}>
                    <Icon name="Settings" size={16} className="mr-2" />
                    Настройки сервера
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <ScrollArea className="flex-1 px-2 py-2">
              <div className="space-y-0.5">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Текстовые каналы
                </div>
                {channels.filter(c => c.type === 'text').map((channel) => (
                  <Button
                    key={channel.id}
                    variant="ghost"
                    className={`w-full justify-start px-2 ${
                      selectedChannel === channel.id ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                    }`}
                    onClick={() => {
                      setSelectedChannel(channel.id);
                      setMessages([]);
                    }}
                  >
                    <Icon name="Hash" size={18} className="mr-2" />
                    {channel.name}
                  </Button>
                ))}
              </div>

              <Separator className="my-3" />

              <div className="space-y-0.5">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Голосовые каналы
                </div>
                {channels.filter(c => c.type === 'voice').map((channel) => (
                  <Button
                    key={channel.id}
                    variant="ghost"
                    className="w-full justify-start px-2 text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    onClick={() => {
                      if (!inCall) {
                        startCall(channel.name, false);
                      } else {
                        endCall();
                      }
                    }}
                  >
                    <Icon name="Volume2" size={18} className="mr-2" />
                    {channel.name}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </>
        ) : (
          <>
            <div className="h-12 px-4 flex items-center border-b border-border shadow-sm justify-between">
              <span className="font-semibold">Личные сообщения</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-8 h-8"
                onClick={addFriend}
              >
                <Icon name="UserPlus" size={18} />
              </Button>
            </div>

            <ScrollArea className="flex-1 px-2 py-2">
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start px-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                  onClick={() => {
                    setCurrentView('friends');
                    setSelectedDM(null);
                  }}
                >
                  <Icon name="Users" size={18} className="mr-2" />
                  Друзья
                  {friends.length > 0 && (
                    <Badge variant="secondary" className="ml-auto">{friends.length}</Badge>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start px-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                  onClick={() => {
                    setCurrentView('notifications');
                    setSelectedDM(null);
                  }}
                >
                  <Icon name="Bell" size={18} className="mr-2" />
                  Уведомления
                </Button>
              </div>

              <Separator className="my-3" />

              <div className="space-y-0.5">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Сообщения
                </div>
                {directMessages.length === 0 ? (
                  <div className="px-2 py-8 text-center text-xs text-muted-foreground">
                    <p>Нет активных чатов</p>
                    <p className="mt-1">Добавьте друзей</p>
                  </div>
                ) : (
                  directMessages.map((dm) => (
                    <Button
                      key={dm.id}
                      variant="ghost"
                      className={`w-full justify-start px-2 py-2 h-auto ${
                        selectedDM === dm.id ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                      }`}
                      onClick={() => openDMChat(dm.id)}
                    >
                      <div className="relative mr-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={dm.friendAvatar} />
                          <AvatarFallback>{dm.friendName[0]}</AvatarFallback>
                        </Avatar>
                        {dm.status === 'online' && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="font-medium text-sm truncate">{dm.friendName}</div>
                        <div className="text-xs truncate opacity-70">{dm.lastMessage}</div>
                      </div>
                      {dm.unread && (
                        <Badge variant="default" className="ml-2 bg-primary text-primary-foreground">
                          {dm.unread}
                        </Badge>
                      )}
                    </Button>
                  ))
                )}
              </div>
            </ScrollArea>
          </>
        )}

        <div className="h-14 px-2 border-t border-border flex items-center gap-2 bg-muted/30">
          <Avatar className="w-8 h-8">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=User" />
            <AvatarFallback>{username[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{username}</div>
            <div className="text-xs text-muted-foreground">{userTag}</div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8"
            onClick={() => setCurrentView('settings')}
          >
            <Icon name="Settings" size={18} />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {inCall && (
          <div className="h-14 bg-accent/30 border-b border-border px-4 flex items-center gap-3">
            <Icon name="Phone" size={18} className="text-primary animate-pulse" />
            <span className="text-sm font-medium">Звонок: {callWith}</span>
            <div className="flex gap-2 ml-auto">
              <Button 
                size="sm" 
                variant={isMicOn ? "ghost" : "destructive"} 
                className="h-8"
                onClick={toggleMic}
              >
                <Icon name={isMicOn ? "Mic" : "MicOff"} size={16} className="mr-2" />
                {isMicOn ? "Микрофон" : "Откл"}
              </Button>
              <Button 
                size="sm" 
                variant={isVideoOn ? "default" : "ghost"} 
                className="h-8"
                onClick={toggleVideo}
              >
                <Icon name={isVideoOn ? "VideoOff" : "Video"} size={16} className="mr-2" />
                Видео
              </Button>
              <Button 
                size="sm" 
                variant={isScreenSharing ? "default" : "ghost"} 
                className="h-8"
                onClick={toggleScreenShare}
              >
                <Icon name="ScreenShare" size={16} className="mr-2" />
                Экран
              </Button>
              <Button size="sm" variant="destructive" className="h-8" onClick={endCall}>
                <Icon name="PhoneOff" size={16} />
              </Button>
            </div>
          </div>
        )}

        <div className="h-12 px-4 flex items-center border-b border-border shadow-sm">
          {currentView === 'dm' && selectedDM && (
            <>
              <Avatar className="w-6 h-6 mr-2">
                <AvatarImage src={directMessages.find(dm => dm.id === selectedDM)?.friendAvatar} />
                <AvatarFallback>{directMessages.find(dm => dm.id === selectedDM)?.friendName[0]}</AvatarFallback>
              </Avatar>
              <span className="font-semibold">
                {directMessages.find(dm => dm.id === selectedDM)?.friendName}
              </span>
            </>
          )}
          {currentView === 'server' && selectedChannel && (
            <>
              <Icon name="Hash" size={20} className="text-muted-foreground mr-2" />
              <span className="font-semibold">{channels.find(c => c.id === selectedChannel)?.name}</span>
            </>
          )}
          {currentView === 'friends' && (
            <>
              <Icon name="Users" size={20} className="text-muted-foreground mr-2" />
              <span className="font-semibold">Друзья</span>
            </>
          )}
          {currentView === 'settings' && (
            <>
              <Icon name="Settings" size={20} className="text-muted-foreground mr-2" />
              <span className="font-semibold">Настройки</span>
            </>
          )}
          {currentView === 'notifications' && (
            <>
              <Icon name="Bell" size={20} className="text-muted-foreground mr-2" />
              <span className="font-semibold">Уведомления</span>
            </>
          )}
          
          <div className="flex gap-2 ml-auto">
            {(currentView === 'dm' && selectedDM) && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-9 h-9"
                  onClick={() => startCall(directMessages.find(dm => dm.id === selectedDM)?.friendName || '', false)}
                >
                  <Icon name="Phone" size={18} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-9 h-9"
                  onClick={() => startCall(directMessages.find(dm => dm.id === selectedDM)?.friendName || '', true)}
                >
                  <Icon name="Video" size={18} />
                </Button>
              </>
            )}
          </div>
        </div>

        {(currentView === 'dm' || currentView === 'server') && (
          <>
            <ScrollArea className="flex-1 px-4 py-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Icon name="MessageCircle" size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Начните общение</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="flex gap-3 hover:bg-muted/30 -mx-2 px-2 py-1 rounded-lg transition-colors group">
                      <Avatar className="w-10 h-10 mt-0.5">
                        <AvatarImage src={message.avatar} />
                        <AvatarFallback>{message.author[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold text-sm">{message.author}</span>
                          <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                        </div>
                        <p className="text-sm mt-0.5 leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="p-4">
              <div className="bg-muted rounded-lg flex items-center gap-2 px-4 py-3">
                <Button variant="ghost" size="icon" className="w-9 h-9">
                  <Icon name="Plus" size={20} />
                </Button>
                <Input
                  placeholder={currentView === 'dm' && selectedDM 
                    ? `Сообщение для ${directMessages.find(dm => dm.id === selectedDM)?.friendName}`
                    : `Написать в #${channels.find(c => c.id === selectedChannel)?.name}`
                  }
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                />
                <Button variant="ghost" size="icon" className="w-9 h-9">
                  <Icon name="Smile" size={20} />
                </Button>
              </div>
            </div>
          </>
        )}

        {currentView === 'friends' && (
          <div className="flex-1 p-6">
            <div className="max-w-2xl">
              <div className="flex gap-3 mb-6">
                <Button variant="default" size="sm">Все</Button>
                <Button variant="ghost" size="sm">Онлайн</Button>
                <Button variant="default" size="sm" className="ml-auto" onClick={addFriend}>
                  <Icon name="UserPlus" size={16} className="mr-2" />
                  Добавить друга
                </Button>
              </div>

              {friends.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="text-center">
                    <Icon name="Users" size={48} className="mx-auto mb-4 opacity-50" />
                    <p>У вас пока нет друзей</p>
                    <Button className="mt-4" onClick={addFriend}>
                      <Icon name="UserPlus" size={16} className="mr-2" />
                      Добавить первого друга
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {friends.map((friend) => (
                    <div key={friend.id} className="bg-card rounded-lg p-4 flex items-center gap-3 hover:bg-accent/50 transition-colors">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={friend.avatar} />
                          <AvatarFallback>{friend.name[0]}</AvatarFallback>
                        </Avatar>
                        {friend.status === 'online' && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{friend.name}</div>
                        <div className="text-sm text-muted-foreground capitalize">{friend.status}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            const dm = directMessages.find(d => d.friendId === friend.id);
                            if (dm) {
                              openDMChat(dm.id);
                            }
                          }}
                        >
                          <Icon name="MessageCircle" size={18} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => startCall(friend.name, false)}
                        >
                          <Icon name="Phone" size={18} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => startCall(friend.name, true)}
                        >
                          <Icon name="Video" size={18} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeFriend(friend.id)}
                        >
                          <Icon name="X" size={18} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'settings' && (
          <div className="flex-1 p-6">
            <div className="max-w-2xl space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-4">Настройки аккаунта</h2>
                <div className="space-y-4">
                  <div className="bg-card rounded-lg p-4">
                    <label className="text-sm font-medium mb-2 block">Имя пользователя</label>
                    <Input 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="bg-card rounded-lg p-4">
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <Input defaultValue="user@example.com" />
                  </div>
                  <Button onClick={() => toast({ title: "Сохранено", description: "Настройки обновлены" })}>
                    Сохранить изменения
                  </Button>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4">Уведомления</h2>
                <div className="bg-card rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Уведомления на рабочем столе</span>
                    <Button variant="outline" size="sm">Включено</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Звуковые уведомления</span>
                    <Button variant="outline" size="sm">Включено</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'notifications' && (
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Icon name="Bell" size={48} className="mx-auto mb-4 opacity-50" />
              <p>У вас нет новых уведомлений</p>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>
              {isScreenSharing ? "Демонстрация экрана" : isVideoOn ? "Видеозвонок" : "Звонок"}
            </DialogTitle>
            <DialogDescription>
              {callWith && `Звонок с ${callWith}`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted rounded-lg overflow-hidden aspect-video relative">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm">
                Вы
              </div>
            </div>
            <div className="bg-muted rounded-lg overflow-hidden aspect-video relative flex items-center justify-center">
              {remoteStream ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <Icon name="UserCircle" size={64} className="mx-auto mb-2 opacity-50" />
                  <p>Ожидание подключения...</p>
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm">
                {callWith}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
