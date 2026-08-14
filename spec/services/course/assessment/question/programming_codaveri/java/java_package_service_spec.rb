# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::ProgrammingCodaveri::Java::JavaPackageService do
  let(:generator) { Course::Assessment::Question::Programming::Java::JavaPackageService }
  let(:instructor_prepend) { "public class Foo {\n  // instructor prepend\n}" }

  # Mirrors how Course::Assessment::Question::Programming::Java::JavaPackageService#generate_zip_file
  # composes `tests/prepend`: the instructor's prepend, a newline, java_autograde_pre.java, and a
  # trailing newline.
  let(:prepend_file_content) do
    "#{instructor_prepend}\n#{File.read(generator::AUTOGRADE_PRE_PATH)}\n"
  end

  subject { described_class.new(nil, nil) }

  describe 'AUTOGRADE_DEFINITION_LENGTH' do
    it 'tracks the autograding definitions appended by the package generator' do
      expect(described_class::AUTOGRADE_DEFINITION_LENGTH).
        to eq(File.size(generator::AUTOGRADE_PRE_PATH) + 2)
    end
  end

  describe '.strip_autograding_definition_from' do
    it "keeps only the instructor's own prepend" do
      expect(subject.send(:strip_autograding_definition_from, prepend_file_content)).
        to eq("#{instructor_prepend}\n")
    end
  end

  describe '.extract_print_functions_from' do
    it 'extracts the print helpers and makes them static' do
      result = subject.send(:extract_print_functions_from, prepend_file_content)

      expect(result).to include('static String printValue')
      expect(result).not_to include('instructor prepend')
    end
  end
end
