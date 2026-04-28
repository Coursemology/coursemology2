import sys
import formulas
import json
import numpy as np
import os
import time_machine
import datetime

def quotient(x, y):
  return x // y if y != 0 else formulas.functions.Error.errors['#DIV/0!']

FUNCTIONS = formulas.get_functions()
FUNCTIONS['QUOTIENT'] = formulas.functions.wrap_ufunc(quotient)

def local_file_path(path):
  return os.path.join(os.path.dirname(__file__), path)

class FormulaEvaluator:
  def __init__(self, formula_str, filename):
    self.xl_model = formulas.ExcelModel().loads(local_file_path(filename))
    self.bookname, bookdata = next(iter(self.xl_model.books.items()))
    internal_book = next((v for k, v in bookdata.items() if str(k) == 'Book'), None)
    self.sheetnames = internal_book.sheetnames
    self.default_sheetname = self.sheetnames[0]

    rewrite_str = self.rewrite_formula(formula_str)
    self.xl_model.from_dict({ "'Sheet1'!A1": rewrite_str })
    self.xl_model.finish(circular=True, complete=True)

  def rewrite_token(self, token):
    if isinstance(token, formulas.tokens.operand.Range):
      return self.book_ref(token.name[:token.end_match])
    elif isinstance(token, formulas.tokens.operand.String):
      return f'"{token.name[:token.end_match]}"'
    return token.name[:token.end_match]

  def rewrite_formula(self, formula):
    tokens, _ = formulas.Parser().ast(formula)
    return '=' + ''.join(self.rewrite_token(t) for t in tokens)

  def book_ref(self, ref):
    bookname_formatted = self.bookname.lower()
    sheetname_formatted = self.default_sheetname.upper()
    cell_ref = ref
    if '!' in ref:
      sheetname, cell_ref = ref.split('!', 1)
      sheetname_formatted = sheetname.replace("'", "").upper()
    return f"'[{bookname_formatted}]{sheetname_formatted}'!{cell_ref}"

  def evaluate(self):
    result = self.xl_model.calculate()['SHEET1!A1']
    return result

def comparable_output(output):
  if isinstance(output, formulas.Ranges):
    return comparable_output(output.value)
  return output

def serialize_output(output):
  if isinstance(output, formulas.Ranges):
    return serialize_output(output.value)
  if isinstance(output, formulas.tokens.operand.Error):
    return str(output)
  elif isinstance(output, np.ndarray) and output.size == 1:
    return output.item()
  return output

def compare_output_elements(a, b):
  if isinstance(a, formulas.tokens.operand.Error) and isinstance(b, formulas.tokens.operand.Error):
    return str(a) == str(b)
  elif isinstance(a, formulas.tokens.operand.Error) or isinstance(b, formulas.tokens.operand.Error):
    return False
  elif isinstance(a, float) and isinstance(b, float):
    return np.isclose(a, b)
  else:
    return a == b

def is_output_correct(answer_output, solution_output):
  comparable_answer = comparable_output(answer_output)
  comparable_solution = comparable_output(solution_output)
  if isinstance(comparable_answer, np.ndarray) or isinstance(comparable_solution, np.ndarray):
    return np.all(np.vectorize(compare_output_elements)(comparable_answer, comparable_solution)).item()
  return compare_output_elements(comparable_answer, comparable_solution)

def evaluate_spreadsheet(answer, solution, filename):
  result = {
    'answer_output': None,
    'solution_output': None,
    'correct': False
  }

  try:
    answer_output_raw = FormulaEvaluator(answer, filename).evaluate()
    result['answer_output'] = serialize_output(answer_output_raw)
  except Exception as e:
    print(f"Error occurred while evaluating answer formula: {e}", file=sys.stderr, flush=True)
    result['answer_error'] = str(e)

  try:
    solution_output_raw = FormulaEvaluator(solution, filename).evaluate()
    result['solution_output'] = serialize_output(solution_output_raw)
  except Exception as e:
    print(f"Error occurred while evaluating solution formula: {e}", file=sys.stderr, flush=True)
    result['solution_error'] = str(e)

  if 'answer_error' not in result and 'solution_error' not in result:
    result['correct'] = is_output_correct(answer_output_raw, solution_output_raw)

  return result

def evaluate_solution(answer, solution):
  return {
    'solution_id': solution['id'],
    'spreadsheets': [
      evaluate_spreadsheet(
        answer, solution['solution'], sheet['filename']
      )
      for sheet in solution['spreadsheets']
    ]
  }

if __name__ == '__main__':
  with open(local_file_path('tests.json')) as f:
    data = json.load(f)
    solutions = data['solutions']
    variables = data['variables']

    with open(local_file_path('result.json'), 'w') as w:
      timestamp = variables.get('timestamp', datetime.datetime.now().isoformat())
      random_seed = variables.get('random_seed', None)

      if random_seed is not None:
        np.random.seed(variables['random_seed'])

      with time_machine.travel(timestamp):
        json.dump({
          'results': [evaluate_solution(data['answer'], solution) for solution in solutions]
        }, w, default= lambda o: o.__class__.__name__)
