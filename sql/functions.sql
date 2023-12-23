CREATE OR REPLACE FUNCTION most_liked_recipe_of_the_day(amount INTEGER) RETURNS TABLE (recipe_id INTEGER, today_like_ratio NUMERIC) AS $$
BEGIN
    RETURN QUERY SELECT 
        user_recipe_like.recipe_id AS recipe_id, 
        count(CASE WHEN is_like = true THEN 1 END)::NUMERIC / NULLIF(count(*), 0) AS today_like_ratio
        FROM user_recipe_like
        WHERE ts::date = now()::date
        GROUP BY user_recipe_like.recipe_id
        ORDER BY today_like_ratio DESC
        LIMIT amount;
END;
$$ LANGUAGE plpgsql;

-- Demo for most_liked_recipe_of_the_day
-- SELECT * FROM most_liked_recipe_of_the_day(2);
-- INSERT INTO user_recipe_like VALUES (1, 0, true, NOW()), (2, 0, false, NOW() - INTERVAL '1 day');
-- INSERT INTO user_recipe_like VALUES (1, 1, true, NOW()), (2, 1, false, NOW());
-- SELECT * FROM most_liked_recipe_of_the_day(2);
-- SELECT * FROM most_liked_recipe_of_the_day(1);

CREATE OR REPLACE FUNCTION delete_haters(hater_threshold INTEGER) RETURNS VOID AS $$
BEGIN
    DELETE FROM "user" WHERE
    (
        SELECT SUM(CASE WHEN is_like = true THEN 1 ELSE 0 END) 
        FROM user_recipe_like
        WHERE user_recipe_like.user_id = "user".id
    ) = 0
    AND 
    (
        SELECT SUM(CASE WHEN is_like = false THEN 1 ELSE 0 END) 
        FROM user_recipe_like
        WHERE user_recipe_like.user_id = "user".id
    ) >= hater_threshold;
END;
$$ LANGUAGE plpgsql;

-- Demo for delete_haters
-- SELECT * FROM "user";
-- INSERT INTO user_recipe_like VALUES (1, 1, true, NOW()), (2, 1, false, NOW());
-- SELECT delete_haters(1);
-- SELECT * FROM "user";

CREATE OR REPLACE FUNCTION get_all_ingredients_of_recipe(recipe_id INTEGER) RETURNS INTEGER[] AS $$
DECLARE
    result INTEGER[];
BEGIN
    SELECT array_agg(ings2.item_id) as recipe_ingredients
        FROM 
        (
            SELECT ings.craft_id, ings.item_id FROM
            (
                SELECT craft_id, item_id FROM ingredient WHERE tag_id IS null
                UNION
                SELECT craft_id, item_tag.item_id as item_id 
                FROM ingredient
                JOIN item_tag ON ingredient.tag_id = item_tag.tag_id
                WHERE ingredient.item_id IS null
            ) AS ings WHERE ings.craft_id = recipe_id
        ) AS ings2 
        INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Demo of get_all_ingredients_of_recipe
-- SELECT get_all_ingredients_of_recipe(6);

CREATE OR REPLACE FUNCTION find_recipes_by_ingredients(ingredients INTEGER[]) RETURNS TABLE (recipe_id INTEGER) AS $$
BEGIN
    RETURN QUERY SELECT recipe.id
    FROM recipe
    WHERE get_all_ingredients_of_recipe(recipe.id) @> ingredients;
END;
$$ LANGUAGE plpgsql;

-- Demo of find_recipes_by_ingredients
-- SELECT find_recipes_by_ingredients(ARRAY[28, 14]);

CREATE OR REPLACE FUNCTION find_next_recipes(current_recipe INTEGER) RETURNS TABLE (recipe_id INTEGER) AS $$
BEGIN
    RETURN QUERY SELECT recipe.id
    FROM recipe
    WHERE get_all_ingredients_of_recipe(recipe.id) @> (
        SELECT array_agg(result_item)
        FROM recipe
        WHERE recipe.id = current_recipe
    );
END;
$$ LANGUAGE plpgsql;

-- Demo of find_next_recipes
-- SELECT find_next_recipes(6);

CREATE OR REPLACE FUNCTION find_structure_loot(target_structure_id INTEGER) RETURNS INTEGER[] AS $$
DECLARE
    result INTEGER[];
BEGIN
    SELECT array_agg(item_id) as loot_id
        FROM chest_drop_table
        WHERE chest_drop_table.structure_id = target_structure_id
        INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Demo of find_structure_loot
-- SELECT name FROM item WHERE id = ANY(find_structure_loot(1));
-- will show loot from mansion

CREATE OR REPLACE FUNCTION find_mob_loot(target_mob_id INTEGER) RETURNS INTEGER[] AS $$
DECLARE
    result INTEGER[];
BEGIN
    SELECT array_agg(item_id) as loot_id
        FROM mob_drop_table
        WHERE mob_drop_table.mob_id = target_mob_id
        INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Demo of find_mob_loot
-- SELECT name FROM item WHERE id = ANY(find_mob_loot(2));
-- will show loot from pig