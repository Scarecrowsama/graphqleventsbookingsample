const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');

const graphqlSchema = require('./graphql/schema/index');
const graphqlResolvers = require('./graphql/resolvers/index');
const isAuth = require('./middleware/is-auth');

const app = express();

app.use(bodyParser.json());
app.use(isAuth);

app.use('/graphql', graphqlHttp({
  schema: graphqlSchema,
  rootValue: graphqlResolvers,
  graphiql: true
}));

mongoose.connect('mongodb://localhost/events-booking', { useNewUrlParser: true })
  .then(() => {
    app.listen(3000);
  })
  .catch(err => console.log(err));