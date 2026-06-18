import { loadLocalEnv } from "./_env.mjs";

loadLocalEnv();

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
  if (!match) throw new Error("L'image doit etre un fichier PNG, JPG ou WebP.");
  const extension = match[1] === "image/png" ? "png" : match[1] === "image/webp" ? "webp" : "jpg";
  return { extension, base64: match[2] };
}

function githubConfig() {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;
  const branch = process.env.GITHUB_BRANCH || "main";

  if (!owner || !repo || !token) {
    throw new Error("GitHub n'est pas configure. Variables requises: GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN.");
  }

  return { owner, repo, token, branch };
}

async function githubApi(endpoint, options = {}) {
  const { owner, repo, token } = githubConfig();
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/${endpoint}`, {
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

async function getGithubFile(path) {
  const { branch } = githubConfig();
  return githubApi(`contents/${path}?ref=${encodeURIComponent(branch)}`);
}

async function createBlob(content, encoding = "utf-8") {
  return githubApi("git/blobs", {
    method: "POST",
    body: JSON.stringify({ content, encoding })
  });
}

async function commitVehicleChanges({ imagePath, imageBase64, vehiclesJson, message }) {
  const { branch } = githubConfig();
  const ref = await githubApi(`git/ref/heads/${encodeURIComponent(branch)}`);
  const parentSha = ref.object.sha;
  const parentCommit = await githubApi(`git/commits/${parentSha}`);
  const imageBlob = await createBlob(imageBase64, "base64");
  const vehiclesBlob = await createBlob(vehiclesJson);

  const tree = await githubApi("git/trees", {
    method: "POST",
    body: JSON.stringify({
      base_tree: parentCommit.tree.sha,
      tree: [
        {
          path: imagePath,
          mode: "100644",
          type: "blob",
          sha: imageBlob.sha
        },
        {
          path: "src/data/vehicles.json",
          mode: "100644",
          type: "blob",
          sha: vehiclesBlob.sha
        }
      ]
    })
  });

  const commit = await githubApi("git/commits", {
    method: "POST",
    body: JSON.stringify({
      message,
      tree: tree.sha,
      parents: [parentSha]
    })
  });

  await githubApi(`git/refs/heads/${encodeURIComponent(branch)}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha })
  });
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Methode non permise." });
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

    const file = await getGithubFile("src/data/vehicles.json");
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

    await commitVehicleChanges({
      imagePath,
      imageBase64: base64,
      vehiclesJson: `${JSON.stringify(vehicles, null, 2)}\n`,
      message: `Add vehicle ${data.dossier}`
    });

    return json(200, { ok: true, slug });
  } catch (error) {
    return json(500, {
      error: error instanceof Error ? error.message : "Impossible d'ajouter le vehicule."
    });
  }
}
