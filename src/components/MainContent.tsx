import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

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

interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice';
}

interface Friend {
  id: string;
  name: string;
  status: 'online' | 'offline';
  avatar: string;
}

type View = 'dm' | 'friends' | 'settings' | 'notifications' | 'server';

interface MainContentProps {
  currentView: View;
  selectedDM: string | null;
  selectedChannel: string | null;
  directMessages: DirectMessage[];
  channels: Channel[];
  messages: Message[];
  messageInput: string;
  username: string;
  friends: Friend[];
  inCall: boolean;
  callWith: string;
  isMicOn: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  onMessageInputChange: (value: string) => void;
  onSendMessage: () => void;
  onStartCall: (friendName: string, withVideo: boolean) => void;
  onToggleMic: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onEndCall: () => void;
  onAddFriend: () => void;
  onRemoveFriend: (id: string) => void;
  onOpenDMChat: (dmId: string) => void;
  onUsernameChange: (value: string) => void;
  onSaveSettings: () => void;
}

const MainContent = ({
  currentView,
  selectedDM,
  selectedChannel,
  directMessages,
  channels,
  messages,
  messageInput,
  username,
  friends,
  inCall,
  callWith,
  isMicOn,
  isVideoOn,
  isScreenSharing,
  onMessageInputChange,
  onSendMessage,
  onStartCall,
  onToggleMic,
  onToggleVideo,
  onToggleScreenShare,
  onEndCall,
  onAddFriend,
  onRemoveFriend,
  onOpenDMChat,
  onUsernameChange,
  onSaveSettings,
}: MainContentProps) => {
  return (
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
              onClick={onToggleMic}
            >
              <Icon name={isMicOn ? "Mic" : "MicOff"} size={16} className="mr-2" />
              {isMicOn ? "Микрофон" : "Откл"}
            </Button>
            <Button 
              size="sm" 
              variant={isVideoOn ? "default" : "ghost"} 
              className="h-8"
              onClick={onToggleVideo}
            >
              <Icon name={isVideoOn ? "VideoOff" : "Video"} size={16} className="mr-2" />
              Видео
            </Button>
            <Button 
              size="sm" 
              variant={isScreenSharing ? "default" : "ghost"} 
              className="h-8"
              onClick={onToggleScreenShare}
            >
              <Icon name="ScreenShare" size={16} className="mr-2" />
              Экран
            </Button>
            <Button size="sm" variant="destructive" className="h-8" onClick={onEndCall}>
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
                onClick={() => onStartCall(directMessages.find(dm => dm.id === selectedDM)?.friendName || '', false)}
              >
                <Icon name="Phone" size={18} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-9 h-9"
                onClick={() => onStartCall(directMessages.find(dm => dm.id === selectedDM)?.friendName || '', true)}
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
                onChange={(e) => onMessageInputChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
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
              <Button variant="default" size="sm" className="ml-auto" onClick={onAddFriend}>
                <Icon name="UserPlus" size={16} className="mr-2" />
                Добавить друга
              </Button>
            </div>

            {friends.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <Icon name="Users" size={48} className="mx-auto mb-4 opacity-50" />
                  <p>У вас пока нет друзей</p>
                  <Button className="mt-4" onClick={onAddFriend}>
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
                            onOpenDMChat(dm.id);
                          }
                        }}
                      >
                        <Icon name="MessageCircle" size={18} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onStartCall(friend.name, false)}
                      >
                        <Icon name="Phone" size={18} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onStartCall(friend.name, true)}
                      >
                        <Icon name="Video" size={18} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onRemoveFriend(friend.id)}
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
                    onChange={(e) => onUsernameChange(e.target.value)}
                  />
                </div>
                <div className="bg-card rounded-lg p-4">
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <Input defaultValue="user@example.com" />
                </div>
                <Button onClick={onSaveSettings}>
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
  );
};

export default MainContent;
