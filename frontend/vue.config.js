let targetUrl = 'http://localhost:5000'

module.exports = {
  publicPath: './',
  devServer: {
    proxy: {
      '^/api': {
        target: targetUrl,
        ws: true,
        changeOrigin: true,
      },
      '^/files': {
        target: targetUrl,
        ws: true,
        changeOrigin: true,
      },
    }
  }
}
