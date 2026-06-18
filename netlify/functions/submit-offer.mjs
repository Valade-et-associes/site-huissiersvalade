import vehicles from "../../src/data/vehicles.json";
import { loadLocalEnv } from "./_env.mjs";
import { sendGraphMail } from "./_graph-mail.mjs";

loadLocalEnv();

function json(status, body) {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body)
  };
}

function parseBody(event) {
  const contentType = event.headers["content-type"] || event.headers["Content-Type"] || "";
  if (contentType.includes("application/json")) {
    return JSON.parse(event.body || "{}");
  }
  const params = new URLSearchParams(event.body || "");
  return Object.fromEntries(params.entries());
}

function formatVehicleTitle(vehicle) {
  if (vehicle.title) return vehicle.title;
  const dossier = vehicle.dossier ? ` (${vehicle.dossier})` : "";
  return `${vehicle.brand} ${vehicle.model} ${vehicle.year}${dossier}`.trim();
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Méthode non permise." });
  }

  try {
    const data = parseBody(event);
    if (data["bot-field"]) return json(200, { ok: true });

    const vehicle = vehicles.find((item) => item.slug === data.vehicleSlug);
    if (!vehicle) return json(400, { error: "Véhicule invalide." });

    const requiredFields = ["firstName", "lastName", "email", "phone", "address", "city", "province", "postalCode", "country", "amount"];
    if (requiredFields.some((field) => !data[field])) {
      return json(400, { error: "Veuillez remplir tous les champs obligatoires." });
    }

    const to = vehicle.bailiffEmail || process.env.OFFER_FALLBACK_EMAIL || "info@valade.net";
    const vehicleTitle = formatVehicleTitle(vehicle);
    const subject = `Offre véhicule - ${vehicleTitle}`;
    const text = [
      "Une nouvelle offre a été soumise depuis le site huissiersvalade.com.",
      "",
      `Véhicule: ${vehicleTitle}`,
      `Dossier: ${vehicle.dossier || "Non indiqué"}`,
      `Montant offert: ${data.amount} $`,
      "",
      "Acheteur potentiel",
      `Prénom: ${data.firstName}`,
      `Nom: ${data.lastName}`,
      `Entreprise: ${data.company || "Non indiquée"}`,
      `Courriel: ${data.email}`,
      `Téléphone: ${data.phone}`,
      "",
      "Adresse",
      `${data.address}`,
      `${data.city}, ${data.province} ${data.postalCode}`,
      `${data.country}`,
      "",
      "Informations internes du véhicule",
      `Marque: ${vehicle.brand || ""}`,
      `Modèle: ${vehicle.model || ""}`,
      `Année: ${vehicle.year || ""}`,
      `NIV: ${vehicle.vin || ""}`,
      `Clef: ${vehicle.keyStatus || ""}`,
      `Date limite: ${vehicle.offerDeadline || ""}`
    ].join("\n");

    await sendGraphMail({ to, replyTo: data.email, subject, text });

    return {
      statusCode: 303,
      headers: { Location: "/vente-de-vehicules-operation-sabot-de-denver/merci/" },
      body: ""
    };
  } catch (error) {
    return json(500, {
      error: error instanceof Error ? error.message : "Impossible d'envoyer l'offre."
    });
  }
}
