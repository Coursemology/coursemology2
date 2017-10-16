prepare:

compile: tests/autograde.py submission/template.py tests/prepend.py tests/append.py
	cat tests/prepend.py submission/template.py tests/append.py tests/autograde.py > answer.py

public:
	PYTHONPATH="$(shell pwd)/submission":"$(shell pwd)/tests" $(PYTHON) answer.py PublicTestsGrader

private:
	PYTHONPATH="$(shell pwd)/submission":"$(shell pwd)/tests" $(PYTHON) answer.py PrivateTestsGrader

evaluation:
	PYTHONPATH="$(shell pwd)/submission":"$(shell pwd)/tests" $(PYTHON) answer.py EvaluationTestsGrader

solution:	solution.py
	PYTHONPATH="$(shell pwd)/solution":"$(shell pwd)/tests" $(PYTHON) solution.py

solution.py:	tests/autograde.py solution/template.py tests/prepend.py tests/append.py
	cat tests/prepend.py solution/template.py tests/append.py tests/autograde.py > solution.py

clean:
	rm -f answer.py
	rm -f report.xml
	rm -f solution.py
