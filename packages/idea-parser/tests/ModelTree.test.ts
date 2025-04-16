import fs from 'fs';
import { describe, it } from 'mocha';
import { expect, use } from 'chai';
import deepEqualInAnyOrder from 'deep-equal-in-any-order';
//NOTE: no extensions in tests because it's excluded in tsconfig.json and
//we are testing in a typescript environment via `ts-mocha -r tsx` (esm)
import ModelTree from '../src/trees/ModelTree';

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

describe('Model Tree', () => {
  it('Should parse Model', async () => {
    const actualRaw = ModelTree.parse(fs.readFileSync(`${import.meta.dirname}/fixtures/model.idea`, 'utf8'));
    const expectedRaw = JSON.parse(fs.readFileSync(`${import.meta.dirname}/fixtures/model.json`, 'utf8'));

    const actual = cleanAST(actualRaw);
    const expected = cleanAST(expectedRaw);
    //console.log(JSON.stringify(actual, null, 2));
    expect(actual).to.deep.equalInAnyOrder(expected);
  });

  // Line 37
  it('Should throw an error if the lexer does not return an IdentifierToken when expecting CapitalIdentifier', () => {
    const lexerMock = {
      expect: (tokenType: string) => {
        if (tokenType === 'CapitalIdentifier') {
          throw new Error('Expected CapitalIdentifier but got something else');
        }
      },
      load: () => {}
    };
  
    const modelTree = new ModelTree();
    modelTree['_lexer'] = lexerMock as any;
  
    expect(() => modelTree.parse('model foobar')).to.throw('Expected CapitalIdentifier but got something else');
  });

  it('Should parse negative values', async () => {
    const actualRaw = ModelTree.parse(fs.readFileSync(`${import.meta.dirname}/fixtures/address.idea`, 'utf8'));
    const expectedRaw = JSON.parse(fs.readFileSync(`${import.meta.dirname}/fixtures/address.json`, 'utf8'));
    
    const actual = cleanAST(actualRaw);
    const expected = cleanAST(expectedRaw);
    
    expect(actual).to.deep.equalInAnyOrder(expected);
  });
});
