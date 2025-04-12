# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::ProgrammingFile do
  it 'belongs to a answer' do
    expect(subject).to belong_to(:answer).
      class_name(Course::Assessment::Answer::Programming.name).
      inverse_of(:files).
      without_validating_presence
  end
  it 'has many annotations' do
    expect(subject).to have_many(:annotations).
      class_name(Course::Assessment::Answer::ProgrammingFileAnnotation.name).
      dependent(:destroy)
  end

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    subject { build_stubbed(:course_assessment_answer_programming_file) }

    describe 'validations' do
      describe '#filename' do
        it 'normalises the filename' do
          subject.filename = 'test\\b.txt'
          expect(subject.valid?).to be(true)
          expect(subject.filename).to eq('test/b.txt')
        end
      end
    end

    describe '#lines' do
      let(:file) do
        content = (0..10).to_a.join("\n")
        create(:course_assessment_answer_programming_file, content: content)
      end
      let(:line_numbers) { 0..5 }
      subject { file.lines(line_numbers) }

      it { is_expected.to eq((0..5).map(&:to_s)) }

      context 'when line_numbers is not specified' do
        it 'returns all the lines' do
          expect(file.lines).to eq((0..10).map(&:to_s))
        end
      end

      context 'when start line is less than 0' do
        let(:line_numbers) { -1..5 }
        it { is_expected.to eq((0..5).map(&:to_s)) }
      end

      context 'when end line is greater than total lines' do
        let(:line_numbers) { 0..30 }
        it { is_expected.to eq((0..10).map(&:to_s)) }
      end

      context 'when end line is not covered in range' do
        let(:line_numbers) { 0...10 }
        it { is_expected.to eq((0..9).map(&:to_s)) }
      end

      context 'when line_numbers is a integer' do
        let(:line_numbers) { 1 }

        it { is_expected.to eq('1') }
      end
    end
  end
end
