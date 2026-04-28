import formulas
import json
import numpy as np
import os

def local_file_path(path):
  return os.path.join(os.path.dirname(__file__), path)

def evaluate_formula(formula_str, xl_model):
  func = formulas.Parser().ast(formula_str)[1].compile()
  args = []
  for ref in func.inputs:
    cell_ref = ref.split('!')[-1].upper()
    cell_val = next(
      c.value for k, c in xl_model.cells.items()
      if k.upper().endswith('!' + cell_ref)
    )
    args.append(cell_val)
  return func(*args)

def serialize_output(output):
  if isinstance(output, np.ndarray) and np.ndim(output) == 0:
    return output.item()
  return output

def evaluate_spreadsheet(answer, solution, xl_model):
  answer_output = evaluate_formula(answer, xl_model)
  solution_output = evaluate_formula(solution, xl_model)
  return {
    'answer_output': serialize_output(answer_output),
    'solution_output': serialize_output(solution_output),
    'correct': np.all(answer_output == solution_output).item()
  }

def evaluate_solution(answer, solution):
  return {
    'solution_id': solution['id'],
    'spreadsheets': [
      evaluate_spreadsheet(
        answer, solution['solution'], 
        formulas.ExcelModel().loads(local_file_path(sheet['filename'])).finish(circular=True)
      )
      for sheet in solution['spreadsheets']
    ]
  }

with open(local_file_path('tests.json')) as f:
  data = json.load(f)
  solutions = data['solutions']

  with open(local_file_path('result.json'), 'w') as w:
    json.dump({
      'results': [evaluate_solution(data['answer'], solution) for solution in solutions]
    }, w, default= lambda o: o.__class__.__name__)
