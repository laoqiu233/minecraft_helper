DROP TRIGGER IF EXISTS propagate_mob_structure_insertion ON structure_mob;
DROP FUNCTION IF EXISTS propagate_mob_structure_insertion;

DROP TRIGGER IF EXISTS propagate_mob_biome_deletion ON biome_mob;
DROP FUNCTION IF EXISTS propagate_mob_biome_deletion;

DROP TRIGGER IF EXISTS check_recipe_ext_data ON recipe;
DROP FUNCTION IF EXISTS check_recipe_ext_data;

DROP TRIGGER IF EXISTS check_ingredients ON recipe_extra_data;
DROP FUNCTION IF EXISTS check_ingredients;

DROP TRIGGER IF EXISTS calculate_like_ratio ON user_recipe_like;
DROP FUNCTION IF EXISTS calculate_like_ratio;

DROP TRIGGER IF EXISTS update_shaped_craft_type ON recipe_extra_data;
DROP FUNCTION IF EXISTS update_shaped_craft_type;

DROP TRIGGER IF EXISTS update_smelting_craft_type ON recipe_extra_data;
DROP FUNCTION IF EXISTS update_smelting_craft_type;

DROP TABLE IF EXISTS user_recipe_like;
DROP TABLE IF EXISTS "user";

DROP TABLE IF EXISTS chest_drop_table;
DROP TABLE IF EXISTS mob_drop_table;
DROP TABLE IF EXISTS fishing_drop_table;
DROP TABLE IF EXISTS biome_drop_table;
DROP TABLE IF EXISTS gift_drop_table;

DROP TABLE IF EXISTS item_tag;
DROP TABLE IF EXISTS ingredient;
DROP TABLE IF EXISTS recipe_extra_data;
DROP TABLE IF EXISTS recipe;
DROP TABLE IF EXISTS item;
DROP TABLE IF EXISTS tag;


DROP TABLE IF EXISTS structure_mob;
DROP TABLE IF EXISTS biome_mob;
DROP TABLE IF EXISTS mob;
DROP TABLE IF EXISTS biome_structure;
DROP TABLE IF EXISTS structure;
DROP TABLE IF EXISTS biome;
DROP TABLE IF EXISTS dimension;
