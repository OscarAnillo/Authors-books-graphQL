# Authors-books-graphQL - FrontEnd Part

# Index.js
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

import { ApolloClient, InMemoryCache, HttpLink, ApolloProvider } from '@apollo/client'

const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
        uri: "http://localhost:3005"
    })
})


ReactDOM.createRoot(document.getElementById('root')).render(
    <ApolloProvider client={client}>
        <App />
    </ApolloProvider>
)

# App.js component

import { useState } from 'react'
import { useQuery } from "@apollo/client"

/* Components */
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'

import { ALL_AUTHORS } from './Queries'

import './App.css'

const App = () => {
  const [page, setPage] = useState('authors')
  const result = useQuery(ALL_AUTHORS)
  const { data, loading } = result;

  if(loading) {
    return <h1>Loading...</h1>
  }

  return (
    <div className='App'>
      <div>
        <button onClick={() => setPage('authors')}>Authors</button>
        <button onClick={() => setPage('books')}>Books</button>
        <button onClick={() => setPage('add')}>Add Book</button>
      </div>
      <Authors show={page === 'authors'} all={data.allAuthors} />
      <Books show={page === 'books'} />
      <NewBook show={page === 'add'} />
    </div>
  )
}

export default App


# Author.js

import { UpdateBorn } from "./Update-born"

const Authors = ({ show, all }) => {
  if (!show) {
    return null
  }

  return (
    <div className="authors-div">
      <h2>Authors</h2>
      <table>
        <tbody>
          <tr>
            <th>Name</th>
            <th>Born</th>
            <th>Books</th>
          </tr>
          {all.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="update-div">
        <UpdateBorn />
      </div>
    </div>
  )
}

export default Authors

# Update Born

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { ALL_AUTHORS, EDIT_BORN_AUTHOR } from "../Queries";


export const UpdateBorn = () => {
    const [name, setName] = useState("");
    const [born, setBorn] = useState("");

    const [ editBorn ] = useMutation(EDIT_BORN_AUTHOR, {
        refetchQueries: [{ query: ALL_AUTHORS }]
    })

    const submitHandler = (e) => {
        e.preventDefault();
        editBorn({ variables: { name, born}})

        setName("");
        setBorn("");
    }

    return (
        <div className="set-div">
            <h2>Set Birthyear</h2>
            <form onSubmit={submitHandler}>
                <label>
                    Name:
                    <input type="text" placeholder="Author name" value={name} onChange={(e) => setName(e.target.value)}/>
                </label>
                <label>
                    Born:
                    <input type="text" placeholder="Born year" value={born} onChange={(e) => setBorn(Number(e.target.value))} />
                </label>
                <button>Submit</button>
            </form>
        </div>
    )
}


# Books.js

import { useQuery } from "@apollo/client"
import { ALL_BOOKS } from "../Queries"

const Books = (props) => {
  const result = useQuery(ALL_BOOKS);

  if (!props.show) {
    return null
  }

  return (
    <div>
      <h2>Books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {result.data.allBooks.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Books


# NewBook.js

import { useState } from 'react'
import { useMutation } from '@apollo/client'

import { ALL_BOOKS, CREATE_BOOK } from '../Queries'

const NewBook = ({ show }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])
  
  const [ createBook ] = useMutation(CREATE_BOOK , {
    refetchQueries: [{ query: ALL_BOOKS }]
  })

  if (!show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()

    createBook({ variables: { title, author, published, genres }})

    setTitle('')
    setPublished('')
    setAuthor('')
    setGenres([])
    setGenre('')
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre('')
  }

  return (
    <div className='new-book-div'>
      <form onSubmit={submit}>
        <div>
          Title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          Author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          Published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(Number(target.value))}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            Add Genre
          </button>
        </div>
        <div>Genres: {genres.join(' ')}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  )
}

export default NewBook

# Queries.js

import { gql } from '@apollo/client'
export const ALL_AUTHORS = gql`
    query {
        allAuthors {
            id
            name
            born
            bookCount
        }
    }
`

export const ALL_BOOKS = gql`
    query {
        allBooks {
            title
            author
            published
        }
    }
`

export const CREATE_BOOK = gql`
    mutation createBook($title: String! $author: String! $published: Int! $genres: [String!]) {
        createBook(title: $title author: $author published: $published genres: $genres){
            title
            author
            published
        }
    }

`
export const EDIT_BORN_AUTHOR = gql`
    mutation editBorn($name: String! $born: Int!){
        editBorn(name: $name born: $born) {
            name
            born
        }
    }
`
