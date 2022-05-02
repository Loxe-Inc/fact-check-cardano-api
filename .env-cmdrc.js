const dotenv = require("dotenv")
dotenv.config()
module.exports = {
  development: {
    NODE_ENV: 'development',
  },
  production: {
    NODE_ENV: 'production',
  },
	common: {
	}
}
