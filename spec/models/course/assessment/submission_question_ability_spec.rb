# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::SubmissionQuestion do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:course_user) { create(:course_student, course: course) }
    let(:assessment) do
      create(:assessment, :published, :with_all_question_types, course: course)
    end
    let(:attempting_submission) do
      create(:submission, :attempting, assessment: assessment, creator: course_user.user)
    end
    let(:submission_question) do
      create(:submission_question, submission: attempting_submission, question: assessment.questions.first)
    end

    context 'when the User is the creator of the submission' do
      subject { Ability.new(user, course, course_user) }
      let(:user) { course_user.user }

      it { is_expected.to be_able_to(:past_answers, submission_question) }
    end

    context 'when the User is a not the creator of the submission' do
      subject { Ability.new(user, course, other_course_user) }
      let(:user) { other_course_user.user }

      context 'when the User is a Course Student' do
        let(:other_course_user) { create(:course_student, course: course) }

        it { is_expected.not_to be_able_to(:past_answers, submission_question) }
      end

      context 'when the User is a Course Staff' do
        let(:other_course_user) { create(:course_owner, course: course) }

        it { is_expected.to be_able_to(:past_answers, submission_question) }
      end
    end
  end
end
