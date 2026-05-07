/**
 * Video URL helper — YouTube / Vimeo / direct (mp4 vb) ayırt et,
 * embed iframe URL'ine çevir.
 */

export type VideoSource =
  | { kind: "youtube"; embedUrl: string; thumbnail: string; videoId: string }
  | { kind: "vimeo"; embedUrl: string; videoId: string }
  | { kind: "direct"; url: string }
  | null;

export function parseVideoUrl(url: string | null | undefined): VideoSource {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // YouTube — birkaç URL formu desteklenir
  // https://www.youtube.com/watch?v=ID
  // https://youtu.be/ID
  // https://youtube.com/shorts/ID
  // https://www.youtube.com/embed/ID
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/,
  );
  if (ytMatch?.[1]) {
    const id = ytMatch[1];
    return {
      kind: "youtube",
      videoId: id,
      embedUrl: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`,
      thumbnail: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
    };
  }

  // Vimeo
  // https://vimeo.com/ID
  // https://player.vimeo.com/video/ID
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch?.[1]) {
    const id = vimeoMatch[1];
    return {
      kind: "vimeo",
      videoId: id,
      embedUrl: `https://player.vimeo.com/video/${id}?title=0&byline=0&portrait=0`,
    };
  }

  // Direct: mp4, webm, mov vb. (Supabase Storage)
  return { kind: "direct", url: trimmed };
}

export function isEmbedUrl(url: string | null | undefined): boolean {
  const v = parseVideoUrl(url);
  return v?.kind === "youtube" || v?.kind === "vimeo";
}
