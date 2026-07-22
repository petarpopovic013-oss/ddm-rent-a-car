# DDM Rent a Car - pregled urađenog

Stanje projekta: 22. jul 2026.

Ovaj dokument beleži funkcionalnosti koje trenutno postoje u kodu i bazi. Otvoreni zadaci nalaze se u [`toDo.md`](./toDo.md).

## 1. Tehnologije i struktura

- Next.js 16 App Router, React 19 i TypeScript.
- Supabase baza i Storage za podatke i fotografije.
- Server Components za čitanje javnih i admin podataka.
- Server Actions za slanje upita, autentikaciju i admin izmene.
- Zod validacija javnih i admin formi.
- Sharp optimizacija uploadovanih fotografija.
- Bcrypt hash za admin šifru i JOSE potpisana admin sesija.
- Globalni CSS za javni sajt, poseban admin CSS i CSS Module za modal.

## 2. Javne rute

### `/`

- Landing stranica sa Golf 7 hero fotografijom.
- Navigacija ka floti, prednostima, procesu, FAQ-u i kontaktu.
- Šest izdvojenih vozila učitanih iz Supabase baze.
- Sekcije: proces najma, prednosti, o nama, recenzija, FAQ i kontakt.
- Tačne informacije o depozitu, pranju i politici goriva.
- Zajednički modal za slanje upita.
- Mobilni floating CTA koji se pojavljuje tek nakon hero sekcije.
- LocalBusiness i AutoRental JSON-LD strukturirani podaci.

### `/vozila`

- Kompletna lista aktivnih vozila iz baze.
- Kartice sa fotografijom, kategorijom, motorom, gorivom, menjačem, sedištima i početnom cenom.
- Link ka detalju svakog vozila.
- Zajednički modal za upit.

### `/vozila/[slug]`

- Posebna SEO stranica svakog aktivnog vozila.
- Glavna galerija sa svim fotografijama vozila.
- Navigacija strelicama, thumbnail slikama, tastaturom i swipe gestom.
- Opis, osnovne činjenice i specifikacije.
- Tempomat se prikazuje samo kada je vrednost uključena.
- Cenovni rangovi i način obračuna.
- CTA unapred bira vozilo koje korisnik gleda.

## 3. Vozila u bazi

Uvezeno je 12 vozila:

1. Fiat Panda
2. Mitsubishi Space Star
3. Peugeot 207
4. Lada Vesta
5. Škoda Rapid
6. Citroën Xsara Picasso
7. Volkswagen Golf 6
8. Volkswagen Golf 7
9. Škoda Octavia A7
10. Opel Astra
11. Opel Insignia
12. Hyundai H1

Sandero i Ducato su namerno izostavljeni radi naknadnog ručnog unosa.

Izdvojena vozila na landing stranici:

- Fiat Panda
- Škoda Rapid
- Volkswagen Golf 7
- Opel Astra
- Opel Insignia
- Hyundai H1

Za svako vozilo su sačuvani:

- marka, model, kategorija i opis;
- motor, gorivo, menjač, karoserija, sedišta i vrata;
- klima i tempomat;
- status, redosled i oznaka izdvojenog vozila;
- glavna i galerijske fotografije;
- dnevne cene za tri perioda i fiksna cena za 30 dana.

Fotografije se uvoze iz foldera `Slike`, automatski rotiraju, smanjuju na maksimalno 1440 x 1080 i čuvaju kao WebP.

## 4. Cenovnik i poslovne informacije

Implementirani cenovni rangovi:

- 1-3 dana, dnevna cena;
- 4-10 dana, dnevna cena;
- 11-29 dana, dnevna cena;
- 30 dana, fiksna mesečna cena.

Obračun broja dana je uključiv. Preuzimanje 22. i vraćanje 23. računaju se kao dva dana.

Sa fotografije cenovnika preneto je:

- depozit za svako vozilo: 36.000 RSD;
- pranje standardnog vozila: 1.200 RSD;
- pranje Hyundai H1: 1.800 RSD;
- odlazak na pumpu kada vozilo nije vraćeno puno: 500 RSD;
- dodatno se naplaćuje sipano gorivo do punog rezervoara.

Podatak o prtljagu potpuno je uklonjen iz tipova, baze i javnog prikaza.

## 5. Forma za upit

Modal ima četiri koraka:

1. Izbor vozila.
2. Izbor datuma preuzimanja i vraćanja.
3. Kontakt podaci i napomena.
4. Pregled podataka i konačnog iznosa.

Implementirano je:

- automatski izbor vozila sa kartice ili detalja;
- opcija za preporuku drugog vozila;
- kalendar sa zauzetim terminima;
- maksimalno trajanje najma od 30 dana;
- automatski izbor cenovnog ranga;
- prikaz broja dana i ukupnog iznosa;
- server-side validacija datuma, emaila, telefona i vozila;
- provera da je vozilo aktivno;
- provera dostupnosti pre upisa;
- honeypot protiv osnovnih botova;
- obavezna saglasnost;
- loading, success i error stanje;
- zaključavanje skrola pozadine;
- zatvaranje preko dugmeta, backdrop-a i Escape tastera.

Uspešan upit se čuva u `rc_reservations` sa statusom `pending`. Pending upit ne blokira vozilo.

## 6. Dostupnost i sprečavanje konflikta

