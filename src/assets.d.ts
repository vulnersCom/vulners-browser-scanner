/* Asset module declarations so TS/TSX imports of static files type-check.
   esbuild resolves these at build time (svg -> data URL). */
declare module '*.svg' {
  const url: string;
  export default url;
}
declare module '*.png' {
  const url: string;
  export default url;
}
declare module '*.jpg' {
  const url: string;
  export default url;
}
declare module '*.scss';
declare module '*.css';
