# DDM Rent a Car — Product Requirements Document

| Polje | Vrednost |
| --- | --- |
| Proizvod | DDM Rent a Car web aplikacija |
| Tržište | Novi Sad, Srbija |
| Verzija dokumenta | 1.2 |
| Status | Spremno za implementaciju MVP-a |
| Jezik proizvoda | Srpski, latinica |
| Primarni stack | Next.js 16, TypeScript, Supabase, Resend, Vercel |
| Glavna valuta | RSD |

### 0.1. Potvrđene produktne odluke

- Sve javno prikazane cene najma, procene i iznosi rezervacija izražavaju se u RSD.
- Primarni tok za slanje upita na početnoj stranici je modal. Opšti CTA otvara modal bez unapred izabranog vozila, dok CTA sa kartice unapred bira odgovarajuće vozilo.
- Obračun najma koristi uključive kalendarske datume: računaju se i datum preuzimanja i datum vraćanja. Na primer, period 22–23. računa se kao dva dana.
- Dostupnost vozila blokiraju samo prihvaćene (`accepted`) rezervacije i aktivne ručne blokade. `pending` upiti ne blokiraju termin.
- Konačni pravni tekstovi, admin i sender email adrese i produkcijski domen biće dostavljeni naknadno. Ne blokiraju razvoj baze, ali su obavezni pre produkcijskog puštanja i prikupljanja stvarnih korisničkih podataka.
- Tačne početne dnevne cene u RSD za šest postojećih vozila moraju biti potvrđene pre seedovanja. Postojeće EUR vrednosti iz frontenda ne konvertuju se automatski.
- Svi rent-a-car objekti u deljenom Supabase projektu koriste prefiks `rc_`, kako bi ostali odvojeni od budućeg sistema za prikolice.

## 1. Sažetak proizvoda

DDM Rent a Car je javni marketing sajt i operativna web aplikacija za pregled vozila, proveru dostupnosti i slanje neobavezujućih upita za najam automobila u Novom Sadu.

Korisnik ne mora da kreira nalog. Bira konkretno vozilo i period najma, dobija procenu cene i šalje upit. Admin zatim prihvata ili odbija upit kroz zaštićen admin panel. Vozilo postaje nedostupno za preklapajuće termine tek kada admin prihvati upit.

Admin iz istog panela upravlja vozilima, fotografijama, cenama, servisnim blokadama, rezervacijama i blog sadržajem. Korisnik i admin dobijaju email obaveštenja o svim ključnim događajima.

## 2. Ciljevi i pokazatelji uspeha

### 2.1. Ciljevi MVP-a

- Omogućiti korisniku da za manje od tri minuta pronađe vozilo i pošalje upit.
- Sprečiti dvostruko rezervisanje istog vozila za preklapajući period.
- Omogućiti adminu da bez rada direktno u bazi upravlja flotom i upitima.
- Automatizovati osnovnu komunikaciju putem emaila.
- Predstaviti DDM kao pouzdan, moderan i lokalno relevantan rent-a-car brend.
- Obezbediti dobru upotrebljivost na mobilnim uređajima, odakle se očekuje najveći deo saobraćaja.

### 2.2. Početni KPI-jevi

- Stopa uspešno poslatih validnih upita.
- Odnos pregleda detalja vozila i započetih upita.
- Odnos započetih i završenih formi.
- Prosečno vreme od slanja upita do admin odluke.
- Broj sprečenih pokušaja preklapajućih rezervacija.
- Stopa uspešno isporučenih email obaveštenja.

## 3. Van obima MVP-a

- Korisnički nalozi i prijava klijenata.
- Supabase Auth za admina i sistem različitih admin uloga.
- Online naplata, depozit ili integracija sa payment providerom.
- Automatska provera vozačke dozvole, ličnih dokumenata ili starosti.
- Dinamički CMS za marketinške stranice, FAQ i ponude.
- Više poslovnica ili dostava vozila na adresu.
- Rezervacije sa satnicom.
- Mobilna aplikacija.
- Automatsko izdavanje ugovora ili fiskalnih dokumenata.

