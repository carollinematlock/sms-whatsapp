export function renderWithSamples(text: string, samples: Record<string, string>) {
  return text.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, key: string) =>
    Object.prototype.hasOwnProperty.call(samples, key) ? samples[key] : `{{${key}}}`
  );
}
