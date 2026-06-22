const DEFAULT_IMAGE = '/assets/images/default-avatar.svg';

export function defaultImage(image: string | null | undefined): string {
  return image || DEFAULT_IMAGE;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
