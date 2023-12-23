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
```
## function
```sql
SELECT array_agg(recipe.result_item)
FROM ingredient
JOIN recipe ON recipe.id = ingredient.craft_id
WHERE ingredient.item_id = 6;
```
## explain result with index on item id
```
                              QUERY PLAN
-----------------------------------------------------------------------------------------------------------------------------------
Aggregate  (cost=50.55..50.56 rows=1 width=32)
   ->  Hash Join  (cost=12.68..50.52 rows=10 width=4)
         Hash Cond: (recipe.id = ingredient.craft_id)
         ->  Seq Scan on recipe  (cost=0.00..23.44 rows=1144 width=8)
         ->  Hash  (cost=12.56..12.56 rows=10 width=4)
               ->  Bitmap Heap Scan on ingredient  (cost=4.08..12.56 rows=10 width=4)
                     Recheck Cond: (item_id = 6)
                     ->  Bitmap Index Scan on ingredient_item_id_index  (cost=0.00..4.08 rows=10 width=0)
                           Index Cond: (item_id = 6)
```

# EXPLAIN index on `recipe`
```sql
CREATE INDEX recipe_like_ratio_index ON recipe USING btree(like_ratio);
```
## function
`find_top_recipes(10)`
```sql
select * from recipe 
      order by like_ratio DESC limit 10;
```
## explain result
```
                                                QUERY PLAN
----------------------------------------------------------------------------------------------------------
 Limit  (cost=0.28..1.09 rows=10 width=63)
   ->  Index Scan Backward using recipe_like_ratio_index on recipe  (cost=0.28..93.44 rows=1144 width=63)
```
