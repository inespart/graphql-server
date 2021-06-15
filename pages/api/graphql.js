import { ApolloServer, gql, makeExecutableSchema } from 'apollo-server-micro';

require('dotenv').config();

const postgres = require('postgres');
const sql = postgres();

// users -> todos
// User -> Todo
// username -> title

const typeDefs = gql`
  # here we define the graphql query
  # that's also the schema we have on the playground
  type Query {
    todos: [Todo!]!
    checkedTodos(checked: Boolean!): [Todo!]
  }

  type Mutation {
    # : User! means -> return the new single user
    # when you create one thing just return this one thing
    createTodo(title: String!, checked: Boolean!): Todo!
  }

  type Todo {
    title: String!
    checked: Boolean!
  }
`;

// don't need the array anymore
// const todos = [
//   { title: 'Drink coffee', checked: false },
//   { title: 'Code JS', checked: true },
// ];

// define the function that connects to the database and gets all todos from there
async function getTodos() {
  return await sql`SELECT * FROM todos`;
}

// define the function that connects to the database and gets checked todos from there
async function getCheckedTodos(checked) {
  return await sql`SELECT * FROM todos WHERE checked = ${checked}`;
}

async function createTodo(title, checked) {
  const result = await sql`INSERT INTO todos (title, checked)
    VALUES (${title}, ${checked}) RETURNING id, title, checked
  `;
  // we just want to grab the first one
  return result[0];
}

// resolvers are the central piece of the server which resolves your data
// whenever you have a query it needs to resolve to a certain object
// resolvers: that's the code that's being executed when we perform the query

const resolvers = {
  // Query is a JS object
  Query: {
    // users() is a function query - that's the resolver for the users query
    todos() {
      // now we also have to call the function to connect to the database
      return getTodos();
    },
    // resolver for the user query
    // takes 4 arguments: first one is parent, second one are the parameters that are passed down from the query, third is context and fourth is info
    // but 3+4 we don't explore further now
    // { username } is destructured; actually it's args
    checkedTodos(parent, { checked }) {
      return getCheckedTodos(checked);
    },
  },

  Mutation: {
    createTodo: (parent, { title, checked }) => {
      // what should the mutation do? create a user and save it!
      // this function is still an async await function
      return createTodo(title, checked);
      // add the user to the database with .push
      // todos.push(newTodo);
      // when you create one thing just return this one thing
      // return newTodo;
    },
  },
};

// here we make the official schema
export const schema = makeExecutableSchema({ typeDefs, resolvers });

// we let the next.js app know a few things
export const config = {
  api: {
    bodyParser: false,
  },
};

// you pass it into the ApolloServer
export default new ApolloServer({ schema }).createHandler({
  path: '/api/graphql',
});

/*

# Removed and saved from graphiql

# Write your query or mutation here
query allUsers {
  users {
    username
    name
  }
}
# I want to pass in the username with the type of string
query singleUser($username: String) {
  # pass $username in as an argument
  user (username: $username) {
    name
  }
}

mutation createNewUser($name: String!, $username:String!) {
  createUser(name: $name, username: $username) {
    name
    username
  }
}
*/
