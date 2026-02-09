'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, DirectMessage, Profile } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MessageCircle, Send, Shield, Users } from 'lucide-react';

interface Contact extends Pick<Profile, 'id' | 'full_name' | 'email' | 'role' | 'avatar_url' | 'is_admin'> {}

const roleTier: Record<string, number> = {
  creator: 1,
  innovator: 2,
  visionary: 3,
  company: 2,
  admin: 99,
};

const roleLabel = (role?: string, isAdmin?: boolean) => {
  if (isAdmin || role === 'admin') return 'Admin';
  if (role === 'visionary') return 'Tier 3 - Visionary';
  if (role === 'innovator') return 'Tier 2 - Innovator';
  if (role === 'creator') return 'Tier 1 - Creator';
  if (role === 'company') return 'Tier 2 - Company';
  return 'User';
};

const canMessageRoles = (senderRole?: string, receiverRole?: string, receiverIsAdmin?: boolean) => {
  if (!senderRole || !receiverRole) return false;
  if (senderRole === 'admin') return true;
  if (receiverIsAdmin || receiverRole === 'admin') return true;

  const senderTier = roleTier[senderRole] ?? 0;
  const receiverTier = roleTier[receiverRole] ?? 0;
  if (senderTier === 0 || receiverTier === 0) return false;

  return senderTier >= receiverTier;
};

const roleRules: Record<string, string> = {
  creator: 'You can message Tier 1 creators and admins.',
  innovator: 'You can message Tier 1-2 users and admins.',
  visionary: 'You can message Tier 1-3 users and admins.',
  admin: 'You can message everyone.',
};

const displayName = (contact: Contact) =>
  contact.full_name || contact.email?.split('@')[0] || 'User';

const sortByCreated = (list: DirectMessage[]) =>
  [...list].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