## 4. Korisnici

### 4.1. Posetilac / potencijalni klijent

Želi brzo da vidi ponudu, cenu i dostupnost bez registracije. Najčešće koristi mobilni telefon i očekuje jednostavan kontakt sa firmom.

### 4.2. Klijent sa poslatim upitom

Čeka odluku admina i preko sigurnog linka može da pregleda, izmeni ili povuče upit dok je njegov status `pending`.

### 4.3. Admin

Jedna ovlašćena osoba koja upravlja upitima, dostupnošću, vozilima, fotografijama i blogom. Pristupa panelu pomoću zajedničke server-side šifre.

## 5. Informaciona arhitektura

### 5.1. Javne stranice

- `/` — početna stranica.
- `/vozila` — katalog i pretraga dostupnih vozila.
- `/vozila/[slug]` — detalj konkretnog vozila i forma za upit.
- `/o-nama` — informacije o firmi.
- `/usluge` — opis usluga i procesa najma.
- `/blog` — lista objavljenih tekstova.
- `/blog/[slug]` — detalj blog objave.
- `/kontakt` — kontakt podaci, poslovnica i kontakt forma ili direktni kontakt.
- `/cesta-pitanja` — FAQ.
- `/uslovi-koriscenja` — uslovi najma i korišćenja sajta.
- `/politika-privatnosti` — obrada podataka i privatnost.
- `/upit/[token]` — siguran pregled i upravljanje pending upitom.

### 5.2. Admin stranice

- `/admin/login` — prijava env šifrom.
- `/admin` — dashboard sa pregledom novih upita i osnovnim pokazateljima.
- `/admin/rezervacije` — lista, filteri i upravljanje upitima.
- `/admin/rezervacije/[id]` — detalj, izmena i odluka.
- `/admin/vozila` — lista i upravljanje flotom.
- `/admin/vozila/novo` — dodavanje vozila.
- `/admin/vozila/[id]` — izmena vozila, slika i blokada.
- `/admin/blog` — lista blog objava.
- `/admin/blog/novo` i `/admin/blog/[id]` — kreiranje i izmena blog sadržaja.

## 6. Javni katalog vozila

### 6.1. Lista vozila

Katalog prikazuje samo aktivna, javno vidljiva vozila. Svaka kartica sadrži:

- Primarnu fotografiju.
- Proizvođača i model.
- Kategoriju.
- Cenu po danu.
- Broj sedišta.
- Menjač.
- Gorivo.
- Osnovni CTA za detalj ili slanje upita.

### 6.2. Filteri

MVP filteri:

- Datum preuzimanja.
- Datum vraćanja.
- Kategorija vozila.
- Menjač.
- Opciono cenovni opseg ako broj vozila opravdava filter.

Katalog bez izabranih datuma prikazuje sva aktivna vozila. Kada su oba datuma izabrana, prikazuju se samo vozila koja nemaju prihvaćenu rezervaciju ili ručnu blokadu u traženom periodu.

### 6.3. Detalj vozila

Stranica sadrži galeriju, opis, karakteristike, cenu po danu, uslove, dostupnost i formu za upit. Registracija i interne admin napomene nikada se ne prikazuju javno.

## 7. Slanje upita

Primarni tok na početnoj stranici koristi zajednički modal „Pošalji upit“. Svi postojeći CTA elementi za upit otvaraju isti modal. CTA sa kartice vozila unapred bira to vozilo, dok opšti CTA ostavlja izbor vozila korisniku. Isti formular i serverski tok mogu se ponovo koristiti na katalogu i stranici detalja vozila.

### 7.1. Obavezni podaci

- Ime i prezime.
- Email.
- Telefon.
- Vozilo.
- Datum preuzimanja.
- Datum vraćanja.
- Potvrda prihvatanja politike privatnosti i uslova korišćenja.

Opciono:

- Napomena korisnika.

Lokacija preuzimanja i vraćanja je jedna fiksna poslovnica u Novom Sadu i prikazuje se u formi kao informacija, bez korisničkog izbora.

