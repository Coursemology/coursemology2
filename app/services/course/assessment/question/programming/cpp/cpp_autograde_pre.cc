template<typename T1, typename T2>
void RecordProperties(T1 a, T2 b);

template<typename T1, typename T2>
void RecordFloatProperties(T1 a, T2 b);

// Catches all type mismatches
// Any type-matches or allowed type-mismatches are explicitly defined
template <typename T1, typename T2>
void expect_equals(const T1 &a, const T2 &b) {
	FAIL() << "Type Mismatch: Cannot implicitly convert either value to the same type.";
}

// Any allowed type-pairs of the two variables are explicitly defined below
// This is so that they will not get caught by the generic overload above.
// The assertion for equality is chosen based on the type-pairs and their
// `expected` and `output` properties are recorded.
void expect_equals(const int &a, const int &b) {
	EXPECT_EQ(a, b);
	RecordProperties(a, b);
}

void expect_equals(const int &a, const double &b) {
	EXPECT_DOUBLE_EQ(a, b);
	RecordFloatProperties(a, b);
}

void expect_equals(const int &a, const float &b) {
	EXPECT_FLOAT_EQ(a, b);
	RecordFloatProperties(a, b);
}

void expect_equals(const double &a, const int &b) {
	EXPECT_DOUBLE_EQ(a, b);
	RecordFloatProperties(a, b);
}

void expect_equals(const double &a, const double &b) {
	EXPECT_DOUBLE_EQ(a, b);
	RecordFloatProperties(a, b);
}

void expect_equals(const double &a, const float &b) {
	EXPECT_FLOAT_EQ(a, b);
	RecordFloatProperties(a, b);
}

void expect_equals(const float &a, const int &b) {
	EXPECT_FLOAT_EQ(a, b);
	RecordFloatProperties(a, b);
}

void expect_equals(const float &a, const double &b) {
	EXPECT_FLOAT_EQ(a, b);
	RecordFloatProperties(a, b);
}

void expect_equals(const float &a, const float &b) {
	EXPECT_FLOAT_EQ(a, b);
	RecordFloatProperties(a, b);
}

void expect_equals(const bool &a, const bool &b) {
	EXPECT_EQ(a, b);
	RecordProperties(a, b);
}

void expect_equals(const char &a, const char &b) {
	EXPECT_EQ(a, b);
	RecordProperties(a, b);
}

void expect_equals(char * a, char * b) {
	EXPECT_STREQ(a, b);
	RecordProperties(a, b);
}

void expect_equals(char * a, const char * b) {
	EXPECT_STREQ(a, b);
	RecordProperties(a, b);
}

void expect_equals(const char * a, char * b) {
	EXPECT_STREQ(a, b);
	RecordProperties(a, b);
}

void expect_equals(const char * a, const char * b) {
	EXPECT_STREQ(a, b);
	RecordProperties(a, b);
}


// Generates the properties for the `output` and `expected` fields
// in the Primitive_visitor() regardless of their types.
template<typename T1, typename T2>
void RecordProperties(T1 a, T2 b) {
	std::ostringstream expected;
	std::ostringstream output;
	expected << a;
	output << b;
	::testing::Test::RecordProperty("output", output.str());
	::testing::Test::RecordProperty("expected", expected.str());
}

// Generates the properties for the `output` and `expected` fields
// in the Primitive_visitor() for floating point numbers.
// Use to_string() for number conversions as it matches what students see when they use printf.
//
// http://en.cppreference.com/w/cpp/string/basic_string/to_string
template<typename T1, typename T2>
void RecordFloatProperties(T1 a, T2 b) {
	std::ostringstream expected;
	std::ostringstream output;
	expected << std::to_string(a);
	output << std::to_string(b);
	::testing::Test::RecordProperty("output", output.str());
	::testing::Test::RecordProperty("expected", expected.str());
}

template<typename T1, typename T2>
void custom_evaluation(T1 expected, T2 expression);
