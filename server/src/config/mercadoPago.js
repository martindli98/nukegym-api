import { MercadoPagoConfig, Preference } from "mercadopago";

export const mpClient = new MercadoPagoConfig({
  accessToken: "APP_USR-4051625577236202-101110-989e52df38103b849bf12694323815a0-2919257343",
});

export const mpPreference = new Preference(mpClient);
