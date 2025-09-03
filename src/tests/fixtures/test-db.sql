-- Sample test data for database fixtures

INSERT INTO files (path, name, size, mime_type, created_at, modified_at, hash_xxh3, hash_blake3, metadata) 
VALUES 
('/test/image.png', 'image.png', 1024, 'image/png', 1630000000, 1630000000, 'abc123', 'hash123', '{"width": 100, "height": 100}'),
('/test/doc.pdf', 'doc.pdf', 2048, 'application/pdf', 1630000000, 1630000000, 'def456', 'hash456', '{}'),
('/test/code.ts', 'code.ts', 512, 'text/typescript', 1630000000, 1630000000, 'ghi789', 'hash789', '{}');

INSERT INTO scan_history (directory, started_at, completed_at, files_scanned, status)
VALUES
('/test/fixtures', 1630000000, 1630000100, 3, 'completed'),
('/test/sample', 1630001000, 1630001200, 5, 'completed');