-- =====================================================================
--  Le Spot · données de démarrage
-- =====================================================================

-- --- 5 terrains variés (les deux types, les deux formats) -----------
insert into courts (name, type, format, description, is_active) values
  ('Court Central',   'indoor',  'double', 'Terrain couvert principal, éclairage LED.',        true),
  ('Le Patio',        'outdoor', 'double', 'Terrain extérieur, exposé sud.',                   true),
  ('La Cage',         'indoor',  'simple', 'Petit terrain couvert pour le 1 contre 1.',        true),
  ('La Terrasse',     'outdoor', 'simple', 'Terrain extérieur simple, vue sur le parc.',       true),
  ('Le Hangar',       'indoor',  'double', 'Grand terrain couvert, sol récent.',               true);

-- --- réservations de démo -------------------------------------------
-- Les réservations référencent auth.users(id) : il faut donc d'abord créer
-- les comptes de démo (voir README → "Comptes de démo"). Une fois les comptes
-- créés, on insère quelques réservations pour que le planning ne soit pas vide.
--
-- Exemple (à adapter avec le vrai user_id du compte client de démo) :
--
--   insert into bookings (court_id, user_id, date, start_hour, status) values
--     (1, '<UUID_CLIENT_DEMO>', current_date, 10, 'confirmee'),
--     (1, '<UUID_CLIENT_DEMO>', current_date, 18, 'confirmee'),
--     (2, '<UUID_CLIENT_DEMO>', current_date, 14, 'confirmee');
