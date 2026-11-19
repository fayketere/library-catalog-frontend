# Library Catalog API

A TypeScript Express API for managing book genres and books. Catalog and user data are kept in memory and reset whenever the service restarts.

## Setup

```sh
pnpm install
pnpm run dev
```

The API listens on port `3000` by default. Set `PORT` in `.env` to choose another port. Set `JWT_SECRET` to a random value of at least 32 characters in production; production startup rejects the development-only default.

## Endpoints

All catalog routes are prefixed with `/api/v1`. JSON request bodies are required for create and update operations.

### Authentication

The authentication and profile endpoints are available under `/api` and `/api/v1`.

| Method | Path | Behavior |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create a patron account (`201`) |
| `POST` | `/api/auth/login` | Verify username or email and set the session cookie (`200`) |
| `POST` | `/api/auth/logout` | Revoke the server-side session and clear the cookie (`204`) |
| `GET` | `/api/users/profile` | Return the authenticated caller's public profile |

Registration accepts `username`, `email`, and `password` (8–128 characters). The server always assigns the `patron` role; public registration cannot create librarians. Passwords are stored only as salted scrypt hashes. The server seeds one librarian on startup: username `librarian`, email `librarian@library.test`, password `LibraryAdmin123!`. This test credential must be changed before using the service outside a local exercise.

### Token Storage

The API stores the signed session token in an `HttpOnly` cookie named `library_session`; it never puts the token in the response body or browser-accessible storage. `HttpOnly` prevents ordinary page scripts from reading the token, reducing the impact of token theft through cross-site scripting. The cookie also uses `SameSite=Strict` to mitigate cross-site request forgery, and production responses add `Secure` so the cookie is sent only over HTTPS. The trade-off is that cookie authentication requires deliberate CSRF and cross-origin configuration: this service assumes a same-site client and does not enable credentialed cross-origin requests. A production deployment should also validate request origins (or use an anti-CSRF token), particularly if the API is reachable from other subdomains. A client hosted on another site would need explicit origin/CSRF protections and CORS configuration.

Tokens expire after eight hours. A server-side in-memory session registry lets logout revoke the active token immediately, in addition to clearing the browser cookie. The trade-off is that this simple session store is not shared between server instances and all sessions are cleared on restart; a multi-instance deployment should replace it with a shared session store.

### Genres

| Method | Path | Behavior |
| --- | --- | --- |
| `GET` | `/api/v1/genres` | List genres |
| `GET` | `/api/v1/genres/:id` | Get one genre |
| `POST` | `/api/v1/genres` | Create a genre (`201`) |
| `PUT` | `/api/v1/genres/:id` | Replace a genre (`200`) |
| `DELETE` | `/api/v1/genres/:id` | Delete a genre (`204`); returns `409` while books still use it |

Genre payload:

```json
{
  "name": "Science Fiction",
  "description": "Speculative fiction"
}
```

`name` is required and must be a non-empty string. `description` is optional.

### Books

| Method | Path | Behavior |
| --- | --- | --- |
| `GET` | `/api/v1/books` | List, filter, search, and paginate books |
| `GET` | `/api/v1/books/:id` | Get one book |
| `POST` | `/api/v1/books` | Create a book (`201`) |
| `PUT` | `/api/v1/books/:id` | Replace a book (`200`) |
| `DELETE` | `/api/v1/books/:id` | Delete a book (`204`) |

Book creation, updates, and deletion require an authenticated librarian. Public read routes remain available.

Book payload:

```json
{
  "title": "Dune",
  "author": "Frank Herbert",
  "genre": "<genre-id>"
}
```

All three fields are required strings. `genre` must be the id of an existing genre. Invalid payloads return `400` with a JSON `errors` array that identifies the failing field. Missing resources return `404`.

`GET /api/v1/books` accepts these optional query parameters:

| Parameter | Description | Default |
| --- | --- | --- |
| `genre` | Exact genre id filter | — |
| `search` | Case-insensitive match against title or author | — |
| `page` | Positive, one-based page number | `1` |
| `limit` | Positive page size, at most `100` | `10` |

Filters and search are applied before pagination. Example:

```text
GET /api/v1/books?genre=<genre-id>&search=dune&page=2&limit=5
```

The books response has a `data` array and `pagination` metadata (`page`, `limit`, `total`, `totalPages`).

## Errors

Errors are returned as JSON, without stack traces. Validation errors use status `400`; missing resources use `404`; attempts to delete a genre that is still referenced use `409`.

## Postman

Import [`postman/library-catalog.postman_collection.json`](./postman/library-catalog.postman_collection.json). Set the collection's `baseUrl` variable if the service is not running at `http://localhost:3000`.

## Library Catalog Frontend

The patron-facing React app lives in [`client/`](./client/). It requests catalog, genre, search, and pagination data from the API at `/api/v1`. Genre and search filters are combined on the server before pagination; the search field waits 400 ms after typing before updating the query. The API does not include cover art, so the frontend generates book-specific cover illustrations locally.

The reading list is stored in the browser's `localStorage`, so it survives page refreshes without requiring a signed-in account or a backend endpoint. Authentication instead uses the API's HttpOnly session cookie: the app checks `/api/users/profile` on load, and protected space-booking routes require that check to succeed. Login and registration use `/api/auth/login` and `/api/auth/register`; newly registered patrons are redirected to sign in because registration does not create an authenticated session. Space booking currently captures its four fields in form-local state only and does not submit a request.

Start the API in one terminal:

```sh
pnpm install
pnpm run dev
```

In another terminal, start the frontend:

```sh
cd client
npm install
npm run dev
```

Open the Vite URL (usually `http://localhost:5173`). The development server proxies `/api` requests to `http://localhost:3000`. To use another API origin, set `VITE_API_BASE_URL` in `client/.env` (for example, `https://api.example.com/api/v1`). The API starts with an empty in-memory catalog; add genres and books before browsing.

Build the frontend with `npm run build` from `client/`.

Demo recording: [browse, filter, search, and open a book](./client/demo/library-catalog-demo.webm).

## Build and test

```sh
pnpm run typecheck
pnpm run test
```
