import random


def get_success_tries(N_tries:int, treshold:int):
    count = 0
    for i in range(N_tries):
        random_dice = random.randint(1, 6)
        if random_dice>treshold:
            count +=1
    return count