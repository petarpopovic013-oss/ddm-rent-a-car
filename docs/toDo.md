# DDM Rent a Car - sledeći koraci

Poslednje ažuriranje: 22. jul 2026.

Ovaj dokument prikazuje stvarno trenutno stanje projekta. Detaljan pregled implementiranih funkcionalnosti nalazi se u [`uradjeno.md`](./uradjeno.md), a poslovni zahtevi u [`PRD.md`](./PRD.md).

## 1. Potvrđene odluke

- [x] Glavna valuta je RSD.
- [x] Upit se šalje kroz zajednički modal.
- [x] Oba izabrana datuma ulaze u obračun najma.
- [x] Samo prihvaćene rezervacije blokiraju vozilo.
- [x] Admin ne može ručno da menja iznos rezervacije.
- [x] Iznos se menja promenom vozila ili perioda.
- [x] Landing prikazuje šest izdvojenih vozila.
- [x] Sandero i Ducato nisu uvezeni i ostavljeni su za ručni unos.
- [x] Podatak o prtljagu je uklonjen iz baze i sa sajta.
- [x] Specifikacije sa vrednošću `false`, poput tempomata, ne prikazuju se javno.
- [ ] Razjasniti neslaganje cenovnika: fotografija navodi rang 11-25 dana, dok aplikacija trenutno koristi 11-29 dana.
- [ ] Dostaviti konačne tekstove politike privatnosti i uslova korišćenja.

## 2. Tehnička osnova i baza

- [x] Povezan Supabase projekat.
- [x] Dodat server-only Supabase admin klijent.
- [x] Dodati TypeScript tipovi za vozila, cene, slike i rezervacije.
- [x] Dodat `.env.example` bez tajnih vrednosti.
- [x] Service key ostaje isključivo na serveru.
- [x] Postoje i koriste se tabele `rc_vehicles`, `rc_vehicle_pricing_tiers`, `rc_vehicle_images` i `rc_reservations`.
- [x] Postoji Storage bucket `rc-vehicle-images`.
- [x] Dodat SQL constraint koji sprečava preklapanje prihvaćenih rezervacija.
- [x] Kolona za prtljag uklonjena je migracijom.
- [ ] Dodati u repozitorijum kompletnu početnu migraciju svih postojećih tabela, indeksa i ograničenja.
- [ ] Proveriti i dokumentovati RLS pravila za sve `rc_` tabele i Storage bucket.
- [ ] Dodati tabelu `rc_vehicle_blocks` za ručne servisne blokade.
- [ ] Dodati `rc_reservation_events` za istoriju promena.
- [ ] Dodati `rc_email_events` ili notification outbox za evidenciju i retry.
- [ ] Napraviti proverenu backup i rollback proceduru.

## 3. Vozila i cenovnik

- [x] U bazu je uvezeno 12 automobila iz foldera `Slike`.
- [x] Uvezene su glavne i galerijske fotografije.
- [x] Slike se optimizuju i čuvaju kao WebP.
- [x] Cene su preuzete iz fajla `cene automobili.jpeg`.
- [x] Definisani su rangovi 1-3, 4-10, 11-29 i fiksna cena za 30 dana.
- [x] Postavljeno je šest izdvojenih vozila.
- [x] Opisi vozila su prepravljeni da budu kratki i prirodni.
- [x] Depozit je ispravljen na 36.000 RSD.
- [x] Pranje je ispravljeno na 1.200 RSD, odnosno 1.800 RSD za Hyundai H1.
- [x] Dodata je naknada od 500 RSD za odlazak na pumpu, uz cenu sipanog goriva.
- [ ] Potvrditi podatke koje nije bilo moguće pouzdano pročitati sa fotografija, posebno tempomat za Golf 6 i Golf 7.
- [ ] Ručno dodati Sandero i Ducato kada podaci budu spremni.

## 4. Javni sajt

- [x] Landing učitava izdvojena vozila iz baze.
- [x] Hero koristi originalnu Golf 7 fotografiju.
- [x] Napravljena je stranica `/vozila` sa kompletnom flotom.
- [x] Napravljene su pojedinačne stranice `/vozila/[slug]`.
- [x] Detalj vozila ima glavnu galeriju, strelice, thumbnails, tastaturu i swipe na telefonu.
- [x] Kartice prikazuju celu fotografiju bez grubog sečenja, uz zamućenu pozadinu.
- [x] Footer logo ima stabilnu veličinu na svim javnim rutama.
- [x] Copy je skraćen, očišćen od dugih crta i generičnog marketinškog tona.
- [x] FAQ sadrži tačne informacije sa cenovnika.
- [x] Navigacija sadrži link ka floti.
- [x] Dodati osnovni metadata, canonical URL i LocalBusiness/AutoRental strukturirani podaci.
- [ ] Dodati filtere kataloga po datumu, kategoriji i menjaču.
- [ ] Kada su datumi izabrani u katalogu, prikazati samo slobodna vozila.
- [ ] Dodati poseban strukturirani podatak za pojedinačna vozila ako bude koristan za SEO.

