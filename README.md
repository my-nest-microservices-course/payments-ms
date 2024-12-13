# Dev

Keep hookdeck open in terminal using the next commands:

```bash
npx hookdeck login
npx hookdeck listen 3003 stripe-to-localhost
```

After that, send a post to `/payments/create-payment-session` and test.

# Prod

Change the url in stripe webhook.
