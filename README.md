[![Build Status](https://travis-ci.com/nile16/trade-api.svg?branch=master)](https://travis-ci.com/nile16/trade-api)

[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/nile16/trade-api/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/nile16/trade-api/?branch=master)
[![Code Coverage](https://scrutinizer-ci.com/g/nile16/trade-api/badges/coverage.png?b=master)](https://scrutinizer-ci.com/g/nile16/trade-api/?branch=master)
[![Build Status](https://scrutinizer-ci.com/g/nile16/trade-api/badges/build.png?b=master)](https://scrutinizer-ci.com/g/nile16/trade-api/build-status/master)

##### Installation
*npm install*

##### Starta utvecklingsserver
*npm start*

##### Kör tester
*npm test*

##### Linta Javascriptet
*npm run eslint*

##### Starta produktionsserver
*npm run production*


##### Krav 1

Eftersom vi skulle försvara vårt val av tekniker valde jag vanilla Javascript
till Node-servern då jag inte kan motivera något ramverk.
En case-sats ersätter i princip Express.

Jag struntade helt i REST, URL-struktur och URL-parametrar då det är designat för
PHP-tankesättet med en samling mallar som ständigt laddas om.
Mallomladdnings-tankesättet hör hemma i en svunnen tidsålder innan webbläsarna
körde skript och det enda sättet att göra en webbsida med aktivt innehåll
var att ladda om hela sidan med hjälp av `<form>`-taggen.

Istället görs alla anrop till API:et som POST med rå JSON.
Alla svar från API:et returneras också som rå JSON.
Det blir ett enkelt men samtidigt mycket kraftfullt sätt att kommunisera.
Anropen till servern har formen av kommando plus parametrar, egendomen 'cmd'
är kommandot och ska finnas med i varje anrop.

Ett anrop för inloggning kan se ut så här:

```
POST / HTTP/1.1
Content-Type: application/json
{ "cmd": "lin", "ema": "nils@bth.se", "psw": "1234" }
```

Vilket kan ge ett svar så här:

```
Content-Type: application/json
<CORS headers>
{ "err": "false", "tok": "eyJhbGciOiJIUzI1Ni..." }
```

Alla svar innehåller egendomen "err" vilken indikerar om något fel påträffades.
Efter inloggning ska värdet i "tok", som är en token, sparas av klienten och
bifogas vid varje anrop som kräver inloggning.
Token innehåller användarens email som i sin tur identifierar användaren.

Ett anrop för hämtning av användardata kan se ut så här:

```
POST / HTTP/1.1
Content-Type: application/json
{ "cmd": "dat", "tok": "eyJhbGciOiJIUzI1Ni..." }
```

Vilket kan ge ett svar så här:

```
Content-Type: application/json`
CORS headers
{"err": false, "bal": 239.94, "shr": { "BTH": 4, "ABB": 2, "OPEL": 5 }}
```

Denna server gör tre saker. Registrerar nya användare, returnerar en token
vid inloggning och sparar användardata.

Som databas valde jag MongoDB.
Valet föll på MongoDB främst för dess programatiska API.
SQL är designat för att en operatör ska kunna skriva in förfrågningar som
strängar via en terminal vilket är ålderdomligt och omständigt att göra programatiskt.
Ett annan anledning är att det är en dokumentbaserad databas vilken sparar
data i JSON form som API:et mot klienten arbetar med vilket gör att data
i viss mån kan skickas direkt utan någon tolkning.



##### Krav 3

Skapa en realtids micro-service som hanterar priserna för dina säljobjekt. I din frontend ska denna micro-service användas för att grafisk representera priserna i realtid.

I dina README beskriver du i ett eget stycke om hur du implementerade realtidsaspekten i din applikation. Du skriver också om vilken teknik/verktyg du valt för din implementation samt en kort reflektion av hur du tycker tekniken fungerar.

##### Krav 4

I din README skriver du ett stycke om vilka verktyg du använt för din testsuite och om det är delar av applikationen som inte täcks av tester. Du reflekterar kort över hur dina teknikval fungerat för dig. Du reflekterar också över hur lätt/svårt det är att få kodtäckning på din applikation.

Man kan köra hela din testsuite lokalt via npm test.

Du har god kodtäckning i enhetstester och integrationstester på backend. Sträva efter 70% där det är rimligt, men se det som en riktlinje och inte ett hårt krav.

Ditt repo har en CI-kedja och automatiserade tester med tillhörande badges för byggtjänst, kodtäckning och tjänst för kodkvalitet.

I din README skriver du ett stycke om CI-kedjan, vilka tjänster du valt och varför samt eventuella begränsningar i hur CI-kedjan kan hantera din applikation. Du gör en kort reflektion över din syn på den hjälpen liknande verktyg ger dig.

Berätta om du är nöjd eller inte med de betyg som tjänsten för kodkvalitet ger dig.


Scrutinizer är hopplöst skräp.
Webbsidan hänger.
Kodkvaliten blir dålig för scrutinizer tycker en enkel funktion "randPrice"
på några rader är för komplex.
Vidare tror scrutinizer att servern är en stor klass som borde brytas ner.
Värdelöst skräp.
