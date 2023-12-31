-- Recipes and items

CREATE TABLE IF NOT EXISTS item (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    image VARCHAR NOT NULL
);

CREATE TABLE IF NOT EXISTS tag (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL
);

CREATE TABLE IF NOT EXISTS item_tag (
    item_id INTEGER REFERENCES item(id) NOT NULL,
    tag_id INTEGER REFERENCES tag(id) NOT NULL,
    PRIMARY KEY (item_id, tag_id)
);

CREATE TABLE IF NOT EXISTS recipe (
    id SERIAL PRIMARY KEY,
    result_item INTEGER REFERENCES item(id) NOT NULL,
    result_amount INTEGER NOT NULL,
    craft_type VARCHAR NOT NULL,
    craft_category VARCHAR,
    craft_group VARCHAR,
    like_ratio NUMERIC
);

CREATE TABLE IF NOT EXISTS ingredient (
    craft_id INTEGER REFERENCES recipe(id),
    ing_symbol CHAR NOT NULL,
    item_or_tag_flag BOOLEAN,
    item_id INTEGER REFERENCES item(id),
    tag_id INTEGER REFERENCES tag(id),
    PRIMARY KEY (craft_id, ing_symbol)
);

CREATE TABLE IF NOT EXISTS recipe_extra_data (
    id INTEGER REFERENCES recipe(id) PRIMARY KEY,
    craft_pattern VARCHAR,
    smelt_time INTEGER,
    CONSTRAINT not_shaped_and_smelting CHECK (NOT (craft_pattern IS NOT null AND smelt_time IS NOT NULL)),
    CONSTRAINT valid_extra_data CHECK (craft_pattern IS null OR smelt_time IS null)
);

-- World

CREATE TABLE IF NOT EXISTS dimension (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    image VARCHAR NOT NULL,
    description VARCHAR NOT NULL
);

CREATE TABLE IF NOT EXISTS biome (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    image VARCHAR NOT NULL,
    description VARCHAR NOT NULL,
    dimension_id INTEGER REFERENCES dimension(id) NOT NULL
);

CREATE TABLE IF NOT EXISTS mob (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    image VARCHAR NOT NULL,
    hp INTEGER NOT NULL,
    player_relation INTEGER NOT NULL -- 0 is friendly, 1 is neutral, 2 is aggressive
);

CREATE TABLE IF NOT EXISTS biome_mob (
    biome_id INTEGER REFERENCES biome(id),
    mob_id INTEGER REFERENCES mob(id),
    PRIMARY KEY (biome_id, mob_id)
);

CREATE TABLE IF NOT EXISTS structure (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    image VARCHAR NOT NULL,
    description VARCHAR NOT NULL
);

CREATE TABLE IF NOT EXISTS structure_mob (
    structure_id INTEGER REFERENCES structure(id),
    mob_id INTEGER REFERENCES mob(id),
    PRIMARY KEY (structure_id, mob_id)
);

CREATE TABLE IF NOT EXISTS biome_structure (
    biome_id INTEGER REFERENCES biome(id),
    structure_id INTEGER REFERENCES structure(id),
    PRIMARY KEY (biome_id, structure_id)
);

-- Drop tables 
CREATE TABLE IF NOT EXISTS chest_drop_table (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES item(id) NOT NULL,
    amount INTEGER NOT NULL,
    probability INTEGER NOT NULL, -- In percents from 0 to 100
    metadata json,
    structure_id INTEGER REFERENCES structure(id) NOT NULL
);

CREATE TABLE IF NOT EXISTS mob_drop_table (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES item(id) NOT NULL,
    amount INTEGER NOT NULL,
    probability INTEGER NOT NULL, -- In percents from 0 to 100
    metadata json,
    mob_id INTEGER REFERENCES mob(id) NOT NULL
);

CREATE TABLE IF NOT EXISTS fishing_drop_table (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES item(id) NOT NULL,
    amount INTEGER NOT NULL,
    probability INTEGER NOT NULL, -- In percents from 0 to 100
    metadata json
);

CREATE TABLE IF NOT EXISTS biome_drop_table (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES item(id) NOT NULL,
    amount INTEGER NOT NULL,
    probability INTEGER NOT NULL, -- In percents from 0 to 100
    metadata json,
    biome_id INTEGER REFERENCES biome(id) NOT NULL
);

CREATE TABLE IF NOT EXISTS gift_drop_table (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES item(id) NOT NULL,
    amount INTEGER NOT NULL,
    probability INTEGER NOT NULL, -- In percents from 0 to 100,
    metadata json,
    gift_source VARCHAR NOT NULL
);

-- Users

CREATE TABLE IF NOT EXISTS "user" (
    id SERIAL PRIMARY KEY,
    username VARCHAR UNIQUE NOT NULL,
    avatar_url VARCHAR NOT NULL
);

CREATE TABLE IF NOT EXISTS user_recipe_like (
    user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
    recipe_id INTEGER REFERENCES recipe(id) ON DELETE CASCADE,
    is_like BOOLEAN NOT NULL,
    ts TIMESTAMP NOT NULL,
    PRIMARY KEY (user_id, recipe_id)
);