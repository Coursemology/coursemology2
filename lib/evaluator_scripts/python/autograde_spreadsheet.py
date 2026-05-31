from datetime import datetime
import formulas
import json
import numpy as np
import os
import sys
import time_machine

RANDOMIZED_TESTS = 3

def quotient(x, y):
  return x // y if y != 0 else formulas.functions.Error.errors['#DIV/0!']

FUNCTIONS = formulas.get_functions()
FUNCTIONS['QUOTIENT'] = formulas.functions.wrap_ufunc(quotient)

def local_file_path(path):
  return os.path.join(os.path.dirname(__file__), path)

def generate_character_map(charset):
  charset_length = len(charset)
  shuffled = list(charset)
  np.random.shuffle(shuffled)
  # A small number of characters should map to two characters to handle different length strings
  extra_character_indices = np.random.choice(len(charset) * 10, size=charset_length)
  return {
    original: shuffled[i] + (charset[extra_character_indices[i]] if extra_character_indices[i] < charset_length else '')
    for i, original in enumerate(charset)
  }


class FormulaEvaluator:
  def __init__(self, formula_str, filename, variables, random_seed, randomize_inputs):
    self.xl_model = formulas.ExcelModel().loads(local_file_path(filename))
    self.bookname, bookdata = next(iter(self.xl_model.books.items()))
    internal_book = next((v for k, v in bookdata.items() if str(k) == 'Book'), None)
    self.sheetnames = internal_book.sheetnames
    self.default_sheetname = self.sheetnames[0]
    self.variables = variables
    self.randomize_inputs = randomize_inputs
    self.random_seed = random_seed

    rewrite_str = self.rewrite_formula(formula_str)
    self.xl_model.from_dict({ "SHEET1!A1": rewrite_str })

  def split_sheetname_from_ref(self, ref):
    if '!' in ref:
      sheetname, cell_ref = ref.split('!', 1)
      return sheetname.replace("'", "").upper(), cell_ref
    return None, ref

  def book_ref(self, ref, default_sheetname=None):
    sheetname, cell_ref = self.split_sheetname_from_ref(ref)
    bookname_formatted = self.bookname.lower()
    sheetname_formatted = (sheetname or default_sheetname or self.default_sheetname).upper()
    return f"'[{bookname_formatted}]{sheetname_formatted}'!{cell_ref}"

  def rewrite_token(self, token, default_sheetname=None):
    if isinstance(token, formulas.tokens.operand.Range):
      return self.book_ref(token.name[:token.end_match], default_sheetname=default_sheetname)
    elif isinstance(token, formulas.tokens.operand.String):
      return f'"{token.name[:token.end_match]}"'
    elif isinstance(token, formulas.tokens.operator.Operator) and token.name in ('u-', 'u+'):
      return token.name[1:]
    return token.name[:token.end_match]

  def rewrite_formula(self, formula, default_sheetname=None):
    # Normalize Unicode dashes (en dash U+2013, em dash U+2014, minus sign U+2212)
    # to ASCII hyphen-minus, which can appear when users copy formulas from Word/PDF.
    formula = formula.replace('–', '-').replace('—', '-').replace('−', '-')
    tokens, _ = formulas.Parser().ast(formula)
    rewritten = '=' + ''.join(self.rewrite_token(t, default_sheetname=default_sheetname) for t in tokens)
    return rewritten

  def generate_inputs(self):
    if not self.variables or not len(self.variables):
      return None

    source_cells = self.xl_model.to_dict()
    inputs = {}
    keys_to_shuffle = []
    for var_config in self.variables:
      variable_key = self.book_ref(var_config['cell'])
      if var_config['mode'] == 'override':
        if var_config['value'].startswith('='):
          sheetname, _ = self.split_sheetname_from_ref(var_config['cell'])
          self.xl_model.from_dict({ variable_key: self.rewrite_formula(var_config['value'], default_sheetname=sheetname) })
        else:
          inputs[variable_key] = var_config['value']
      elif var_config['mode'] == 'numeric' and self.randomize_inputs:
        inputs[variable_key] = np.random.uniform(var_config['min'], var_config['max'])
      elif var_config['mode'] == 'string' and self.randomize_inputs:
        digit_map = generate_character_map('0123456789') if var_config.get('randomizeDigits', False) else {}
        letter_map = generate_character_map('abcdefghijklmnopqrstuvwxyz') if var_config.get('randomizeLetters', False) else {}
        char_map = digit_map | letter_map

        original_str = source_cells.get(variable_key, '')
        inputs[variable_key] = ''.join(char_map.get(c, c) for c in original_str)
      elif var_config['mode'] == 'shuffle' and self.randomize_inputs:
        keys_to_shuffle.append(variable_key)

    if len(keys_to_shuffle):
      # Shuffle the values for the specified variables
      shuffled_values = [source_cells.get(key) for key in keys_to_shuffle]
      np.random.shuffle(shuffled_values)
      for i, key in enumerate(keys_to_shuffle):
        inputs[key] = shuffled_values[i]
    return inputs

  def evaluate(self):
    np.random.seed(self.random_seed)
    self.inputs = self.generate_inputs()

    self.xl_model.finish(circular=True, complete=True)
    result = self.xl_model.calculate(inputs=self.inputs)['SHEET1!A1']
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

