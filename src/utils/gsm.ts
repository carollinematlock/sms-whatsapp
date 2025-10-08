export function estimateSmsParts(text: string, hasMedia: boolean) {
  const unicode = /[^\u0000-\u007F]/.test(text);
  const singleLimit = unicode ? 70 : 160;
  const concatLimit = unicode ? 67 : 153;
  const perSegment = text.length > singleLimit ? concatLimit : singleLimit;
  const length = text.length;
  const parts = Math.max(1, Math.ceil(length / perSegment));
  return { unicode, limit: singleLimit, perSegment, length, parts, mms: hasMedia };
}
