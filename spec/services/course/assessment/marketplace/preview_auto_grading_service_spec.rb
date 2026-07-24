# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Marketplace::PreviewAutoGradingService do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, :with_mcq_question, :autograded, course: course) }
    let(:previewer) { create(:course_manager, course: course).user }
    let(:other_previewer) { create(:course_manager, course: course).user }
    let(:attempt) do
      a = create(:course_assessment_attempt, assessment: assessment, creator: previewer)
      a.create_new_answers
      # Finalise via the ATTEMPT event (not answer.finalise!): workflow persistence is deferred
      # (lib/extensions/deferred_workflow_state_persistence), so a bare answer.finalise! is never
      # written without an explicit save!. Attempt#finalise finalises current answers correctly.
      a.finalise!
      # The Workflow gem persists the new workflow_state (via persist_workflow_state) only AFTER the
      # event's action callback (WorkflowEventConcern#finalise, which calls its own `save!`) returns —
      # see workflow-3.1.1's `process_event!`. A real Submission#finalise! papers over this with its
      # OWN trailing `save!`, autosave-cascaded onto `attempt` (submission.rb#253-257); a bare preview
      # Attempt has no such wrapper, so `workflow_state` would otherwise never reach the DB.
      a.save!
      a
    end

    with_active_job_queue_adapter(:test) do
      it 'grades every answer WITHOUT publishing (no EXP/publish tail)' do
        expect(attempt).to be_submitted

        described_class.grade(attempt)

        expect(attempt.answers.reload).to all(be_graded.or(be_evaluated))
        # The attempt itself is NOT advanced to graded/published — that tail is omitted.
        expect(attempt.reload).to be_submitted
      end

      it 'skips an answer left in the attempting state (never grades it)' do
        # Different creator: the unique (assessment, creator) index forbids two attempts for previewer.
        unfinalised = create(:course_assessment_attempt, assessment: assessment, creator: other_previewer)
        unfinalised.create_new_answers
        answer = unfinalised.answers.reload.first
        expect(answer).to be_attempting

        expect { described_class.grade(unfinalised) }.not_to raise_error

        expect(answer.reload).to be_attempting
      end

      it 'grades every current answer when there is more than one, not just the first' do
        # Guards the `.each` loop: a service that graded only `current_answers.first` passes every
        # single-question example above. `question_count: 2` is the assessment factory's transient.
        multi = create(:assessment, :with_mcq_question, :autograded, course: course, question_count: 2)
        multi_attempt = create(:course_assessment_attempt, assessment: multi, creator: other_previewer)
        multi_attempt.create_new_answers
        multi_attempt.finalise!
        expect(multi_attempt.current_answers.size).to eq(2)

        described_class.grade(multi_attempt)

        expect(multi_attempt.answers.reload).to all(be_graded.or(be_evaluated))
      end
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

      before { assessment.questions.first.actable.update!(is_codaveri: true) }

      with_active_job_queue_adapter(:test) do
        it 'still routes the answer through auto_grade! (no inert short-circuit)' do
          expect { described_class.grade(attempt) }.
            to have_enqueued_job(Course::Assessment::Answer::ReducePriorityAutoGradingJob)
        end
      end
    end
  end
end
