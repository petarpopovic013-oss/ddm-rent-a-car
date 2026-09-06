# DDM Rent a Car

Next.js 16 aplikacija za DDM Rent a Car, sa javnim landing sajtom i zaštićenim admin panelom za vozila, cenovnike i rezervacije.

## Lokalno pokretanje

Kopirajte `.env.example` u `.env.local` i popunite vrednosti:

```env
NEXT_PUBLIC_SUPABASE_URL=https://obtjnbhzitkuvvlabjrb.supabase.co
SUPABASE_SECRET_KEY=
ADMIN_PASSWORD_HASH=
ADMIN_SESSION_SECRET=
RATE_LIMIT_SECRET=
```

Admin šifra se čuva samo kao bcrypt hash:

```bash
node -e "console.log(require('bcryptjs').hashSync('unesite-svoju-sifru', 12))"
```

Session secret generišite komandom:

```bash
openssl rand -base64 32
```

Istom komandom generišite zaseban `RATE_LIMIT_SECRET`. Ako se aplikacija
self-hostuje na više instanci, podesite i isti
`NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` na svakoj instanci.

Zatim pokrenite:

```bash
npm install
npm run dev
```

- Javni sajt: `http://localhost:3000`
- Admin prijava: `http://localhost:3000/admin/login`

## Supabase objekti

Rent-a-car deo baze koristi `rc_` namespace:

- `rc_vehicles`
- `rc_vehicle_pricing_tiers`
- `rc_reservations`
- Storage bucket `rc-vehicle-images`

`SUPABASE_SECRET_KEY` je server-only vrednost i nikada ne sme imati `NEXT_PUBLIC_` prefiks niti biti commitovana.

## Produkcioni deploy

Migracije moraju biti primenjene pre nove verzije aplikacije. Security
migracija uključuje RLS, eksplicitne grantove, indekse i distribuirani rate
limit koji koriste javna forma i admin prijava:

```bash
supabase db push
```

Posle migracija proverite u Supabase Dashboardu:

- da su `rc_vehicles`, `rc_vehicle_pricing_tiers`, `rc_vehicle_images`,
  `rc_reservations` i `rc_rate_limits` označene kao RLS enabled;
- da `anon` i `authenticated` nemaju direktan pristup tim tabelama;
- da je `rc-vehicle-images` jedini javni bucket i da ne sadrži privatne dokumente;
- da su Database i Storage backup/retention podešavanja primerena produkciji.

Na hosting/WAF nivou dodatno ograničite broj POST zahteva prema sajtu i
maksimalno telo zahteva na 20 MB. Aplikacioni rate limit se izvršava nakon što
hosting primi telo zahteva, pa edge zaštita ostaje važna protiv volumetrijskog
DoS napada.

Pre svakog deploya koristite zaključani dependency tree i pokrenite provere:

```bash
npm ci
npm audit --omit=dev
npm run lint
npx tsc --noEmit
npm run build
```

## Provere

```bash
npm run lint
npx tsc --noEmit
npm run build
```
