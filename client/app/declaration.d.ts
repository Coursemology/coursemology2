declare module '*.scss' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.svg' {
  import { SVGProps, VFC } from 'react';

  const SVG: VFC<SVGProps<SVGSVGElement>>;
  export default SVG;
}

declare module '*.svg?url' {
  const svg: string;
  export default svg;
}

declare const FIRST_BUILD_YEAR: string;
declare const LATEST_BUILD_YEAR: string;
