import mirrorCreator from 'mirror-creator';

export const formNames = mirrorCreator([
  'PROGRAMMING_QUESTION',
]);

export const programmingLanguages = {
  JAVASCRIPT: 1,
  PYTHON_2_7: 2,
  PYTHON_3_4: 3,
  PYTHON_3_5: 4,
  PYTHON_3_6: 5,
  C_CPP: 6,
  JAVA: 7,
};

export const aceEditorModes = {
  C_CPP: 'c_cpp',
  JAVA: 'java',
  PYTHON: 'python',
};

export const editorActionTypes = mirrorCreator([
  'TOGGLE_SUBMIT_AS_FILE',
  'CODE_BLOCK_UPDATE',
  'TEST_CASE_CREATE',
  'TEST_CASE_UPDATE',
  'TEST_CASE_DELETE',
  'NEW_PACKAGE_FILE_UPDATE',
  'NEW_PACKAGE_FILE_DELETE',
  'EXISTING_PACKAGE_FILE_DELETE',
]);

export const actionTypes = mirrorCreator([
  'PROGRAMMING_QUESTION_UPDATE',
  'SKILLS_UPDATE',
  'EDITOR_MODE_UPDATE',
  'HAS_ERROR_CLEAR',
  'SUBMISSION_MESSAGE_SET',
  'SUBMISSION_MESSAGE_CLEAR',
  'SUBMIT_FORM_LOADING',
  'SUBMIT_FORM_SUCCESS',
  'SUBMIT_FORM_FAILURE',
  'SUBMIT_FORM_EVALUATING',
  'VALIDATION_ERRORS_SET',
]);

export const cppAppend = `// This is a global environment that is setup before the tests are run.
// Since googletest does not allow function calls in the global scope
class GlobalEnv : public testing::Environment {
public:
    virtual ~GlobalEnv() {}
    virtual void TearDown() {}

    // SetUp() is called before the tests are run
    virtual void SetUp() {
        // Add any function calls you require to the definition here
    }
};

// This function will be called on the expected and expression-output entered in the test case.
template<typename T1, typename T2>
void custom_evaluation(T1 expected, T2 expression) {
    // void expect_equals(a, b) is overloaded to generate the appropriate test assertions
    // for the respective type-pairs,
    // It also records the 'expected' and 'output' properties for you
    // and supports comparisons between:
    //    int, double, float, bool, char, char*, const char*
    // For any other types (arrays, structs... etc) - you can choose to overload expect_equals() or
    // just write your test here.
    // You will also have to use ::testing::Test::RecordProperty()
    // to record the 'expected' and 'output' properties

    expect_equals(expected, expression);
}
`;

export const javaAppend = `// NOTE:
// void expectEquals(Object expression, Object expected) { Assert.assertEquals(expression, expected) }
// will be called on the expression and expected values that you input into each test case
// It has been overloaded to handle all java primitive types as well
// If you wish to make comparisons between other types/classes, you may overload this function

// String printValue(Object val) { ... } will be called on the expected and expression values by default.
// It has been overloaded to handle java primitives and their arrays.
// You can also choose to overload this function to declare how to print different types of values.
`;
