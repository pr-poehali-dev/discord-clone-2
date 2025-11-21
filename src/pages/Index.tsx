import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import ServerSidebar from '@/components/ServerSidebar';
import ChannelSidebar from '@/components/ChannelSidebar';
import MainContent from '@/components/MainContent';
import VideoCallDialog from '@/components/VideoCallDialog';

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

  const handleSelectHome = () => {
    setCurrentView('dm');
    setSelectedServer(null);
    setSelectedChannel(null);
  };

  const handleSelectServer = (serverId: string) => {
    setSelectedServer(serverId);
    setCurrentView('server');
    setSelectedChannel('1');
    setSelectedDM(null);
  };

  const handleAddServer = () => {
    toast({
      title: "Создание сервера",
      description: "Введите название нового сервера",
    });
  };

  const handleInvite = () => {
    toast({ description: "Отправьте ссылку друзьям" });
  };

  const handleServerSettings = () => {
    setCurrentView('settings');
  };

  const handleSelectChannel = (channelId: string) => {
    setSelectedChannel(channelId);
    setMessages([]);
  };

  const handleVoiceChannelClick = () => {
    if (!inCall) {
      const channel = channels.find(c => c.type === 'voice');
      if (channel) {
        startCall(channel.name, false);
      }
    } else {
      endCall();
    }
  };

  const handleViewFriends = () => {
    setCurrentView('friends');
    setSelectedDM(null);
  };

  const handleViewNotifications = () => {
    setCurrentView('notifications');
    setSelectedDM(null);
  };

  const handleViewSettings = () => {
    setCurrentView('settings');
  };

  const handleSaveSettings = () => {
    toast({ title: "Сохранено", description: "Настройки обновлены" });
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
      <ServerSidebar
        servers={servers}
        selectedServer={selectedServer}
        onSelectHome={handleSelectHome}
        onSelectServer={handleSelectServer}
        onAddServer={handleAddServer}
      />

      <ChannelSidebar
        currentView={currentView}
        selectedServer={selectedServer}
        selectedChannel={selectedChannel}
        selectedDM={selectedDM}
        servers={servers}
        channels={channels}
        directMessages={directMessages}
        friends={friends}
        username={username}
        userTag={userTag}
        onInvite={handleInvite}
        onServerSettings={handleServerSettings}
        onSelectChannel={handleSelectChannel}
        onVoiceChannelClick={handleVoiceChannelClick}
        onAddFriend={addFriend}
        onViewFriends={handleViewFriends}
        onViewNotifications={handleViewNotifications}
        onOpenDMChat={openDMChat}
        onViewSettings={handleViewSettings}
      />

      <MainContent
        currentView={currentView}
        selectedDM={selectedDM}
        selectedChannel={selectedChannel}
        directMessages={directMessages}
        channels={channels}
        messages={messages}
        messageInput={messageInput}
        username={username}
        friends={friends}
        inCall={inCall}
        callWith={callWith}
        isMicOn={isMicOn}
        isVideoOn={isVideoOn}
        isScreenSharing={isScreenSharing}
        onMessageInputChange={setMessageInput}
        onSendMessage={handleSendMessage}
        onStartCall={startCall}
        onToggleMic={toggleMic}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={toggleScreenShare}
        onEndCall={endCall}
        onAddFriend={addFriend}
        onRemoveFriend={removeFriend}
        onOpenDMChat={openDMChat}
        onUsernameChange={setUsername}
        onSaveSettings={handleSaveSettings}
      />

      <VideoCallDialog
        showVideoDialog={showVideoDialog}
        onOpenChange={setShowVideoDialog}
        isScreenSharing={isScreenSharing}
        isVideoOn={isVideoOn}
        callWith={callWith}
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        remoteStream={remoteStream}
      />
    </div>
  );
};

export default Index;
