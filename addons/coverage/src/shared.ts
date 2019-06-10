export const ADDON_ID = 'storybookjs/coverage';
export const PANEL_ID = `${ADDON_ID}/panel`;
export const PARAM_KEY = `coverage`;

interface TextParameter {
  text: string;
}
interface MarkdownParameter {
  markdown: string;
}
interface DisabledParameter {
  disable: boolean;
}

export interface CoverageItem {
  statementMap: any;
  fnMap: any;
  branchMap: any;
}

// export type Parameters = string | TextParameter | MarkdownParameter | DisabledParameter;
export type CoverageMap = {
  [key: string]: CoverageItem;
};

function preprocessKey(fname: string) {
  const parts = fname.split('/');
  const last = parts[parts.length - 1];
  if (/index.[tj]sx?/.test(last) && parts.length > 1) {
    return parts[parts.length - 2];
  } else {
    return last
      .split('.')
      .slice(0, -1)
      .join('.');
  }
}

function preprocessVal(key: string, item: CoverageItem): CoverageItem {
  // console.log(key, item);
  return item;
}

// Object.fromEntries
function fromEntries(pairs: any[]): object {
  const ret: { [key: string]: any } = {};
  pairs.forEach(function(p: any[]) {
    const key: string = p[0];
    ret[key] = p[1];
  });
  return ret;
}

function preprocess(coverageMap: CoverageMap) {
  const entries = Object.entries(coverageMap);
  const preprocessed = entries
    .map(([key, val]) => [preprocessKey(key), val])
    .filter(([key, val]) => !!key)
    .map(([key, val]) => [key, preprocessVal(key as string, val as CoverageItem)]);
  const map = fromEntries(preprocessed) as CoverageMap;
  return map;
}

let __coverageMap: CoverageMap | undefined;
export const setCoverage = (coverageMap: CoverageMap) => {
  __coverageMap = preprocess(coverageMap);
  console.log('set', { __coverageMap });
};
export const getCoverage = () => {
  // console.log('get', { __coverageMap });
  return __coverageMap;
};