### 7.2. Validacija

- Datum preuzimanja ne može biti u prošlosti.
- Datum vraćanja mora biti isti ili posle datuma preuzimanja.
- Email mora biti validnog formata.
- Telefon mora imati razumnu minimalnu i maksimalnu dužinu.
- Vozilo mora biti aktivno i javno dostupno.
- Server ponovo proverava dostupnost pre upisa, bez oslanjanja na stanje iz browsera.
- Forma koristi honeypot i rate limiting protiv spama.

### 7.3. Obračun cene

Oba izabrana datuma ulaze u period najma.

`broj_dana = datum_vraćanja - datum_preuzimanja + 1`

Za periode 1–3, 4–10 i 11–29 dana:

`iznos = broj_dana × cena_po_danu_za_odgovarajući_rang`

Za tačno 30 dana koristi se posebna fiksna mesečna cena vozila.

Na primer, preuzimanje 22. i vraćanje 23. u istom mesecu predstavlja dva dana najma. Cena po danu i iznos izraženi su u RSD i automatski se računaju prema izabranom vozilu i terminu. Admin ne unosi cenu ručno; iznos može da promeni samo promenom vozila ili datuma.

### 7.4. Rezultat slanja

- Kreira se rezervacija sa statusom `pending`.
- Generiše se kriptografski siguran management token.
- U bazi se čuva samo hash tokena.
- Korisnik dobija success ekran i email potvrdu.
- Admin dobija email o novom upitu.
- Pending upit ne blokira vozilo za druge korisnike.

## 8. Statusi i poslovna pravila rezervacije

### 8.1. Statusi

- `pending` — novi upit, čeka odluku.
- `accepted` — admin je prihvatio rezervaciju; vozilo je blokirano.
- `rejected` — admin je odbio upit; vozilo nije blokirano.

Status se ne vraća iz `accepted` ili `rejected` u `pending` bez eksplicitne admin akcije i ponovne provere dostupnosti.

### 8.2. Povlačenje upita

Korisnik može povući samo `pending` upit. Povlačenje:

- Postavlja `withdrawn_at` timestamp.
- Ne briše istorijski zapis.
- Uklanja upit iz aktivnog pending reda.
- Obaveštava admina i korisnika emailom.
- Trajno deaktivira management token.

Povučeni upit zadržava status `pending`, ali se operativno smatra zatvorenim kada `withdrawn_at` nije `null`.

### 8.3. Dostupnost i preklapanje

Samo `accepted` rezervacije i aktivne ručne blokade utiču na dostupnost.

Dva perioda se preklapaju kada važi:

`postojeći_datum_preuzimanja <= novi_datum_vraćanja`

i

`postojeći_datum_vraćanja >= novi_datum_preuzimanja`

Datum vraćanja ostaje zauzet. Sledeća rezervacija istog vozila može početi najranije narednog kalendarskog dana.

### 8.4. Atomsko prihvatanje

Prihvatanje se obavlja kroz Supabase/PostgreSQL RPC funkciju u jednoj transakciji:

1. Zaključava se zapis vozila.
2. Proverava se da je upit i dalje aktivan i `pending`.
3. Proveravaju se prihvaćene rezervacije i ručne blokade.
4. Ako postoji konflikt, transakcija se prekida i admin dobija jasno obaveštenje.
5. Ako konflikta nema, status prelazi u `accepted`, token se deaktivira i čuva se vreme odluke.

Ovaj tok mora sprečiti da dva admin zahteva istovremeno prihvate preklapajuće rezervacije.

## 9. Siguran korisnički link

Email potvrda sadrži link oblika `/upit/[token]`.

Dok je upit aktivan i `pending`, korisnik može:

- Videti vozilo, datume, kontakt podatke i procenu cene.
- Promeniti kontakt podatke, datume i napomenu.
- Povući upit.

Pri promeni datuma server ponovo proverava validnost i dostupnost. Izmena ne blokira vozilo i ne menja status.

