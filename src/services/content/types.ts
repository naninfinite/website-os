/**
 * SUMMARY
 * Content shapes for projects, media, and lore. These are intentionally
 * minimal and serializable to JSON so the frontend can hydrate from
 * /content/*.json files. Keep these lightweight so future Supabase
 * integration can map easily to these types.
 */

export type Project = {
  id: string;
  title: string;
  blurb: string;
  tags: string[];
  url?: string;
  repo?: string;
  year?: number;
};

export type Media = {
  id: string;
  title: string;
  src: string;
  alt: string;
  kind: 'image' | 'video';
  credit?: string;
  tags?: string[];
};

export type Lore = {
  id: string;
  key: string;
  value: string;
};


