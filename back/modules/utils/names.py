from uuid import UUID


def get_name(uuid_id: str) -> int:
    NAMES = [
        "James",
        "Mary",
        "John",
        "Patricia",
        "Robert",
        "Jennifer",
        "Michael",
        "Linda",
        "William",
        "Elizabeth",
        "David",
        "Barbara",
        "Richard",
        "Susan",
        "Joseph",
        "Jessica",
        "Thomas",
        "Sarah",
        "Charles",
        "Karen",
        "Christopher",
        "Nancy",
        "Daniel",
        "Margaret",
        "Matthew",
        "Betty",
        "Anthony",
        "Helen",
        "Mark",
        "Sandra",
    ]

    uuid = UUID(uuid_id)
    color_index = uuid.int % len(NAMES)
    return NAMES[color_index]


def get_ship_name(uuid_id: str) -> int:
    NAMES = [
        "Wrath of Terra",
        "Baneblade",
        "Blood Sword",
        "Invictus",
        "Shield of Mars",
        "Spear",
        "Vengeance",
        "Gloryhammer",
        "Divinator",
        "Bane of Heretics",
        "Razor of Warp",
        "Peasemaker",
        "Crown of Kalt",
        "Fist of Dorn",
        "Russ's Claws",
        "Angelicus",
        "Enclamator",
        "Eternal Honor",
        "Crusader",
        "Eradicator",
        "Tormentor",
        "Xenodoom",
        "Purifier",
        "Sentinel",
        "Warden",
        "Spear of Rage",
        "Bell of Pain",
        "Ashes of Isstvan",
    ]

    uuid = UUID(uuid_id)
    color_index = uuid.int % len(NAMES)
    return NAMES[color_index]
