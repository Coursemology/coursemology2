import { FC, useEffect, useState } from 'react';

interface AudioPreviewProps {
  // A local file not yet uploaded, e.g. one just picked or recorded. Takes precedence over `url`.
  file?: File | null;
  // An already-uploaded file.
  url?: string | null;
}

/**
 * A standalone audio player, rendered by the caller rather than passed as a `previewComponent`:
 * SingleFileInput only shows its preview component inside the dropzone, and only for dropped files.
 */
const AudioPreview: FC<AudioPreviewProps> = ({ file, url }) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  // Created in the effect rather than during render, so that StrictMode's remount revokes only a URL
  // it created itself, never the one being played.
  useEffect(() => {
    if (!file) {
      setObjectUrl(null);
      return undefined;
    }
    const created = URL.createObjectURL(file);
    setObjectUrl(created);
    return () => URL.revokeObjectURL(created);
  }, [file]);

  const src = file ? objectUrl : url;
  if (!src) return null;

  return (
    <audio controls src={src}>
      <track kind="captions" />
    </audio>
  );
};

export default AudioPreview;
