export type Point2D = [x: number, y: number];

/**
 * Angle at `b` formed by rays b->a and b->c, in degrees [0, 180].
 * Direct port of the notebook's numpy `arctan2` based calculation.
 */
export function calculateAngle(a: Point2D, b: Point2D, c: Point2D): number {
  const radians =
    Math.atan2(c[1] - b[1], c[0] - b[0]) - Math.atan2(a[1] - b[1], a[0] - b[0]);
  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}
