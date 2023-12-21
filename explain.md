# EXPLAIN index on `user_recipe_like`
```sql
CREATE INDEX user_recipe_like_user_id_index ON user_recipe_like USING hash(user_id);
```
## function
`delete_haters(10);`
```sql
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
    ) >= 10;
```
## explain result
```
                                                   QUERY PLAN
-----------------------------------------------------------------------------------------------------------------
 Delete on "user"  (cost=0.00..24919.06 rows=0 width=0)
   ->  Seq Scan on "user"  (cost=0.00..24919.06 rows=1 width=6)
         Filter: (((SubPlan 2) >= 10) AND ((SubPlan 1) = 0))
         SubPlan 2
           ->  Aggregate  (cost=14.63..14.64 rows=1 width=8)
                 ->  Bitmap Heap Scan on user_recipe_like user_recipe_like_1  (cost=4.07..14.61 rows=9 width=1)
                       Recheck Cond: (user_id = "user".id)
                       ->  Bitmap Index Scan on user_recipe_like_user_id_index  (cost=0.00..4.07 rows=9 width=0)
                             Index Cond: (user_id = "user".id)
         SubPlan 1
           ->  Aggregate  (cost=14.63..14.64 rows=1 width=8)
                 ->  Bitmap Heap Scan on user_recipe_like  (cost=4.07..14.61 rows=9 width=1)
                       Recheck Cond: (user_id = "user".id)
                       ->  Bitmap Index Scan on user_recipe_like_user_id_index  (cost=0.00..4.07 rows=9 width=0)
                             Index Cond: (user_id = "user".id)
```


# EXPLAIN index on `chest_drop_table`
```sql
CREATE INDEX chest_drop_table_structure_id_index ON chest_drop_table USING hash(structure_id);
```
## function
`find_structure_loot(10)`
```sql
SELECT array_agg(item_id) as loot_id
        FROM chest_drop_table
        WHERE chest_drop_table.structure_id = 10;
```
## explain result
```
                                               QUERY PLAN
---------------------------------------------------------------------------------------------------------
 Aggregate  (cost=19.36..19.37 rows=1 width=32)
   ->  Bitmap Heap Scan on chest_drop_table  (cost=4.09..19.33 rows=12 width=4)
         Recheck Cond: (structure_id = 10)
         ->  Bitmap Index Scan on chest_drop_table_structure_id_index  (cost=0.00..4.09 rows=12 width=0)
               Index Cond: (structure_id = 10)
```


# EXPLAIN index on `chest_drop_table`
```sql
CREATE INDEX chest_drop_table_item_id_index ON chest_drop_table USING hash(item_id);
```
## function
`find_structures_with_loot(10)`
```sql
SELECT structure_id
        FROM chest_drop_table
        WHERE chest_drop_table.item_id = 10;
```
## explain result
```
                                         QUERY PLAN
---------------------------------------------------------------------------------------------
 Bitmap Heap Scan on chest_drop_table  (cost=4.02..9.85 rows=2 width=4)
   Recheck Cond: (item_id = 10)
   ->  Bitmap Index Scan on chest_drop_table_item_id_index  (cost=0.00..4.01 rows=2 width=0)
         Index Cond: (item_id = 10)
```


# EXPLAIN index on `mob_drop_table`
```sql
CREATE INDEX mob_drop_table_mob_id_index ON mob_drop_table USING hash(mob_id);
```
## function
`find_structure_with_loot(20)`
```sql
SELECT array_agg(item_id) as loot_id
      FROM mob_drop_table
      WHERE mob_drop_table.mob_id = 20;
```
## explain result
```
                                           QUERY PLAN
------------------------------------------------------------------------------------------------
 Aggregate  (cost=7.81..7.82 rows=1 width=32)
   ->  Bitmap Heap Scan on mob_drop_table  (cost=4.02..7.80 rows=2 width=4)
         Recheck Cond: (mob_id = 20)
         ->  Bitmap Index Scan on mob_drop_table_mob_id_index  (cost=0.00..4.01 rows=2 width=0)
               Index Cond: (mob_id = 20)
```

# EXPLAIN index on `mob_drop_table`
```sql
CREATE INDEX mob_drop_table_item_id_index ON mob_drop_table USING hash(item_id);
```
## function
`find_mob_with_loot(8)`
```sql
SELECT mob_id
      FROM mob_drop_table
      WHERE mob_drop_table.item_id = 8;
```
## explain result
```
                                            QUERY PLAN
---------------------------------------------------------------------------------------------------
 Index Scan using mob_drop_table_item_id_index on mob_drop_table  (cost=0.00..8.02 rows=1 width=4)
   Index Cond: (item_id = 8)
```

