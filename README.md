# Item Manager

A small full-stack application for managing items in Primary and Secondary groups. The project includes a Django REST API and a React TypeScript frontend.

## Features

- List all items
- Create items in either the Primary or Secondary group
- View the details of a selected item
- Update an existing item
- Display validation and request errors in the interface
- Prevent duplicate item names within the same group
- Allow the same item name in different groups

## Tech Stack

### Backend

- Python
- Django
- Django REST Framework
- django-cors-headers
- SQLite

### Frontend

- React
- TypeScript
- Vite
- Native Fetch API
- Custom CSS
- ESLint

The project was developed and tested with Python 3.13 and Node.js 22.

## Getting Started

The backend and frontend run as separate applications.

### Backend

From the project root:

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment.

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

macOS or Linux:

```bash
source .venv/bin/activate
```

Install the Python dependencies and prepare the database:

```bash
python -m pip install -r requirements.txt
python manage.py migrate
```

Start the Django development server:

```bash
python manage.py runserver
```

The item API will be available at `http://127.0.0.1:8000/items/`.

### Frontend

Open another terminal from the project root:

```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

The frontend uses `http://127.0.0.1:8000` as its default API address. To use a different backend address, create a `.env` file based on `frontend/.env.example`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Restart the frontend development server after changing environment variables.

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/items/` | List all items |
| `POST` | `/items/` | Create an item |
| `GET` | `/items/{id}/` | Retrieve one item |
| `PATCH` | `/items/{id}/` | Update an item |

Each item contains:

- `id`
- `name`
- `group`
- `created_at`
- `updated_at`

The supported groups are `Primary` and `Secondary`. Item names must be unique within a group, but the same name can be used in different groups.

Invalid input returns `400 Bad Request`, and requesting an item that does not exist returns `404 Not Found`.

## Tests and Checks

Run the backend test suite:

```bash
cd backend
python manage.py test
```

Expected result:

```text
Ran 10 tests
OK
```

Check the frontend:

```bash
cd frontend
npm run lint
npm run build
```

## Design Decisions

- The `(group, name)` uniqueness rule is validated by the API and enforced by the database.
- `created_at` and `updated_at` are managed by the server and exposed as read-only fields.
- Frontend API requests are kept in a separate module.
- The API address can be configured without changing the frontend source code.
- Custom CSS keeps the interface lightweight without adding an unnecessary UI framework dependency.
- SQLite keeps the local setup simple.
- DELETE was not implemented because it was not included in the required endpoints.