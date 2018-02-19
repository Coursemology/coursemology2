# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::Programming do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:course_user) { create(:course_student, course: course) }
    let(:assessment) { create(:assessment, :published, :with_programming_question, course: course) }
    let(:submission) { create(:submission, :submitted, assessment: assessment, creator: course_user.user) }
    let(:answer) { submission.answers.first.specific }
    let(:multiple_file_assessment) do
      create(:assessment, :published, :with_programming_file_submission_question, course: course)
    end

    context 'when the user is the creator of the submission' do
      subject { Ability.new(user, course, course_user) }
      let(:user) { course_user.user }

      it { is_expected.to be_able_to(:download, answer.files.first) }

      context 'when the assessment is multiple_file_submission' do
        let(:multiple_file_submission) do
          create(:submission, *submission_traits,
                 assessment: multiple_file_assessment, creator: course_user.user)
        end
        let(:answer) { multiple_file_submission.answers.first.specific }

        context 'when the submission is in the attempting state' do
          let(:submission_traits) { [:attempting] }

          it { is_expected.to be_able_to(:create_programming_files, answer) }
          it { is_expected.to be_able_to(:destroy_programming_file, answer) }
        end

        context 'when the submission is in the submitted state' do
          let(:submission_traits) { [:submitted] }

          it { is_expected.not_to be_able_to(:create_programming_files, answer) }
          it { is_expected.not_to be_able_to(:destroy_programming_file, answer) }
        end

        context 'when the submission is in the graded state' do
          let(:submission_traits) { [:graded] }

          it { is_expected.not_to be_able_to(:create_programming_files, answer) }
          it { is_expected.not_to be_able_to(:destroy_programming_file, answer) }
        end

        context 'when the submission is in the published state' do
          let(:submission_traits) { [:published] }

          it { is_expected.not_to be_able_to(:create_programming_files, answer) }
          it { is_expected.not_to be_able_to(:destroy_programming_file, answer) }
        end
      end

      context 'when the assessment is not multple_file_submission' do
        let(:assessment) do
          create(:assessment, :published_with_programming_question, course: course)
        end
        let(:submission) { create(:submission, :attempting, assessment: assessment, creator: user) }
        let(:answer) { submission.answers.first.specific }

        it { is_expected.not_to be_able_to(:create_programming_files, answer) }
        it { is_expected.not_to be_able_to(:destroy_programming_file, answer) }
      end
    end

    context 'when the user is not the creator of the submission' do
      subject { Ability.new(user, course, other_course_user) }
      let(:user) { other_course_user.user }

      context 'when the assessment is multple_file_submission' do
        let(:multiple_file_submission) do
          create(:submission, :attempting,
                 assessment: multiple_file_assessment, creator: course_user.user)
        end
        let(:answer) { multiple_file_submission.answers.first.specific }

        context 'when the user is a course student' do
          let(:other_course_user) { create(:course_student, course: course) }

          it { is_expected.not_to be_able_to(:create_programming_files, answer) }
          it { is_expected.not_to be_able_to(:destroy_programming_file, answer) }
          it { is_expected.not_to be_able_to(:download, answer.files.first) }
        end

        context 'when the user is a course staff' do
          let(:other_course_user) { create(:course_owner, course: course) }

          it { is_expected.not_to be_able_to(:create_programming_files, answer) }
          it { is_expected.not_to be_able_to(:destroy_programming_file, answer) }
          it { is_expected.to be_able_to(:download, answer.files.first) }
        end
      end
    end
  end
end