# EXPLAIN index on `ingredient`
```sql
CREATE INDEX ingredient_item_id_index ON ingredient USING hash(item_id);
CREATE INDEX ingredient_tag_id_index ON ingredient USING hash(tag_id);
```
## function
`get_all_ingredients_of_recipe(13)`
```sql
SELECT array_agg(item_id) as recipe_ingredients
   FROM 
   (
       SELECT craft_id, item_id FROM
       (
           SELECT craft_id, item_id FROM ingredient WHERE tag_id IS null
           UNION
           SELECT craft_id, item_tag.item_id as item_id 
           FROM ingredient
           JOIN item_tag ON ingredient.tag_id = item_tag.tag_id
           WHERE ingredient.item_id IS null
       )
       WHERE craft_id = 13
   );
```
## explain result without index on tag_id
```
                              QUERY PLAN
-----------------------------------------------------------------------------------------------------------------------------------
 Aggregate  (cost=66.71..66.72 rows=1 width=32)
   ->  HashAggregate  (cost=66.44..66.56 rows=12 width=8)
         Group Key: ingredient.craft_id, ingredient.item_id
         ->  Append  (cost=4.33..66.38 rows=12 width=8)
               ->  Bitmap Heap Scan on ingredient  (cost=4.33..12.56 rows=1 width=8)
                     Recheck Cond: (craft_id = 13)
                     Filter: (tag_id IS NULL)
                     ->  Bitmap Index Scan on ingredient_pkey  (cost=0.00..4.33 rows=7 width=0)
                           Index Cond: (craft_id = 13)
               ->  Hash Join  (cost=12.57..53.76 rows=11 width=8)
                     Hash Cond: (item_tag.tag_id = ingredient_1.tag_id)
                     ->  Seq Scan on item_tag  (cost=0.00..32.60 rows=2260 width=8)
                     ->  Hash  (cost=12.56..12.56 rows=1 width=8)
                           ->  Bitmap Heap Scan on ingredient ingredient_1  (cost=4.33..12.56 rows=1 width=8)
                                 Recheck Cond: (craft_id = 13)
                                 Filter: (item_id IS NULL)
                                 ->  Bitmap Index Scan on ingredient_pkey  (cost=0.00..4.33 rows=7 width=0)
                                       Index Cond: (craft_id = 13)
```
## explain result with index on tag_id
```
                              QUERY PLAN
-----------------------------------------------------------------------------------------------------------------------------------
 Aggregate  (cost=31.98..31.99 rows=1 width=32)
   ->  Unique  (cost=31.94..31.95 rows=2 width=8)
         ->  Sort  (cost=31.94..31.94 rows=2 width=8)
               Sort Key: ingredient.craft_id, ingredient.item_id
               ->  Append  (cost=0.28..31.93 rows=2 width=8)
                     ->  Index Scan using ingredient_pkey on ingredient  (cost=0.28..8.29 rows=1 width=8)
                           Index Cond: (craft_id = 13)
                           Filter: (tag_id IS NULL)
                     ->  Hash Join  (cost=8.31..23.62 rows=1 width=8)
                           Hash Cond: (item_tag.tag_id = ingredient_1.tag_id)
                           ->  Seq Scan on item_tag  (cost=0.00..12.22 rows=822 width=8)
                           ->  Hash  (cost=8.29..8.29 rows=1 width=8)
                                 ->  Index Scan using ingredient_pkey on ingredient ingredient_1  (cost=0.28..8.29 rows=1 width=8)
                                       Index Cond: (craft_id = 13)
                                       Filter: (item_id IS NULL)
```

# EXPLAIN index on `recipe`
```sql
CREATE INDEX recipe_like_ratio_index ON recipe USING btree(like_ratio);
```
## function
`find_top_recipes(10)`
```sql
select * from recipe 
      order by like_ratio DESC limit 10x``;
```
## explain result
```
                                                QUERY PLAN
----------------------------------------------------------------------------------------------------------
 Limit  (cost=0.28..1.09 rows=10 width=63)
   ->  Index Scan Backward using recipe_like_ratio_index on recipe  (cost=0.28..93.44 rows=1144 width=63)
```
