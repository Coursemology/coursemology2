# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    subject { Ability.new(user) }
    let(:course) { create(:course) }
    let(:course_user) { create(:course_student, course: course) }
    let(:coursemate) { create(:course_student, course: course) }
    let(:unpublished_assessment) do
      create(:assessment, :with_all_question_types, course: course, published: false)
    end
    let(:published_started_assessment) do
      create(:assessment, :published_with_all_question_types, course: course)
    end
    let(:published_not_started_assessment) do
      create(:assessment, :published_with_all_question_types,
             start_at: 1.day.from_now, course: course)
    end
    let(:published_assessment_with_attemping_submission) do
      create(:assessment, :published_with_all_question_types, course: course)
    end
    let(:attempting_submission) do
      create(:submission, :attempting,
             assessment: published_assessment_with_attemping_submission, creator: course_user.user)
    end
    let(:submitted_submission) do
      create(:submission, :submitted,
             assessment: published_started_assessment, creator: course_user.user)
    end
    let(:coursemate_attempting_submission) do
      create(:submission, :attempting,
             assessment: published_started_assessment, creator: coursemate.user)
    end
    let(:coursemate_submitted_submission) do
      create(:submission, :submitted,
             assessment: published_started_assessment, creator: coursemate.user)
    end

    def get_text_response_answer_for(submission)
      submission.latest_answers.select do |ans|
        ans.specific.class == Course::Assessment::Answer::TextResponse
      end.first.specific
    end

    context 'when the user is a Course Student' do
      let(:user) { course_user.user }

      # Course Assessments
      it { is_expected.not_to be_able_to(:read, unpublished_assessment) }
      it { is_expected.to be_able_to(:read, published_started_assessment) }
      it { is_expected.to be_able_to(:read, published_not_started_assessment) }

      # Course Assessment Submissions
      it { is_expected.not_to be_able_to(:attempt, unpublished_assessment) }
      it { is_expected.not_to be_able_to(:attempt, published_not_started_assessment) }
      it { is_expected.to be_able_to(:attempt, published_started_assessment) }
      it { is_expected.to be_able_to(:create, attempting_submission) }
      it { is_expected.to be_able_to(:update, attempting_submission) }
      it { is_expected.to be_able_to(:read, submitted_submission) }
      it { is_expected.not_to be_able_to(:update, coursemate_attempting_submission) }
      it { is_expected.not_to be_able_to(:read, coursemate_submitted_submission) }

      it do
        is_expected.to be_able_to(:destroy_attachment,
                                  get_text_response_answer_for(attempting_submission))
      end
      it do
        is_expected.not_to be_able_to(:destroy_attachment,
                                      get_text_response_answer_for(submitted_submission))
      end
      it do
        is_expected.
          not_to be_able_to(:destroy_attachment,
                            get_text_response_answer_for(coursemate_attempting_submission))
      end

      context 'when the course is self directed' do
        let(:course) { create(:course, advance_start_at_duration_days: 3) }
        let(:published_not_started_assessment2) do
          create(:assessment, :published_with_mcq_question,
                 start_at: 7.days.from_now, course: course)
        end

        it { is_expected.to be_able_to(:attempt, published_not_started_assessment) }

        # This duration to this assessment's starting date is long that the max self directed time.
        it { is_expected.not_to be_able_to(:attempt, published_not_started_assessment2) }
      end
    end

    context 'when the user is a Course Teaching Assistant' do
      let(:user) { create(:course_teaching_assistant, course: course).user }
      it { is_expected.to be_able_to(:manage, published_started_assessment) }
      it { is_expected.not_to be_able_to(:publish_grades, published_started_assessment) }
      it do
        is_expected.not_to be_able_to(:destroy_attachment,
                                      get_text_response_answer_for(attempting_submission))
      end
    end

    context 'when the user is a Course Staff' do
      let(:user) { create(:course_manager, course: course).user }

      # Course Assessments
      it { is_expected.to be_able_to(:manage, unpublished_assessment) }
      it { is_expected.to be_able_to(:manage, published_started_assessment) }
      it { is_expected.to be_able_to(:publish_grades, published_started_assessment) }
      it 'can manage all questions in the assessment' do
        unpublished_assessment.questions.each do |question|
          expect(subject).to be_able_to(:manage, question.specific)
        end
      end

      # Course Assessment Submissions
      it { is_expected.to be_able_to(:read, attempting_submission) }
      it { is_expected.to be_able_to(:grade, attempting_submission) }
      it { is_expected.to be_able_to(:grade, submitted_submission) }

      it 'sees attempting submission for a given assessment' do
        expect(published_assessment_with_attemping_submission.submissions.accessible_by(subject)).
          to contain_exactly(attempting_submission)
      end

      it 'sees submitted submission for a given assessment' do
        expect(published_started_assessment.submissions.accessible_by(subject)).
          to contain_exactly(submitted_submission)
      end
    end
  end
end
