SELECT V.id, V.make, V.model, V.year, V.owner_id FROM vehicles V
JOIN users U ON U.id = V.owner_id
WHERE U.email = $1;