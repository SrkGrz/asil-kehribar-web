<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/e034d026-c0af-429c-ac4f-d230e314dfa0

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create a `.env` file with the required server variables:

   | Variable | Required | Description |
   | --- | --- | --- |
   | `MONGODB_URI` | yes | MongoDB Atlas connection string |
   | `JWT_SECRET` | yes | Long random string used to sign admin tokens (the server refuses to start without it) |
   | `ALLOWED_ORIGINS` | no | Comma separated list of origins allowed to call the API (defaults to localhost dev servers) |
   | `ALLOW_ADMIN_BOOTSTRAP` | no | Set to `true` only while creating the very first admin account, then remove it |
   | `BOOTSTRAP_ADMIN_EMAIL` | no | Restricts the bootstrap login to a single e-mail address |
   | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | no | Order notification e-mails (disabled when unset) |

3. Run the app:
   `npm run dev:full`
