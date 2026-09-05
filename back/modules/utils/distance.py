def get_distance(start: tuple, target:tuple):
    x_start, y_start = start
    x_target,y_target = target
    return abs(y_start-y_target)+abs(x_start-x_target)