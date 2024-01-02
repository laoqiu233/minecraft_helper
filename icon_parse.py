import requests
import json

def parse_json():
    res = requests.get("http://localhost:8080/items").json()
    names = []
    for ob in res:
        names.append((f'https://minecraft.wiki/images/Invicon_{ob["name"].replace(" ", "_")}.png', "images" + ob['image'].replace(":", "_")))
    

    for name, path in names:
        r = requests.get(name, stream=True)
        if r.status_code == 200:
            with open(path, 'wb') as f:
                for chunk in r:
                    f.write(chunk)
        else:
            print(r.status_code, path)


parse_json()