import os
import json

# Recipe gen

recipes = []
ingredients = []
items = {}
tags = {}
tags_to_items = {}
craft_patterns = {}
smelting_time = {}

anon_tag_count = 0

def parse_item(item):
    if item in items:
        return items[item]

    new_id = len(items) + 1

    items[item] = new_id
    
    return new_id

def parse_tag(tag):
    if tag in tags:
        return tags[tag]
    
    new_id = len(tags) + 1

    tags[tag] = new_id

    return new_id

def put_item_in_tag(item, tag):
    if tag not in tags_to_items:
        tags_to_items[tag] = set()

    tags_to_items[tag].add(item)

def long_substr(data):
    substr = ''
    if len(data) > 1 and len(data[0]) > 0:
        for i in range(len(data[0])):
            for j in range(len(data[0])-i+1):
                if j > len(substr) and all(data[0][i:i+j] in x for x in data):
                    substr = data[0][i:i+j]
    return substr

def quote_if_not_null(data):
    if data != "null":
        data = f"\"{data}\""
    return data
    
def parse_ingredient(craft_id, ingredient, key = "null"):
    if type(ingredient) is list:
        tag = long_substr([ing["item"][10:] for ing in ingredient]).strip("_")
        if tag == "": tag = input(f"Come up with tag for {ingredient}: ")
        
        # print(f"Generated tag {tag} for items: {ingredient}")
        tag_id = parse_tag(tag)

        for i in ingredient:
            put_item_in_tag(parse_item(i["item"]), tag_id)

        ingredient = {
            "tag": tag
        }

    if "item" in ingredient:
        item_id = parse_item(ingredient["item"])

        ingredients.append(
            (craft_id, key, True, item_id, "null")
        )
    else:
        tag_id = parse_tag(ingredient["tag"])

        ingredients.append(
            (craft_id, key, False, "null", tag_id)
        )

for index, file_name in enumerate(os.listdir("./minecraft/recipes")):
    with open("./minecraft/recipes/" + file_name) as file:
        data = json.load(file)
        if "result" not in data: continue
        category = data.get("category", "null")
        group = data.get("group", "null")
        craft_type = data["type"]
        result = data["result"]
        if type(result) == str:
            result_item_id = parse_item(result)
            result_item_amount = 1
        else:
            result_item_id = parse_item(data["result"]["item"])
            result_item_amount = data["result"].get("count", 1)

        if craft_type == "minecraft:crafting_shaped":
            if len(data["pattern"]) > 2 or any([len(line) > 2 for line in data["pattern"]]):
                craft_type += "_3"
            else:
                craft_type += "_2"

            pattern = "\\n".join(data["pattern"])
            
            craft_patterns[index] = pattern

        if craft_type == "minecraft:smelting":
            smelting_time[index] = data["cookingtime"]

        for key in data.get("key", {}):
            ingredient = data["key"][key]
            parse_ingredient(index, ingredient, key)
        
        for ingredient in data.get("ingredients", []):
            parse_ingredient(index, ingredient)

        recipes.append(
            (index, result_item_id, result_item_amount, craft_type, category, group)
        )


# Biome tags

biome_tags = {}        

for file_name in filter(lambda x: x.endswith(".json"), os.listdir("./minecraft/tags/worldgen/biome")):
    tag_name = "#minecraft:" + file_name[:-5]
    
    with open(f"./minecraft/tags/worldgen/biome/{file_name}") as file:
        data = json.load(file)
        biome_tags[tag_name] = set(data["values"])

for file_name in os.listdir("./minecraft/tags/worldgen/biome/has_structure"):
    tag_name = "#minecraft:has_structure/" + file_name[:-5]
    
    with open(f"./minecraft/tags/worldgen/biome/has_structure/{file_name}") as file:
        data = json.load(file)
        biome_tags[tag_name] = set(data["values"])

def find_biome_tags(tag):
    res = set(biome_tags[tag])
    for i in list(res):
        if i[0] == '#':
            res.remove(i)
            for biome in find_biome_tags(i):
                res.add(biome)
    return res

for tag in biome_tags:
    biome_tags[tag] = find_biome_tags(tag)

tag_to_dimension = {
    "#minecraft:is_overworld": "overworld",
    "#minecraft:is_nether": "the_nether",
    "#minecraft:is_end": "the_end"
}

# World

dimensions = {}

def parse_dimension(dimension_name):
    if dimension_name not in dimensions:
        dimensions[dimension_name] = len(dimensions) + 1
    return dimensions[dimension_name]

for index, file_name in enumerate(os.listdir("./minecraft/dimension_type")):
    with open(f"./minecraft/dimension_type/{file_name}") as file:
        data = json.load(file)
        dimension_name = file_name[:-5]
        parse_dimension(dimension_name)

biomes = {}
biomes_to_dimension = {}
mobs = {}
mobs_info = {}
mobs_to_biomes = {}

def parse_biome(biome_name):
    if biome_name not in biomes:
        biomes[biome_name] = len(biomes) + 1
    return biomes[biome_name]

