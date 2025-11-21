import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface Server {
  id: string;
  name: string;
  icon: string;
}

interface ServerSidebarProps {
  servers: Server[];
  selectedServer: string | null;
  onSelectHome: () => void;
  onSelectServer: (serverId: string) => void;
  onAddServer: () => void;
}

const ServerSidebar = ({ servers, selectedServer, onSelectHome, onSelectServer, onAddServer }: ServerSidebarProps) => {
  return (
    <div className="w-[72px] bg-sidebar flex flex-col items-center py-3 gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="w-12 h-12 rounded-2xl bg-primary hover:bg-primary/90 hover:rounded-xl transition-all duration-200"
        onClick={onSelectHome}
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
          onClick={() => onSelectServer(server.id)}
        >
          {server.icon}
        </Button>
      ))}
      
      <Button
        variant="ghost"
        size="icon"
        className="w-12 h-12 rounded-2xl bg-muted hover:bg-accent hover:rounded-xl transition-all duration-200 mt-auto"
        onClick={onAddServer}
      >
        <Icon name="Plus" size={24} />
      </Button>
    </div>
  );
};

export default ServerSidebar;