Token prestaje da važi kada je upit prihvaćen, odbijen ili povučen. Nevažeći token vraća generičku poruku bez otkrivanja da li rezervacija postoji.

## 10. Admin autentikacija

Admin nema Supabase Auth nalog.

- Login forma šalje šifru isključivo server-side handleru.
- U env promenljivoj čuva se hash šifre, ne otvorena šifra.
- Poređenje koristi odgovarajuću password-hash biblioteku.
- Uspešan login kreira potpisan `HttpOnly`, `Secure`, `SameSite=Lax` cookie.
- Sesija ima ograničeno trajanje i obnavlja se samo dok je validna.
- Admin ima logout akciju koja odmah briše sesiju.
- Login pokušaji se ograničavaju po IP adresi.
- Sve `/admin` rute i admin server akcije proveravaju sesiju na serveru.
- Admin secret i session secret nikada ne ulaze u client bundle.

## 11. Admin panel

### 11.1. Dashboard

- Broj aktivnih pending upita.
- Najnoviji upiti.
- Današnja i predstojeća prihvaćena preuzimanja/vraćanja.
- Vozila trenutno blokirana rezervacijom ili servisom.
- Email greške koje zahtevaju pažnju.

### 11.2. Rezervacije

Admin može:

- Pretraživati po imenu, emailu, telefonu i vozilu.
- Filtrirati po statusu, datumu i povučenim upitima.
- Otvoriti detalj rezervacije.
- Menjati kontakt podatke, datume, napomenu i konačnu cenu.
- Prihvatiti ili odbiti pending upit.
- Ponovo poslati email ako prethodno slanje nije uspelo.
- Pregledati osnovnu istoriju promena i email događaja.

Pri promeni datuma prihvaćene rezervacije mora se izvršiti ista atomska provera konflikta kao pri prihvatanju.

### 11.3. Vozila

Admin može:

- Dodati novo vozilo.
- Izmeniti sve javne i interne podatke.
- Aktivirati, privremeno sakriti ili arhivirati vozilo.
- Postaviti cenu po danu.
- Uploadovati, sortirati i obrisati fotografije.
- Izabrati primarnu fotografiju.
- Dodati ručnu blokadu zbog servisa ili druge nedostupnosti.
- Pregledati buduće rezervacije i blokade konkretnog vozila.

Vozilo sa istorijom rezervacija se arhivira umesto trajnog brisanja.

### 11.4. Blog

Admin može:

- Kreirati draft objavu.
- Uneti naslov, slug, excerpt, sadržaj, naslovnu fotografiju i SEO podatke.
- Objaviti ili povući objavu.
- Izmeniti postojeću objavu.
- Pregledati datum objave i status.

Ostali marketinški sadržaj ostaje statičan u kodu.

## 12. Email obaveštenja

| Događaj | Primalac | Sadržaj |
| --- | --- | --- |
| Novi upit | Korisnik | Potvrda prijema, vozilo, datumi, iznos, poslovnica i management link |
| Novi upit | Admin | Kontakt korisnika, vozilo, datumi, iznos i link ka admin detalju |
| Izmenjen pending upit | Korisnik | Potvrda novih podataka |
| Izmenjen pending upit | Admin | Pregled promena i link ka upitu |
| Povlačenje upita | Korisnik | Potvrda povlačenja |
| Povlačenje upita | Admin | Obaveštenje da upit više nije aktivan |
| Prihvatanje | Korisnik | Potvrđeni detalji, iznos i dalji koraci |
| Odbijanje | Korisnik | Obaveštenje o odbijanju i kontakt podaci |
| Admin izmena | Korisnik | Ažurirani detalji rezervacije |

Email se šalje preko Resend-a sa verifikovanog DDM domena. Razvojno okruženje koristi Resend test režim ili verifikovanu razvojnu adresu.

Svako slanje beleži tip događaja, primaoca, status, Resend message ID, grešku i vreme slanja. Neuspešno slanje ne poništava baznu operaciju. Admin vidi grešku i može ručno pokušati ponovno slanje.

## 13. Model podataka

