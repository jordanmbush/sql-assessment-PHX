SELECT V.id, V.make, V.model, V.year, U.name FROM vehicles V
JOIN users U ON U.id = V.owner_id
WHERE V.year > 2000
ORDER BY V.year DESC;