export const truncateLabel = (label: string, maxLength: number = 10) => {
  if (!label) return '';
  if (label.length <= maxLength) return label;
  return label.substring(0, maxLength) + '...';
};