- Javni kalendar koristi prihvaćene rezervacije kao zauzete periode.
- Server proverava preklapanje pre prihvatanja ili ručnog kreiranja prihvaćene rezervacije.
- SQL exclusion constraint u bazi sprečava dve prihvaćene rezervacije za isto vozilo i preklapajući period.
- Kada admin prihvati rezervaciju, vozilo postaje nedostupno za taj period.
- Odbijene i pending rezervacije ne blokiraju vozilo.

## 7. Admin autentikacija

- Ruta `/admin/login`.
- Admin šifra se čuva kao bcrypt hash u environment promenljivoj.
- Provera šifre izvršava se na serveru.
- Sesija je JWT potpisana i čuva se u `HttpOnly` cookie-ju.
- Cookie koristi `SameSite=Lax`, produkcijski `Secure` i traje osam sati.
- Sve admin rute i mutacije proveravaju sesiju.
- Implementirana je odjava.

## 8. Admin dashboard i rezervacije

Admin rute:

- `/admin`
- `/admin/rezervacije`
- `/admin/rezervacije/nova`
- `/admin/rezervacije/[id]`

Dashboard prikazuje:

- broj aktivnih i ukupnih vozila;
- broj novih upita;
- broj predstojećih prihvaćenih rezervacija;
- zbir potvrđenih iznosa;
- poslednje rezervacije;
- brze akcije.

Upravljanje rezervacijama podržava:

- pretragu po imenu, emailu i telefonu;
- filter po statusu;
- detalj rezervacije;
- promenu vozila;
- produženje ili skraćenje perioda;
- promenu kontakta i napomena;
- automatsko preračunavanje iznosa;
- prihvatanje i odbijanje;
- ručno kreiranje rezervacije;
- brisanje uz potvrdu.

Admin nema polje za ručnu izmenu cene. Iznos se menja isključivo promenom vozila ili datuma.

## 9. Admin upravljanje vozilima

Admin rute:

- `/admin/vozila`
- `/admin/vozila/novo`
- `/admin/vozila/[id]`

Podržano je:

- prikaz kompletne flote;
- dodavanje i izmena vozila;
- automatsko generisanje jedinstvenog sluga;
- promena specifikacija i opisa;
- promena svih cenovnih rangova;
- statusi active, hidden, service i archived;
- izbor izdvojenog vozila i redosleda;
- upload i zamena glavne fotografije;
- višestruki upload galerije;
- uklanjanje galerijskih fotografija;
- validacija tipa i veličine fajlova;
- automatska WebP kompresija;
- čišćenje uploadovanih fajlova kada operacija ne uspe;
- brisanje vozila bez istorije rezervacija;
- zaštita vozila sa rezervacijama od brisanja.

## 10. Responsive i mobilni prikaz

Posebno su prilagođeni:

- landing i hero;
- mobilna navigacija;
- izdvojena vozila;
- flota;
- detalj vozila;
- galerija;
- FAQ, kontakt i footer;
- modal u sva četiri koraka;
- kalendar;
- admin login;
- admin dashboard;
- admin tabele, kartice i forme.

Admin tabele se na telefonu pretvaraju u vertikalne kartice. Input polja koriste veličinu koja sprečava automatski iOS zoom. Dodate su veće touch zone, safe-area razmaci i pravila za vrlo uske i niske ekrane.

Floating CTA na telefonu:

- ima plavo-ljubičasti pill izgled;
- odvojen je od donje ivice;
- na landing stranici se pojavljuje nakon hero sekcije;
- na ostalim javnim rutama odmah je vidljiv;
- na detalju zadržava kontekst izabranog vozila.

## 11. Dizajn i sadržaj

- Logo je ujednačen na svim footerima.
- Golf 7 hero slika je vraćena i zadržana.
- Uklonjen je okvir i ljubičasta linija oko uvoda detalja vozila.
- Galerija je spojena sa glavnom fotografijom na detalju.
- Fotografije različitih odnosa stranica koriste contain prikaz uz zamućenu pozadinu.
- Javni copy je skraćen i prepravljen da bude direktniji.
- Uklonjene su duge crte iz javnog copyja.
- Opisi svih 12 vozila ažurirani su i u bazi.

## 12. SEO i kvalitet

- Osnovni metadata za landing, flotu i detalje vozila.
- Canonical URL vrednosti.
- Open Graph podaci.
- LocalBusiness i AutoRental strukturirani podaci.
- Next Image optimizacija.
- Empty i error stanja za javne podatke.
- ESLint prolazi.
- Produkcijski Next.js build prolazi za svih 17 generisanih ruta.

## 13. Migracije i pomoćne skripte

- `scripts/import-vehicles.mjs` uvozi i ažurira 12 vozila, cenovnike i fotografije.
- `20260722_prevent_overlapping_reservations.sql` dodaje zaštitu od preklapanja prihvaćenih rezervacija.
- `20260722_remove_vehicle_bags.sql` uklanja podatak o prtljagu.

## 14. Još nije implementirano

Sledeće stavke su razmatrane ili planirane, ali još nisu deo funkcionalnog sistema:

- Resend email notifikacije.
- Telegram notifikacije.
- Korisnički management link za izmenu ili povlačenje upita.
- Rate limiting.
- Ručne servisne blokade.
- Istorija događaja rezervacije.
- Notification outbox i retry.
- Pravne stranice.
- Filteri javnog kataloga.
- Automatizovani unit, integration i end-to-end testovi.
- Kompletna početna SQL migracija i dokumentovana RLS pravila.
- Produkcijski deployment i završni Lighthouse audit.

