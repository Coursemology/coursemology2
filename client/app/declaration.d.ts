declare module '*.scss' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.svg' {
  import { VFC, SVGProps } from 'react';

  const SVG: VFC<SVGProps<SVGSVGElement>>;
  export default SVG;
}

declare module '*.svg?url' {
  const svg: string;
  export default svg;
}
