
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

Båda servrarna lyssnar på samma port.

##### Krav 4

tester
