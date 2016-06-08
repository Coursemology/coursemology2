# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment do
  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    subject { Ability.new(user) }
    let(:course) { create(:course) }
    let(:course_user) { create(:course_student, :approved, course: course) }
    let(:assessment) do
      create(:course_assessment_assessment, :with_all_question_types, course: course)
    end
    let(:attempting_submission) do
      create(:submission, :attempting, assessment: assessment, creator: course_user.user)
    end
    let(:submitted_submission) do
      create(:submission, :submitted, assessment: assessment, creator: course_user.user)
    end

    context 'when the user is a Course Student' do
      let(:user) { course_user.user }

      # Course Assessments
      it { is_expected.to be_able_to(:read, assessment) }

      # Course Assessment Submissions
      it { is_expected.to be_able_to(:attempt, assessment) }
      it { is_expected.to be_able_to(:create, attempting_submission) }
      it { is_expected.to be_able_to(:update, attempting_submission) }
      it { is_expected.to be_able_to(:read, submitted_submission) }
    end

    context 'when the user is a Course Staff' do
      let(:user) { create(:course_manager, :approved, course: course).user }

      # Course Assessments
      it { is_expected.to be_able_to(:manage, assessment) }
      it 'can manage all questions in the assessment' do
        assessment.questions.each do |question|
          expect(subject).to be_able_to(:manage, question.specific)
        end
      end

      # Course Assessment Submissions
      it { is_expected.to be_able_to(:read, attempting_submission) }
      it { is_expected.not_to be_able_to(:grade, attempting_submission) }
      it { is_expected.to be_able_to(:grade, submitted_submission) }

      it 'sees all submissions for a given assessment' do
        expect(assessment.submissions.accessible_by(subject)).
          to contain_exactly(attempting_submission, submitted_submission)
      end
    end
  end
end
