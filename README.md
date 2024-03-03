# SETUP
In order to use this, you need to set some values in config.json (not included in the repo)
 
```json
{
  "database": {
    "host": "localhost",
    "port": 3306,
    "username": "[USERNAME]",
    "password": "[PASSWORD]",
    "database_name": "[DATABASE]"
  },
  "gretel": {
    "model_id": "[GRETEL MODEL ID]",
    "secret": "[GRETEL API KEY]",
  },
  "environment": {
    "debug": true,
    "express_port": 3000
  }
}
```

### database
- host: The uri of the database (most of the time will be localhost)
- port: The port that sqlite is running on
- username: The MySQL username
- password: The password of the MySQL user
- database_name: The database with the data for this project

### gretel
- model_id: The model id of the model to use on Gretel
- secret: The API key for the Gretel account with access to the model

### environment
- debug: Enables debug-only endpoints for development. NOT SECURE, DO NOT USE WITH THIS ENABLED IN PRODUCTION!
- express_port: The port that the express server runs on