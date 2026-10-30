# d.Aesthetics Clinic Manager

**Laser | Skin | Hair | Mind | Body | Soul**

d.Aesthetics Clinic Manager is a web app for running an aesthetics clinic day to day. It covers the whole client journey: someone sees an ad on Instagram, becomes a lead, books an appointment, turns into a client, and gets billed. It also covers the back office: staff, expenses and payroll.

It works on desktop, tablet and phone, and has light and dark modes.

---

## Contents

- [How the pieces fit together](#how-the-pieces-fit-together)
- [Sign-in and user roles](#sign-in-and-user-roles)
- [Dashboard](#dashboard)
- [CRM Leads](#crm-leads)
- [Appointments](#appointments)
- [Clients](#clients)
- [Online booking](#online-booking)
- [Billing and invoices](#billing-and-invoices)
- [Services and prices](#services-and-prices)
- [Employees](#employees)
- [Expenses](#expenses)
- [Payroll](#payroll)
- [Branches](#branches)
- [Team and invites](#team-and-invites)
- [General features](#general-features)
- [Current limitations](#current-limitations)
- [For developers](#for-developers)

---

## How the pieces fit together

```
  Lead  ──►  Appointment  ──►  Client  ──►  Bill / Invoice
 (enquiry)    (booked visit)   (patient record)  (payment)
```

1. **A lead comes in** from Instagram, WhatsApp or Google. Staff add it to **CRM Leads**.
2. **An appointment is booked**, either by staff straight from the lead (name and phone number are filled in for them) or by the client on the [online booking page](#online-booking).
3. **When the appointment is marked Completed**, the person is added to **Clients** automatically, and their lead is moved to the "Clients" category.
4. **Staff create a bill** for the client by picking services from the clinic's price list, then print a receipt.

The phone number links all of this together. A client's bills are matched to them by phone number, and the app won't let two clients share one.

---

## Sign-in and user roles

Everyone signs in with an email and password. Each account has one of three roles, and the menu only shows the sections that role can use.

| Section       | Admin | Manager | Staff |
|---------------|:-----:|:-------:|:-----:|
| Dashboard     |   ✓   |    ✓    |   ✓   |
| CRM Leads     |   ✓   |    ✓    |       |
| Appointments  |   ✓   |    ✓    |   ✓   |
| Clients       |   ✓   |    ✓    |   ✓   |
| Billing       |   ✓   |    ✓    |   ✓   |
| Services & Prices | ✓ |    ✓    |       |
| Expenses      |   ✓   |    ✓    |   ✓   |
| Employees     |   ✓   |         |       |
| Payroll       |   ✓   |         |       |
| Branches      |   ✓   |         |       |
| Team          |   ✓   |         |       |

New people join through an [invite link](#team-and-invites) sent by an Admin; there is no public sign-up. Accounts that have been switched off can't sign in. You stay signed in between visits until you log out from the account menu in the top-right corner.

---

## Dashboard

The first screen after signing in gives a quick overview of the clinic.

**Summary cards**
- Total Employees (active staff)
- Present Today and average attendance
- On Leave
- Total Revenue
- Total Expenses (approved expenses only)
- Pending Approvals (expense claims waiting for review)
- Total Clients

**Revenue vs Expenses chart.** A line chart of the last six months, so you can see how spending moves over time.

**Recent Clients.** The five newest clients, with each one's concern and next visit date. A link goes to the full Clients list.

---

## CRM Leads

*Available to Admins and Managers.*

This is where enquiries are tracked before they become paying clients.

**Each lead records**
- Name and phone number
- Source: Instagram, WhatsApp or Google
- City: Lahore, Islamabad, Karachi or Sialkot
- Gender
- Category (see below)
- Date added

**Categories.** Leads can be sorted into 19 categories that match how the clinic works, including *LHR Leads*, *Skt Leads*, *Potential*, *Interested*, *Pending Payment*, *Lash & Nails*, *Salon & Common*, *Offer & Deals*, *Packages*, *Wellness*, *Institute*, *Vendors*, *Jobs*, *Bloggers & PR*, *New Order*, *Advanced*, *Important*, *Lead* and *Clients*.

**What you can do**
- Add, edit and delete leads
- Search by name or phone number
- Filter the list by category
- **Book an appointment** for a lead in one click. The booking form opens with the lead's name and number already filled in, and the appointment stays linked to the lead.

---

## Appointments

*Available to everyone.*

Every booked visit, shown as a **list** or a **calendar**.

**Each appointment records**
- Name and phone number
- Service type: Consultation, Follow-up or Procedure
- Treatment, if one was chosen (for example "HydraFacial Glow 6000")
- Branch
- Date and time
- Status: Scheduled, Confirmed, Completed or Cancelled
- Notes
- Whether it was booked by staff or **online** by the client

**List view.** Sorted by date and time so the next appointment is always at the top. Online bookings carry an "Online" tag.

**Calendar view.** A month calendar showing booked and past visits at a glance:
- Each day shows its appointments by time and first name, colour-coded: **upcoming**, **completed**, **cancelled**, and **passed but not marked** (the visit time has gone by but nobody marked it Completed or Cancelled).
- Cards at the top count each of these for the month, so it's easy to spot visits that still need updating.
- Click a day to see its appointments in full, with phone numbers, treatment, branch and notes, and change their status right there.
- **Book** on a day opens the booking form with that date already picked.
- Filter by branch.
- On phones, days show coloured dots instead of names.

**Booking a new appointment**
- Optionally add the treatment and the branch.
- Pick the date from a calendar.
- Pick the time from a list of 15-minute slots across the whole day.
- Choose the starting status and add any notes.

Staff bookings are not limited by the branch's opening hours or "clients per slot", so staff can always fit someone in. They do count towards the slot limit that online clients see.

**Managing appointments**
- Search by name or phone number.
- Change the status straight from the list, without opening a form.
- Delete an appointment (you are asked to confirm first).

**Automatic client creation.** When you mark an appointment **Completed**:
- If nobody with that phone number is in Clients yet, a new client record is created using the appointment's name, number, date and treatment (or service type, if no treatment was chosen).
- If the appointment came from a lead, that lead is moved to the **Clients** category.

---

## Clients

*Available to everyone.*

The clinic's patient records.

**Each client records**
- Name and phone number (each number can belong to only one client)
- First visit date
- Age and gender
- Concern (what they came in for)
- Next visit date
- Treatment plan
- Treatment history

**What you can do**
- Add, edit and delete clients
- Search by name or concern
- See the total number of clients

**Client profile.** Opening a client shows all of their details on one page, plus a list of every bill they have. Each bill shows its invoice number, date, total and whether it's paid, with a button to print it.

**Client bills page.** A separate page for one client's billing history. From here you can:
- Create a new bill with the client already selected
- Edit an existing bill
- Print any invoice

---

## Online booking

*Public. Clients don't need an account.*

Each branch has its own booking page, and there is one main link to put in your Instagram bio:

- **`/book`** lists every branch that is taking bookings, and the client picks one. If only one branch is taking bookings, clients go straight to it.
- **`/book/<branch>`** (for example `/book/lahore`) is one branch's booking page.

**What the client does**
1. **Chooses a treatment** from the price list (searchable, with prices), or leaves it as *Consultation* if they're not sure.
2. **Picks a day.** Days in the past, days the branch is closed, and days more than 60 days ahead can't be picked.
3. **Picks a time** from the branch's time slots. Slots that are full, or that have already passed today, are greyed out.
4. **Enters their name, phone number** and an optional note, and confirms.

They then see a confirmation with the treatment, date, time and branch address. The booking appears straight away in Appointments as **Scheduled**, tagged **Online**, for staff to confirm. **Book another appointment** starts again with their name and number already filled in.

If the chosen time fills up while they are typing, the times reload and they are asked to pick another; nothing they typed is lost.

**Built-in protections**
- Each time slot takes only as many bookings as the branch allows (set on the [Branches](#branches) page). Bookings made by staff count towards that limit.
- The same person can't book the same branch twice on one day, however they write their number (0300-1234567, 0300 1234567 and +92 300 1234567 are the same number).
- These limits are enforced by the database, so two clients pressing Confirm at the same moment can't both get the last place.
- Cancelling a booking, or moving it to another time, frees its place for someone else.
- Each device can make at most 10 bookings an hour. Attempts that fail (a typo in the phone number, for example) don't count.
- Phone numbers must contain 7 to 15 digits. Problems are explained in plain words just above the Confirm button.
- "Today" and "now" use Pakistan time, wherever the server runs.

---

## Billing and invoices

*Available to everyone.*

Create bills from the clinic's price list and print receipts.

**Summary cards at the top**
- **Total Billed**: the value of every bill
- **Total Collected**: how much has actually been paid
- **Outstanding**: the difference between the two

**Creating a bill**
1. **Choose the client** from a dropdown of existing clients.
2. **Set the date.** It defaults to today.
3. **Add services** from the [price list](#services-and-prices). You can search by service name or category. You can also add a custom item for anything not on the list.
4. **Adjust each line** if needed. Prices can be changed, quantities set, and lines removed.
5. **Apply a discount** if needed.
6. **Record payment:**
   - Payment method: Cash, Card, Bank Transfer or Easypaisa/JazzCash
   - Payment status: Paid or Pending
   - For a partial payment, enter the amount still **due**. The app works out the amount paid and sets the status for you.
7. **Add notes** if needed.

A live summary shows the subtotal, discount, total, amount paid and balance due as you go.

**Invoice numbers** are assigned automatically, in order, starting again each year: `INV-2026-00001`, `INV-2026-00002`, and so on.

**Managing bills**
- Search by client name, phone number or invoice number
- Switch a bill between Paid and Pending straight from the list
- See the paid and due amounts for each bill
- Edit or delete bills

**Printing receipts.** Every bill has a print button that opens a receipt sized for an 80 mm thermal printer. The receipt shows:
- The clinic name and tagline
- Invoice number, date and time
- Client name and number
- Each service with its quantity, price and line total
- Subtotal, discount and total
- Amount paid and balance due (only for bills that aren't fully paid)
- Payment method and status
- Any notes
- "Thank you for visiting us"

---

## Services and prices

*Admins and Managers can edit it. It is read by Billing and the online booking page.*

The clinic's price list is managed in the app on the **Services & Prices** page, so prices can change without a developer.

**Each service records**
- Name and category
- Price (leave at 0 for **POA**, price on application: staff enter the price on the bill)
- An optional note (for example the number of steps, or a package deal)
- **Available**: whether it can be added to bills
- **Show on booking page**: whether clients can pick it when booking online

**What you can do**
- Add, edit and delete services. Categories are suggested as you type, and new ones are created by typing a new name. Two services in the same category can't share a name, even with different capital letters.
- Switch *Available* and *Show on booking page* on or off straight from the list.
- Search, and filter by category.
- See how many services, categories and online-bookable services there are.
- **Import default list** (Admins): loads the d.Aesthetics 2025 price list, 126 services in 19 categories, from Medicated Facials and HydraFacials to laser hair removal, HIFU and IV drips. Running it again only adds services that are missing; it never changes prices you have edited.

Editing or deleting a service doesn't change bills that were already created.

---

## Employees

*Available to Admins.*

The staff directory.

**Each employee records**
- Name and email (each email must be unique)
- Department: Doctor (DR), Technician or Management
- Monthly salary
- Join date
- Status: Active or Inactive
- Working hours
- Damages (an amount)
- Benefits
- How they receive their pay

**What you can do**
- Add, edit and delete employees
- Search by name or email
- See how many employees there are in total, and how many are active and inactive

---

## Expenses

*Available to everyone.*

Staff log spending here, and managers review it.

**Each expense records**
- Date
- Category: Travel, Meals, Office Supplies, Equipment, Software or Other
- City: Lahore, Islamabad, Karachi or Sialkot
- Amount
- Description
- Who submitted it
- Status: Pending, Approved or Rejected

**What you can do**
- Submit a new expense claim
- Choose a period to view: this week or a specific month (see [Current limitations](#current-limitations))
- See totals for all expenses, approved expenses and expenses awaiting review

Only **approved** expenses count towards the expense figures on the Dashboard.

---

## Payroll

*Available to Admins.*

Record and track monthly salary payments.

**Each payroll entry records**
- Employee
- Month
- Base salary
- Bonus
- Deductions
- **Net salary**, calculated automatically as base + bonus − deductions
- Status: Pending or Processed

**What you can do**
- Process payroll for an employee for a given month, with a preview of the net salary before saving
- See the total payroll, total bonuses, and how many entries are processed or still pending

An employee can only be paid once per month, so the same month can't be entered twice by mistake.

---

## Branches

*Available to Admins.*

The clinic's locations, and the settings for each one's online booking.

**Each branch records**
- Name, city, address and phone (shown to clients on the booking page)
- **Booking link name**, for example `lahore` for `/book/lahore`: lowercase letters, numbers and dashes, unique to each branch. It is filled in from the branch name and can be changed, but changing it breaks links you have already shared.
- Opening and closing time (long enough for at least one slot), and the days it is open (at least one)
- **Slot length**: 15, 30, 45 or 60 minutes
- **Clients per slot**: how many online bookings one time slot can take
- **Take online bookings**: switch off to pause the branch's booking link
- **Branch is open**: closed branches are hidden from booking

**What you can do**
- Add, edit and delete branches
- Copy or open each branch's booking link, and the main link for your Instagram bio
- See at a glance which branches are taking bookings

Branches only affect online booking and how appointments are labelled. Clients, bills, expenses and staff are shared across all branches.

---

## Team and invites

*Available to Admins.*

Controls who can sign in to the dashboard, and with which role.

**Members**
- See everyone with an account, their role and when they joined.
- **Change someone's role** (Admin, Manager or Staff) from the list.
- **Switch sign-in off** for someone who should lose access for now, or remove their account entirely.
- You can't change your own role, switch yourself off or remove yourself, so the clinic can't be left without an Admin by accident.

**Inviting someone**
1. Click **Invite**, enter their email, optionally their name, and pick a role.
2. You get a link, with buttons to **copy it** or **share it on WhatsApp**.
3. They open the link, choose their name and password, and are signed straight in.

Invite links work once and expire after 7 days. After 20 wrong passwords or bad invite links from one network in 15 minutes, further attempts are paused for 15 minutes; successful sign-ins never count towards this. For security a link is only shown when it's created. If it gets lost, or expires, click **New link** on the pending invite; the old link stops working. Pending invites can also be cancelled.

---

## General features

- **Works on any screen.** On phones the sidebar becomes a slide-out menu and less important table columns are hidden.
- **Light and dark mode**, switched from the top bar.
- **Confirmation before deleting.** Every delete asks you to confirm first.
- **Clear feedback.** Short pop-up messages confirm when something is saved, or explain what went wrong. On the public booking and invite pages, problems are shown in plain words next to the form instead.
- **Input checks.** Required fields, valid emails, phone numbers that aren't already in use, and no negative amounts are all checked before anything is saved.
- **Protection against abuse.** Each signed-in person can make 300 requests every 15 minutes, which normal use never reaches. Visitors who aren't signed in are counted per network. Staff sharing the clinic's Wi-Fi never slow each other down.
- **Rupee formatting.** All amounts are shown in Pakistani Rupees (Rs) with thousands separators.

---

## Current limitations

These parts of the product are not finished yet:

- **Dashboard revenue** always shows Rs 0, and the revenue line on the chart is flat. It is not yet linked to Billing; use the *Total Collected* figure on the Billing page instead.
- **Attendance and leave** are not tracked yet. *Present Today* counts every active employee as present, and *On Leave* is always 0.
- **Expense filters**: the "This Week" and month options don't filter the list yet. All expenses are always shown.
- **Approving expenses**: the Expenses page has no Approve or Reject buttons yet, so claims stay *Pending* unless their status is changed outside the app.
- **Payroll months**: the month picker only offers January to April 2024.
- **Clinic contact details** (address, phone, email) are blank, so they don't appear on printed receipts yet.
- **Sign-in page** shows the sample accounts and their passwords. Remove that box, and change or remove the sample accounts, before real use.
- **One clinic per installation.** Branches belong to one clinic. Running several separate clinics means one installation each.

---

## For developers

The project is a monorepo using npm workspaces:

| Folder | What it is |
|---|---|
| `apps/web` | The Next.js app: dashboard, booking pages and invite page |
| `apps/api` | The Express + MongoDB API |
| `apps/site` | The marketing website for selling the app as SaaS (see [its README](apps/site/README.md)) |
| `packages/shared` | Option lists (roles, statuses, cities, lead categories…) used by both apps |

**Getting started** (Node 18 or newer, and a MongoDB database)

1. `npm install` from the repo root. Install from the root only; it sets up all three folders.
2. Copy `apps/api/.env.example` to `apps/api/.env`, and set `MONGO_URI` and a long random `JWT_SECRET`.
3. Copy `apps/web/.env.local.example` to `apps/web/.env.local`. Its URL must use the same port as `PORT` in the API's `.env` (5000 by default).
4. `npm run seed` to load sample data, then `npm run dev`. The dashboard is at http://localhost:3000 and the booking page at http://localhost:3000/book.

**Commands** (run from the repo root)

| Command | What it does |
|---|---|
| `npm run dev` | Starts the API and the web app together |
| `npm run dev:web` / `npm run dev:api` | Starts just one of them |
| `npm run dev:site` / `npm run build:site` | Runs or builds the marketing website (port 3001) |
| `npm run build` | Production build of the web app |
| `npm run lint` | Lints the web app |
| `npm run seed` | Loads sample data: the three accounts below, employees, payroll, expenses, leads, clients, appointments, a Lahore branch (`/book/lahore`) and the default price list |
| `npm run seed:services -w @daesthetics/api` | Loads just the default price list; safe to run on a live database |

**Sample accounts** (created by the seed)

| Role | Email | Password |
|---|---|---|
| Admin | admin@daesthetics.com | admin123 |
| Manager | manager@daesthetics.com | manager123 |
| Staff | staff@daesthetics.com | staff123 |

**API settings** (`apps/api/.env`)

| Setting | Purpose |
|---|---|
| `PORT` | API port (5000 in the example) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Signs sign-in tokens; how long a sign-in lasts (`7d`) |
| `CORS_ORIGIN` | Web addresses allowed to call the API, comma-separated |
| `CLINIC_TIMEZONE` | Time zone for "today" and past slots on the booking page (default `Asia/Karachi`) |

**Deploying.** On Vercel, create two projects from this repo with their **Root Directory** set to `apps/web` and `apps/api` (and a third for `apps/site` if you're publishing the marketing website). Set `NEXT_PUBLIC_API_URL` on the web project to the API's address, and `CORS_ORIGIN` on the API project to the web app's address.

**Troubleshooting.** If `npm install` fails with `EACCES` or a confusing `ERESOLVE` error, your npm cache has wrong file permissions. Fix it with `sudo chown -R $(whoami) ~/.npm` and install again.
