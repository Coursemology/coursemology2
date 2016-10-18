# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission::AutoGradingService do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:student_user) { create(:course_student, course: course).user }
    let(:assessment) { create(:assessment, :published_with_mrq_question, course: course) }
    let(:question) { assessment.questions.first.specific }
    let(:submission) { create(:submission, assessment: assessment, creator: student_user) }
    let(:answer) do
      create(:course_assessment_answer_multiple_response, :submitted,
             question: question.acting_as, submission: submission).answer
    end
    # let(:question) { answer.question.specific }

    describe '#grade' do
      it 'grades all answers' do
        answer
        expect(subject.grade(submission)).to eq(true)

        expect(submission.answers.map(&:reload).all?(&:graded?)).to be(true)
      end

      context 'when given a non-auto gradable answer' do
        let(:non_autograded_question) do
          create(:course_assessment_question_programming, assessment: assessment)
        end
        let!(:answer) do
          create(:course_assessment_answer_programming, :submitted,
                 question: non_autograded_question.acting_as, submission: submission).answer
        end
        it 'does not grade the answer' do
          answer
          expect(subject.grade(submission)).to eq(true)

          gradable_answers = submission.answers.reject { |answer| answer.question.auto_gradable? }
          expect(gradable_answers).not_to be_empty
          expect(gradable_answers.map(&:reload).all?(&:graded?)).to be(false)
        end
      end

      context 'when assessment is autograded' do
        let(:assessment) do
          create(:assessment, :published_with_mcq_question, :autograded,
                 course: course, question_count: 2)
        end
        let(:submission) { create(:submission, assessment: assessment, creator: student_user) }
        before do
          # Create one correct and one wrong answer.
          create(:course_assessment_answer_multiple_response, :with_all_correct_options,
                 question: assessment.questions.first,
                 submission: submission)
          create(:course_assessment_answer_multiple_response, :with_all_wrong_options,
                 question: assessment.questions.last,
                 submission: submission)
          submission.finalise!
          submission.save!
          subject.grade(submission)
        end

        it 'gives the correct experience points' do
          expect(submission).to be_published

          correct_exp = (assessment.time_bonus_exp + assessment.base_exp).to_f / 2
          expect(submission.points_awarded).to eq(correct_exp.to_i)
        end
      end
    end

    context 'when a sub job fails' do
      before do
        def subject.aggregate_failures(jobs)
          jobs.each_with_index do |job, i|
            job.status = :errored
            job.error = { 'message' => i }
          end

          super
        end
      end

      it 'fails with a SubJobError' do
        answer
        expect { subject.grade(submission) }.to \
          raise_error(Course::Assessment::Submission::AutoGradingService::SubJobError, '0')
      end
    end
  end
end
