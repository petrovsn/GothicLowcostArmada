from  uuid import UUID

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
        "Sandra"
    ]
        
    uuid = UUID(uuid_id)
    color_index =  uuid.int % len(NAMES)
    return NAMES[color_index]