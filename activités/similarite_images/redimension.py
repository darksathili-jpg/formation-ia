from PIL import Image

# Charger les deux images
img_a = Image.open("images/dark1.png")
img_b = Image.open("images/dark2.png")

# Déterminer la plus petite taille
taille = (min(img_a.width, img_b.width), min(img_a.height, img_b.height))

# Redimensionner les deux à la même taille
img_a = img_a.resize(taille)
img_b = img_b.resize(taille)

print(f"Taille finale : {taille[0]} x {taille[1]} pixels")
print(f"Nombre de pixels : {taille[0] * taille[1]}")