# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Course::Assessment abilities in a course linked to Koditsu v1' do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course, koditsu_v1_workspace_id: v1_workspace_id) }
    let(:v1_workspace_id) { '670040c49a72e414c8f04bd7' }
    let(:student) { create(:course_student, course: course) }
    let(:assessment) do
      create(:assessment, :published_with_mcq_question, course: course, is_koditsu_enabled: koditsu_enabled)
    end
    let(:koditsu_enabled) { true }
    let!(:submission) do
      create(:submission, :attempting, assessment: assessment, creator: student.user, course_user: student)
    end
    let(:answer) { submission.answers.first }
    let(:new_submission) { assessment.submissions.new(creator: student.user, course_user: student) }

    subject { Ability.new(student.user, course, student) }

    # The Koditsu component is left at its default (off) throughout. The rules read only the course's v1 link, so they
    # must hold while it is off too: some v1-linked courses have since switched it off, and without the rules their
    # Koditsu assessments would open as plain Coursemology attempts.
    context 'for a Koditsu assessment' do
      it 'blocks starting an attempt' do
        is_expected.not_to be_able_to(:create, new_submission)
      end

      it 'blocks continuing an attempt' do
        is_expected.not_to be_able_to(:update, submission)
        is_expected.not_to be_able_to(:update, answer)
        is_expected.not_to be_able_to(:submit_answer, answer)
      end

      it 'still allows reading the submission' do
        is_expected.to be_able_to(:read, submission)
      end

      context 'for a manager' do
        let(:manager) { create(:course_manager, course: course) }

        subject { Ability.new(manager.user, course, manager) }

        it { is_expected.not_to be_able_to(:force_submit_assessment_submission, assessment) }
        it { is_expected.to be_able_to(:update, submission) }
      end

      # Their grants (`can :manage`) come after the course roles', so the rule must come after those.
      context 'for an instance administrator not enrolled in the course' do
        let(:instance_administrator) { create(:instance_administrator) }

        subject { Ability.new(instance_administrator.user, course, nil, instance_administrator) }

        it { is_expected.not_to be_able_to(:force_submit_assessment_submission, assessment) }
        it { is_expected.to be_able_to(:manage, assessment) }
      end

      context 'for a system administrator' do
        subject { Ability.new(create(:administrator), course) }

        it { is_expected.not_to be_able_to(:force_submit_assessment_submission, assessment) }
      end
    end

    context 'for an assessment outside Koditsu mode' do
      let(:koditsu_enabled) { false }

      it 'is unaffected' do
        is_expected.to be_able_to(:create, new_submission)
        is_expected.to be_able_to(:update, submission)
        is_expected.to be_able_to(:update, answer)
        is_expected.to be_able_to(:submit_answer, answer)
      end

      context 'for a manager' do
        let(:manager) { create(:course_manager, course: course) }

        subject { Ability.new(manager.user, course, manager) }

        it { is_expected.to be_able_to(:force_submit_assessment_submission, assessment) }
      end
    end

    context 'when the course is not linked to Koditsu v1' do
      let(:v1_workspace_id) { nil }

      it 'leaves Koditsu assessments attemptable' do
        is_expected.to be_able_to(:create, new_submission)
        is_expected.to be_able_to(:update, submission)
        is_expected.to be_able_to(:update, answer)
      end

      context 'for a manager' do
        let(:manager) { create(:course_manager, course: course) }

        subject { Ability.new(manager.user, course, manager) }

        it { is_expected.to be_able_to(:force_submit_assessment_submission, assessment) }
      end
    end
  end
end