def parse_mob(mob_name):
    if mob_name not in mobs:
        mobs[mob_name] = len(mobs) + 1

    return mobs[mob_name]

def put_mob_to_biome(mob_id, biome_id):
    if mob_id not in mobs_to_biomes:
        mobs_to_biomes[mob_id] = set()

    mobs_to_biomes[mob_id].add(biome_id)

mob_hp = {}

for file_name in os.listdir("./minecraft/worldgen/biome"):
    with open(f"./minecraft/worldgen/biome/{file_name}") as file:
        data = json.load(file)
        biome_name = "minecraft:" + file_name[:-5]
        biome_id = parse_biome(biome_name)

        for spawner in data["spawners"]:
            for mob in data["spawners"][spawner]:
                mob_name = mob["type"]
                mob_id = parse_mob(mob_name)

                player_realtion = 0
                if spawner == "monster":
                    player_realtion = 2

                mobs_info[mob_id] = (mob_hp.get(mob_name, 20), player_realtion)
                put_mob_to_biome(mob_id, biome_id)

        for dimension_tag in tag_to_dimension:
            if biome_name in biome_tags[dimension_tag]:
                biomes_to_dimension[biome_id] = parse_dimension(tag_to_dimension[dimension_tag])
                break
        else:
            biomes_to_dimension[biome_id] = parse_dimension("unknown_dimension")

structures = {}
structure_to_biomes = {}
mob_in_structures = {}

def parse_structure(structure_name):
    if structure_name not in structures:
        structures[structure_name] = len(structures) + 1

    return structures[structure_name]

def put_structure_to_biome(structure_id, biome_id):
    if structure_id not in structure_to_biomes:
        structure_to_biomes[structure_id] = set()

    structure_to_biomes[structure_id].add(biome_id)

def put_mob_to_structure(mob_id, structure_id):
    if mob_id not in mob_in_structures:
        mob_in_structures[mob_id] = set()
        
    mob_in_structures[mob_id].add(structure_id)

for file_name in os.listdir("./minecraft/worldgen/structure"):
    structure_name = file_name[:-5]
    structure_id = parse_structure(structure_name)
    with open(f"./minecraft/worldgen/structure/{file_name}") as file:
        data = json.load(file)

        structure_biomes_tag = data["biomes"]
        for biome in biome_tags[structure_biomes_tag]:
            biome_id = parse_biome(biome)
            put_structure_to_biome(structure_id, biome_id)

        for spawner in data["spawn_overrides"]:
            for mob in data["spawn_overrides"][spawner]["spawns"]:
                mob_name = mob["type"]
                mob_id = parse_mob(mob_name)

                player_realtion = 0
                if spawner == "monster":
                    player_realtion = 2

                mobs_info[mob_id] = (mob_hp.get(mob_name, 20), player_realtion)
                put_mob_to_structure(mob_id, structure_id)


# Format scripts

with open("sql/dimensions_data.sql", "w") as file:
    file.write("INSERT INTO dimension (id, name, image, description) VALUES \n")

    for index, dimension in enumerate(dimensions):
        dimension_id = dimensions[dimension]
        dimension_name = " ".join([part.capitalize() for part in dimension.split("_")])
        dimension_description = f"{dimension_name} dimension"
        dimension_image = f"/dimensions/{dimension}.png"

        file.write(f"({dimension_id}, \"{dimension_name}\", \"{dimension_image}\", \"{dimension_description}\")")

        if index == len(dimensions) - 1:
            file.write(";\n")
        else:
            file.write(",\n")

with open("sql/biomes_data.sql", "w") as file:
    file.write("INSERT INTO biome (id, name, image, description, dimension_id) VALUES\n")

    for index, biome in enumerate(biomes):
        biome_id = biomes[biome]
        biome_name = " ".join([part.capitalize() for part in biome[10:].split("_")])
        biome_description = f"The {biome_name} biome"
        biome_image = f"/biomes/{biome}.png"
        biome_dimension = biomes_to_dimension[biome_id]

        file.write(f'({biome_id}, "{biome_name}", "{biome_image}", "{biome_description}", {biome_dimension})')

        if index == len(biomes) - 1:
            file.write(";\n")
        else:
            file.write(",\n")

with open("sql/structures_data.sql", "w") as file:
    file.write("INSERT INTO structure (id, name, image, description) VALUES\n")

    for index, structure in enumerate(structures):
        structure_id = structures[structure]
        structure_name = " ".join([part.capitalize() for part in structure.split("_")])
        structure_image = f"/structures/{structure}.png"
        structure_description = f"The {structure_name} structure"

        file.write(f'({structure_id}, "{structure_name}", "{structure_image}", "{structure_description}")')

        if index == len(structures) - 1:
            file.write(";\n")
        else:
            file.write(",\n")

