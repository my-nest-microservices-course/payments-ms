# Dev

Keep hookdeck open in terminal using the next commands:

```bash
# if not installed hookdeck-cli in your machine:
npm install hookdeck-cli -g
npx hookdeck login
npx hookdeck listen 3003 stripe-to-localhost
```

After that, send a post to `/payments/create-payment-session` and test.

# Prod

Change the url in stripe webhook.
