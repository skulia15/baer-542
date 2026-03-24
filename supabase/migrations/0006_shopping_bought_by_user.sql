-- Add bought_by column to track which user (not household) bought an item
ALTER TABLE shopping_item
  ADD COLUMN bought_by uuid REFERENCES auth.users(id);