### 13.1. `rc_vehicles`

- `id` — UUID, primary key.
- `slug` — unique, javni URL identifikator.
- `make`, `model`, `year`.
- `category`.
- `description`.
- `engine`, `fuel_type`, `transmission`, `body_type`.
- `seats`, `doors`.
- `air_conditioning`, `cruise_control`.
- `primary_image_path`, `image_position`.
- `status` — `active`, `hidden`, `service`, `archived`.
- `featured` — boolean.
- `created_at`, `updated_at`.

### 13.2. `rc_vehicle_pricing_tiers`

- `id` — UUID.
- `vehicle_id` — foreign key ka `rc_vehicles`.
- `min_days`, `max_days`.
- `price_rsd`.
- `pricing_mode` — `daily` ili `fixed`.
- `created_at`, `updated_at`.

Aktuelni rasponi su 1–3, 4–10 i 11–29 dana sa dnevnom cenom, odnosno tačno 30 dana sa fiksnom mesečnom cenom.

### 13.3. `rc_vehicle_images` — planirano za galeriju

- `id` — UUID.
- `vehicle_id` — foreign key.
- `storage_path`.
- `alt_text`.
- `sort_order`.
- `is_primary`.
- `created_at`.

### 13.4. `rc_vehicle_blocks` — planirano

- `id` — UUID.
- `vehicle_id` — foreign key.
- `start_date`, `end_date` — uključivi datumi.
- `reason` — admin napomena.
- `created_at`, `updated_at`.

### 13.5. `rc_reservations`

- `id` — UUID.
- `vehicle_id` — foreign key.
- `status` — `pending`, `accepted`, `rejected`.
- `customer_name`, `customer_email`, `customer_phone`.
- `pickup_date`, `return_date` — uključivi datumi.
- `pickup_location_snapshot`.
- `customer_note`, `admin_note`.
- `price_snapshot_rsd`, `pricing_mode_snapshot`.
- `rental_days`, `estimated_total_rsd` — automatski obračunat iznos (interni naziv kolone).
- `management_token_hash` — nullable nakon deaktiviranja.
- `withdrawn_at`, `decided_at` — nullable.
- `created_at`, `updated_at`.

### 13.6. `rc_blog_posts` — planirano

- `id` — UUID.
- `slug` — unique.
- `title`, `excerpt`, `content`.
- `cover_image_path`.
- `status` — `draft`, `published`.
- `seo_title`, `seo_description`.
- `published_at`, `created_at`, `updated_at`.

### 13.7. `rc_email_events` — planirano

- `id` — UUID.
- `reservation_id` — nullable foreign key.
- `event_type`.
- `recipient`.
- `provider_message_id`.
- `status` — `pending`, `sent`, `failed`.
- `error_message`.
- `attempt_count`.
- `created_at`, `sent_at`.

### 13.8. Istorija promena

Rezervacije treba da imaju audit istoriju kroz posebnu `rc_reservation_events` tabelu ili ekvivalentan mehanizam. Svaki događaj beleži rezervaciju, tip promene, prethodne i nove relevantne vrednosti, izvor promene (`customer` ili `admin`) i vreme.

## 14. Supabase i bezbednost

- Vehicle i blog fotografije čuvaju se u javnom Storage bucket-u.
- Upload, izmena i brisanje fajlova dozvoljeni su samo kroz zaštićene server-side admin operacije.
- Javni klijent može čitati samo aktivna vozila i objavljene blog postove.
- Javna forma ne upisuje direktno u Supabase iz browsera.
- Service-role ključ koristi se samo na serveru.
- RLS je uključen na svim tabelama dostupnim preko Supabase API-ja.
- Privatni podaci rezervacija nisu javno čitljivi.
- Management token se loguje samo redigovano i nikada se ne čuva kao otvoren tekst.
- Admin i korisničke mutacije koriste CSRF-safe obrasce, validaciju i proveru porekla zahteva gde je primenljivo.
- Produkcija koristi HTTPS, security headers i sigurne cookie postavke.
- Logovi ne smeju sadržati pun telefon, email, token ili admin šifru.

