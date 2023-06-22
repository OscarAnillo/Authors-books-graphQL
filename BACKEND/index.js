const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");

const { readFileSync } = require("fs");
const path = require("path");
const { v1: uuid } = require("uuid")

let authors = require("./Data/authors");
let books = require("./Data/books");


/* Resolvers */
const resolvers = {
    Query: {
        allAuthors: () => authors,
        allBooks: () => books
    },
    Author: {
        bookCount: (root) => {
            const test = books.filter((book) => book.author === root.name)
            if(!test) {
                return null
            }
            return test.length;
        }
    },
    Mutation: {
        createBook: (root, args) => {
            const newBook = {...args, id: uuid(), title: args.title, author: args.author, published: args.published, genres: args.genres}
            books = books.concat(newBook)
            return newBook;
        },
        editBorn: (root, args) => {
            const born = authors.find((a) => a.name === args.name)
            if(!born){
                return null;
            }

            const updateBornYear = {...born, born: args.born}
            authors = authors.map(b => b.name === args.name ? updateBornYear : b)
            return updateBornYear;
        }
    }
}


/* Server */
const server = new ApolloServer({
    typeDefs: readFileSync(path.join(__dirname, "schema.graphql"), "utf-8"),
    resolvers
});
startStandaloneServer(server, {
    listen: { port: 3005 }
}).then((res) => console.log(`Server running on port ${res.url}`))