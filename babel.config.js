module.exports = function(api) {
  api.cache(true);
  
  const presets = [
    'babel-preset-expo',
    ['@babel/preset-react', {
      runtime: 'automatic'
    }],
    ['@babel/preset-typescript', {
      allowNamespaces: true,
      allowDeclareFields: true
    }]
  ];

  return {
    presets,
  };
};