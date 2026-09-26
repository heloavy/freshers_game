import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TeamLeaderboardEntry, AdminMember } from '../types';

// ============================================================================
// SUPABASE CONFIGURATION:
// Connected to your Supabase Project:
// ============================================================================
export const DEFAULT_SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  (import.meta.env.NEXT_PUBLIC_SUPABASE_URL as string) ||
  'https://wqeeptcktnehgalrdywk.supabase.co';

export const DEFAULT_SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  (import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string) ||
  'sb_publishable_uXfEQC6YsQcMWWbnVY8SfA_effXUozR';

const STORAGE_KEY_URL = 'dtth_supabase_url';
const STORAGE_KEY_KEY = 'dtth_supabase_key';
const LOCAL_LEADERBOARD_KEY = 'dtth_local_leaderboard';
const LOCAL_ADMINS_KEY = 'dtth_admin_members';

// Default 4 Admin Members: Neethu N (Lead Director), Nithin P H, Likith S K, and Aayush
export const DEFAULT_ADMINS: AdminMember[] = [
  { id: 'admin-1', name: 'Neethu N (Lead Director)', role: 'Chief Organizer & Mission Commander', passcode: 'ADMIN-2026', email: 'neethunhs2006@gmail.com', avatar: '👑' },
  { id: 'admin-2', name: 'Nithin P H', role: 'Security Architect & Mission Co-Director', passcode: 'NITHIN-2026', email: 'nithin.ph@dtth.internal', avatar: '🛡️' },
  { id: 'admin-3', name: 'Likith S K', role: 'Scorekeeper & Quantum Marshal', passcode: 'LIKITH-2026', email: 'likith.sk@dtth.internal', avatar: '⚡' },
  { id: 'admin-4', name: 'Aayush', role: 'Code Arbiter & Technical Proctor', passcode: 'AAYUSH-2026', email: 'aayush@dtth.internal', avatar: '🥷' },
];

// Clean database: Start with 0 mock teams! Teams are only added when they register their details
const DEFAULT_TEAMS_SEED: TeamLeaderboardEntry[] = [];

const AVATAR_POOL = ['🚀', '🤖', '👾', '⚡', '🐉', '🛸', '🥷', '💻', '💀', '🦅', '🔥', '🪐', '💎', '🦊', '🛡️', '👑'];

class SupabaseService {
  private client: SupabaseClient | null = null;
  private currentUrl: string = '';
  private currentKey: string = '';
  private channel: ReturnType<SupabaseClient['channel']> | null = null;
  private localLeaderboard: TeamLeaderboardEntry[] = [];
  private admins: AdminMember[] = [];
  private broadcastChannel: BroadcastChannel | null = null;
  private subscribers: Array<(data: TeamLeaderboardEntry[]) => void> = [];
  private adminSubscribers: Array<(admins: AdminMember[]) => void> = [];

  constructor() {
    this.initCredentials();
    this.initLocalData();
    this.initAdmins();
    this.initBroadcast();
    this.initClient();
  }

  private initCredentials() {
    const savedUrl = localStorage.getItem(STORAGE_KEY_URL);
    const savedKey = localStorage.getItem(STORAGE_KEY_KEY);

    // If the saved URL is empty or does not match the default configured Supabase project,
    // sync it to the configured project URL and Key:
    if (DEFAULT_SUPABASE_URL && (!savedUrl || savedUrl !== DEFAULT_SUPABASE_URL)) {
      this.currentUrl = DEFAULT_SUPABASE_URL;
      this.currentKey = DEFAULT_SUPABASE_ANON_KEY;
      localStorage.setItem(STORAGE_KEY_URL, DEFAULT_SUPABASE_URL);
      localStorage.setItem(STORAGE_KEY_KEY, DEFAULT_SUPABASE_ANON_KEY);
    } else {
      this.currentUrl = savedUrl || DEFAULT_SUPABASE_URL || '';
      this.currentKey = savedKey || DEFAULT_SUPABASE_ANON_KEY || '';
    }
  }

