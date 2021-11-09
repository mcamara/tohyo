module.exports = {
  babel: {
    presets: [],
    plugins: ['@babel/plugin-syntax-bigint'],
    loaderOptions: { /* Any babel-loader configuration options: https://github.com/babel/babel-loader. */ },
  },
  style: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
}
