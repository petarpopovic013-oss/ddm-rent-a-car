# DDM Rent a Car

Next.js 16 aplikacija za DDM Rent a Car, sa javnim landing sajtom i zaštićenim admin panelom za vozila, cenovnike i rezervacije.

## Lokalno pokretanje

Kopirajte `.env.example` u `.env.local` i popunite vrednosti:

```env
NEXT_PUBLIC_SUPABASE_URL=https://obtjnbhzitkuvvlabjrb.supabase.co
SUPABASE_SECRET_KEY=
ADMIN_PASSWORD_HASH=
ADMIN_SESSION_SECRET=
```

Admin šifra se čuva samo kao bcrypt hash:

```bash
node -e "console.log(require('bcryptjs').hashSync('unesite-svoju-sifru', 12))"
```

Session secret generišite komandom:

```bash
openssl rand -base64 32
```

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

## Provere

```bash
npm run lint
npx tsc --noEmit
npm run build
```
