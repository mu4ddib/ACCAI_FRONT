export interface CsvPreview {
  headers: string[];
  rows: string[][];
}

export async function csvPreviewFromFile(
  file: File,
  maxRows: number = Number.POSITIVE_INFINITY,
  delimiter = ','
): Promise<CsvPreview> {
  const text = await file.text();
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseLine = (line: string) => line.split(delimiter).map(c => c.trim().replace(/^"|"$/g, ''));
  const headers = parseLine(lines[0]);
  const body = lines.slice(1, 1 + (Number.isFinite(maxRows) ? maxRows : lines.length)).map(parseLine);

  return { headers, rows: body };
}
