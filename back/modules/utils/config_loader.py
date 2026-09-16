import configparser
from datetime import timedelta
import psutil
import getpass
import os
import argparse
import json
from modules.utils.singleton import SingletonMeta

def print_config(config_read):
    for section in config_read.sections():
        print(f"[{section}]")
        for key, value in config_read[section].items():
            print(f"{key} = {value}")
        print()

class ConfigLoader(metaclass = SingletonMeta):
    _instance = None

    def __init__(self):
        self.config = configparser.ConfigParser()
        self.filename =  "configs/server.ini"
        if not os.path.exists(self.filename):
             raise Exception("no config file")
        self.config.read(self.filename)

    def get_fps(self)->int:
        return int(self.config["engine"]["fps"])

    def get_round_duration(self)->int:
        return int(self.config["game"]["round"])

    def get_torpedo_reloading_scale(self)->int:
        return int(self.config["game"]["torpedo_reloading_scale"])

    