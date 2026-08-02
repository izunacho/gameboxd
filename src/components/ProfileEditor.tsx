'use client';

import { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import Avatar from './Avatar';
import { uploadAvatar, updateMyProfile } from '@/lib/user-data';

interface ProfileEditorProps {
  avatarUrl: string | null;
  bio: string | null;
  username: string;
  onSaved: (changes: { avatarUrl?: string; bio?: string | null }) => void;
  onClose: () => void;
}

const BIO_MAX = 300;

/** Panel for changing your profile picture and bio. */
export default function ProfileEditor({
  avatarUrl,
  bio,
  username,
  onSaved,
  onClose,
}: ProfileEditorProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(avatarUrl);
  const [bioText, setBioText] = useState(bio || '');
  const [uploading, setUploading] = useState(false);
  const [savingBio, setSavingBio] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setSaved(false);
    setUploading(true);
    try {
      const url = await uploadAvatar(file);
      setPreview(url);
      onSaved({ avatarUrl: url });
      setSaved(true);
    } catch (err: any) {
      if (err?.message === 'INVALID_TYPE') {
        setError('Pick a JPG, PNG, WebP or GIF image.');
      } else if (err?.message === 'TOO_LARGE') {
        setError('That image is over 2 MB. Try a smaller one.');
      } else {
        setError("Couldn't upload that picture. Try again.");
        console.error('Avatar upload failed:', err);
      }
    } finally {
      setUploading(false);
      // Allow picking the same file again after an error
      if (fileInput.current) fileInput.current.value = '';
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

      {/* Profile picture */}
      <div className="flex items-center gap-4">
        <Avatar url={preview} username={username} size="lg" />
        <div>
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFile}
            className="hidden"
          />
          <button
            onClick={() => fileInput.current?.click()}
            disabled={uploading}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
            {uploading ? 'Uploading...' : preview ? 'Change picture' : 'Add a picture'}
          </button>
          <p className="text-xs text-dark-text mt-2">JPG, PNG, WebP or GIF, up to 2 MB.</p>
        </div>
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium mb-2">
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