## 15. Nefunkcionalni zahtevi

### 15.1. Performanse

- Next.js Image ili ekvivalentna optimizacija za fotografije vozila i bloga.
- Lazy loading za sadržaj ispod prvog ekrana.
- Stabilan layout bez značajnog CLS-a.
- Ciljani Lighthouse rezultat najmanje 90 za Performance, Accessibility, Best Practices i SEO na ključnim javnim stranicama, uz realne optimizovane fotografije.

### 15.2. Pristupačnost

- Semantički HTML i pravilna hijerarhija naslova.
- Sve forme imaju vidljive labele i razumljive greške.
- Potpuna navigacija tastaturom.
- Vidljivi focus state-ovi.
- Kontrast prema WCAG AA standardu.
- Alt tekst za sadržajne fotografije.
- Animacije poštuju `prefers-reduced-motion`.

### 15.3. Responsive dizajn

- Primarni breakpoint fokus: mobilni 360–430 px.
- Admin panel mora biti funkcionalan na tabletu, dok je desktop primarni admin format.
- Tabele na manjim ekranima prelaze u kartice ili horizontalno skrolovanje sa jasno vidljivim ključnim akcijama.

### 15.4. SEO

- Jedinstveni metadata title i description po stranici.
- Canonical URL-ovi.
- Open Graph slike.
- Strukturirani podaci za lokalni biznis i vozila gde su primenljivi.
- `sitemap.xml` i `robots.txt`.
- Blog objave imaju stabilne slugove i datum objave.

## 16. Vizuelni smer

Sajt nastavlja postojeću DDM temu:

- Primarna tamno-plava `#272271`.
- Sekundarna siva `#514c4a`.
- Bela pozadina sa crnim naslovima.
- Teška, geometrijska tipografija inspirisana DDM logotipom.
- Jasna vizuelna hijerarhija, kontrolisana upotreba grid tekstura i ravnije katalog kartice.
- Sekcija vozila treba da izgleda kao ozbiljan katalog, bez generičnih glow, glassmorphism i preteranih hover efekata.
- Dizajn mora ostati konzistentan kroz javne stranice, forme i admin panel.

## 17. Analytics i praćenje događaja

Minimalni događaji:

- Pregled kataloga.
- Primena filtera dostupnosti.
- Pregled detalja vozila.
- Početak popunjavanja upita.
- Uspešno slanje upita.
- Greška pri slanju upita.
- Klik na telefon ili email.
- Otvaranje management linka.
- Povlačenje ili izmena pending upita.

Analytics rešenje mora poštovati politiku privatnosti i cookie pravila koja važe za izabrani alat.

## 18. Acceptance kriterijumi

### 18.1. Upit i dostupnost

- Korisnik može izabrati vozilo, validan period i poslati upit bez naloga.
- Sistem pravilno računa uključive dane i procenu cene.
- Pending upit ne utiče na dostupnost.
- Accepted rezervacija uklanja vozilo iz rezultata za svaki preklapajući period.
- Ručna blokada ima isti efekat na dostupnost kao accepted rezervacija.
- Datum vraćanja ne može biti datum preuzimanja sledeće rezervacije.
- Konkurentno prihvatanje dva konfliktna upita može uspeti samo za jedan upit.

### 18.2. Korisnički link

- Validan token otvara samo pripadajući pending upit.
- Korisnik može da izmeni validne podatke i dobije email potvrdu.
- Korisnik može povući pending upit.
- Token više ne radi nakon prihvatanja, odbijanja ili povlačenja.
- Nevažeći token ne otkriva postojanje rezervacije ili lične podatke.

### 18.3. Admin

- Neautentifikovan korisnik ne može pristupiti admin stranici ili admin operaciji.
- Validna env šifra kreira sigurnu sesiju; logout je invalidira.
- Admin može kompletno upravljati vozilima, slikama i blokadama.
- Admin može pregledati, menjati, prihvatiti i odbiti upit.
- Admin može kreirati, menjati i objaviti blog post.
- Izmena accepted termina ne može napraviti konflikt.

