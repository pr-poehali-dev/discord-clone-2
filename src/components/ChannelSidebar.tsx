import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
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

type View = 'dm' | 'friends' | 'settings' | 'notifications' | 'server';

interface ChannelSidebarProps {
  currentView: View;
  selectedServer: string | null;
  selectedChannel: string | null;
  selectedDM: string | null;
  servers: Server[];
  channels: Channel[];
  directMessages: DirectMessage[];
  friends: Friend[];
  username: string;
  userTag: string;
  onInvite: () => void;
  onServerSettings: () => void;
  onSelectChannel: (channelId: string) => void;
  onVoiceChannelClick: () => void;
  onAddFriend: () => void;
  onViewFriends: () => void;
  onViewNotifications: () => void;
  onOpenDMChat: (dmId: string) => void;
  onViewSettings: () => void;
}

const ChannelSidebar = ({
  currentView,
  selectedServer,
  selectedChannel,
  selectedDM,
  servers,
  channels,
  directMessages,
  friends,
  username,
  userTag,
  onInvite,
  onServerSettings,
  onSelectChannel,
  onVoiceChannelClick,
  onAddFriend,
  onViewFriends,
  onViewNotifications,
  onOpenDMChat,
  onViewSettings,
}: ChannelSidebarProps) => {
  return (
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
                <DropdownMenuItem onClick={onInvite}>
                  <Icon name="UserPlus" size={16} className="mr-2" />
                  Пригласить
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onServerSettings}>
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
                  onClick={() => onSelectChannel(channel.id)}
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
                  onClick={onVoiceChannelClick}
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
              onClick={onAddFriend}
            >
              <Icon name="UserPlus" size={18} />
            </Button>
          </div>

          <ScrollArea className="flex-1 px-2 py-2">
            <div className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start px-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                onClick={onViewFriends}
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
                onClick={onViewNotifications}
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
                    onClick={() => onOpenDMChat(dm.id)}
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
          onClick={onViewSettings}
        >
          <Icon name="Settings" size={18} />
        </Button>
      </div>
    </div>
  );
};

export default ChannelSidebar;
