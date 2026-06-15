CREATE UNIQUE INDEX bookings_no_overlap
  ON bookings (court_id, date, start_hour)
  WHERE status = 'confirmee';
