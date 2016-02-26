# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::ProgrammingFile do
  it { is_expected.to belong_to(:answer).class_name(Course::Assessment::Answer::Programming.name) }
  it 'has many annotations' do
    expect(subject).to have_many(:annotations).
      class_name(Course::Assessment::Answer::ProgrammingFileAnnotation.name).
      dependent(:destroy)
  end

  let(:instance) { create(:instance) }
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
  end
end
