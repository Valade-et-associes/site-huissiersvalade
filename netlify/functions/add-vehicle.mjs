function json(status, body) {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body)
  };
}

function slugify(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function decodeDataUrl(dataUrl) {
  const match = /^data:(image\/(?:png|jpeg|webp));base64,(.+)$/.exec(dataUrl || "");
  if (!match) throw new Error("L'image doit être un fichier PNG, JPG ou WebP.");
  const extension = match[1] === "image/png" ? "png" : match[1] === "image/webp" ? "webp" : "jpg";
  return { extension, base64: match[2] };
}

async function github(path, options = {}) {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;
  const branch = process.env.GITHUB_BRANCH || "main";

  if (!owner || !repo || !token) {
    throw new Error("GitHub n'est pas configuré. Variables requises: GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN.");
  }

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Erreur GitHub ${response.status}: ${text}`);
  }

  return response.json();
}

async function putGithubFile(path, message, content, sha) {
  const branch = process.env.GITHUB_BRANCH || "main";
  return github(path, {
    method: "PUT",
    body: JSON.stringify({
      message,
      content,
      branch,
      ...(sha ? { sha } : {})
    })
  });
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Méthode non permise." });
  }

  try {
    const data = JSON.parse(event.body || "{}");
    if (!process.env.VEHICLE_ADMIN_PASSWORD || data.password !== process.env.VEHICLE_ADMIN_PASSWORD) {
      return json(401, { error: "Mot de passe invalide." });
    }

    const required = ["brand", "model", "year", "vin", "dossier", "keyStatus", "offerDeadline", "bailiffEmail", "imageData"];
    for (const field of required) {
      if (!data[field]) return json(400, { error: `Champ manquant: ${field}` });
    }

    const baseSlug = slugify(`${data.brand}-${data.model}-${data.year}-${data.dossier}`);
    const { extension, base64 } = decodeDataUrl(data.imageData);
    const imagePath = `public/wp-content/uploads/vehicles/${baseSlug}.${extension}`;
    const imageUrl = `/wp-content/uploads/vehicles/${baseSlug}.${extension}`;

    await putGithubFile(
      imagePath,
      `Add vehicle image ${data.dossier}`,
      base64
    );

    const file = await github("src/data/vehicles.json");
    const vehicles = JSON.parse(Buffer.from(file.content, "base64").toString("utf8"));
    const existingSlugs = new Set(vehicles.map((vehicle) => vehicle.slug));
    let slug = baseSlug;
    let suffix = 2;
    while (existingSlugs.has(slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    const title = `${String(data.brand).toUpperCase()} ${String(data.model).toUpperCase()} ${data.year} (${data.dossier})`;
    vehicles.unshift({
      title,
      slug,
      brand: String(data.brand).toUpperCase(),
      model: String(data.model).toUpperCase(),
      year: String(data.year),
      vin: String(data.vin).toUpperCase(),
      dossier: String(data.dossier),
      keyStatus: String(data.keyStatus).toUpperCase(),
      offerDeadline: String(data.offerDeadline),
      bailiffEmail: String(data.bailiffEmail).toLowerCase(),
      image: imageUrl
    });

    const updated = Buffer.from(`${JSON.stringify(vehicles, null, 2)}\n`, "utf8").toString("base64");
    await putGithubFile(
      "src/data/vehicles.json",
      `Add vehicle ${data.dossier}`,
      updated,
      file.sha
    );

    return json(200, { ok: true, slug });
  } catch (error) {
    return json(500, {
      error: error instanceof Error ? error.message : "Impossible d'ajouter le véhicule."
    });
  }
}
