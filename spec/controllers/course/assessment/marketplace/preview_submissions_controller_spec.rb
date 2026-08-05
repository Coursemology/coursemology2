# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Marketplace::PreviewSubmissionsController, type: :controller do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:preview_course) { create(:course, preview: true) }
    let(:assessment) { create(:assessment, :with_mcq_question, course: preview_course) }
    let(:question) { assessment.questions.first.actable }
    let(:previewer) { create(:user) }
    let!(:previewer_course_user) { create(:course_manager, course: preview_course, user: previewer) }

    before { controller_sign_in(controller, previewer) }

    describe 'PATCH #update' do
      subject do
        patch :update, params: { course_id: preview_course, assessment_id: assessment, format: :json }
      end

      context 'when the previewer has a submission for this assessment' do
        let!(:submission) do
          create(:submission, :attempting, assessment: assessment, course: preview_course, creator: previewer)
        end
        let!(:original_answer) do
          answer = submission.reload.answers.first.specific
          answer.options << question.options.first
          answer.save!
          answer
        end

        it 'does not destroy the submission row' do
          expect { subject }.
            not_to(change { Course::Assessment::Submission.exists?(submission.id) })
        end

        it 'clears the current answer back to blank, destroying the old one outright' do
          # `original_answer` is the MultipleResponse actable, not the base Answer — resolve back to
          # the base Answer's own id (`acting_as`, aliased by the `acts_as` macro) BEFORE calling
          # `subject`: the two records live in different tables with unrelated ids, and once the
          # base Answer is destroyed, `original_answer.acting_as` can no longer look it up.
          original_base_answer_id = original_answer.acting_as.id

          expect { subject }.not_to(change { submission.reload.answers.count })

          submission.reload
          expect(submission.current_answers.length).to eq(1)

          new_current_answer = submission.current_answers.first.specific
          expect(new_current_answer.id).not_to eq(original_answer.id)
          expect(new_current_answer.option_ids).to be_empty

          expect { Course::Assessment::Answer.find(original_base_answer_id) }.
            to raise_error(ActiveRecord::RecordNotFound)
        end

        it 'leaves an already-attempting submission in the attempting state' do
          expect(submission.workflow_state).to eq('attempting')
          subject
          expect(submission.reload.workflow_state).to eq('attempting')
        end

        it 'responds with no content' do
          subject
          expect(response).to have_http_status(:no_content)
        end
      end

      # Submission#reset_preview_answers loops over `current_answers`, one per question. A fixture
      # with only one question cannot tell that loop apart from one that resets just the first answer.
      context 'when the assessment has more than one question' do
        let(:two_question_assessment) do
          create(:assessment, :with_mcq_question, question_count: 2, course: preview_course)
        end
        let!(:submission) do
          create(:submission, :attempting, assessment: two_question_assessment, course: preview_course,
                                           creator: previewer)
        end

        subject do
          patch :update, params: { course_id: preview_course, assessment_id: two_question_assessment,
                                   format: :json }
        end

        it 'replaces every current answer, not just the first' do
          old_answer_ids = submission.reload.current_answers.map(&:id)
          expect(old_answer_ids.length).to eq(2)

          subject

          submission.reload
          expect(submission.current_answers.length).to eq(2)
          expect(Course::Assessment::Answer.where(id: old_answer_ids)).to be_empty
        end
      end

      # The user's real bug report: for a programming question, the old current answer's
      # auto-grading record (stdout/stderr/exit code) and its per-test-case pass/fail rows must not
      # survive a reset either — otherwise the "Past Answers" list and old test results still show
      # up on the freshly-reset page.
      context "when the previewer's current answer has programming test-case run results (auto-grading)" do
        let(:programming_assessment) { create(:assessment, :with_programming_question, course: preview_course) }
        let!(:submission) do
          create(:submission, :attempting, assessment: programming_assessment, course: preview_course,
                                           creator: previewer)
        end
        let(:programming_answer) { submission.reload.answers.first }
        let!(:auto_grading) do
          create(:course_assessment_answer_programming_auto_grading, answer: programming_answer)
        end
        let!(:test_result) do
          create(:course_assessment_answer_programming_auto_grading_test_result, :failed, auto_grading: auto_grading)
        end

        subject do
          patch :update, params: { course_id: preview_course, assessment_id: programming_assessment, format: :json }
        end

        it 'destroys the old answer, its auto-grading record, and its test-case results' do
          programming_answer_id = programming_answer.id
          auto_grading_id = auto_grading.id
          test_result_id = test_result.id

          subject

          expect { Course::Assessment::Answer.find(programming_answer_id) }.
            to raise_error(ActiveRecord::RecordNotFound)
          expect { Course::Assessment::Answer::ProgrammingAutoGrading.find(auto_grading_id) }.
            to raise_error(ActiveRecord::RecordNotFound)
          expect { Course::Assessment::Answer::ProgrammingAutoGradingTestResult.find(test_result_id) }.
            to raise_error(ActiveRecord::RecordNotFound)
        end
      end

      # A previewer holds `can :manage` on their own submission inside the sandbox, so they can
      # finalise and then unsubmit — and unsubmit demotes the old answer to non-current instead of
      # destroying it. Those leftover rows ARE the "Past Answers" trace the reset exists to erase,
      # so they must go too, not just the current answer.
      context 'when the previewer already has past (non-current) answers' do
        let!(:submission) do
          create(:submission, :attempting, assessment: assessment, course: preview_course, creator: previewer)
        end
        # Built by hand rather than with the `:attempting_with_past_answers` trait: that trait's
        # `questions.attempt(submission)` REUSES an existing current answer instead of building a
        # second one (QuestionsConcern#attempt:15), so it demotes the only answer there is and
        # leaves the submission with a past answer and no current one.
        let!(:past_answer) do
          answer = assessment.questions.first.attempt(submission)
          answer.current_answer = false
          answer.save!
          answer
        end

        it 'destroys the past answers too, leaving one fresh blank current answer' do
          past_answer_id = past_answer.id
          expect(submission.reload.answers.count).to eq(2)

          expect { subject }.to change { submission.reload.answers.count }.from(2).to(1)

          expect(Course::Assessment::Answer.where(id: past_answer_id)).to be_empty
          expect(submission.current_answers.length).to eq(1)
        end
      end

      context 'when the submission was already submitted (past attempting)' do
        let!(:submission) do
          create(:submission, :submitted, assessment: assessment, course: preview_course, creator: previewer)
        end

        it 'forces the workflow_state back to attempting' do
          expect(submission.workflow_state).to eq('submitted')
          subject
          expect(submission.reload.workflow_state).to eq('attempting')
        end

        it 'clears submitted_at' do
          expect(submission.submitted_at).not_to be_nil
          subject
          expect(submission.reload.submitted_at).to be_nil
        end
      end

      context 'when the submission was graded but not yet published' do
        let!(:submission) do
          create(:submission, :graded, assessment: assessment, course: preview_course, creator: previewer)
        end

        it 'forces the workflow_state back to attempting and clears the draft grade' do
          expect(submission.workflow_state).to eq('graded')
          expect(submission.draft_points_awarded).not_to be_nil

          subject
          submission.reload

          expect(submission.workflow_state).to eq('attempting')
          expect(submission.draft_points_awarded).to be_nil
        end
      end

      context 'when the submission was already graded and published' do
        let!(:submission) do
          create(:submission, :published, assessment: assessment, course: preview_course, creator: previewer)
        end

        it 'forces the workflow_state back to attempting' do
          subject
          expect(submission.reload.workflow_state).to eq('attempting')
        end

        it 'clears all grading/publishing attributes' do
          expect(submission.points_awarded).not_to be_nil
          expect(submission.draft_points_awarded).not_to be_nil
          expect(submission.awarded_at).not_to be_nil
          expect(submission.awarder).not_to be_nil
          expect(submission.publisher).not_to be_nil
          expect(submission.published_at).not_to be_nil

          subject
          submission.reload

          expect(submission.points_awarded).to be_nil
          expect(submission.draft_points_awarded).to be_nil
          expect(submission.awarded_at).to be_nil
          expect(submission.awarder).to be_nil
          expect(submission.submitted_at).to be_nil
          expect(submission.publisher).to be_nil
          expect(submission.published_at).to be_nil
        end
      end

      context 'when the current previewer has no submission for this assessment' do
        it 'responds not found' do
          subject
          expect(response).to have_http_status(:not_found)
        end
      end

      # The submission is looked up through `@assessment.submissions`, never by an id from the
      # client, so a submission the previewer owns for a DIFFERENT assessment in the same sandbox
      # must not be reachable through this route either.
      context 'when the previewer only has a submission for another assessment in the same course' do
        let(:other_assessment) { create(:assessment, :with_mcq_question, course: preview_course) }
        let!(:other_assessment_submission) do
          create(:submission, :submitted, assessment: other_assessment, course: preview_course, creator: previewer)
        end

        it 'responds not found' do
          subject
          expect(response).to have_http_status(:not_found)
        end

        it "does not reset the other assessment's submission" do
          subject
          expect(other_assessment_submission.reload.workflow_state).to eq('submitted')
        end
      end

      # The container course is shared by every previewer, and every previewer is enrolled as
      # `manager` — which under Course::Assessment::AssessmentAbility grants `:delete_submission`
      # on ANY submission in the course, not just their own. This is the single riskiest scoping
      # question in this feature, so it gets its own dedicated set of examples.
      context "when another previewer's submission exists for the same assessment" do
        let(:other_previewer) { create(:user) }
        let!(:other_course_user) { create(:course_manager, course: preview_course, user: other_previewer) }
        let!(:other_submission) do
          create(:submission, :attempting, assessment: assessment, course: preview_course, creator: other_previewer)
        end

        it "does not touch the other previewer's submission" do
          other_workflow_state_before = other_submission.workflow_state
          other_answer_count_before = other_submission.answers.count

          subject

          other_submission.reload
          expect(other_submission.workflow_state).to eq(other_workflow_state_before)
          expect(other_submission.answers.count).to eq(other_answer_count_before)
        end

        it 'responds not found (the current previewer has nothing of their own to reset)' do
          subject
          expect(response).to have_http_status(:not_found)
        end
      end

      context 'when both the current previewer and another previewer have their own submissions' do
        let(:other_previewer) { create(:user) }
        let!(:other_course_user) { create(:course_manager, course: preview_course, user: other_previewer) }
        let!(:own_submission) do
          create(:submission, :submitted, assessment: assessment, course: preview_course, creator: previewer)
        end
        let!(:other_submission) do
          create(:submission, :submitted, assessment: assessment, course: preview_course, creator: other_previewer)
        end

        it "resets only the current previewer's own submission" do
          subject

          expect(own_submission.reload.workflow_state).to eq('attempting')
          expect(other_submission.reload.workflow_state).to eq('submitted')
        end
      end

      # `load_assessment` scopes the lookup to `current_course.assessments`, so an assessment id
      # from another course cannot be driven through the preview course's route.
      context 'when the assessment belongs to a different course' do
        let(:other_course) { create(:course) }
        let(:other_course_assessment) { create(:assessment, :with_mcq_question, course: other_course) }

        subject do
          patch :update, params: { course_id: preview_course, assessment_id: other_course_assessment,
                                   format: :json }
        end

        it 'raises not found' do
          expect { subject }.to raise_error(ActiveRecord::RecordNotFound)
        end
      end

      # Enrolment is what admits someone to the sandbox: PreviewLaunchService enrols each previewer
      # as a manager of the container course, and Course::Controller's
      # `load_and_authorize_resource :course` denies anyone without a CourseUser there.
      context 'when the user is not enrolled in the preview course' do
        let(:outsider) { create(:user) }

        before { controller_sign_in(controller, outsider) }

        it 'denies access' do
          expect { subject }.to raise_exception(CanCan::AccessDenied)
        end
      end

      context 'when the course is not a marketplace preview course' do
        run_rescue

        let(:normal_course) { create(:course) }
        let(:normal_assessment) { create(:assessment, :with_mcq_question, course: normal_course) }
        let!(:normal_course_user) { create(:course_manager, course: normal_course, user: previewer) }
        let!(:normal_submission) do
          create(:submission, :attempting, assessment: normal_assessment, course: normal_course, creator: previewer)
        end

        subject do
          patch :update, params: { course_id: normal_course, assessment_id: normal_assessment, format: :json }
        end

        it 'is forbidden' do
          subject
          expect(response).to have_http_status(:forbidden)
        end

        it 'does not touch the submission' do
          workflow_state_before = normal_submission.workflow_state
          subject
          expect(normal_submission.reload.workflow_state).to eq(workflow_state_before)
        end
      end
    end
  end
end
