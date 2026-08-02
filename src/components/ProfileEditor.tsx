'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import Avatar from './Avatar';
import { AVATAR_PRESETS } from '@/lib/avatars';
import { setMyAvatar, updateMyProfile } from '@/lib/user-data';

interface ProfileEditorProps {
  avatarUrl: string | null;
  bio: string | null;
  username: string;
  onSaved: (changes: { avatarUrl?: string | null; bio?: string | null }) => void;
  onClose: () => void;
}

const BIO_MAX = 300;

/** Panel for picking an avatar and editing your bio. */
export default function ProfileEditor({
  avatarUrl,
  bio,
  username,
  onSaved,
  onClose,
}: ProfileEditorProps) {
  const [selected, setSelected] = useState(avatarUrl);
  const [bioText, setBioText] = useState(bio || '');
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [savingBio, setSavingBio] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

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
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-black rounded-full p-0.5">
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