export function ChatPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactQuery, setContactQuery] = useState('');
  const [threads, setThreads] = useState<Record<string, DirectMessage | undefined>>({});
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [initializing, setInitializing] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const selectedContactRef = useRef<string | null>(null);

  useEffect(() => {
    selectedContactRef.current = selectedContact?.id ?? null;
  }, [selectedContact]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [loading, user, router]);

  const loadContacts = useCallback(async (currentProfile: Profile) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, avatar_url, is_admin')
      .neq('id', currentProfile.id)
      .order('full_name', { ascending: true });

    if (error) {
      toast({
        title: 'Unable to load contacts',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    const allowedContacts = (data || []).filter(contact =>
      canMessageRoles(currentProfile.role, contact.role, contact.is_admin)
    );

    setContacts(allowedContacts as Contact[]);
  }, [toast]);

  const loadThreads = useCallback(async (currentProfile: Profile) => {
    const { data, error } = await supabase
      .from('direct_messages')
      .select('id, sender_id, receiver_id, content, created_at')
      .or(`sender_id.eq.${currentProfile.id},receiver_id.eq.${currentProfile.id}`)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      console.error('Error loading threads', error);
      return;
    }

    const latestByContact: Record<string, DirectMessage> = {};

    (data || []).forEach(message => {
      const counterpart =
        message.sender_id === currentProfile.id ? message.receiver_id : message.sender_id;
      if (!latestByContact[counterpart]) {
        latestByContact[counterpart] = message as DirectMessage;
      }
    });

    setThreads(latestByContact);
  }, []);

  const loadMessages = useCallback(async (currentUserId: string, contactId: string) => {
    setLoadingMessages(true);
    const { data, error } = await supabase
      .from('direct_messages')
      .select('id, sender_id, receiver_id, content, created_at')
      .or(
        `and(sender_id.eq.${currentUserId},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${currentUserId})`
      )
      .order('created_at', { ascending: true })
      .limit(500);

    if (error) {
      toast({
        title: 'Unable to load conversation',
        description: error.message,
        variant: 'destructive',
      });
      setLoadingMessages(false);
      return;
    }

    setMessages(sortByCreated((data || []) as DirectMessage[]));
    setLoadingMessages(false);
  }, [toast]);

  useEffect(() => {
    if (!profile) return;

    const hydrate = async () => {
      await Promise.all([loadContacts(profile), loadThreads(profile)]);
      setInitializing(false);
    };

    hydrate();
  }, [profile, loadContacts, loadThreads]);

  useEffect(() => {
    if (!profile) return;

    const channel = supabase
      .channel(`direct-messages-${profile.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages' }, payload => {
        const message = payload.new as DirectMessage;
        if (!message) return;
        if (message.sender_id !== profile.id && message.receiver_id !== profile.id) return;

        const counterpartId =
          message.sender_id === profile.id ? message.receiver_id : message.sender_id;

        setThreads(prev => {
          const current = prev[counterpartId];
          if (!current || new Date(message.created_at) > new Date(current.created_at)) {
            return { ...prev, [counterpartId]: message };
          }
          return prev;
        });

        const activeId = selectedContactRef.current;
        if (activeId && (message.sender_id === activeId || message.receiver_id === activeId)) {
          setMessages(prev => sortByCreated([...prev, message]));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile]);

  useEffect(() => {
    if (selectedContact && profile) {
      loadMessages(profile.id, selectedContact.id);
    } else {
      setMessages([]);
    }
  }, [selectedContact, profile, loadMessages]);

  const handleSend = async () => {
    if (!profile || !selectedContact) return;
    const trimmed = messageText.trim();
    if (!trimmed) return;

    if (!canMessageRoles(profile.role, selectedContact.role, selectedContact.is_admin)) {
      toast({
        title: 'Not allowed',
        description: 'Your tier cannot start a chat with this user.',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    const { data, error } = await supabase
      .from('direct_messages')
      .insert({
        sender_id: profile.id,
        receiver_id: selectedContact.id,
        content: trimmed,
      })
      .select('id, sender_id, receiver_id, content, created_at')
      .single();

    if (error) {
      toast({
        title: 'Message not sent',
        description: error.message,
        variant: 'destructive',
      });
      setSending(false);
      return;
    }

    const newMessage = data as DirectMessage;
    setMessages(prev => sortByCreated([...prev, newMessage]));
    setThreads(prev => ({ ...prev, [selectedContact.id]: newMessage }));
    setMessageText('');
    setSending(false);
  };

  const filteredContacts = useMemo(() => {
    if (!contactQuery) return contacts;
    const query = contactQuery.toLowerCase();
    return contacts.filter(contact =>
      displayName(contact).toLowerCase().includes(query) || contact.email?.toLowerCase().includes(query)
    );
  }, [contacts, contactQuery]);

  if (loading || initializing || !profile) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="glass-card p-6 rounded-xl border border-primary/20 flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-primary/80">Preparing chat...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Chat</h1>
          <p className="text-sm text-muted-foreground">
            Message users based on your tier rules. {roleRules[profile.role] || 'Your tier rules apply.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            {roleLabel(profile.role, profile.is_admin)}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <MessageCircle className="h-3 w-3" />
            {roleRules[profile.role] || 'Tier-based messaging' }
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="glass-card border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="text-lg">People</span>
              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                <Users className="h-3 w-3" />
                {contacts.length}
              </Badge>
            </CardTitle>
            <Input
              value={contactQuery}
              onChange={e => setContactQuery(e.target.value)}
              placeholder="Search by name or email"
              className="mt-3"
            />
          </CardHeader>
          <CardContent className="max-h-[70vh] overflow-y-auto space-y-2">
            {filteredContacts.length === 0 && (
              <div className="text-sm text-muted-foreground">No contacts available for your tier.</div>
            )}
            {filteredContacts.map(contact => {
              const isActive = selectedContact?.id === contact.id;
              const lastMessage = threads[contact.id];
              return (
                <button
                  key={contact.id}
                  className={`w-full text-left p-3 rounded-xl border transition-colors ${
                    isActive
                      ? 'glass-card border-accent/40 shadow-sm'
                      : 'border-transparent hover:glass-card'
                  }`}
                  onClick={() => setSelectedContact(contact)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={contact.avatar_url || undefined} alt={displayName(contact)} />
                      <AvatarFallback>{displayName(contact).slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-primary truncate">{displayName(contact)}</span>
                        <Badge variant="outline" className="text-[11px]">
                          {roleLabel(contact.role, contact.is_admin)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {lastMessage ? lastMessage.content : 'Start a conversation'}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20">
          <CardHeader className="pb-2">
            {selectedContact ? (
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11">
                  <AvatarImage
                    src={selectedContact.avatar_url || undefined}
                    alt={displayName(selectedContact)}
                  />
                  <AvatarFallback>
                    {displayName(selectedContact).slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-semibold text-primary truncate">
                      {displayName(selectedContact)}
                    </h2>
                    <Badge variant="outline" className="text-[11px]">
                      {roleLabel(selectedContact.role, selectedContact.is_admin)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{selectedContact.email}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                <span>Select a contact to start chatting.</span>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-[50vh] md:h-[60vh] overflow-y-auto rounded-xl border border-primary/10 bg-white/40 p-3 flex flex-col gap-2">
              {loadingMessages && (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading conversation...
                </div>
              )}

              {!loadingMessages && selectedContact && messages.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                  No messages yet. Say hello!
                </div>
              )}

              {!loadingMessages && !selectedContact && (
                <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                  Choose someone from the left to view messages.
                </div>
              )}

              {!loadingMessages && messages.map(message => {
                const isMe = message.sender_id === profile.id;
                return (
                  <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                        isMe
                          ? 'bg-accent text-white rounded-br-none'
                          : 'bg-white text-primary border border-primary/10 rounded-bl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      <span className={`block text-[10px] mt-1 ${isMe ? 'text-white/80' : 'text-muted-foreground'}`}>
                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-end gap-2">
              <Textarea
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                placeholder={selectedContact ? 'Type your message...' : 'Select a contact to start chatting'}
                disabled={!selectedContact || sending}
                className="flex-1 min-h-[80px]"
                maxLength={1000}
              />
              <Button
                onClick={handleSend}
                disabled={!selectedContact || sending || !messageText.trim()}
                className="h-[80px]"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
