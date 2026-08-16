# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course::Assessment late submission abilities' do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:student) { create(:course_student, course: course) }
    let(:assessment) do
      create(:assessment, :published_with_mcq_question, course: course,
                                                        end_at: end_at, is_late_submission_allowed: late_allowed)
    end
    let!(:submission) do
      create(:submission, :attempting, assessment: assessment,
                                       creator: student.user, course_user: student)
    end
    let(:answer) { submission.answers.first }

    subject(:student_ability) { Ability.new(student.user, course, student) }

    context 'when late submissions are disallowed and the deadline has passed' do
      let(:late_allowed) { false }
      let(:end_at) { 1.hour.ago }

      it { is_expected.not_to be_able_to(:update, submission) }
      it { is_expected.not_to be_able_to(:update, answer) }
      it { is_expected.not_to be_able_to(:submit_answer, answer) }

      context 'when the submission has been unsubmitted' do
        before { submission.update_column(:unsubmitted_at, Time.zone.now) }

        it 'is editable again despite the passed deadline' do
          is_expected.to be_able_to(:update, submission)
          is_expected.to be_able_to(:update, answer)
          is_expected.to be_able_to(:submit_answer, answer)
        end
      end

      it 'still allows reading the submission' do
        is_expected.to be_able_to(:read, submission)
      end

      it 'still allows viewing the assessment materials' do
        is_expected.to be_able_to(:attempt, assessment)
      end

      context 'for a manager grading the submission' do
        let(:manager) { create(:course_manager, course: course) }

        subject { Ability.new(manager.user, course, manager) }

        it { is_expected.to be_able_to(:update, submission) }
        it { is_expected.to be_able_to(:update, answer) }
      end
    end

    context 'when late submissions are disallowed but the deadline is in the future' do
      let(:late_allowed) { false }
      let(:end_at) { 1.hour.from_now }

      it { is_expected.to be_able_to(:update, submission) }
      it { is_expected.to be_able_to(:update, answer) }
    end

    context 'when the deadline just passed but is within the force-submit grace period' do
      let(:late_allowed) { false }
      let(:end_at) { 1.minute.ago }

      it 'still allows the client force-submit to finalise' do
        is_expected.to be_able_to(:update, submission)
        is_expected.to be_able_to(:update, answer)
      end
    end

    context 'when late submissions are allowed and the deadline has passed' do
      let(:late_allowed) { true }
      let(:end_at) { 1.hour.ago }

      it { is_expected.to be_able_to(:update, submission) }
      it { is_expected.to be_able_to(:update, answer) }
    end
  end
end
