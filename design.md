# DDM Rent a Car — Design System

## 1. Vizuelni pravac

DDM sajt koristi industrijski, automobilski i lokalno autentičan vizuelni jezik. Dizajn treba da podseća na tehničku dokumentaciju, servisnu signalizaciju i ozbiljan katalog vozila, a ne na generičan SaaS ili AI-generisan landing page.

Osnovni principi:

- velike i zgusnute tipografske poruke;
- ravne površine i tvrde ivice umesto lebdećih kartica;
- kontrolisana tehnička mreža u pozadini;
- plava kao glavna radna površina;
- žuta samo kao signal, marker ili CTA akcenat;
- stvarne DDM fotografije i jasni podaci ispred dekoracije;
- dosledna numeracija i hijerarhija svih sekcija.

Ne koristiti blob pozadine, glassmorphism, glow efekte, pill komponente, ogromne watermark natpise, nasumične gradijente ili generičke stock fotografije ljudi.

## 2. Tehnologija i source of truth

- Framework: Next.js 16 App Router, React i TypeScript.
- Glavna stranica i marketinški sadržaj: `app/page.tsx`.
- Svi globalni tokeni, layout pravila i responsive stilovi: `app/globals.css`.
- Fontovi se učitavaju u `app/layout.tsx` pomoću `next/font/google` i self-hostuju kroz Next.js build.
- Tailwind CSS v4 je dostupan, ali je trenutni landing pretežno stilizovan eksplicitnim semantičkim klasama.
- Klijentski JavaScript koriste samo mobilna navigacija i FAQ. Hero je statičan Server Component.
- `dangerouslySetInnerHTML` se koristi isključivo za JSON-LD strukturirane podatke, ne za renderovanje template HTML-a.

## 3. Paleta

```css
--blue: #293B91;
--ink: #101414;
--muted: #5B5C5E;
--yellow: #FEFE05;
--white: #FFFFFF;
--line: rgba(91, 92, 94, 0.22);
```

Pravila upotrebe:

- `blue` je primarna boja dugmadi, tehničkih oznaka, velikih informacionih površina i jakih sekcija.
- `ink` je boja glavnih naslova na svetloj pozadini.
- `muted` je osnovna boja dužeg teksta.
- `yellow` se koristi u kratkim linijama, markerima, kategorijama, brojevima i najvažnijim mobilnim CTA elementima.
- Pozadine su uglavnom bele ili veoma svetlo plavo-sive; tamne površine koriste isključivo DDM plavu.

## 4. Tipografija

### Display font

`Barlow Semi Condensed`, težine 600, 700 i 800.

Koristi se za:

- `h1`, `h2` i `h3` naslove;
- velike brojeve koraka;
- oznake vozila i kratke tehničke naslove;
- naslovne elemente u footeru.

Naslovi su najčešće uppercase, zgusnuti, sa kratkim line-heightom između `0.82` i `1.02`. Ne koristiti ekstremno negativan tracking koji smanjuje čitljivost srpske latinice.

### Body font

`IBM Plex Sans`, variable težine 100–700.

Koristi se za:

- pasuse i opise;
- navigaciju, dugmad i linkove;
- cene, specifikacije i kontakt podatke;
- forme i budući admin interfejs.

Body tekst je standardno `16px`, sa line-heightom oko `1.6`. Duži uvodni tekst može biti `17px`.

## 5. Layout i ritam

Glavni kontejner je `.page-shell`:

```css
width: min(calc(100% - 48px), 1320px);
margin-inline: auto;
```

Razmaci se smanjuju na 32px ukupne margine ispod 820px i 24px ispod 620px.

Standardna `.section`:

- ima gornju separator liniju;
- koristi vertikalni razmak od približno 92–128px na desktopu i 82px na mobilnom;
- dobija `data-index` vrednost `01`–`07`, prikazanu iznad sadržaja kao mali plavi tehnički marker;
- koristi levi, ne centrirani uvod osim kada funkcionalni kontekst zahteva drugačije.

Sekcijski naslov, opis i eyebrow moraju zadržati isti redosled:

1. mali uppercase eyebrow sa žutim kvadratnim markerom;
2. veliki kondenzovani naslov;
3. maksimalno 2–3 reda opisnog teksta;
4. sadržaj ili akcije sekcije.

## 6. Tehnička mreža

Mreža je CSS tekstura od horizontalnih i vertikalnih linija, bez zasebnog raster asseta.

- Hero desktop: polja od `64px`, plava sa veoma niskom neprozirnošću i maskom prema desnoj strani.
- Mobilni hero: polja od `42px`.
- Fleet, prednosti, FAQ, kontakt i footer koriste još diskretniju varijantu mreže.
- Ne stavljati mrežu preko fotografija ili dužeg teksta sa slabim kontrastom.

## 7. Komponente

### Header

- Beli sticky header visine 78px na desktopu i 72px na mobilnom.
- DDM logo levo, navigacija i plavi CTA desno.
- Navigacioni hover je kratka žuta donja linija.
- Ispod 1100px navigaciju zamenjuje kvadratno burger dugme.

### Hero

- Beli tehnički poster sa mrežom preko cele pozadine.
- Naslov: „Spremni za grad. Spremni za put.“ u dve linije na desktopu i četiri kontrolisane linije na mobilnom.
- `public/golf7hero.png` je jedino hero vozilo i prikazuje se bez kartice ili fotografskog okvira.
- Golf dobija samo tehničku oznaku, kratku žutu liniju i diskretnu podnu senku.
- Primarni CTA vodi ka `#vozila`, sekundarni CTA je telefonski link.
- Kontakt, lokacija i radno vreme čine integrisanu plavu informacionu traku ispod hero kompozicije.
- Hero nema karusel, autoplay ni klijentsko stanje.