## 5. Modal i slanje upita

- [x] Svi `data-inquiry-trigger` CTA elementi otvaraju isti modal.
- [x] CTA sa kartice ili detalja unapred bira vozilo.
- [x] Forma ima četiri koraka: vozilo, termin, kontakt i potvrda.
- [x] Forma prikuplja vozilo, datume, ime, telefon, email, napomenu i saglasnost.
- [x] Kalendar prikazuje zauzete periode prihvaćenih rezervacija.
- [x] Obračun koristi uključive datume i maksimalno 30 dana.
- [x] Konačan iznos prikazuje se pre slanja.
- [x] Server ponovo validira podatke, cenu i dostupnost.
- [x] Upit se čuva sa statusom `pending`.
- [x] Pending upit ne blokira vozilo.
- [x] Dodato je honeypot polje protiv osnovnih botova.
- [x] Modal ima loading, success i error stanja.
- [x] Modal se zatvara klikom na backdrop, close dugmetom i tasterom Escape.
- [x] Skrolovanje pozadine je zaključano dok je modal otvoren.
- [ ] Dodati rate limiting za javno slanje upita.
- [ ] Dodati potpun focus trap i vraćanje fokusa na CTA koji je otvorio modal.
- [ ] Dodati integracione testove javnog toka.
- [ ] Razmotriti zaštitu od duplog slanja i idempotency ključ.

## 6. Floating CTA na telefonu

- [x] CTA je izdvojen od donje ivice i prikazan kao plavo-ljubičasto pill dugme.
- [x] Dugme se na landing stranici pojavljuje tek nakon izlaska iz hero sekcije.
- [x] Dugme se ponovo sakriva kada se korisnik vrati na hero.
- [x] Na floti i detalju vozila odmah je dostupno.
- [x] Na detalju vozila zadržava izbor konkretnog automobila.
- [x] Uklonjen je dodatni CTA iz informativne sekcije na telefonu.

## 7. Admin autentikacija

- [x] Napravljena je `/admin/login` stranica.
- [x] Admin šifra se čuva kao bcrypt hash.
- [x] Poređenje šifre radi isključivo na serveru.
- [x] Sesija je potpisana, `HttpOnly`, `SameSite=Lax` i traje osam sati.
- [x] Cookie je `Secure` u produkciji.
- [x] Dodata je logout akcija.
- [x] Sve admin stranice i mutacije zahtevaju admin sesiju.
- [ ] Dodati rate limiting za pokušaje prijave.
- [ ] Razmotriti rotaciju session secret-a i evidentiranje neuspešnih prijava.

## 8. Admin rezervacije

- [x] Dashboard prikazuje stanje flote, nove upite, buduće rezervacije i potvrđeni iznos.
- [x] Napravljena je lista rezervacija sa pretragom i status filterom.
- [x] Napravljen je detalj rezervacije.
- [x] Admin može da promeni vozilo, datume, kontakt i napomene.
- [x] Iznos se automatski preračunava i ne može ručno da se unese.
- [x] Admin može da prihvati ili odbije upit.
- [x] Prihvaćena rezervacija blokira vozilo u izabranom periodu.
- [x] Baza sprečava dve prihvaćene rezervacije za isto vozilo i preklapajući period.
- [x] Admin može ručno da kreira rezervaciju.
- [x] Admin može da obriše rezervaciju uz potvrdu.
- [ ] Dodati istoriju svih promena rezervacije.
- [ ] Dodati ručne servisne blokade vozila.
- [ ] Dodati testove prihvatanja, odbijanja, izmene i konflikta.

## 9. Admin vozila

- [x] Napravljene su lista, dodavanje, izmena i brisanje vozila.
- [x] Podržani su statusi `active`, `hidden`, `service` i `archived`.
- [x] Admin može da menja javne specifikacije i cenovne rangove.
- [x] Admin može da označi izdvojeno vozilo i promeni redosled.
- [x] Implementiran je upload glavne i galerijskih fotografija.
- [x] Fotografije se validiraju, smanjuju, rotiraju i pretvaraju u WebP.
- [x] Moguće je zameniti glavnu i ukloniti galerijske fotografije.
- [x] Neuspeli upload pokušava da očisti već kreirane fajlove.
- [x] Vozilo sa rezervacijama ne može se obrisati i treba ga arhivirati.
- [ ] Dodati drag-and-drop sortiranje galerije.
- [ ] Dodati ručni izbor postojeće galerijske slike kao glavne.
- [ ] Prikazati buduće rezervacije i blokade na detalju vozila.

