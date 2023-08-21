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

declare module '*.csv?url' {
  const csv: string;
  export default csv;
}

declare module '*.png?url' {
  const png: string;
  export default png;
}

declare const FIRST_BUILD_YEAR: string;
declare const LATEST_BUILD_YEAR: string;

declare module '*.md' {
  const markdown: string;
  export default markdown;
}

interface Window {
  _CSRF_TOKEN?: string;
}
