from  uuid import UUID

def get_color(uuid_id: str) -> int:
    COLORS = [
        "#E53935",  # red
        "#D81B60",  # pink
        "#8E24AA",  # purple
        "#5E35B1",  # deep purple
        "#3949AB",  # indigo
        "#039BE5",  # light blue
        "#00ACC1",  # cyan
        "#00897B",  # teal
        "#43A047",  # green
        "#7CB342",  # light green
        "#C0CA33",  # lime
        "#FDD835",  # yellow
        "#FFB300",  # amber
        "#FB8C00",  # orange
        "#F4511E",  # deep orange
        "#EC407A",  # bright pink
        "#26A69A",  # turquoise
        "#66BB6A",  # bright green
        "#AB47BC",  # bright purple
    ]
        
    uuid = UUID(uuid_id)
    color_index =  uuid.int % len(COLORS)
    return COLORS[color_index]