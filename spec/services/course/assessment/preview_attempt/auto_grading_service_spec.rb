# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Course::Assessment::PreviewAttempt::AutoGradingService do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, :with_mcq_question, :autograded, course: course) }
    let(:attempt) do
      a = create(:course_assessment_preview_attempt, assessment: assessment, course: course)
      a.create_new_answers
      a.finalise!
      a
    end

    it 'grades every answer WITHOUT publishing (no EXP/publish tail)' do
      expect(attempt).to be_submitted

      described_class.grade(attempt)

      expect(attempt.answers.reload).to all(be_graded.or(be_evaluated))
      expect(attempt.reload).to be_submitted
    end

    it 'skips an answer left in the attempting state (never grades it)' do
      unfinalised = create(:course_assessment_preview_attempt, assessment: assessment, course: course)
      unfinalised.create_new_answers
      answer = unfinalised.answers.reload.first
      expect(answer).to be_attempting

      expect { described_class.grade(unfinalised) }.not_to raise_error

      expect(answer.reload).to be_attempting
    end

    context 'when the current answer grades asynchronously (programming)' do
      let(:assessment) { create(:assessment, :with_programming_question, :autograded, course: course) }

      with_active_job_queue_adapter(:test) do
        it 'enqueues a reduced-priority auto-grading job instead of grading inline' do
          expect { described_class.grade(attempt) }.
            to have_enqueued_job(Course::Assessment::Answer::ReducePriorityAutoGradingJob)
        end
      end
    end

    context 'when a Codaveri programming question is present (paid grader runs, NOT skipped)' do
      let(:assessment) { create(:assessment, :with_programming_question, :autograded, course: course) }

      before do
        assessment.questions.first.actable.update!(is_codaveri: true)
      end

      with_active_job_queue_adapter(:test) do
        it 'still routes the answer through auto_grade! (no inert short-circuit)' do
          expect { described_class.grade(attempt) }.
            to have_enqueued_job(Course::Assessment::Answer::ReducePriorityAutoGradingJob)
        end
      end
    end
  end
end
