import unittest
# Needs xmlrunner: pip install unittest-xml-reporting
import xmlrunner
import sys

class AutoGrader(unittest.TestCase):
    def setUp(self):
        # clears the dictionary containing meta data for each test
        self.meta = { 'expression': '', 'expected': '', 'hint': '' }

# Do not modify above this line, unless you know what you are doing
