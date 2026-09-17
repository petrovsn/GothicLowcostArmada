from  uuid import UUID
import random
def get_color(used_colors:list) -> int:
    COLORS = [
        "#E53935",  # red
        "#3949AB",  # indigo
        "#00ACC1",  # cyan
        "#00897B",  # teal
        "#FDD835",  # yellow
        "#FB8C00",  # orange
        "#AB47BC",  # bright purple
    ]

    selected_color = random.choice(COLORS)
    while selected_color in used_colors:
        selected_color = random.choice(COLORS)
    return selected_color