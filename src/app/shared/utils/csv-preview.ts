export interface CsvPreview {
    headers: string[];
    rows: string[][]; // primeras N filas
}
  
export async function csvPreviewFromFile(file: File, maxRows = 30, delimiter = ','): Promise<CsvPreview> {
    const text = await file.text();
  
    // Normaliza saltos de línea
    const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim().length > 0);
    if (lines.length === 0) return { headers: [], rows: [] };
  
    // Parse sencillo (no maneja comillas escapadas complejas; suficiente para preview)
    const parseLine = (line: string) =>
      line.split(delimiter).map(c => c.trim().replace(/^"|"$/g, ''));
  
    const headers = parseLine(lines[0]);
    const body = lines.slice(1, 1 + maxRows).map(parseLine);
  
    return { headers, rows: body };
}
  