### 18.4. Email

- Korisnik i admin dobijaju odgovarajuće emailove za sve definisane događaje.
- Email greška ne poništava uspešan upis ili promenu u bazi.
- Admin vidi neuspešno slanje i može pokrenuti retry.

### 18.5. Kvalitet

- Produkcijski build i TypeScript provera prolaze.
- Nema kritičnih lint grešaka u aplikacionom kodu.
- Ključni tokovi pokriveni su automatizovanim testovima.
- Javni tok i admin odluka testirani su na mobilnom i desktop viewport-u.

## 19. Test plan

### 19.1. Unit testovi

- Obračun broja dana i procenjene cene.
- Detekcija preklapanja uključivih datuma.
- Validacija forme i normalizacija telefona/emaila.
- Hash i validacija management tokena.
- Provera admin sesije.

### 19.2. Integracioni testovi

- Kreiranje pending upita.
- Atomsko prihvatanje bez konflikta.
- Odbijanje prihvatanja kada postoji konflikt.
- Izmena i povlačenje preko tokena.
- CRUD vozila, slika, blokada i bloga.
- Evidencija uspešnih i neuspešnih email događaja.

### 19.3. End-to-end testovi

- Katalog → detalj vozila → upit → email potvrda.
- Admin login → pregled upita → prihvatanje → promenjena dostupnost.
- Korisnički management link → izmena → povlačenje.
- Admin dodavanje vozila i fotografije → javni prikaz.
- Admin objava blog posta → javna blog stranica.

## 20. Deployment i konfiguracija

### 20.1. Supabase

- Kreirati produkcijski i razvojni projekat ili jasno odvojene environment konfiguracije.
- Kreirati migracije za tabele, indekse, enum vrednosti, RLS i RPC funkcije.
- Kreirati Storage bucket i pravila.
- Seedovati početna vozila samo u razvojnom okruženju.

### 20.2. Resend

- Verifikovati DDM domen.
- Definisati sender adresu i reply-to adresu admina.
- Kreirati email template-e na srpskom.
- Pratiti ograničenja besplatnog plana i broj poslatih poruka.

### 20.3. Vercel

- Podesiti development, preview i production env promenljive.
- Povezati produkcijski domen.
- Proveriti da tajne nisu dostupne client-side kodu.
- Aktivirati osnovni monitoring grešaka i logova.

## 21. Potrebna konfiguracija pre lansiranja

Sledeće vrednosti nisu produktne odluke i unose se pre produkcije:

- Tačan naziv firme i pravni podaci.
- Adresa novosadske poslovnice.
- Radno vreme.
- Admin email i broj telefona.
- Produkcijski domen.
- Resend sender i reply-to adrese.
- Politika goriva, kašnjenja, štete i depozita.
- Minimalna starost vozača i potrebna dokumentacija.
- Tekst uslova korišćenja i politike privatnosti odobren od strane vlasnika ili pravnog savetnika.

### 21.1. Potrebni podaci pre seedovanja vozila

- Potvrđene dnevne cene u RSD za Fiat Pandu, Daciju Sandero, Škodu Rapid, Volkswagen Golf 7, Opel Insigniju i Hyundai H1.
- Postojeće vrednosti od 20 do 55 EUR u trenutnom frontendu služe samo kao privremeni sadržaj i neće biti automatski preračunate niti upisane kao RSD.

## 22. Redosled implementacije

1. Supabase schema, migracije, Storage i RLS.
2. Server-side Supabase klijenti, validacija i shared tipovi.
3. Katalog, detalj vozila, dostupnost i obračun cene.
4. Slanje upita, management token i Resend potvrde.
5. Admin login i zaštita admin ruta.
6. Admin rezervacije i atomsko prihvatanje.
7. CRUD vozila, fotografija i ručnih blokada.
8. Blog CMS i javne blog stranice.
9. Ostale marketing i legal stranice.
10. Analytics, SEO, accessibility, testovi i produkcijsko puštanje.
