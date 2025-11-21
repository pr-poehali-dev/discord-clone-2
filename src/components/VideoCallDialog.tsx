import { RefObject } from 'react';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface VideoCallDialogProps {
  showVideoDialog: boolean;
  onOpenChange: (open: boolean) => void;
  isScreenSharing: boolean;
  isVideoOn: boolean;
  callWith: string;
  localVideoRef: RefObject<HTMLVideoElement>;
  remoteVideoRef: RefObject<HTMLVideoElement>;
  remoteStream: MediaStream | null;
}

const VideoCallDialog = ({
  showVideoDialog,
  onOpenChange,
  isScreenSharing,
  isVideoOn,
  callWith,
  localVideoRef,
  remoteVideoRef,
  remoteStream,
}: VideoCallDialogProps) => {
  return (
    <Dialog open={showVideoDialog} onOpenChange={onOpenChange}>
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
  );
};

export default VideoCallDialog;
