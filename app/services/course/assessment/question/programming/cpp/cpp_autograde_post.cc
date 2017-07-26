GTEST_API_ int main(int argc, char **argv) {
	printf("Running main() from autograde.cc\n");
	testing::InitGoogleTest(&argc, argv);
	::testing::AddGlobalTestEnvironment(new GlobalEnv);
	return RUN_ALL_TESTS();
}

