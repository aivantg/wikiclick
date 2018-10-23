import json
pages = []
with open("output.txt", "rb") as fin:
    for line in fin:
        title = line.rstrip().decode('utf-8')
        pages.append({"name": title})
with open('data.json', 'w') as outfile:
    json.dump(pages, outfile)
