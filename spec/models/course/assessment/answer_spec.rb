require 'rails_helper'

RSpec.describe Course::Assessment::Answer do
  it { is_expected.to be_actable }
  it { is_expected.to belong_to(:submission) }
  it { is_expected.to belong_to(:question) }

  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    describe 'validations' do
      subject { build_stubbed(:course_assessment_answer) }

      describe '#question' do
        it 'validates that the assessment is consistent' do
          subject.question = build_stubbed(:course_assessment_question)
          expect(subject.question.assessment).not_to eq(subject.submission.assessment)
          expect(subject.valid?).to be(false)
          expect(subject.errors[:question]).to include(
            I18n.t('activerecord.errors.models.course/assessment/answer.attributes.question'\
              '.consistent_assessment'))
        end
      end
    end
  end
end
