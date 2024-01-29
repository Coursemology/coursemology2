# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::Scribing, type: :model do
  it { is_expected.to act_as(Course::Assessment::Question) }

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    describe '#attempt' do
      let(:course) { create(:course) }
      let(:student_user) { create(:course_student, course: course).user }
      let(:assessment) { create(:assessment, course: course) }
      let(:question) { create(:course_assessment_question_scribing, assessment: assessment) }
      let(:submission) { create(:submission, assessment: assessment, creator: student_user) }
      subject { question }

      it 'returns an Answer' do
        expect(subject.attempt(submission)).to be_a(Course::Assessment::Answer)
      end
    end

    describe '#question_type_readable' do
      subject { build(:course_assessment_question_scribing) }

      it 'returns correct question type' do
        expect(subject.question_type_readable).to eq I18n.t('course.assessment.question.scribing.question_type')
      end
    end
  end
end