def is_output_correct(output, expected):
  comparable_answer = comparable_output(output)
  comparable_solution = comparable_output(expected)
  if isinstance(comparable_answer, np.ndarray) or isinstance(comparable_solution, np.ndarray):
    return np.all(np.vectorize(compare_output_elements)(comparable_answer, comparable_solution)).item()
  return compare_output_elements(comparable_answer, comparable_solution)

def evaluate_spreadsheet(identifier, answer, solution, filename, variables, random_seed, randomize_inputs):
  result = {
    'identifier': identifier,
    'correct': False
  }

  try:
    output_raw = FormulaEvaluator(answer, filename, variables, random_seed, randomize_inputs).evaluate()
    result['output'] = serialize_output(output_raw)
  except Exception as e:
    print(f"Error occurred while evaluating answer formula: {e}", file=sys.stderr, flush=True)
    result['outputError'] = str(e)

  try:
    expected_raw = FormulaEvaluator(solution, filename, variables, random_seed, randomize_inputs).evaluate()
    result['expected'] = serialize_output(expected_raw)
  except Exception as e:
    print(f"Error occurred while evaluating solution formula: {e}", file=sys.stderr, flush=True)
    result['expectedError'] = str(e)

  if 'outputError' not in result and 'expectedError' not in result:
    result['correct'] = is_output_correct(output_raw, expected_raw)

  return result

def evaluate_solution(answer, solution):
  timestamp = solution.get('test_timestamp') or datetime.now().isoformat()
  random_seed = solution.get('random_seed')
  num_random_tests = solution.get('num_random_tests', RANDOMIZED_TESTS)

  if random_seed is not None:
    np.random.seed(random_seed)

  random_seeds = np.random.randint(0, 2**31-1, size=num_random_tests + 1)

  with time_machine.travel(datetime.fromisoformat(timestamp)):
    return {
      'solution_id': solution['id'],
      'results': [
        evaluate_spreadsheet(
          'test_original_spreadsheet',
          answer, solution['solution'], solution['spreadsheet']['filename'], solution['variables'],
          random_seeds[0], False
        ),
        *[evaluate_spreadsheet(
          f"test_random_{i+1}",
          answer, solution['solution'], solution['spreadsheet']['filename'], solution['variables'],
          random_seeds[i+1], True
        ) for i in range(num_random_tests)]
      ]
    }

if __name__ == '__main__':
  with open(local_file_path('tests.json')) as f:
    data = json.load(f)
    solutions = data['solutions']

    with open(local_file_path('result.json'), 'w') as w:
      json.dump({
        'evaluated_solutions': [evaluate_solution(data['answer'], solution) for solution in solutions]
      }, w, default= lambda o: o.__class__.__name__)
