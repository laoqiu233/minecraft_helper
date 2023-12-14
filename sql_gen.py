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

        file.write(f"({index}, {result_item_id}, {result_item_amount}, {category}, {group})")

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