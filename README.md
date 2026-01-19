# Meteo App - Application Meteo Interactive

Une application meteo moderne et responsive avec systeme de monetisation integre.

## Apercu

Application meteo complete avec:
- Meteo actuelle et previsions 5 jours
- Animations meteo dynamiques
- Interface responsive et moderne
- **Systeme Premium** avec previsions 14 jours
- **Alertes meteo personnalisees** (Premium)
- **Monetisation integree**

## Demo en ligne

**URL:** https://httttgf.github.io/weather-app/

## Fonctionnalites

### Version Gratuite
- Meteo actuelle (temperature, humidite, vent, visibilite)
- Previsions sur 5 jours
- Animations meteo (pluie, neige, soleil, etoiles)
- Recherche de ville
- Sauvegarde de la derniere ville

### Version Premium (4.99 EUR/mois)
- Tout de la version gratuite
- Previsions etendues sur 14 jours
- Alertes meteo personnalisees (pluie, temperature, vent, neige)
- Experience sans publicites

## Monetisation

### 1. Google AdSense

Un emplacement pour banniere publicitaire est integre en bas de page.

**Pour l'activer:**
1. Creez un compte [Google AdSense](https://www.google.com/adsense/)
2. Obtenez votre code d'annonce
3. Remplacez le placeholder dans `index.html` par votre code AdSense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-VOTRE_ID"
     crossorigin="anonymous"></script>
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-VOTRE_ID"
     data-ad-slot="VOTRE_SLOT_ID"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

### 2. Systeme Premium avec Stripe

Le systeme freemium est pre-configure avec un modal de comparaison des plans.

**Pour activer les paiements:**
1. Creez un compte [Stripe](https://stripe.com/)
2. Obtenez vos cles API (publique et secrete)
3. Implementez Stripe Checkout:

```javascript
// Frontend - Dans app.js
const stripe = Stripe('pk_test_VOTRE_CLE_PUBLIQUE');

async function upgradeToPremium() {
    const response = await fetch('/create-checkout-session', {
        method: 'POST'
    });
    const session = await response.json();
    await stripe.redirectToCheckout({ sessionId: session.id });
}

// Backend - Node.js/Express exemple
const stripe = require('stripe')('sk_test_VOTRE_CLE_SECRETE');

app.post('/create-checkout-session', async (req, res) => {
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price_data: {
                currency: 'eur',
                product_data: {
                    name: 'Meteo App Premium',
                },
                unit_amount: 499, // 4.99 EUR en centimes
                recurring: { interval: 'month' }
            },
            quantity: 1,
        }],
        mode: 'subscription',
        success_url: 'https://votre-site.com/success',
        cancel_url: 'https://votre-site.com/cancel',
    });
    res.json({ id: session.id });
});
```

### 3. Buy Me a Coffee

Un bouton de donation est integre dans le header.

**Pour l'activer:**
1. Creez un compte [Buy Me a Coffee](https://www.buymeacoffee.com/)
2. Remplacez `VOTRE_USERNAME` par votre nom d'utilisateur dans `index.html`

```html
<a href="https://www.buymeacoffee.com/VOTRE_USERNAME" target="_blank" class="bmc-button">
```

## Configuration API

L'application utilise l'API OpenWeatherMap. Au premier lancement, un modal demande la cle API.

**Pour obtenir une cle gratuite:**
1. Inscrivez-vous sur [OpenWeatherMap](https://openweathermap.org/api)
2. Recuperez votre cle API
3. Entrez-la dans l'application

## Test du mode Premium

Pour tester les fonctionnalites Premium sans integration Stripe:

```javascript
// Dans la console du navigateur
simulatePremium(true);  // Active le mode Premium
simulatePremium(false); // Desactive le mode Premium
```

## Technologies

- HTML5 / CSS3 (Flexbox, Grid, Variables CSS)
- JavaScript ES6+ (Classes, Async/Await, Fetch API)
- API OpenWeatherMap
- Google Fonts (Poppins)
- Design responsive (Mobile-first)

## Structure des fichiers

```
weather-app/
âââ index.html      # Structure HTML avec modals de monetisation
âââ style.css       # Styles incluant Premium UI et AdSense
âââ app.js          # Logique meteo et gestion Premium
âââ README.md       # Documentation
```

## Licence

MIT License - Libre d'utilisation et de modification.
