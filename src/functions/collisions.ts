/**
 * Given two elements, check if they collide.
 */
export const collisionInfo = (
  el1: HTMLElement,
  el2: HTMLElement,
): { isColliding: boolean; overlapArea: number } => {
  const r1 = el1.getBoundingClientRect();
  const r2 = el2.getBoundingClientRect();

  const overlapWidth =
    Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left);
  const overlapHeight =
    Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top);
  const overlapArea =
    overlapWidth <= 0 || overlapHeight <= 0 ? 0 : overlapWidth * overlapHeight;

  const isColliding = !(
    r1.right < r2.left ||
    r1.left > r2.right ||
    r1.bottom < r2.top ||
    r1.top > r2.bottom
  );

  return {
    isColliding,
    overlapArea,
  };
};
