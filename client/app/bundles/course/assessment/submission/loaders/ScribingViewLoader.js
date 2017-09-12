const { Promise } = global;

export default () => (
  Promise.all([
    import(/* webpackChunkName: "react-color" */ 'react-color'),
    import(/* webpackChunkName: "fabric" */ 'fabric'),
  ])
);
