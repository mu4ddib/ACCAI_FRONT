import { csvPreviewFromFile } from './csv-preview';

const makeFile = (txt: string, name = 'x.csv', type = 'text/csv') =>
  new File([txt], name, { type });

describe('csvPreviewFromFile', () => {
  it('parsea headers y filas con coma (trim + sin comillas)', async () => {
    const content = ` A , "B" , C \n 1 , "2" , 3 \n 4 , 5 , 6 \n`;
    const file = makeFile(content);
    const res = await csvPreviewFromFile(file);
    expect(res.headers).toEqual(['A', 'B', 'C']);
    expect(res.rows.length).toBe(2);
    expect(res.rows[0]).toEqual(['1', '2', '3']);
  });

  it('soporta delimitador punto y coma', async () => {
    const content = `A;B;C\n1;2;3\n`;
    const file = makeFile(content);
    const res = await csvPreviewFromFile(file, Number.POSITIVE_INFINITY, ';');
    expect(res.headers).toEqual(['A', 'B', 'C']);
    expect(res.rows[0]).toEqual(['1', '2', '3']);
  });

  it('respeta maxRows', async () => {
    const content = `A,B\n1,2\n3,4\n5,6\n`;
    const file = makeFile(content);
    const res = await csvPreviewFromFile(file, 1);
    expect(res.rows.length).toBe(1);
    expect(res.rows[0]).toEqual(['1', '2']);
  });

  it('vacío -> arrays vacíos', async () => {
    const file = makeFile(`\n \n`);
    const res = await csvPreviewFromFile(file);
    expect(res.headers).toEqual([]);
    expect(res.rows).toEqual([]);
  });
});
