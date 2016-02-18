# frozen_string_literal: true
# Represents a Programming Question test report.
#
# We adopt the JUnit XML format (documented at
# http://help.catchsoftware.com/display/ET/JUnit+Format) so that evaluations can be run in any
# language.
class Course::Assessment::ProgrammingTestCaseReport
  class TestSuite
    # Creates a new test suite. This represents a \<testsuite> element.
    #
    # @param [Nokogiri::XML::Element] suite
    def initialize(suite)
      @suite = suite
    end

    # The name of the test suite.
    #
    # @return [String]
    def name
      @suite['name']
    end

    # The identifier for the test suite.
    #
    # @return [String]
    def identifier
      name
    end

    # The duration for running the test suite.
    #
    # @return [Float] The duration for the test suite.
    # @return [nil] If the duration was not recorded.
    def duration
      @duration ||= begin
        duration = @suite['time']
        duration ? duration.to_f : nil
      end
    end

    # Gets the test cases found in this test suite.
    #
    # @return [Enumerable<Course::Assessment::ProgrammingTestCaseReport::TestCase>]
    def test_cases
      @suite.search('./testcase').map do |test_case|
        TestCase.new(self, test_case)
      end
    end
  end

  class TestCase
    attr_reader :test_suite

    # Creates a new test case. This represents a \<testcase> element.
    #
    # @param [Course::Assessment::ProgrammingTestCaseReport::TestSuite] test_suite The suite this
    #   test case belongs to.
    # @param [Nokogiri::XML::Element] test_case
    def initialize(test_suite, test_case)
      @test_suite = test_suite
      @test_case = test_case
    end

    # The name of the class.
    #
    # @return [String]
    def class_name
      @test_case['classname']
    end

    # The name of the test case.
    #
    # @return [String]
    def name
      @test_case['name']
    end

    # The duration for running the test case.
    #
    # @return [Float] The duration for the test case.
    # @return [nil] If the duration was not recorded.
    def duration
      @duration ||= begin
        duration = @test_case['time']
        duration ? duration.to_f : nil
      end
    end

    # The identifier for this test case. This attempts to be unique, but it might not be.
    #
    # @return [String]
    def identifier
      class_name = self.class_name ? self.class_name + '/' : ''
      "#{@test_suite.identifier}/#{class_name}#{name.underscore}"
    end

    # Checks if the test case encountered an error.
    #
    # @return [Boolean]
    def errored?
      !@test_case.search('./error').empty?
    end

    # Checks if the test case was skipped.
    #
    # @return [Boolean]
    def skipped?
      !@test_case.search('./skipped').empty?
    end

    # Checks if the test case has failed.
    #
    # @return [Boolean]
    def failed?
      !@test_case.search('./failure').empty?
    end

    # Checks if the test case has passed.
    #
    # @return [Boolean]
    def passed?
      !failed? && !skipped? && !errored?
    end
  end

  # Parses a test case report.
  #
  # @param [String] report The report XML to parse.
  def initialize(report)
    @report = Nokogiri::XML::Document.parse(report)
  end

  # Gets the set of test suites found in this report.
  #
  # @return [Enumerable<Course::Assessment::ProgrammingTestCaseReport::TestSuite>]
  def test_suites
    @report.search('./testsuites/testsuite|./testsuite').map do |suite|
      TestSuite.new(suite)
    end
  end

  # Gets the set of test cases in this report.
  #
  # @return [Enumerable<Course::Assessment::ProgrammingTestCaseReport::TestCase>]
  def test_cases
    test_suites.map(&:test_cases).tap(&:flatten!)
  end
end
