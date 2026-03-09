CREATE TABLE shopping_item (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id uuid NOT NULL REFERENCES house(id) ON DELETE CASCADE,
  name text NOT NULL,
  reported_by_household_id uuid REFERENCES household(id),
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  bought_at timestamptz,
  bought_by_household_id uuid REFERENCES household(id)
);

ALTER TABLE shopping_item ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth users read shopping" ON shopping_item FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth users insert shopping" ON shopping_item FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth users update shopping" ON shopping_item FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth users delete shopping" ON shopping_item FOR DELETE TO authenticated USING (true);
