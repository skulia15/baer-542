UPDATE shopping_item_log sil
SET household_id = p.household_id
FROM profile p
WHERE sil.created_by = p.id
  AND sil.household_id IS NULL;
