/**
 * API locale : enregistre les inscriptions admission dans PostgreSQL (DATABASE_URL).
 * Les fichiers sont stockés sous uploads/admissions/ et servis sous /admission-files/…
 */
import "dotenv/config";
import cors from "cors";
import express from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import pg from "pg";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_ROOT = path.join(__dirname, "..", "uploads", "admissions");
fs.mkdirSync(UPLOAD_ROOT, { recursive: true });

const PROMOTIONS = new Set(["L1", "L2", "L3", "M1", "M2"]);
const SEXES = new Set(["M", "F"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_ROOT),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".bin";
    const base = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    cb(null, `${base}-${file.fieldname}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use("/admission-files", express.static(UPLOAD_ROOT));

const uploadFields = upload.fields([
  { name: "photo", maxCount: 1 },
  { name: "diplome", maxCount: 1 },
  { name: "bulletin", maxCount: 1 },
  { name: "attestation", maxCount: 1 },
]);

function publicFileUrl(filename) {
  return `/admission-files/${filename}`;
}

function collectUploadedPaths(files) {
  const paths = [];
  if (!files) return paths;
  for (const key of Object.keys(files)) {
    for (const f of files[key]) {
      if (f?.path) paths.push(f.path);
    }
  }
  return paths;
}

app.post("/api/admissions", uploadFields, async (req, res) => {
  const uploadedPaths = collectUploadedPaths(req.files);

  const cleanup = () => {
    for (const p of uploadedPaths) {
      fs.unlink(p, () => {});
    }
  };

  try {
    const b = req.body;
    const str = (k) => (typeof b[k] === "string" ? b[k].trim() : "");

    const nom = str("nom");
    const postnom = str("postnom");
    const prenom = str("prenom");
    const sexe = str("sexe");
    const date_naissance = str("date_naissance");
    const lieu_naissance = str("lieu_naissance");
    const nationaliteRaw = str("nationalite");
    const telephone = str("telephone");
    const email = str("email");
    const adresse = str("adresse");
    const domaine = str("domaine");
    const filiere = str("filiere");
    const promotion = str("promotion");
    let annee_academique = str("annee_academique");
    if (!annee_academique) annee_academique = "2025-2026";

    if (
      !nom ||
      !postnom ||
      !prenom ||
      !sexe ||
      !date_naissance ||
      !lieu_naissance ||
      !telephone ||
      !email ||
      !adresse
    ) {
      cleanup();
      return res.status(400).json({ error: "Champs identité incomplets." });
    }
    if (!domaine || !filiere || !promotion) {
      cleanup();
      return res.status(400).json({ error: "Champs parcours incomplets." });
    }
    if (!SEXES.has(sexe)) {
      cleanup();
      return res.status(400).json({ error: "Sexe invalide." });
    }
    if (!PROMOTIONS.has(promotion)) {
      cleanup();
      return res.status(400).json({ error: "Promotion invalide." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      cleanup();
      return res.status(400).json({ error: "Email invalide." });
    }

    const files = req.files || {};
    const photo = files.photo?.[0];
    const diplome = files.diplome?.[0];
    const bulletin = files.bulletin?.[0];
    const attestation = files.attestation?.[0];

    const photo_url = photo ? publicFileUrl(photo.filename) : null;
    const diplome_url = diplome ? publicFileUrl(diplome.filename) : null;
    const bulletin_url = bulletin ? publicFileUrl(bulletin.filename) : null;
    const attestation_url = attestation ? publicFileUrl(attestation.filename) : null;

    const nationalite = nationaliteRaw || null;

    const databaseUrl = process.env.DATABASE_URL?.trim();
    if (!databaseUrl) {
      cleanup();
      return res.status(503).json({ error: "DATABASE_URL non configurée sur le serveur." });
    }

    const client = new pg.Client({ connectionString: databaseUrl });
    await client.connect();
    try {
      await client.query(
        `INSERT INTO public.students (
          nom, postnom, prenom, sexe, date_naissance, lieu_naissance, nationalite,
          telephone, email, adresse, domaine, filiere, promotion, annee_academique,
          status, photo_url, diplome_url, bulletin_url, attestation_url
        ) VALUES (
          $1, $2, $3, $4, $5::date, $6, $7, $8, $9, $10, $11, $12, $13, $14,
          $15, $16, $17, $18, $19
        )`,
        [
          nom,
          postnom,
          prenom,
          sexe,
          date_naissance,
          lieu_naissance,
          nationalite,
          telephone,
          email,
          adresse,
          domaine,
          filiere,
          promotion,
          annee_academique,
          "pending",
          photo_url,
          diplome_url,
          bulletin_url,
          attestation_url,
        ],
      );
    } finally {
      await client.end();
    }

    res.json({ ok: true });
  } catch (e) {
    cleanup();
    const message = e instanceof Error ? e.message : "Erreur serveur.";
    console.error("[admission-api]", e);
    res.status(500).json({ error: message });
  }
});

app.use((err, _req, res, _next) => {
  if (err && err.name === "MulterError") {
    return res.status(400).json({ error: err.message || "Fichier refusé." });
  }
  console.error(err);
  res.status(500).json({ error: err instanceof Error ? err.message : "Erreur serveur." });
});

const port = Number(process.env.ADMISSION_API_PORT || 8787);
app.listen(port, "127.0.0.1", () => {
  console.log(`[admission-api] http://127.0.0.1:${port} — PostgreSQL via DATABASE_URL`);
});
