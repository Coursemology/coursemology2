import formulas
import json

with open('test_data.json') as f:
  data = json.load(f)

xl_model = formulas.ExcelModel().loads('test_spreadsheet.xlsx').finish(circular=True)
xl_model.calculate()

def evaluate_formula(formula_str, xl_model):
  func = formulas.Parser().ast(formula_str)[1].compile()
  # func.inputs is an ordered dict keyed by each cell ref the formula needs
  args = []
  for ref in func.inputs:
    cell_ref = ref.split('!')[-1].upper()
    cell_val = next(
      c.value for k, c in xl_model.cells.items()
      if k.upper().endswith('!' + cell_ref)
    )
    args.append(cell_val)
  return func(*args)

answer_result = evaluate_formula(data['answer_text'], xl_model)
solution_result = evaluate_formula(data['solution_value'], xl_model)

print(f"answer_formula result:   {answer_result}")
print(f"solution_formula result: {solution_result}")

print(solution_result.item().__class__)
print(f"equality: {answer_result == solution_result}")
