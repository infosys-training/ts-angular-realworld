export function defaultImage(image: string | null | undefined): string {
  return image || '/assets/images/default-avatar.svg';
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
