import os
import sys
import unittest
import formulas
import time_machine
import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from autograde_spreadsheet import FormulaEvaluator, is_output_correct, evaluate_spreadsheet

SPREADSHEET_PATH = os.path.join(os.path.dirname(__file__), 'test_spreadsheet.xlsx')

def error_value(error_str):
  return formulas.functions.Error.errors[error_str]

FORMULA_CASES = {
  'arithmetic': ('=1 + 2', 3),
  'simple_ref': ('=MOD(E15,F15)', 1),
  'range': ('=SUM(E3:E4)', 1),
  'multistep': ('=SUM(J3:J7)', 5),
  'quotient': ('=QUOTIENT(E15,F15)', 3),
  'quotient_div_0': ('=QUOTIENT(1,0)',  error_value('#DIV/0!')),
  'string': ('=(LEN($M4)-LEN(SUBSTITUTE($M4,N$2,""))) / LEN(N$2)', 12),
  'lookup': ('=P11*IF(P11=0,0,VLOOKUP(V$2, $H$3:$I$7, 2, FALSE))', 47.998216),
  'undefined_inputs': ('=SUM(J3:J9) + J10 + SUM(J11:J13)', 5),
  'cross_sheet': ("=C3 + 'new sheet'!A1 + 'newer sheet'!A1",  6),
  'error_div_0': ('=1/0',  error_value('#DIV/0!')),
  'error_name': ('=COUNTCELLS(H3:H7)',  error_value('#NAME?')),
  'error_value': ('=B12+C12',  error_value('#VALUE!')),
  'error_null': ('=SUM(E3:E12 F3:F12)', error_value('#NULL!')),
  'error_overflow': ('=POWER(10, 309)',  error_value('#NUM!')),
  'error_ref': ('=VLOOKUP(U$2, $H$3:$I$7, 3, FALSE)', error_value('#REF!')),
  'unary_plus': ('=+1', 1),
  'unary_minus': ('=-1', -1),
  'literal_string': ('="Hello, World!"', "Hello, World!"),
}

class TestEvaluateFormula(unittest.TestCase):
  def assertFormula(self, formula, expected):
    result = FormulaEvaluator(formula, SPREADSHEET_PATH, None, False).evaluate()
    self.assertTrue(is_output_correct(result, expected), f'Expected {expected!r}, got {result.value!r}')

  def test_formulas(self):
    for name, (formula, expected) in FORMULA_CASES.items():
      with self.subTest(name):
        self.assertFormula(formula, expected)

  def test_date(self):
    with time_machine.travel('2026-05-15'):
      self.assertFormula('=DAYS(TODAY(),H1)', 4)

  def test_random(self):
    np.random.seed(42)
    self.assertFormula('=RAND() * RAND()', 0.5114958297721829)

  def test_target_sheetname(self):
    # An unqualified reference resolves against the configured target sheet,
    # matching the value of the explicitly-qualified reference.
    for target, expected in [('new sheet', 2), ('newer sheet', 3)]:
      with self.subTest(target):
        result = FormulaEvaluator('=A1', SPREADSHEET_PATH, None, False, target).evaluate()
        self.assertTrue(is_output_correct(result, expected), f'Expected {expected!r}, got {result.value!r}')

  def test_target_sheetname_case_insensitive(self):
    result = FormulaEvaluator('=A1', SPREADSHEET_PATH, None, False, 'NEW SHEET').evaluate()
    self.assertTrue(is_output_correct(result, 2), f'Expected 2, got {result.value!r}')

  def test_target_sheetname_unknown_falls_back_to_first_sheet(self):
    fallback = FormulaEvaluator('=A1', SPREADSHEET_PATH, None, False, 'does not exist').evaluate()
    default = FormulaEvaluator('=A1', SPREADSHEET_PATH, None, False).evaluate()
    self.assertTrue(is_output_correct(fallback, default), f'Expected {default.value!r}, got {fallback.value!r}')

  def test_spreadsheet_evaluation_error(self):
    result = evaluate_spreadsheet(
      'test_spreadsheet_evaluation_error',
      '=(O6-R6*VLOOKUP(U$2, $H$3:$I$7, 2, FALSE)',
      '=(O6-R6)*VLOOKUP(U$2, $H$3:$I$7, 2, FALSE)',
      SPREADSHEET_PATH,
      None,
      0,
      False,
    )
    self.assertIsNone(result.get('output'))
    self.assertIn('outputError', result)

if __name__ == '__main__':
  unittest.main()
