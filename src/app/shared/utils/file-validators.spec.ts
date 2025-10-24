import { hasAllowedExtension, hasAllowedMime, isUnderMaxSize } from './file-validators';

const makeFile = (name: string, type = 'text/csv', size = 1024) =>
  new File(['x'.repeat(size)], name, { type });

describe('file-validators', () => {
  it('valida extensión .csv', () => {
    expect(hasAllowedExtension(makeFile('ok.csv'), ['.csv'])).toBeTrue();
    expect(hasAllowedExtension(makeFile('bad.txt'), ['.csv'])).toBeFalse();
  });

  it('valida mime text/csv y acepta type vacío', () => {
    expect(hasAllowedMime(makeFile('x.csv', 'text/csv'), ['text/csv'])).toBeTrue();
    expect(hasAllowedMime(makeFile('x.csv', ''), ['text/csv'])).toBeTrue(); // navegadores que no setean type
    expect(hasAllowedMime(makeFile('x.csv', 'application/json'), ['text/csv'])).toBeFalse();
  });

  it('valida tamaño máximo configurado', () => {
    expect(isUnderMaxSize(makeFile('x.csv', 'text/csv', 5), 10)).toBeTrue();
    expect(isUnderMaxSize(makeFile('x.csv', 'text/csv', 15), 10)).toBeFalse();
  });
});
