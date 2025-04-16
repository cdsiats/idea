import fs from 'fs';
import { describe, it } from 'mocha';
import { expect, use } from 'chai';
import deepEqualInAnyOrder from 'deep-equal-in-any-order';
//NOTE: no extensions in tests because it's excluded in tsconfig.json and
//we are testing in a typescript environment via `ts-mocha -r tsx` (esm)
import EnumTree from '../src/trees/EnumTree';

use(deepEqualInAnyOrder);

/*
* The cleanAST function is used to remove start and end
* properties from ASTs for comparison.
*/
const cleanAST = (node: any) => {
  if (typeof node === 'object' && node !== null) {
    const { start, end, ...rest } = node;
    return Object.keys(rest).reduce((acc, key) => {
      acc[key] = Array.isArray(rest[key])
        ? rest[key].map(cleanAST)
        : cleanAST(rest[key]);
      return acc;
    }, {});
  }
  return node;
};

describe('Enum Tree', () => {
  it('Should parse Enums', async () => {
    const actualRaw = EnumTree.parse(fs.readFileSync(`${import.meta.dirname}/fixtures/enum.idea`, 'utf8'));
    const expectedRaw = JSON.parse(fs.readFileSync(`${import.meta.dirname}/fixtures/enum.json`, 'utf8'));

    const actual = cleanAST(actualRaw);
    const expected = cleanAST(expectedRaw);
    //console.log(JSON.stringify(actual, null, 2));
    expect(actual).to.deep.equalInAnyOrder(expected);
  });

  // Line 37
  it('Should throw an error when the input is an empty string', () => {
    expect(() => {
      const lexerMock = {
        expect: (tokenType: string) => { throw new Error('Unexpected end of input'); },
        load: () => {}
      };
      const enumTree = new EnumTree();
      (enumTree as any)._lexer = lexerMock;
      enumTree.parse('');
    }).to.throw(Error, 'Unexpected end of input');
  });



});
