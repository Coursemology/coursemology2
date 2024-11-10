# frozen_string_literal: true
# rubocop:disable Metrics/AbcSize
class Course::Assessment::ProgrammingTestCaseReportBuilder
  def self.build_dummy_report(test_type, test_cases)
    builder = Nokogiri::XML::Builder.new do |xml|
      xml.testsuites do
        xml.testsuite(
          name: "#{test_type.capitalize}TestsGrader",
          tests: test_cases.count.to_s,
          file: '.R',
          time: '0.01',
          timestamp: Time.now.iso8601,
          failures: 0.to_s,
          errors: test_cases.count.to_s
        ) do
          test_cases.each.with_index(1) do |test_case, index|
            xml.testcase(
              classname: "#{test_type.capitalize}TestsGrader",
              name: "test_#{test_type}_#{format('%<index>02i', index: index)}",
              time: '0.00001',
              timestamp: Time.now.iso8601,
              file: 'answer.R',
              line: '1'
            ) do
              xml.meta(expression: test_case[:expression], expected: test_case[:expected], hint: test_case[:hint])
              xml.error(type: 'NotImplementedError', message: 'This is a dummy report, so this test was not run.')
            end
          end
        end
      end
    end

    builder.to_xml
  end
end
# rubocop:enable Metrics/AbcSize