## 10. Email i druge notifikacije

- [ ] Otvoriti Resend nalog.
- [ ] Verifikovati domen `rentacarddm.rs` preko SPF i DKIM zapisa.
- [ ] Dodati `RESEND_API_KEY` i notification adrese u environment promenljive.
- [ ] Napraviti admin email za novi upit.
- [ ] Napraviti korisničku potvrdu prijema upita.
- [ ] Napraviti email za prihvatanje, odbijanje i izmenu rezervacije.
- [ ] Podesiti `Reply-To` tako da admin može direktno da odgovori klijentu.
- [ ] Osigurati da greška notifikacije ne poništi uspešan upis rezervacije.
- [ ] Dodati evidenciju, status slanja i retry mehanizam.
- [ ] Opciono dodati Telegram bot kao trenutnu internu notifikaciju.

Napomena: mailbox za `rezervacije@rentacarddm.rs` nije potreban samo za slanje preko Resenda. Potreban je samo ako se želi klasičan inbox na toj adresi.

## 11. Mobilni prikaz i pristupačnost

- [x] Landing, flota, detalj vozila, galerija i modal imaju posebna mobilna pravila.
- [x] Admin dashboard, tabele, kartice, forme i login prilagođeni su telefonu.
- [x] Admin tabele se na telefonu prikazuju kao kartice bez horizontalnog skrola.
- [x] Input polja koriste veličinu koja sprečava automatski iOS zoom.
- [x] Dodate su veće touch zone i safe-area podrška.
- [x] Mobilni meni zaključava pozadinu i zatvara se tasterom Escape.
- [x] Galerija podržava prevlačenje prstom.
- [ ] Uraditi vizuelni QA na stvarnim iOS i Android uređajima.
- [ ] Proveriti sve tokove samo tastaturom.
- [ ] Uraditi audit kontrasta i screen reader labela.

## 12. Legalne stranice

- [ ] Napraviti `/politika-privatnosti`.
- [ ] Napraviti `/uslovi-koriscenja`.
- [ ] Povezati dokumente iz forme i footera.
- [ ] Potvrditi tekstove sa vlasnikom ili pravnim savetnikom pre produkcije.

## 13. Testovi, SEO i produkcija

- [x] ESLint prolazi.
- [x] TypeScript produkcijska provera prolazi kroz `next build`.
- [x] Produkcijski build trenutno prolazi za sve rute.
- [x] Next Image koristi optimizovane lokalne i Supabase fotografije.
- [ ] Dodati unit testove za obračun cene i datuma.
- [ ] Dodati integracione testove za server actions.
- [ ] Dodati end-to-end testove za upit i admin odluku.
- [ ] Dodati `sitemap.xml`.
- [ ] Proveriti generisani `robots.txt` i produkcijska robots pravila.
- [ ] Dodati bezbednosne headere.
- [ ] Dodati privacy-friendly analytics po potrebi.
- [ ] Izmeriti Lighthouse i popraviti ključne javne stranice do cilja 90+.
- [ ] Podesiti produkcijske environment promenljive.
- [ ] Povezati i proveriti produkcijski domen.
- [ ] Proveriti da logovi ne sadrže pune lične podatke ili tajne.

## Preporučeni redosled nastavka

1. Razjasniti cenovni rang 11-25 naspram 11-29 dana.
2. Dodati Resend notifikaciju adminu i potvrdu korisniku.
3. Dodati rate limiting za javni upit i admin login.
4. Napraviti legalne stranice i povezati ih sa formom.
5. Dodati kompletnu početnu migraciju i proveriti RLS.
6. Dodati testove za cenu, dostupnost i prihvatanje rezervacije.
7. Uvesti ručne blokade vozila i istoriju događaja.
8. Uraditi završni mobilni, pristupačni i produkcijski QA.

## Definicija završenog zadatka

Zadatak je završen kada:

- [ ] funkcionalnost radi u realnom korisničkom toku;
- [ ] lint i produkcijski build prolaze;
- [ ] relevantni testovi prolaze ili je jasno zabeleženo da još ne postoje;
- [ ] provereni su telefon i desktop;
- [ ] postoje jasna success i error stanja;
- [ ] tajne i osetljivi podaci ostaju na serveru;
- [ ] dokumentacija i `.env.example` su ažurirani.

