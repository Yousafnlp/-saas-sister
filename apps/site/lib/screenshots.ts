// Product screenshots in public/screenshots, taken from the real app with demo data.
// Regenerate them with `npm run screenshots -w @daesthetics/site` (see README.md).

export interface Screenshot {
  src: string;
  width: number;
  height: number;
}

const desktop = (name: string): Screenshot => ({ src: `/screenshots/${name}.png`, width: 2880, height: 1800 });
const phone = (name: string): Screenshot => ({ src: `/screenshots/${name}.png`, width: 1170, height: 2532 });

export const shots = {
  dashboard: desktop('dashboard'),
  dashboardDark: desktop('dashboard-dark'),
  calendar: desktop('calendar'),
  leads: desktop('leads'),
  billing: desktop('billing'),
  roles: desktop('roles'),
  team: desktop('team'),
  branches: desktop('branches'),
  services: desktop('services'),
  dashboardMobile: phone('dashboard-mobile'),
  booking: phone('booking'),
  bookingConfirmed: phone('booking-confirmed'),
  receipt: { src: '/screenshots/receipt.png', width: 912, height: 1566 },
};