with open("sql/biome_structure_data.sql", "w") as file:
    file.write("INSERT INTO biome_structure (biome_id, structure_id) VALUES\n")

    lines = []

    for structure_id in structure_to_biomes:
        for biome_id in structure_to_biomes[structure_id]:
            lines.append(
                f"({biome_id}, {structure_id})"
            )

    for i in range(len(lines) - 1):
        lines[i] += ",\n"
    lines[-1] += ";\n"
    file.writelines(lines)

with open("sql/mobs_data.sql", "w") as file:
    file.write("INSERT INTO mob (id, name, image, hp, player_relation) VALUES\n")

    for index, mob in enumerate(mobs):
        mob_id = mobs[mob]
        mob_name = " ".join([part.capitalize() for part in mob[10:].split("_")])
        mob_image = f"/mobs/{mob}.png"
        mob_hp, player_realtion = mobs_info[mob_id]

        file.write(f'({mob_id}, "{mob_name}", "{mob_image}", {mob_hp}, {player_realtion})')

        if index == len(mobs) - 1:
            file.write(";\n")
        else:
            file.write(",\n")

with open("sql/biome_mob_data.sql", "w") as file:
    file.write("INSERT INTO biome_mob (biome_id, mob_id) VALUES\n")

    lines = []

    for mob_id in mobs_to_biomes:
        for biome_id in mobs_to_biomes[mob_id]:
            lines.append(f'({biome_id}, {mob_id})')

    for i in range(len(lines) - 1):
        lines[i] += ',\n'
    lines[-1] += ';\n'
    file.writelines(lines)

with open("sql/structure_mob_data.sql", "w") as file:
    file.write("INSERT INTO structure_mob (structure_id, mob_id) VALUES\n")

    lines = []

    for mob_id in mob_in_structures:
        for structure_id in mob_in_structures[mob_id]:
            lines.append(f'({structure_id}, {mob_id})')

    for i in range(len(lines) - 1):
        lines[i] += ',\n'
    lines[-1] += ';\n'
    file.writelines(lines)

with open("sql/tags_data.sql", "w") as file:
    file.write("INSERT INTO tag (id, name) VALUES\n")
    
    for index, tag in enumerate(tags):
        file.write(f"({tags[tag]}, \"{tag}\")")

        if index == len(tags) - 1:
            file.write(";\n")
        else:
            file.write(",\n")

with open("sql/items_data.sql", "w") as file:
    file.write("INSERT INTO item (id, name, image) VALUES \n")

    for index, item in enumerate(items):
        item_name = " ".join([part.capitalize() for part in item[10:].split("_")])

        file.write(f"({items[item]}, \"{item_name}\", \"/items/{item}.png\")")
        
        if index == len(items) - 1:
            file.write(";\n")
        else:
            file.write(",\n")

with open("sql/recipes_data.sql", "w") as file:
    file.write("INSERT INTO recipe (id, result_item, result_amount, craft_type, craft_category, craft_group) VALUES \n")

    for recipe in recipes:
        index, result_item_id, result_item_amount, craft_type, category, group = recipe
        category = quote_if_not_null(category)
        group = quote_if_not_null(group)

        file.write(f"({index}, {result_item_id}, {result_item_amount}, \"{craft_type}\", {category}, {group})")

        if index == len(recipes) - 1:
            file.write(";\n")
        else:
            file.write(",\n")

with open("sql/recipes_extra_data.sql", "w") as file:
    file.write("INSERT INTO recipe_extra_data (id, craft_pattern, smelt_time) VALUES \n")
    
    lines = []

    for index in craft_patterns:
        lines.append(f"({index}, \"{craft_patterns[index]}\", null)")

    for index in smelting_time:
        lines.append(f"({index}, null, {smelting_time[index]})")

    for i in range(len(lines) - 1):
        lines[i] += ",\n"

    lines[-1] += ";\n"

    file.writelines(lines)

with open("sql/item_tag_data.sql", "w") as file:
    file.write("INSERT INTO item_tag (item_id, tag_id) VALUES\n")

    lines = []

    for tag_id in tags_to_items:
        for item_id in tags_to_items[tag_id]:
            lines.append(f"({tag_id}, {item_id})")

    for i in range(len(lines) - 1):
        lines[i] += ",\n"

    lines[-1] += ";\n"
    file.writelines(lines)

with open("sql/ingredients_data.sql", "w") as file:
    file.write("INSERT INTO ingredient (craft_id, ing_symbol, item_or_tag_flag, item_id, tag_id) VALUES\n")

    shapeless_keys = {}

    for index, (craft_id, key, flag, item_id, tag_id) in enumerate(ingredients):
        item_id = quote_if_not_null(item_id)
        tag_id = quote_if_not_null(tag_id)
        flag = "true" if flag else "false"

        if key == 'null':
            if craft_id not in shapeless_keys:
                shapeless_keys[craft_id] = 0
            key = chr(ord('a') + shapeless_keys[craft_id])
            shapeless_keys[craft_id] += 1

        file.write(f'({craft_id}, \'{key}\', {flag}, {item_id}, {tag_id})')

        if index == len(ingredients) - 1:
            file.write(";\n")
        else:
            file.write(",\n")
