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
    # @return [Float|nil] The duration for the test suite, nil if the duration was not recorded.
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
    # @return [Float|nil] The duration for the test case, nil if not recorded.
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

    # The test expression
    #
    # @return [String]
    def expression
      @expression ||= get_test_case_metadata('expression')
    end

    # The expected value from running the test expression
    #
    # @return [String]
    def expected
      @expected ||= get_test_case_metadata('expected')
    end

    # A hint to help the student pass the test case
    #
    # @return [String]
    def hint
      @hint ||= get_test_case_metadata('hint')
    end

    # The output from the function under test.
    # Needs to be initialized by the test code.
    #
    # @return [String]
    def output
      @output ||= get_test_case_metadata('output')
    end

    # If there's an error, return the error type and error message.
    #
    # @return [String|nil] A combined string with the error type and error message, nil if no error.
    def error_message
      return nil unless errored?
      error_body = @test_case.search('error')[0]['message']
      "#{error_type}: #{error_body}"
    end

    # If there's a error, return the contents of the error tag.
    # This contains the full traceback.
    #
    # @return [String|nil] Full traceback of error, or nil if there's no error.
    def error_contents
      return nil unless errored?
      @test_case.search('error')[0].children.to_s
    end

    # If there's an error, return the error type attribute.
    #
    # @return [String|nil] The type attribute, nil if no error.
    def error_type
      return nil unless errored?
      @test_case.search('error')[0]['type']
    end

    # If there's a failure, return the failure type and failure message.
    #
    # @return [String|nil] A combined string with the failure type and failure message,
    # nil if no failure.
    def failure_message
      return nil unless failed?
      failure_body = @test_case.search('failure')[0]['message']
      "#{failure_type}: #{failure_body}"
    end

    # If there's a failure, return the contents of the failure tag.
    # This contains the full traceback.
    #
    # @return [String|nil] Full traceback of failure, nil if there's no failure.
    def failure_contents
      return nil unless failed?
      @test_case.search('failure')[0].children.to_s
    end

    # If there's a failure, return the failure type attribute.
    #
    # @return [String|nil] The type attribute, nil if there's no failure.
    def failure_type
      return nil unless failed?
      @test_case.search('failure')[0]['type']
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

    # Combines the different strings above into a hash
    #
    # @return [Hash]
    def messages
      # prune empty and nil values
      # error_contents and failure_contents are only being stored and not displayed on the interface
      @messages ||= {
        'error': error_message,
        'error_contents': error_contents,
        'hint': hint,
        'failure': failure_message,
        'failure_contents': failure_contents,
        'output': output
      }.reject! { |_, v| v.blank? }
    end

    private

    # Looks for the metadata attribute value in the test case XML.
    # This can be stored either as attributes of the test case XML tag
    # or as attributes of a child meta tag.
    #
    # @param [String] attribute_name The name of the attribute to retrieve.
    # @return [String]
    def get_test_case_metadata(attribute_name)
      meta = @test_case.search('meta')
      if meta.present? && meta[0][attribute_name]
        meta[0][attribute_name]
      else
        @test_case[attribute_name] || ''
      end
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
