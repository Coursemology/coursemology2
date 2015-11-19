require 'rails_helper'

RSpec.describe Course::Assessment::Question::Programming do
  it { is_expected.to act_as(:question) }
  it 'belongs to an import job' do
    expect(subject).to belong_to(:import_job).
      class_name(TrackableJob::Job.name)
  end

  it 'has many template files' do
    expect(subject).to have_many(:template_files).
      class_name(Course::Assessment::Question::ProgrammingTemplateFile.name)
  end

  it 'has many test cases' do
    expect(subject).to have_many(:test_cases).
      class_name(Course::Assessment::Question::ProgrammingTestCase.name)
  end

  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    describe 'validations' do
      describe '#language' do
        it 'is a valid language'
      end
    end
  end
end
