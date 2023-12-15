CREATE INDEX user_recipe_like_user_id_index ON user_recipe_like USING hash(user_id);
CREATE INDEX chest_drop_table_structure_id_index ON chest_drop_table USING hash(structure_id);
CREATE INDEX chest_drop_table_item_id_index ON chest_drop_table USING hash(item_id);
CREATE INDEX mob_drop_table_mob_id_index ON mob_drop_table USING hash(mob_id);
CREATE INDEX mob_drop_table_item_id_index ON mob_drop_table USING hash(item_id);
CREATE INDEX ingredient_item_id_index ON ingredient USING hash(item_id);
CREATE INDEX ingredient_tag_id_index ON ingredient USING hash(tag_id);

CREATE INDEX recipe_like_ratio_index ON recipe USING btree(like_ratio);
