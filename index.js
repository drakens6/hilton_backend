const express = require('express');
const { gql } = require('apollo-server');
const { ApolloServer } =  require('apollo-server-express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const reservations = {
    1: {
        name: 'Reservation 1',
        id: '1',
        hotelName: 'Holiday Inn Greensboro',
        arrivalDate: new Date().toISOString(),
        departureDate: new Date().toISOString()
    }
}

const typeDefs = gql`
  type Query {
    reservations: [Reservation]
    reservation(id: ID!): Reservation
  }
  type Mutation {
    reservation(name: String!, hotelName: String!, arrivalDate: String!, departureDate: String!): ID!
  }
  type Reservation {
    id: ID!
    name: String!
    hotelName: String!
    arrivalDate: String!
    departureDate: String!
  }
`;

const resolvers = {
  Query: {
    reservations: () => Object.values(reservations),
    reservation: (parent, { id }) => reservations[id]
  },
  Mutation: {
    reservation: (parent, {name, hotelName, arrivalDate, departureDate}) => {
        const id = Object.values(reservations).length + 1
        const reservation = {
            'name': name,
            'id': id,
            'hotelName': hotelName,
            'arrivalDate': arrivalDate,
            'departureDate': departureDate
        }
        reservations[id] = reservation; 
        return id;
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.applyMiddleware({ app, path: '/graphql' });

//Rest workarounds - use resolvers directly
app.get('/reservations', function(req,res) {
    res.send(JSON.stringify(resolvers.Query.reservations()))
})
app.get('/reservation/:id', function(req, res) {
    res.send(JSON.stringify(resolvers.Query.reservation(null, {id: req.params.id})))
})
app.post('/reservation', function(req, res) {
    res.send(JSON.stringify(resolvers.Mutation.reservation(null, req.body)))
})

app.listen({ port: 8000 }, () => {
    console.log('Apollo Server on http://localhost:8000/graphql');
});
