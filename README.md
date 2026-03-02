# Bitespeed Backend Task: Identity Reconciliation

A backend web service designed to identify and keep track of a customer's identity across multiple purchases. It links different orders made with varying contact information (emails and phone numbers) to the same person.

**Live URL:** `https://bitespeed-zopy.onrender.com`
**Primary Endpoint:** `POST https://bitespeed-zopy.onrender.com/api/v1/identify`
_(Note: Hosted on Render's free tier. A keep-alive cron job is implemented)._

## Tech Stack

- **Runtime & Framework:** Node.js, Express, TypeScript
- **Database & ORM:** PostgreSQL (Neon DB), Prisma
- **Validation:** Zod

## API Reference

### `POST /api/v1/identify`

Receives HTTP POST requests with a JSON body containing contact information.

**Request Format:**

```json
{
  "email": "string (optional)",
  "phoneNumber": "string (optional)"
}
```

_Note: At least one parameter is required._

**Response Format:**
Returns an HTTP 200 response with a JSON payload containing the consolidated contact. The response strictly adheres to the requested schema, including the specific `primaryContatctId` key.

```json
{
  "success": true,
  "message": "Contact identified successfully",
  "data": {
    "contact": {
      "primaryContatctId": 1,
      "emails": ["lorraine@hillvalley.edu", "mcfly@hillvalley.edu"],
      "phoneNumbers": ["123456"],
      "secondaryContactIds": [23]
    }
  }
}
```

## Example Usage

### 1. Creating a New Primary Contact

When an unrecognized email and phone number are sent, the service creates a new `primary` contact.

```bash
curl -X POST https://bitespeed-zopy.onrender.com/api/v1/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "doc@hillvalley.edu", "phoneNumber": "123456"}'
```

### 2. Linking New Information (Secondary Contact)

If an incoming request shares common information with an existing contact but contains new details, the service creates a `secondary` contact row.

```bash
curl -X POST https://bitespeed-zopy.onrender.com/api/v1/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "emmett@hillvalley.edu", "phoneNumber": "123456"}'
```

_(Note: The algorithm also successfully handles "Deep Merges", where an incoming request bridges two previously separate primary clusters, demoting the newer primary and repointing its children)._

## Local Setup

1. **Clone the repository:**

```bash
git clone https://github.com/sukh285/bitespeed
cd bitespeed
```

2. **Install dependencies:**

```bash
npm install
```

3. **Environment Setup:**
   Create a `.env` file in the root directory:
```env
PORT=3000
DATABASE_URL="postgresql://user:password@host/db"
NODE_ENV="development"
BACKEND_URL="http://localhost:3000"
```

4. **Database Setup:**

```bash
npx prisma generate
npx prisma db push
```

5. **Run the server:**

```bash
npm run dev
```