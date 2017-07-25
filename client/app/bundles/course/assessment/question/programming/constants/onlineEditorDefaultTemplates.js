const cppAppend = `// This is a global environment that is setup before the tests are run.
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

// This is called on the expression and expected values for each test case.
template<typename T1, typename T2>
void custom_evaluation(T1 expression, T2 expected) {
    // void expect_equals(a, b) is overloaded to generate the appropriate test assertions
    // for the respective type-pairs, 
    // It also records the 'expected' and 'output' properties for you
    // and currently supports comparisons between:
    //    int, double, float, bool, char, char*, const char*
    // For any other types (arrays, structs... etc) - you can choose to overload expect_equals() or
    // just write your test here.
    // You will also have to use ::testing::Test::RecordProperty() 
    // to record the 'expected' and 'output' properties

    expect_equals(expression, expected);
}
`;

module.exports = { data: cppAppend };