  private initLocalData() {
    const saved = localStorage.getItem(LOCAL_LEADERBOARD_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Strictly only keep teams that have a non-empty registered team_name
          this.localLeaderboard = parsed.filter(
            (t: TeamLeaderboardEntry) =>
              Boolean(t && t.team_id && typeof t.team_name === 'string' && t.team_name.trim().length > 0)
          );
        } else {
          this.localLeaderboard = [];
        }
      } catch {
        this.localLeaderboard = [];
      }
    } else {
      this.localLeaderboard = [];
    }
  }

  private initAdmins() {
    const saved = localStorage.getItem(LOCAL_ADMINS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If saved list has old placeholder names, migrate immediately to the updated council
        const hasLegacyNames = Array.isArray(parsed) && parsed.some(
          (a: { name?: string }) =>
            a.name?.includes('Cyber Overseer') ||
            a.name?.includes('Quantum Core Marshal') ||
            a.name?.includes('Code Arbiter Prime')
        );
        if (hasLegacyNames || !Array.isArray(parsed) || parsed.length === 0) {
          this.admins = [...DEFAULT_ADMINS];
          localStorage.setItem(LOCAL_ADMINS_KEY, JSON.stringify(this.admins));
        } else {
          this.admins = parsed;
        }
      } catch {
        this.admins = [...DEFAULT_ADMINS];
        localStorage.setItem(LOCAL_ADMINS_KEY, JSON.stringify(this.admins));
      }
    } else {
      this.admins = [...DEFAULT_ADMINS];
      localStorage.setItem(LOCAL_ADMINS_KEY, JSON.stringify(this.admins));
    }
  }

  private initBroadcast() {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        this.broadcastChannel = new BroadcastChannel('dtth_leaderboard_sync');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data) {
            if (event.data.type === 'leaderboard' && Array.isArray(event.data.data)) {
              this.localLeaderboard = event.data.data;
              this.notifySubscribers();
            } else if (event.data.type === 'admins' && Array.isArray(event.data.data)) {
              this.admins = event.data.data;
              this.notifyAdminSubscribers();
            }
          }
        };
      }
    } catch {}
  }

  private initClient() {
    if (this.currentUrl && this.currentKey && this.isValidSupabaseConfig(this.currentUrl, this.currentKey)) {
      try {
        const win = window as unknown as { supabase?: { createClient: typeof createClient } };
        if (win.supabase && typeof win.supabase.createClient === 'function') {
          this.client = win.supabase.createClient(this.currentUrl, this.currentKey);
        } else {
          this.client = createClient(this.currentUrl, this.currentKey);
        }
      } catch (err) {
        console.warn('Could not initialize Supabase client:', err);
        this.client = null;
      }
    } else {
      this.client = null;
    }
  }

  public isValidSupabaseConfig(url: string, key: string): boolean {
    return Boolean(url && url.startsWith('http') && key && key.length > 20);
  }

  public isConnected(): boolean {
    return this.client !== null && this.isValidSupabaseConfig(this.currentUrl, this.currentKey);
  }

  public getConfig() {
    return {
      url: this.currentUrl,
      key: this.currentKey,
      isConnected: this.isConnected(),
    };
  }

  public setConfig(url: string, key: string) {
    this.currentUrl = url.trim();
    this.currentKey = key.trim();
    localStorage.setItem(STORAGE_KEY_URL, this.currentUrl);
    localStorage.setItem(STORAGE_KEY_KEY, this.currentKey);

    if (this.channel) {
      try {
        this.channel.unsubscribe();
      } catch {}
      this.channel = null;
    }

    this.initClient();
    this.setupRealtimeSubscription();
  }

  // Admin Management
  public getAdmins(): AdminMember[] {
    return [...this.admins];
  }

  public saveAdmins(updatedAdmins: AdminMember[]) {
    this.admins = updatedAdmins;
    localStorage.setItem(LOCAL_ADMINS_KEY, JSON.stringify(this.admins));
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'admins', data: this.admins });
    }
    this.notifyAdminSubscribers();
  }

  public resetAdminsToDefault(): AdminMember[] {
    this.admins = [...DEFAULT_ADMINS];
    localStorage.setItem(LOCAL_ADMINS_KEY, JSON.stringify(this.admins));
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'admins', data: this.admins });
    }
    this.notifyAdminSubscribers();
    return [...this.admins];
  }

  public subscribeToAdmins(cb: (admins: AdminMember[]) => void): () => void {
    this.adminSubscribers.push(cb);
    cb([...this.admins]);
    return () => {
      this.adminSubscribers = this.adminSubscribers.filter((s) => s !== cb);
    };
  }

  private notifyAdminSubscribers() {
    this.adminSubscribers.forEach((cb) => {
      try {
        cb([...this.admins]);
      } catch {}
    });
  }

  private saveLocalLeaderboard() {
    if (this.localLeaderboard.length === 0) {
      localStorage.removeItem(LOCAL_LEADERBOARD_KEY);
    } else {
      localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(this.localLeaderboard));
    }
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'leaderboard', data: this.localLeaderboard });
    }
    this.notifySubscribers();
  }

  private notifySubscribers() {
    const sorted = this.sortLeaderboard([...this.localLeaderboard]);
    this.subscribers.forEach((cb) => {
      try {
        cb(sorted);
      } catch {}
    });
  }

  // Sort Leaderboard:
  // 1. Filter to only registered squads with a valid team name
  // 2. Disqualified teams always placed at bottom
  // 3. Teams that have completed all 5 levels (current_level > 5) rank at top
  // 4. For completed teams:
  //    - Organised by MORE POINTS (higher score) and LESS TIME (faster total time: elapsed + penalties)
  // 5. For teams in progress:
  //    - Highest sector level reached > Higher score > Less time
  public sortLeaderboard(list: TeamLeaderboardEntry[]): TeamLeaderboardEntry[] {
    const validTeams = list.filter(
      (t) => Boolean(t && t.team_id && typeof t.team_name === 'string' && t.team_name.trim().length > 0)
    );

    return validTeams.sort((a, b) => {
      // 1. Disqualification check
      if (a.is_disqualified && !b.is_disqualified) return 1;
      if (!a.is_disqualified && b.is_disqualified) return -1;

      const aCompleted = (a.current_level ?? 1) > 5;
      const bCompleted = (b.current_level ?? 1) > 5;

      const totalTimeA = (a.elapsed_time || 0) + (a.penalties || 0);
      const totalTimeB = (b.elapsed_time || 0) + (b.penalties || 0);

      // 2. Teams who have completed all levels are ranked ahead of in-progress teams
      if (aCompleted && !bCompleted) return -1;
      if (!aCompleted && bCompleted) return 1;

      // 3. If both completed all levels:
      // Organised by more points scored and less time to complete all levels
      if (aCompleted && bCompleted) {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        if (totalTimeA !== totalTimeB) {
          return totalTimeA - totalTimeB;
        }
        return (a.elapsed_time || 0) - (b.elapsed_time || 0);
      }

      // 4. For teams still in progress:
      if (b.current_level !== a.current_level) {
        return b.current_level - a.current_level;
      }
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      if (totalTimeA !== totalTimeB) {
        return totalTimeA - totalTimeB;
      }
      return (a.elapsed_time || 0) - (b.elapsed_time || 0);
    });
  }

  public async fetchLeaderboard(): Promise<TeamLeaderboardEntry[]> {
    if (this.client) {
      try {
        const { data, error } = await this.client
          .from('leaderboard')
          .select('*');

        if (!error && Array.isArray(data)) {
          // If database returns 0 rows (clean empty database), ensure localLeaderboard is []
          this.localLeaderboard = data.filter(
            (t) => Boolean(t && t.team_id && typeof t.team_name === 'string' && t.team_name.trim().length > 0)
          );
          this.saveLocalLeaderboard();
          return this.sortLeaderboard([...this.localLeaderboard]);
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to cached state:', err);
      }
    }
    return this.sortLeaderboard([...this.localLeaderboard]);
  }

  public async upsertLeaderboard(entry: Partial<TeamLeaderboardEntry> & { team_id: string; team_name: string }): Promise<TeamLeaderboardEntry> {
    const existingIdx = this.localLeaderboard.findIndex((t) => t.team_id === entry.team_id);
    const prev = existingIdx >= 0 ? this.localLeaderboard[existingIdx] : null;

    // ANTI-CHEAT LOCK: If a team has completed all levels (current_level > 5), their score is immutable.
    if (prev && (prev.current_level > 5)) {
      console.warn(`Team ${entry.team_id} has already completed the hunt. Record is permanently locked.`);
      return prev;
    }

    // ANTI-CHEAT DUPLICATE: Reject if another team already registered with this exact team name
    if (entry.team_name) {
      const normalizedName = entry.team_name.trim().toLowerCase();
      const duplicateTeam = this.localLeaderboard.find(
        (t) => t.team_id !== entry.team_id && t.team_name && t.team_name.trim().toLowerCase() === normalizedName
      );
      if (duplicateTeam) {
        console.warn(`Team name "${entry.team_name}" already exists on leaderboard. Cannot reuse.`);
        return duplicateTeam;
      }
    }

    const updatedEntry: TeamLeaderboardEntry = {
      team_id: entry.team_id,
      team_name: entry.team_name,
      avatar: entry.avatar || prev?.avatar || '🚀',
      current_level: entry.current_level ?? prev?.current_level ?? 1,
      score: entry.score ?? prev?.score ?? 0,
      elapsed_time: entry.elapsed_time ?? prev?.elapsed_time ?? 0,
      penalties: entry.penalties ?? prev?.penalties ?? 0,
      is_disqualified: entry.is_disqualified ?? prev?.is_disqualified ?? false,
      updated_at: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      this.localLeaderboard[existingIdx] = updatedEntry;
    } else {
      this.localLeaderboard.push(updatedEntry);
    }
    this.saveLocalLeaderboard();

    if (this.client) {
      try {
        const { error } = await this.client
          .from('leaderboard')
          .upsert(updatedEntry, { onConflict: 'team_id' });
        if (error) {
          console.warn('Supabase upsert error:', error.message);
          // If the table was created without avatar or is_disqualified column, fallback to base fields
          if (error.message?.includes('column') || error.code === '42703') {
            const fallbackEntry = {
              team_id: updatedEntry.team_id,
              team_name: updatedEntry.team_name,
              current_level: updatedEntry.current_level,
              score: updatedEntry.score,
              elapsed_time: updatedEntry.elapsed_time,
              penalties: updatedEntry.penalties,
              updated_at: updatedEntry.updated_at,
            };
            await this.client.from('leaderboard').upsert(fallbackEntry, { onConflict: 'team_id' });
          }
        }
      } catch (err) {
        console.warn('Failed to upsert to Supabase:', err);
      }
    }

    return updatedEntry;
  }

  public getLeaderboardSnapshot(): TeamLeaderboardEntry[] {
    return [...this.localLeaderboard];
  }

  // Admin bulk operations: add new team, delete team, reset team, reset all
  public async addCustomTeam(teamId: string, teamName: string, avatar: string = '🚀'): Promise<TeamLeaderboardEntry> {
    const newEntry: TeamLeaderboardEntry = {
      team_id: teamId.trim().toUpperCase(),
      team_name: teamName.trim(),
      avatar,
      current_level: 1,
      score: 0,
      elapsed_time: 0,
      penalties: 0,
      updated_at: new Date().toISOString(),
    };

    return this.upsertLeaderboard(newEntry);
  }

  public async deleteTeam(teamId: string) {
    this.localLeaderboard = this.localLeaderboard.filter((t) => t.team_id !== teamId);
    this.saveLocalLeaderboard();

    if (this.client) {
      try {
        await this.client.from('leaderboard').delete().eq('team_id', teamId);
        await this.fetchLeaderboard();
      } catch (err) {
        console.warn('Failed to delete team in Supabase:', err);
      }
    }
  }

  public async resetTeamScore(teamId: string) {
    const team = this.localLeaderboard.find((t) => t.team_id === teamId);
    if (team) {
      await this.upsertLeaderboard({
        ...team,
        current_level: 1,
        score: 0,
        elapsed_time: 0,
        penalties: 0,
      });
    }
  }

  public async adjustTeamScore(teamId: string, deltaScore: number, deltaPenalties: number = 0) {
    const team = this.localLeaderboard.find((t) => t.team_id === teamId);
    if (team) {
      const newScore = Math.max(0, (team.score || 0) + deltaScore);
      const newPenalties = Math.max(0, (team.penalties || 0) + deltaPenalties);
      await this.upsertLeaderboard({
        ...team,
        score: newScore,
        penalties: newPenalties,
      });
    }
  }

  public async toggleDisqualify(teamId: string) {
    const team = this.localLeaderboard.find((t) => t.team_id === teamId);
    if (team) {
      await this.upsertLeaderboard({
        ...team,
        is_disqualified: !team.is_disqualified,
      });
    }
  }

  public async resetAllTeams() {
    this.localLeaderboard = this.localLeaderboard.map((t) => ({
      ...t,
      current_level: 1,
      score: 0,
      elapsed_time: 0,
      penalties: 0,
      updated_at: new Date().toISOString(),
    }));
    this.saveLocalLeaderboard();

    if (this.client) {
      try {
        for (const team of this.localLeaderboard) {
          await this.client.from('leaderboard').upsert(team, { onConflict: 'team_id' });
        }
      } catch {}
    }
  }

  // Clean Wipe: Delete all teams to restore fully clean database
  public async deleteAllTeams(): Promise<void> {
    this.localLeaderboard = [];
    localStorage.removeItem(LOCAL_LEADERBOARD_KEY);
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'leaderboard', data: [] });
    }
    this.notifySubscribers();

    if (this.client) {
      try {
        // Delete all rows in the leaderboard table
        const { error } = await this.client.from('leaderboard').delete().neq('team_id', '___PURGE_ALL_FLAG___');
        if (error) {
          console.warn('Direct purge failed, fetching ids to delete:', error.message);
          const { data } = await this.client.from('leaderboard').select('team_id');
          if (data && data.length > 0) {
            const ids = data.map((d: { team_id: string }) => d.team_id);
            await this.client.from('leaderboard').delete().in('team_id', ids);
          }
        }
      } catch (err) {
        console.warn('Failed to wipe Supabase leaderboard table:', err);
      }
    }
  }

  public subscribeToLeaderboard(callback: (data: TeamLeaderboardEntry[]) => void): () => void {
    this.subscribers.push(callback);
    callback(this.sortLeaderboard([...this.localLeaderboard]));
    this.setupRealtimeSubscription();

    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== callback);
    };
  }

  private setupRealtimeSubscription() {
    if (!this.client) return;

    try {
      if (this.channel) {
        this.channel.unsubscribe();
      }

      this.channel = this.client
        .channel('public:leaderboard')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'leaderboard' },
          (payload) => {
            if (payload.eventType === 'DELETE') {
              const old = payload.old as Record<string, unknown> | undefined;
              const deletedId = (old?.team_id || old?.id) as string | undefined;
              if (deletedId) {
                this.localLeaderboard = this.localLeaderboard.filter(
                  (t) => t.team_id !== deletedId && (t as unknown as Record<string, unknown>).id !== deletedId
                );
                this.saveLocalLeaderboard();
              }
              // Immediately fetch fresh state from DB to guarantee instant sync
              this.fetchLeaderboard();
            } else if (payload.new && (payload.new as TeamLeaderboardEntry).team_id) {
              const newEntry = payload.new as TeamLeaderboardEntry;
              // Only include if registered with a valid team name
              if (newEntry.team_name && newEntry.team_name.trim().length > 0) {
                const idx = this.localLeaderboard.findIndex((t) => t.team_id === newEntry.team_id);
                if (idx >= 0) {
                  this.localLeaderboard[idx] = newEntry;
                } else {
                  this.localLeaderboard.push(newEntry);
                }
                this.saveLocalLeaderboard();
              } else {
                // If row has no name, remove if previously present
                this.localLeaderboard = this.localLeaderboard.filter((t) => t.team_id !== newEntry.team_id);
                this.saveLocalLeaderboard();
              }
            } else {
              // Any other change event
              this.fetchLeaderboard();
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('Realtime connected to public:leaderboard');
          }
        });
    } catch (err) {
      console.warn('Realtime subscription error:', err);
    }
  }

  public async testConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
    if (!this.isValidSupabaseConfig(url, key)) {
      return { success: false, message: 'Invalid URL or Anon Key format.' };
    }

    try {
      const testClient = createClient(url, key);
      const { error } = await testClient.from('leaderboard').select('count', { count: 'exact', head: true });
      if (error) {
        return { success: false, message: `Connected to Supabase, but error querying leaderboard table: ${error.message}. Did you run the SQL setup script?` };
      }
      return { success: true, message: 'Successfully connected and verified public:leaderboard table!' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, message: `Connection failed: ${msg}` };
    }
  }
}

export const supabaseService = new SupabaseService();
