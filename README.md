# Atlas - Irish Scouting Platform

Atlas is a distributed, high-performance platform for scouting organizations. It is designed to empower local scout groups with professional management tools while allowing the national community to stay connected through a central discovery hub.

---

## 🏗 One Architecture, Two Roles

Atlas uses a single codebase that can be deployed in two distinct modes via environment variables:

### 1. Atlas Hub (The Master Site)
The central directory located at [atlashub.ie](https://atlashub.ie). It aggregates news, events, and public information from across the scouting network.
*   **Purpose:** Discovery, Directory, and National Aggregation.
*   **Restricted:** Private membership management and local group finances are not accessible here.

### 2. Atlas Instance (Standalone)
A private, self-hosted deployment for a specific Group, County, or Province.
*   **Purpose:** Membership records, Payments (Stripe), Form Builder, Gear Lists, and Internal Scouting operations.
*   **Infrastructure:** Runs on Vercel and Supabase Free Tiers for **$0/month** hosting cost.
*   **Interconnect:** Pulses public news and events back to the **Atlas Hub**.

---

## 🚀 Setting Up an Atlas Instance

To set up a standalone site for your group:

### 1. Cloud Accounts
1.  **Vercel**: Create an account at [vercel.com](https://vercel.com).
2.  **Supabase**: Create a project at [supabase.com](https://supabase.com).
    *   **Data API**: Enable (Required for the app to communicate with the DB).
    *   **Automatic RLS**: Enable (Highly recommended for scouting data privacy).

### 2. Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FRuairi-Production-Apps%2Fatlas&env=NEXT_PUBLIC_APP_ROLE,NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,ATLAS_HUB_URL,ATLAS_SYNC_TOKEN&envDescription=Set%20App%20Role%20to%20%27instance%27.%20Get%20Supabase%20keys%20from%20your%20Supabase%20Project%20Settings.)

1.  Click the **Deploy** button above.
2.  Vercel will prompt you to name your project and **automatically ask for the following Environment Variables**:

| Variable | Recommended Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_ROLE` | `instance` | Defines role as a standalone group site. |
| `NEXT_PUBLIC_SUPABASE_URL` | *(from Supabase)* | Your project's API URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(from Supabase)* | Your project's Anon Key. |
| `SUPABASE_SERVICE_ROLE_KEY` | *(from Supabase)* | Required for automated membership reminders (CRON). |
| `ATLAS_HUB_URL` | `https://atlashub.ie` | The URL of the master hub you sync with. |
| `ATLAS_SYNC_TOKEN` | *(shared secret)* | Used for secure communication with the Hub. |

### 3. Initialization Wizard
Once deployed, visit your site at `/setup`. The wizard will:
1.  **Prepare Database**: Initialize the Postgres schema on your Supabase project.
2.  **Claim Organization**: Link your instance to a specific organization from the master directory.
3.  **Local Branding**: Set your site title and colors (they will override the default "Atlas" theme).
4.  **Admin Check**: Confirm your sysadmin credentials.

### 4. Keeping Atlas Updated
Your instance includes a **GitHub Workflow** that automatically checks for updates from the master Atlas Hub (atlashub-ie) repository every Monday (or when triggered manually).
*   **Selective Updates:** When new features or security fixes are released, a **Pull Request** will automatically be opened on your repository.
*   **Merge to Update:** Simply review and merge the Pull Request to install the latest version.
*   **Conflicts:** If you have customized the code, GitHub will help you resolve any conflicts during the merge.

---

## ⚙️ Development

### Getting Started
```bash
npm install
npm run dev
```

### Environment Variables (.env.local)
Copy `.env.example` to `.env.local` and fill in your Supabase credentials. Ensure `NEXT_PUBLIC_APP_ROLE` is set to `instance` for local development of group features.

### Database Updates
Atlas uses Supabase Migrations. When pulling new code, ensure your local or production database is up to date:
```bash
npx supabase migration up
```

---

## 🔒 Security & Privacy
*   **Data Sovereignty**: When running in `instance` mode, **no private member data** is ever shared with the Atlas Hub. Only "Public" flagged news and events are synchronized.
*   **RLS**: Every table is protected with Supabase Row Level Security.
*   **Inactivity**: Sessions automatically timeout after 30 minutes for security on shared terminals.

---

## 📄 License
MIT License - See [LICENSE](./LICENSE) for details.
