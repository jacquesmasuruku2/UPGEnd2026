-- Données initiales services (alignées sur la migration Supabase d’origine).
-- Id fixes de démo : à remplacer si vous importez les vrais UUID depuis Postgres.
-- INSERT OR IGNORE : safe si relancé (unicité sur slug).

INSERT OR IGNORE INTO services (id, name, slug, description, display_order, published, created_at, updated_at)
VALUES
  ('10000000-0001-4000-8000-000000000001', 'Enseignement et Formation de cadres', 'enseignement-formation',
   'Formation académique et professionnelle de haut niveau.', 1, 1, datetime('now'), datetime('now')),
  ('10000000-0001-4000-8000-000000000002', 'Recherche académique & Innovation', 'recherche-innovation',
   'Recherche scientifique et innovation technologique.', 2, 1, datetime('now'), datetime('now')),
  ('10000000-0001-4000-8000-000000000003', 'Rectorat', 'rectorat',
   'Direction et administration de l''université.', 3, 1, datetime('now'), datetime('now')),
  ('10000000-0001-4000-8000-000000000004', 'SGAc', 'sgac',
   'Secrétariat Général Académique.', 4, 1, datetime('now'), datetime('now')),
  ('10000000-0001-4000-8000-000000000005', 'LABO INFO', 'labo-info',
   'Laboratoire informatique de l''université.', 5, 1, datetime('now'), datetime('now')),
  ('10000000-0001-4000-8000-000000000006', 'APPARITORAT', 'apparitorat',
   'Service de l''apparitorat.', 6, 1, datetime('now'), datetime('now'));
