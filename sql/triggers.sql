CREATE OR REPLACE FUNCTION propagate_mob_structure_insertion() RETURNS trigger AS $$
BEGIN
    INSERT INTO biome_mob (biome_id, mob_id) 
    (
        SELECT biome_id, NEW.mob_id FROM biome_structure WHERE biome_structure.structure_id = NEW.structure_id
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER propagate_mob_structure_insertion
AFTER INSERT OR UPDATE ON structure_mob
FOR EACH ROW EXECUTE FUNCTION propagate_mob_structure_insertion();

-- Demo for propagate_mob_structure_insertion:
-- SELECT * FROM biome_mob WHERE mob_id = 37;
-- insert into structure_mob (structure_id, mob_id) values (27, 37);
-- SELECT * FROM biome_mob WHERE mob_id = 37;

CREATE OR REPLACE FUNCTION propagate_mob_biome_deletion() RETURNS trigger AS $$
BEGIN
    DELETE FROM structure_mob
    WHERE structure_mob.structure_id IN
    (
        SELECT structure_id FROM biome_structure WHERE biome_structure.biome_id = OLD.biome_id
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER propagate_mob_biome_deletion
AFTER DELETE ON biome_mob
FOR EACH ROW EXECUTE FUNCTION propagate_mob_biome_deletion();

-- Demo for propagate_mob_biome_deletion
-- SELECT * FROM structure_mob WHERE mob_id = 12;
-- DELETE FROM biome_mob WHERE mob_id = 12 AND biome_id = 22;
-- SELECT * FROM structure_mob WHERE mob_id = 12;

CREATE OR REPLACE FUNCTION check_recipe_ext_data() RETURNS trigger as $$
BEGIN
    IF NEW.craft_type = 'minecraft:crafting_shaped_3' OR
       NEW.craft_type = 'minecraft:crafting_shaped_2' OR
       NEW.craft_type = 'minecraft:smelting' OR
       NEW.craft_type = 'minecraft:blasting'
    THEN
        INSERT INTO recipe_extra_data (id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
    ELSE
        DELETE FROM recipe_extra_data WHERE id = NEW.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_recipe_ext_data
AFTER INSERT OR UPDATE ON recipe
FOR EACH ROW EXECUTE FUNCTION check_recipe_ext_data();

-- Demo for check_recipe_ext_data
-- SELECT * FROM recipe LEFT JOIN recipe_extra_data AS ext ON recipe.id = ext.id WHERE recipe.id = 0;
-- UPDATE recipe SET craft_type = 'smth' WHERE id = 0;
-- SELECT * FROM recipe LEFT JOIN recipe_extra_data AS ext ON recipe.id = ext.id WHERE recipe.id = 0;

CREATE OR REPLACE FUNCTION check_ingredients() RETURNS trigger AS $$
BEGIN
    IF NEW.craft_pattern IS NOT NULL
    THEN
        INSERT INTO ingredient (craft_id, ing_symbol, item_or_tag_flag, item_id) 
        (
            SELECT DISTINCT ON (symbol) NEW.id, symbol, true, 1 FROM regexp_split_to_table(NEW.craft_pattern, '') AS symbol 
            WHERE symbol != E'\n'
            AND symbol NOT IN (
                SELECT ing_symbol FROM ingredient WHERE craft_id = NEW.id
            )
        );
        DELETE FROM ingredient WHERE ing_symbol NOT IN 
        (
            SELECT DISTINCT symbol FROM regexp_split_to_table(NEW.craft_pattern, '') AS symbol WHERE symbol != E'\n'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_ingredients
AFTER INSERT OR UPDATE ON recipe_extra_data
FOR EACH ROW EXECUTE FUNCTION check_ingredients();

-- Demo for check_ingredients
-- SELECT * FROM recipe_extra_data JOIN ingredient ON recipe_extra_data.id = ingredient.craft_id WHERE recipe_extra_data.id = 0;
-- UPDATE recipe_extra_data SET craft_pattern = E'#\nABC' WHERE id = 0;
-- SELECT * FROM recipe_extra_data JOIN ingredient ON recipe_extra_data.id = ingredient.craft_id WHERE recipe_extra_data.id = 0;

CREATE OR REPLACE FUNCTION calculate_like_ratio() RETURNS trigger AS $$
BEGIN
    UPDATE recipe SET like_ratio = (
        SELECT count(CASE WHEN is_like = true THEN 1 END)::NUMERIC / NULLIF(count(*), 0)
        FROM user_recipe_like
        GROUP BY user_recipe_like.recipe_id
        HAVING user_recipe_like.recipe_id = recipe.id
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_like_ratio
AFTER INSERT OR UPDATE OR DELETE ON user_recipe_like
FOR EACH STATEMENT EXECUTE FUNCTION calculate_like_ratio();

-- Demo for calculate_like_ratio
-- SELECT * FROM recipe WHERE id = 0;
-- INSERT INTO user_recipe_like VALUES (1, 0, true, NOW()), (2, 0, false, NOW());
-- SELECT * FROM recipe WHERE id = 0;

CREATE OR REPLACE FUNCTION update_shaped_craft_type() RETURNS trigger AS $$
BEGIN
    IF NEW.craft_pattern IS NOT null
    THEN
        IF (SELECT COUNT(*) FROM regexp_split_to_table(NEW.craft_pattern, E'\n')) > 2
        OR (SELECT SUM(CASE WHEN char_length(lines) > 2 THEN 1 ELSE 0 END) FROM regexp_split_to_table(NEW.craft_pattern, E'\n') AS lines) > 0
        THEN
            UPDATE recipe SET craft_type = 'minecraft:crafting_shaped_3' WHERE recipe.id = NEW.id;
        ELSE
            UPDATE recipe SET craft_type = 'minecraft:crafting_shaped_2' WHERE recipe.id = NEW.id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shaped_craft_type
AFTER INSERT OR UPDATE on recipe_extra_data
FOR EACH ROW EXECUTE FUNCTION update_shaped_craft_type();

-- Demo for update_shaped_craft_tyoe
-- SELECT * FROM recipe JOIN recipe_extra_data ON recipe.id = recipe_extra_data.id WHERE recipe.id = 0;
-- UPDATE recipe_extra_data SET craft_pattern = 'A' WHERE id = 0;
-- SELECT * FROM recipe JOIN recipe_extra_data ON recipe.id = recipe_extra_data.id WHERE recipe.id = 0;
-- UPDATE recipe_extra_data SET craft_pattern = E'AAA\nBB' WHERE id = 0;
-- SELECT * FROM recipe JOIN recipe_extra_data ON recipe.id = recipe_extra_data.id WHERE recipe.id = 0;

CREATE OR REPLACE FUNCTION update_smelting_craft_type() RETURNS trigger AS $$
BEGIN
    IF NEW.smelt_time IS NOT null
    THEN
        UPDATE recipe SET craft_type = 'minecraft:smelting' WHERE recipe.id = NEW.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_smelting_craft_type
AFTER INSERT OR UPDATE ON recipe_extra_data
FOR EACH ROW EXECUTE FUNCTION update_smelting_craft_type();

-- Demo for update_smelting_craft_type
-- SELECT * FROM recipe JOIN recipe_extra_data ON recipe.id = recipe_extra_data.id WHERE recipe.id = 0;
-- UPDATE recipe_extra_data SET smelt_time = 200, craft_pattern = null WHERE id = 0;
-- SELECT * FROM recipe JOIN recipe_extra_data ON recipe.id = recipe_extra_data.id WHERE recipe.id = 0;
