import { parse as sdlParse } from 'graphql/language/parser';
import { print as sdlPrint } from 'graphql/language/printer';

export function transformHeaders(
  headers: [boolean, string, string][]
): Record<string, string> {
  let res = {} as Record<string, any>;
  for (let header of headers)
    if (header[0]) res[header[1] as unknown as string] = header[2];
  return res;
}

export function untransformHeaders(
  headers: Record<string, string>
): [boolean, string, string][] {
  return Object.entries(headers).map((e) => [true, ...e]);
}

export function edited2DArray(
  arr: [boolean, string, string][],
  row: number,
  col: number,
  val: string | boolean
): [boolean, string, string][] {
  let res = arr.slice();
  res[row][col] = val;
  return res;
}

export const toggleCacheDirective = (operationString:string|undefined):string => {
    if(!operationString) return ""
    let operationAst;
    try {
      operationAst = sdlParse(operationString);
    } catch (e) {
      console.error(e);
      return "ERROR";
    }
  
    const shouldAddCacheDirective = !operationAst.definitions.some((def:any) => {
      return def.directives.some((dir:any) => dir.name.value === 'cached');
    });
  
    const newOperationAst = JSON.parse(JSON.stringify(operationAst));
  
    newOperationAst.definitions = operationAst.definitions.map((def:any) => {
      if (def.kind === 'OperationDefinition' && def.operation === 'query') {
        const newDef = {
          ...def,
          directives: def.directives.filter((dir:any) => dir.name.value !== 'cached'),
        };
        if (shouldAddCacheDirective) {
          newDef.directives.push({
            kind: 'Directive',
            name: {
              kind: 'Name',
              value: 'cached',
            },
          });
        }
        return newDef;
      }
      return def;
    });
  
    try {
      const newString = sdlPrint(newOperationAst);
      return newString;
    } catch {
      throw new Error('cannot build the operation string');
    }
  };