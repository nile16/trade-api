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
Anropen till servern har formen av ett kommando plus parametrar, egendomen 'cmd'
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
<CORS headers>
{ "err": false, "bal": 239.94, "shr": { "BTH": 4, "ABB": 2, "OPEL": 5 } }
```

Som databas valde jag MongoDB.
Valet föll på MongoDB främst för dess programatiska API.
SQL är designat för att en operatör ska kunna skriva in förfrågningar som
strängar via en terminal vilket är ålderdomligt och omständigt att göra programatiskt.
En annan anledning är att det är en dokumentbaserad databas vilken sparar
data i JSON form som API:et mot klienten arbetar med vilket gör att data
i viss mån kan skickas direkt utan någon tolkning.



##### Krav 3

För realtidsaspekten gjorde jag en webbsocket broadcasting-server som
periodvis skickar en lista med aktiekurser till alla klienter.
Priserna är sparade i ett objekt som innehåller nyckel-värde-par där varje
nyckel är en aktiesymbol och värdet är dess pris.
Var tionde sekund itereras priserna och varje pris ändras lite slumpvis och
skickas sedan ut till alla anslutna klienter med en broadcasting-metod.

Tekniken fungerar bra men i detta fallet hade det varit bättre om klienten
anropat servern och efterfrågat de senaste priserna istället.
Då hade inte anslutningen behövt vara öppen hela tiden samt avbrott
hade hanterats bättre.

##### Krav 4

Verktygen som används är mocha, nyc, chai, chai-http och eslint.
Jag valde de för vi använde dem i kursen och jag hade inget bättre
förslag helt enkelt.
Webbsocket-servern täcks inte av testerna.
En del felkontroll täcks inte heller.
Det är ganska lätt att få bra kodtäckning på den vanliga servern men på
webbsocket-servern är det värre.
Jag hittade inte något bra sätt att lösa det på.
I övrigt fungerar det ganska bra tekniskt.

För CI-kedjan har jag både Travis och Scrutinizer.
Både Travis och Scrutinizer testar att bygga projektet och köra testerna.
Jag tycker inte dessa tjänster hjälper mycket, man kan lika gärna köra testerna
lokalt.
Möjligtvis kan de vara till nytta för att varna om någon utvecklare envisas med
att pusha upp sådant som inte fungerar.

Jag är inte nöjd med Scrutinizers betyg för kodkvalitet.
Scrutinizer verka se hela min server som en enda komplicerad klass som borde
brytas ner i mindre delar.
Vidare tycker Scrutinizer att en enkel funktion, "randPrice", på några rader är för komplex.
Enligt Scrutinizer innehåller funktionen på 5 rader hela 67 "conditions".
Hade betyget varit mer förutsägbart hade jag nog försökt skriva om koden för ett
finare betyg men som det är nu känns det meningslöst så det får vara.
