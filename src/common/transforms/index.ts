import { Transform } from 'class-transformer';

export function TransformBoolean() {
  return Transform(({ value }) => {
    if (value === 'true') {
      return true;
    }
    if (value === 'false') {
      return false;
    }
    return Boolean(value);
  });
}
