### Migrate table create
## npx sequelize-cli migration:generate --name create_msrl_table

### Migration
## npx sequelize-cli db:migrate

## npx sequelize-cli db:migrate --to 20230726111118-notification.js

### Seed Create
## npx sequelize seed:generate --name projects

### Seed cmd
## npx sequelize-cli db:seed:all

### Seed single file 
## npx sequelize-cli db:seed --seed (20230705071845-products.js)

## rename column in sequalise - npx sequelize-cli migration:generate --name=alter-column-name

## npx  sequelize model:generate --name ModelName

## npx sequelize-cli db:seed --seed 20230915064440-destrorytempdata.js //testing purpose
