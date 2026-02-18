import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { users } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Search, Send } from 'lucide-react';

export default function ChatPage() {
  return (
    <div className="h-[calc(100vh-8rem)] flex rounded-2xl border bg-white/20 dark:bg-black/20 backdrop-blur-md overflow-hidden">
      <div className="w-1/3 border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Search chats" className="pl-10 bg-background/50" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {users.slice(0, 5).map((user, index) => (
            <div key={user.id} className={cn(
              "p-4 flex items-center gap-4 cursor-pointer hover:bg-black/5",
              index === 0 && "bg-primary/10"
            )}>
              <Avatar>
                <AvatarImage src={`https://picsum.photos/seed/${user.avatar}/200/200`} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-muted-foreground truncate">Hey, are you free to work on the UI?</p>
              </div>
              <span className="text-xs text-muted-foreground">2m ago</span>
            </div>
          ))}
        </div>
      </div>
      <div className="w-2/3 flex flex-col">
        <div className="p-4 border-b flex items-center gap-4">
          <Avatar>
            <AvatarImage src={`https://picsum.photos/seed/${users[0].avatar}/200/200`} />
            <AvatarFallback>{users[0].name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{users[0].name}</p>
            <p className="text-sm text-green-500">Online</p>
          </div>
        </div>
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Chat messages */}
          <div className="flex items-end gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={`https://picsum.photos/seed/${users[0].avatar}/200/200`} />
              <AvatarFallback>{users[0].name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="max-w-xs p-3 rounded-lg rounded-bl-none bg-muted">
              <p>Hey! Just saw your profile on HackConnect. Your projects look awesome!</p>
            </div>
          </div>
          <div className="flex items-end gap-2 justify-end">
            <div className="max-w-xs p-3 rounded-lg rounded-br-none bg-primary text-primary-foreground">
              <p>Thanks so much! I'm looking for a team for the upcoming hackathon. Are you participating?</p>
            </div>
            <Avatar className="h-8 w-8">
              <AvatarImage src={`https://picsum.photos/seed/current-user/200/200`} />
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
          </div>
           <div className="flex items-end gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={`https://picsum.photos/seed/${users[0].avatar}/200/200`} />
              <AvatarFallback>{users[0].name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="max-w-xs p-3 rounded-lg rounded-bl-none bg-muted">
              <p>Definitely! I was thinking of building something with Generative AI. Interested?</p>
            </div>
          </div>
        </div>
        <div className="p-4 border-t">
          <div className="relative">
            <Input placeholder="Type a message..." className="pr-12 h-12 bg-background/50" />
            <Button size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9">
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