### Fleet katalog

- Svetla grid pozadina i tehnički uvod sa plavim graničnim linijama.
- Kartice čine kontinuiranu katalog mrežu bez međusobnih gapova i zaobljenja.
- Fotografija je dominantna; kategorija je mali žuti marker pričvršćen uz ivicu fotografije.
- Naziv vozila je uppercase, cena plava, a karakteristike su organizovane kao tabela.
- Hover samo blago uvećava fotografiju i pojačava ivicu; kartica se ne podiže i nema veliku senku.

### Proces najma

- Cela sekcija koristi plavu pozadinu i beli tekst.
- Tri koraka su u jednoj tabelarnoj traci sa tankim belim separatorima.
- Brojevi `01–03` su veliki i žuti.
- Na mobilnom se koraci slažu vertikalno, ostaju levo poravnati i zadržavaju separatore.

### Prednosti

- Svetla tehnička mreža, tekst levo i stvarne DDM fotografije desno.
- Benefiti su numerisani redovi `01–04`, bez generičnih check ikonica.
- Fotografije čine jedan tvrdo uokviren panel bez gapova i zaobljenja.
- Panel nosi malu žutu oznaku „DDM / AUTOMOTIVE TEAM“.

### O nama

- Fotografija i tekst čine jednu povezanu komponentu sa plavim okvirom.
- Tekstualni deo ima isti ritam eyebrow → naslov → tekst → CTA.
- Mali žuti segment na gornjoj ivici povezuje panel sa hero jezikom.

### Recenzija

- Fotografija i quote panel su spojeni bez razmaka.
- Quote panel koristi punu DDM plavu, beli tekst i žute zvezdice.
- Žuta donja linija je jedini dekorativni akcenat.

### FAQ

- Sekcija koristi svetlu mrežu i jednu uokvirenu dvokolonsku komponentu.
- Levi uvod je plav, desna accordion lista bela.
- Accordion kontrole su kvadratne, ne kružne.
- Samo jedan odgovor je otvoren; postojeća ARIA stanja i keyboard ponašanje moraju ostati očuvani.

### Kontakt

- Velika realna fotografija sa plavim overlay-em i belim naslovom.
- Donji kontakt podaci su plava četvorokolonska informaciona tabla sa žutom gornjom linijom.
- Na manjim ekranima kolone prelaze u dve, zatim jednu kolonu.

### Footer

- Beli footer sa tehničkom mrežom i debelom plavom gornjom ivicom.
- Žuti segment zauzima samo deo gornje ivice.
- Kolone su razdvojene tankim vertikalnim linijama.
- Naslovi kolona koriste display font, DDM plavu i uppercase stil.

## 8. Dugmad i linkovi

- Primarna dugmad su pravougaona sa radiusom do 2px.
- Podrazumevano: plava pozadina, beli tekst i plava ivica.
- Hover: bela pozadina i plavi tekst, bez podizanja ili velike senke.
- Tekstualni linkovi su plavi i dobijaju underline na hover.
- Na tamnoj površini koriste se bele varijante.
- Mobilna fiksna kontakt traka ostaje žuta sa plavim tekstom.

## 9. Responsive standard

- Primarni mobilni opseg: 360–430px.
- Desktop katalog: tri kolone; tablet: dve; mobilni: jedna.
- Sve kompleksne dvokolonske sekcije prelaze u jednu kolonu ispod 820px.
- Naslovi se lome namerno, ne preko overflow-a ili smanjivanja do nečitljivosti.
- Fotografije mogu da budu šire od unutrašnjeg sadržaja samo unutar roditelja koji ima kontrolisan `overflow: hidden`.
- Ne sme postojati horizontalni scroll.
- Mobilni CTA ne sme pokriti poslednji sadržaj; body ima safe-area donji razmak.

## 10. Interakcije i pristupačnost

- Sve interaktivne kontrole imaju vidljiv `:focus-visible` outline.
- Linkovi za telefon, email i mapu koriste stvarne `tel:`, `mailto:` i eksternе URL vrednosti.
- `prefers-reduced-motion` isključuje tranzicije i animacije.
- Fotografije imaju sadržajne alt tekstove, dok su tehnički ukrasi `aria-hidden`.
- Kontrast mora ostati najmanje WCAG AA.

## 11. Pravila za buduće stranice

- Katalog, detalj vozila, forme i admin treba da koriste iste fontove, boje, ravne ivice i tabelarni ritam.
- Forme se grade kao tehnički paneli: jasne labele, 1px ivice, bez plutajućih labela i glass efekata.
- Admin može biti gušći, ali ne sme uvoditi novu paletu ili drugačiji radius sistem.
- Novi marketinški blok mora koristiti postojeći eyebrow, sekcijski naslov, indeks i jedan od postojećih surface tipova pre nego što dobije novu dekoraciju.
- Žuta nikada ne sme postati dominantna pozadina cele velike sekcije.

## 12. Ključni asseti

- `public/Logo/DDM-RC.png` — primarni logo.
- `public/golf7hero.png` — transparentni Golf 7 za hero.
- `public/ddm-assets/vehicles/` — fotografije trenutne flote.
- `public/team1.jpg` i `public/team.jpeg` — DDM lokacija i radionica.

RentQ asseti ostaju samo istorijski/reference materijal. Novi DDM interfejs ne treba da vraća RentQ narandžastu, pale-green površine, stock ljude ili originalne promotivne blokove.
