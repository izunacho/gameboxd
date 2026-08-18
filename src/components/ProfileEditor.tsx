'use client';

import { useEffect, useState } from 'react';
import { Check, Sparkles, Link2, Loader2 } from 'lucide-react';
import Avatar from './Avatar';
import { AVATAR_PRESETS } from '@/lib/avatars';
import { setMyAvatar, updateMyProfile, setMyCosmetics } from '@/lib/user-data';
import { ACCENT_PRESETS, FRAME_PRESETS, getAccent, getFrameClass } from '@/lib/cosmetics';
import { supabase } from '@/lib/supabase';

const PATREON_URL = 'https://www.patreon.com/cw/hitboxd';

interface ProfileEditorProps {
  avatarUrl: string | null;
  bio: string | null;
  username: string;
  isPremium: boolean;
  accentColor: string | null;
  tickColor: string | null;
  avatarFrame: string | null;
  onSaved: (changes: {
    avatarUrl?: string | null;
    bio?: string | null;
    accentColor?: string | null;
    tickColor?: string | null;
    avatarFrame?: string | null;
  }) => void;
  onClose: () => void;
}

const BIO_MAX = 300;

/** Panel for picking an avatar, editing your bio, and premium cosmetics. */
export default function ProfileEditor({
  avatarUrl,
  bio,
  username,
  isPremium,
  accentColor,
  tickColor,
  avatarFrame,
  onSaved,
  onClose,
}: ProfileEditorProps) {
  const [selected, setSelected] = useState(avatarUrl);
  const [bioText, setBioText] = useState(bio || '');
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [savingBio, setSavingBio] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [accent, setAccent] = useState(accentColor);
  const [tick, setTick] = useState(tickColor);
  const [frame, setFrame] = useState(avatarFrame);
  const [savingCosmetic, setSavingCosmetic] = useState(false);

  const [patreonName, setPatreonName] = useState<string | null | undefined>(undefined); // undefined = loading
  const [patreonBusy, setPatreonBusy] = useState(false);

  useEffect(() => {
    supabase
      .from('patreon_links')
      .select('patreon_full_name')
      .maybeSingle()
      .then(
        ({ data }) => setPatreonName(data?.patreon_full_name ?? null),
        () => setPatreonName(null)
      );
  }, []);

  async function withAuthHeader(): Promise<Record<string, string>> {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error('NOT_LOGGED_IN');
    return { Authorization: `Bearer ${token}` };
  }

  const handleConnectPatreon = async () => {
    setPatreonBusy(true);
    setError(null);
    try {
      const headers = await withAuthHeader();
      const res = await fetch('/api/patreon/connect', { headers });
      if (!res.ok) throw new Error('Failed to start Patreon connect');
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      setError("Couldn't connect to Patreon. Try again.");
      console.error('Patreon connect failed:', err);
      setPatreonBusy(false);
    }
  };

  const handleDisconnectPatreon = async () => {
    if (!confirm('Disconnect your Patreon account?')) return;
    setPatreonBusy(true);
    setError(null);
    try {
      const headers = await withAuthHeader();
      const res = await fetch('/api/patreon/disconnect', { method: 'POST', headers });
      if (!res.ok) throw new Error('Failed to disconnect');
      setPatreonName(null);
    } catch (err) {
      setError("Couldn't disconnect Patreon. Try again.");
      console.error('Patreon disconnect failed:', err);
    } finally {
      setPatreonBusy(false);
    }
  };

  /**
   * Cosmetics save on click like the avatar picker does, rolling back the
   * optimistic value if the write fails.
   */
  const pickCosmetic = async (
    field: 'accent_color' | 'tick_color' | 'avatar_frame',
    value: string | null
  ) => {
    if (savingCosmetic) return;
    const setters = {
      accent_color: setAccent,
      tick_color: setTick,
      avatar_frame: setFrame,
    } as const;
    const previous = { accent_color: accent, tick_color: tick, avatar_frame: frame }[field];

    setters[field](value);
    setError(null);
    setSaved(false);
    setSavingCosmetic(true);
    try {
      await setMyCosmetics({ [field]: value });
      onSaved({
        accentColor: field === 'accent_color' ? value : undefined,
        tickColor: field === 'tick_color' ? value : undefined,
        avatarFrame: field === 'avatar_frame' ? value : undefined,
      });
      setSaved(true);
    } catch (err) {
      setters[field](previous);
      setError("Couldn't save that. Try again.");
      console.error('Cosmetic update failed:', err);
    } finally {
      setSavingCosmetic(false);
    }
  };

  const handlePick = async (url: string | null) => {
    if (savingAvatar || url === selected) return;
    const previous = selected;
    setSelected(url);
    setError(null);
    setSaved(false);
    setSavingAvatar(true);
    try {
      await setMyAvatar(url);
      onSaved({ avatarUrl: url });
      setSaved(true);
    } catch (err) {
      setSelected(previous);
      setError("Couldn't save that avatar. Try again.");
      console.error('Avatar update failed:', err);
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleSaveBio = async () => {
    setError(null);
    setSaved(false);
    setSavingBio(true);
    try {
      await updateMyProfile({ bio: bioText });
      onSaved({ bio: bioText.trim() || null });
      setSaved(true);
    } catch (err) {
      setError("Couldn't save your bio. Try again.");
      console.error('Bio update failed:', err);
    } finally {
      setSavingBio(false);
    }
  };

  return (
    <div className="card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Edit profile</h2>
        <button onClick={onClose} className="text-sm text-dark-text hover:text-primary">
          Done
        </button>
      </div>

      {/* Avatar picker */}
      <div>
        <div className="flex items-center gap-4 mb-4">
          <Avatar url={selected} username={username} size="lg" />
          <div>
            <p className="font-medium">Your avatar</p>
            <p className="text-sm text-dark-text">Pick one — it saves as soon as you choose.</p>
          </div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
          {AVATAR_PRESETS.map((preset) => {
            const isSelected = selected === preset.url;
            return (
              <button
                key={preset.id}
                onClick={() => handlePick(preset.url)}
                disabled={savingAvatar}
                title={preset.label}
                aria-label={preset.label}
                aria-pressed={isSelected}
                className={`relative rounded-lg p-1 border-2 transition-colors disabled:opacity-50 ${
                  isSelected ? 'border-primary' : 'border-transparent hover:border-dark-border'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preset.url}
                  alt=""
                  className="w-full aspect-square rounded-md bg-dark-bg"
                  style={{ imageRendering: 'pixelated' }}
                />
                {isSelected && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary on-primary rounded-full p-0.5">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {selected && (
          <button
            onClick={() => handlePick(null)}
            disabled={savingAvatar}
            className="text-sm text-dark-text hover:text-primary mt-3 disabled:opacity-50"
          >
            Remove avatar
          </button>
        )}
      </div>

      {/* Premium cosmetics. Shown to everyone, locked for non-members —
          hiding it would hide the reason to subscribe. */}
      <div className="pt-2 border-t border-dark-border">
        <div className="flex items-center gap-2 mt-4 mb-1">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="font-medium">Premium look</h3>
        </div>
        {isPremium ? (
          <p className="text-sm text-dark-text mb-4">
            Your colour paints the whole app for you, and your profile for everyone else.
          </p>
        ) : (
          <p className="text-sm text-dark-text mb-4">
            Pick an app colour, an avatar frame and a badge colour by supporting Hitboxd on{' '}
            <a
              href={PATREON_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Patreon
            </a>
            .
          </p>
        )}

        {/* Patreon connection — links this account so pledges/cancellations
            update premium automatically instead of needing a manual grant. */}
        <div className="flex items-center justify-between gap-3 bg-dark-bg rounded-lg px-4 py-3 mb-5">
          <div className="flex items-center gap-2 min-w-0">
            <Link2 className="w-4 h-4 text-dark-text shrink-0" />
            {patreonName === undefined ? (
              <span className="text-sm text-dark-text">Checking Patreon connection...</span>
            ) : patreonName !== null ? (
              <span className="text-sm truncate">
                Connected as <span className="font-medium">{patreonName}</span>
              </span>
            ) : (
              <span className="text-sm text-dark-text">Not connected to Patreon</span>
            )}
          </div>
          {patreonName !== undefined && (
            <button
              type="button"
              onClick={patreonName !== null ? handleDisconnectPatreon : handleConnectPatreon}
              disabled={patreonBusy}
              className="btn-secondary text-xs shrink-0 flex items-center gap-1.5 disabled:opacity-50"
            >
              {patreonBusy && <Loader2 className="w-3 h-3 animate-spin" />}
              {patreonName !== null ? 'Disconnect' : 'Connect Patreon'}
            </button>
          )}
        </div>

        <div className={isPremium ? '' : 'opacity-50 pointer-events-none select-none'}>
          {/* Accent colour */}
          <p className="text-sm font-medium mb-2">App colour</p>
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 mb-5">
            {ACCENT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => pickCosmetic('accent_color', preset.id)}
                disabled={!isPremium || savingCosmetic}
                title={preset.label}
                aria-label={preset.label}
                aria-pressed={accent === preset.id}
                className={`relative aspect-square rounded-full border-2 transition-colors ${
                  accent === preset.id ? 'border-white' : 'border-transparent'
                }`}
                style={{ background: `rgb(${preset.rgb})` }}
              >
                {accent === preset.id && (
                  <Check
                    className="w-3 h-3 absolute inset-0 m-auto"
                    style={{ color: `rgb(${preset.fg})` }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Badge colour */}
          <p className="text-sm font-medium mb-2">Badge colour</p>
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 mb-5">
            {ACCENT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => pickCosmetic('tick_color', preset.id)}
                disabled={!isPremium || savingCosmetic}
                title={preset.label}
                aria-label={preset.label}
                aria-pressed={tick === preset.id}
                className={`relative aspect-square rounded-full border-2 transition-colors ${
                  tick === preset.id ? 'border-white' : 'border-transparent'
                }`}
                style={{ background: `rgb(${preset.rgb})` }}
              >
                {tick === preset.id && (
                  <Check
                    className="w-3 h-3 absolute inset-0 m-auto"
                    style={{ color: `rgb(${preset.fg})` }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Avatar frame */}
          <p className="text-sm font-medium mb-2">Avatar frame</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => pickCosmetic('avatar_frame', null)}
              disabled={!isPremium || savingCosmetic}
              title="No frame"
              aria-label="No frame"
              aria-pressed={!frame}
              className={`rounded-lg p-1 border-2 ${
                !frame ? 'border-primary' : 'border-transparent'
              }`}
            >
              <Avatar url={selected} username={username} size="sm" />
            </button>
            {FRAME_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => pickCosmetic('avatar_frame', preset.id)}
                disabled={!isPremium || savingCosmetic}
                title={preset.label}
                aria-label={preset.label}
                aria-pressed={frame === preset.id}
                className={`rounded-lg p-1 border-2 ${
                  frame === preset.id ? 'border-primary' : 'border-transparent'
                }`}
              >
                <Avatar url={selected} username={username} size="sm" frame={preset.id} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="pt-2 border-t border-dark-border">
        <label htmlFor="bio" className="block text-sm font-medium mb-2 mt-4">
          Bio
        </label>
        <textarea
          id="bio"
          value={bioText}
          onChange={(e) => setBioText(e.target.value)}
          maxLength={BIO_MAX}
          rows={3}
          placeholder="Tell other players what you're into..."
          className="w-full px-4 py-2 rounded-lg bg-dark-bg border border-dark-border focus:border-primary outline-none resize-none"
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-dark-text">
            {bioText.length}/{BIO_MAX}
          </p>
          <button
            onClick={handleSaveBio}
            disabled={savingBio}
            className="btn-primary text-sm disabled:opacity-50"
          >
            {savingBio ? 'Saving...' : 'Save bio'}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {saved && !error && <p className="text-sm text-primary">Profile updated.</p>}
    </div>
  );
}
