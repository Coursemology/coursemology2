# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    subject { Ability.new(user) }
    let(:course) { create(:course) }
    let(:course_user) { create(:course_student, course: course) }
    let(:coursemate) { create(:course_student, course: course) }
    let(:draft_assessment) do
      create(:assessment, :with_all_question_types, course: course, draft: true)
    end
    let(:published_assessment) do
      create(:assessment, :published_with_all_question_types, course: course)
    end
    let(:published_assessment_with_attemping_submission) do
      create(:assessment, :published_with_all_question_types, course: course)
    end
    let(:attempting_submission) do
      create(:submission, :attempting,
             assessment: published_assessment_with_attemping_submission, creator: course_user.user)
    end
    let(:submitted_submission) do
      create(:submission, :submitted, assessment: published_assessment, creator: course_user.user)
    end
    let(:coursemate_attempting_submission) do
      create(:submission, :attempting, assessment: published_assessment, creator: coursemate.user)
    end
    let(:coursemate_submitted_submission) do
      create(:submission, :submitted, assessment: published_assessment, creator: coursemate.user)
    end

    context 'when the user is a Course Student' do
      let(:user) { course_user.user }

      # Course Assessments
      it { is_expected.not_to be_able_to(:read, draft_assessment) }
      it { is_expected.to be_able_to(:read, published_assessment) }

      # Course Assessment Submissions
      it { is_expected.not_to be_able_to(:attempt, draft_assessment) }
      it { is_expected.to be_able_to(:attempt, published_assessment) }
      it { is_expected.to be_able_to(:create, attempting_submission) }
      it { is_expected.to be_able_to(:update, attempting_submission) }
      it { is_expected.to be_able_to(:read, submitted_submission) }
      it { is_expected.not_to be_able_to(:update, coursemate_attempting_submission) }
      it { is_expected.not_to be_able_to(:read, coursemate_submitted_submission) }
    end

    context 'when the user is a Course Staff' do
      let(:user) { create(:course_manager, course: course).user }

      # Course Assessments
      it { is_expected.to be_able_to(:manage, draft_assessment) }
      it { is_expected.to be_able_to(:manage, published_assessment) }
      it 'can manage all questions in the assessment' do
        draft_assessment.questions.each do |question|
          expect(subject).to be_able_to(:manage, question.specific)
        end
      end

      # Course Assessment Submissions
      it { is_expected.to be_able_to(:read, attempting_submission) }
      it { is_expected.not_to be_able_to(:grade, attempting_submission) }
      it { is_expected.to be_able_to(:grade, submitted_submission) }

      it 'sees attempting submission for a given assessment' do
        expect(published_assessment_with_attemping_submission.submissions.accessible_by(subject)).
          to contain_exactly(attempting_submission)
      end

      it 'sees submitted submission for a given assessment' do
        expect(published_assessment.submissions.accessible_by(subject)).
          to contain_exactly(submitted_submission)
      end
    end
  end
end
