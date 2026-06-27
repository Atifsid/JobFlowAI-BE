export const parseJSON = <T>(text: string): T => {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}") + 1;
  return JSON.parse(text.slice(start, end));
};