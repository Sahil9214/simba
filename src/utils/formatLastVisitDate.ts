export const formatLastVisitDate = (dateString: string | any): string => {
  if (!dateString) return 'N/A';
  const raw = typeof dateString === 'object' && dateString?.formatted ? dateString.formatted : dateString;
  const date = new Date(raw);
  if (isNaN(date.getTime())) {
    return typeof raw === 'string' ? raw : 'N/A';
  }
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }
};

export const formatDayLabel = (dateString: string | any): string => {
  if (!dateString) return 'N/A';
  const raw = typeof dateString === 'object' && dateString?.formatted ? dateString.formatted : dateString;
  const inputDate = new Date(raw);
  if (isNaN(inputDate.getTime())) {
    return typeof raw === 'string' ? raw : 'N/A';
  }
  const today = new Date();

  // Normalize time (important!)
  const normalize = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const input = normalize(inputDate);
  const current = normalize(today);

  const diffInDays =
    (input.getTime() - current.getTime()) / (1000 * 60 * 60 * 24);

  if (diffInDays === 0) {
    return 'Today';
  }

  if (diffInDays === 1) {
    return 'Tomorrow';
  }

  if (diffInDays === -1) {
    return 'Yesterday';
  }

  // dd/mm/yyyy format
  const day = String(input.getDate()).padStart(2, '0');
  const month = String(input.getMonth() + 1).padStart(2, '0');
  const year = input.getFullYear();

  return `${day}/${month}/${year}`;
};
