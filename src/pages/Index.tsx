import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type View = 'chat' | 'friends' | 'profile' | 'settings' | 'notifications';

interface Server {
  id: string;
  name: string;
  icon: string;
}

interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice';
  unread?: number;
}

interface Message {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
}

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('chat');
  const [selectedServer, setSelectedServer] = useState('1');
  const [selectedChannel, setSelectedChannel] = useState('1');
  const [messageInput, setMessageInput] = useState('');
  const [inCall, setInCall] = useState(false);

  const servers: Server[] = [
    { id: '1', name: 'Главный', icon: '🏠' },
    { id: '2', name: 'Работа', icon: '💼' },
    { id: '3', name: 'Друзья', icon: '🎮' },
    { id: '4', name: 'Проекты', icon: '🚀' },
  ];

  const channels: Channel[] = [
    { id: '1', name: 'общий', type: 'text', unread: 3 },
    { id: '2', name: 'важное', type: 'text' },
    { id: '3', name: 'Голосовой 1', type: 'voice' },
    { id: '4', name: 'Голосовой 2', type: 'voice' },
  ];

  const messages: Message[] = [
    {
      id: '1',
      author: 'Александр',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      content: 'Привет! Как дела?',
      timestamp: '14:30',
    },
    {
      id: '2',
      author: 'Мария',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
      content: 'Отлично! Работаю над новым проектом',
      timestamp: '14:32',
    },
    {
      id: '3',
      author: 'Дмитрий',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dmitry',
      content: 'Кто готов к созвону через 10 минут?',
      timestamp: '14:35',
    },
  ];

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      setMessageInput('');
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <div className="w-[72px] bg-sidebar flex flex-col items-center py-3 gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-2xl bg-primary hover:bg-primary/90 hover:rounded-xl transition-all duration-200"
          onClick={() => setCurrentView('chat')}
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
            onClick={() => setSelectedServer(server.id)}
          >
            {server.icon}
          </Button>
        ))}
        
        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-2xl bg-muted hover:bg-accent hover:rounded-xl transition-all duration-200 mt-auto"
        >
          <Icon name="Plus" size={24} />
        </Button>
      </div>

      <div className="w-60 bg-card flex flex-col">
        <div className="h-12 px-4 flex items-center border-b border-border shadow-sm">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-between px-2 hover:bg-accent">
                <span className="font-semibold">{servers.find(s => s.id === selectedServer)?.name}</span>
                <Icon name="ChevronDown" size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem>
                <Icon name="UserPlus" size={16} className="mr-2" />
                Пригласить
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Icon name="Settings" size={16} className="mr-2" />
                Настройки сервера
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <ScrollArea className="flex-1 px-2 py-2">
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start px-2 text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => setCurrentView('friends')}
            >
              <Icon name="Users" size={18} className="mr-2" />
              Друзья
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start px-2 text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => setCurrentView('notifications')}
            >
              <Icon name="Bell" size={18} className="mr-2" />
              Уведомления
              <Badge variant="destructive" className="ml-auto">5</Badge>
            </Button>
          </div>

          <Separator className="my-3" />

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
                  setCurrentView('chat');
                }}
              >
                <Icon name="Hash" size={18} className="mr-2" />
                {channel.name}
                {channel.unread && (
                  <Badge variant="default" className="ml-auto bg-primary text-primary-foreground">
                    {channel.unread}
                  </Badge>
                )}
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
                onClick={() => setInCall(!inCall)}
              >
                <Icon name="Volume2" size={18} className="mr-2" />
                {channel.name}
              </Button>
            ))}
          </div>
        </ScrollArea>

        <div className="h-14 px-2 border-t border-border flex items-center gap-2 bg-muted/30">
          <Avatar className="w-8 h-8">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=User" />
            <AvatarFallback>Я</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">Мой профиль</div>
            <div className="text-xs text-muted-foreground">#1234</div>
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
            <span className="text-sm font-medium">Голосовой канал: {channels.find(c => c.type === 'voice')?.name}</span>
            <div className="flex gap-2 ml-auto">
              <Button size="sm" variant="ghost" className="h-8">
                <Icon name="Mic" size={16} className="mr-2" />
                Микрофон
              </Button>
              <Button size="sm" variant="ghost" className="h-8">
                <Icon name="Video" size={16} className="mr-2" />
                Видео
              </Button>
              <Button size="sm" variant="ghost" className="h-8">
                <Icon name="ScreenShare" size={16} className="mr-2" />
                Экран
              </Button>
              <Button size="sm" variant="destructive" className="h-8" onClick={() => setInCall(false)}>
                <Icon name="PhoneOff" size={16} />
              </Button>
            </div>
          </div>
        )}

        <div className="h-12 px-4 flex items-center border-b border-border shadow-sm">
          <Icon name="Hash" size={20} className="text-muted-foreground mr-2" />
          <span className="font-semibold">
            {currentView === 'chat' && channels.find(c => c.id === selectedChannel)?.name}
            {currentView === 'friends' && 'Друзья'}
            {currentView === 'profile' && 'Профиль'}
            {currentView === 'settings' && 'Настройки'}
            {currentView === 'notifications' && 'Уведомления'}
          </span>
          <div className="flex gap-2 ml-auto">
            {currentView === 'chat' && (
              <>
                <Button variant="ghost" size="icon" className="w-9 h-9">
                  <Icon name="Users" size={18} />
                </Button>
                <Button variant="ghost" size="icon" className="w-9 h-9">
                  <Icon name="Search" size={18} />
                </Button>
              </>
            )}
          </div>
        </div>

        {currentView === 'chat' && (
          <>
            <ScrollArea className="flex-1 px-4 py-4">
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
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="w-7 h-7">
                        <Icon name="MoreVertical" size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4">
              <div className="bg-muted rounded-lg flex items-center gap-2 px-4 py-3">
                <Button variant="ghost" size="icon" className="w-9 h-9">
                  <Icon name="Plus" size={20} />
                </Button>
                <Input
                  placeholder={`Написать в #${channels.find(c => c.id === selectedChannel)?.name}`}
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
                <Button variant="ghost" size="sm">Ожидают</Button>
                <Button variant="ghost" size="sm">Заблокированные</Button>
                <Button variant="default" size="sm" className="ml-auto">
                  <Icon name="UserPlus" size={16} className="mr-2" />
                  Добавить друга
                </Button>
              </div>

              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="bg-card rounded-lg p-4 flex items-center gap-3 hover:bg-accent/50 transition-colors">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Friend${i}`} />
                      <AvatarFallback>F{i}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-semibold">Друг {i}</div>
                      <div className="text-sm text-muted-foreground">Онлайн</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Icon name="MessageCircle" size={18} />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Icon name="Phone" size={18} />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Icon name="Video" size={18} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
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
                    <Input defaultValue="Мой профиль" />
                  </div>
                  <div className="bg-card rounded-lg p-4">
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <Input defaultValue="user@example.com" />
                  </div>
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
          <div className="flex-1 p-6">
            <div className="max-w-2xl space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-card rounded-lg p-4 flex items-start gap-3 hover:bg-accent/50 transition-colors">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Notif${i}`} />
                    <AvatarFallback>N{i}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">Новое сообщение от Пользователь {i}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Привет! Есть пара минут для обсуждения проекта?
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">2 минуты назад</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {currentView === 'chat' && (
        <div className="w-60 bg-card border-l border-border">
          <ScrollArea className="h-full p-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Участники — 12
                </h3>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-2 p-1.5 rounded hover:bg-accent/50 cursor-pointer transition-colors">
                      <div className="relative">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Member${i}`} />
                          <AvatarFallback>M{i}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></div>
                      </div>
                      <span className="text-sm">Участник {i}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default Index;
