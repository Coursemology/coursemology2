# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Course::Assessment::PreviewAttempt do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, :with_all_question_types, course: course) }
    let(:previewer) { create(:user) }

    subject(:attempt) do
      Course::Assessment::PreviewAttempt.create!(assessment: assessment, creator: previewer, updater: previewer)
    end

    it 'is not an experience points record and has no course_user' do
      expect(attempt).not_to respond_to(:points_awarded)
      expect(attempt.course_user).to be_nil
      expect(attempt.current_points_awarded).to be_nil
    end

    it 'creates answers for the source assessment questions without a submission' do
      attempt.create_new_answers

      expect(attempt.answers.reload.map(&:question_id)).to match_array(assessment.questions.map(&:id))
      expect(attempt.answers.first.attemptable).to eq(attempt)
      expect(assessment.submissions).to be_empty
    end

    it 'persists no selected question bundles for a non-randomized assessment' do
      non_randomized = create(:assessment, :with_mcq_question, course: course)
      non_randomized_attempt = described_class.create!(
        assessment: non_randomized, creator: previewer, updater: previewer
      )

      expect(non_randomized_attempt.selected_question_bundle_ids).to eq([])
    end

    it 'finalises without assigning experience points or touching a course_user' do
      attempt.create_new_answers

      expect { attempt.finalise! }.not_to raise_error
      expect(attempt).to be_submitted
      expect(attempt.submitted_at).to be_present
      expect(attempt.reload).to be_submitted
    end

    it 'publishes (grader rehearsal) without EXP/email/publisher side effects' do
      attempt.create_new_answers
      attempt.finalise!

      expect { attempt.publish! }.not_to raise_error
      expect(attempt).to be_published
    end

    it 'neutralizes the inherited EXP assignment hook' do
      allow(attempt).to receive(:workflow_state).and_return('published')
      allow(attempt).to receive(:workflow_state_was).and_return('submitted')

      expect { attempt.send(:assign_experience_points) }.not_to raise_error
    end

    it 'persists one selected bundle per question group for a randomized assessment' do
      randomized = create(:assessment, :with_mcq_question, question_count: 2,
                                                           course: course, randomization: :prepared)
      question_group = Course::Assessment::QuestionGroup.create!(
        assessment: randomized, title: 'Preview group', weight: 0
      )
      selected_bundle, unselected_bundle = %w[Selected Unselected].map do |title|
        Course::Assessment::QuestionBundle.create!(question_group: question_group, title: title)
      end
      [selected_bundle, unselected_bundle].zip(randomized.questions.order(:id)).each do |question_bundle, question|
        Course::Assessment::QuestionBundleQuestion.create!(
          question_bundle: question_bundle, question: question, weight: 0
        )
      end
      randomized_attempt = described_class.create!(assessment: randomized, creator: previewer, updater: previewer)

      question_ids = randomized_attempt.questions.pluck(:id)
      bundle_question_ids = [selected_bundle, unselected_bundle].map { |bundle| bundle.questions.pluck(:id) }
      expect(randomized_attempt.selected_question_bundle_ids).to have_attributes(size: 1)
      expect([selected_bundle.id, unselected_bundle.id]).to include(
        randomized_attempt.selected_question_bundle_ids.first
      )
      expect(question_ids.size).to eq(1)
      expect(bundle_question_ids).to include(question_ids)
      expect(bundle_question_ids.count(question_ids)).to eq(1)
      randomized_attempt.create_new_answers
      expect(randomized_attempt.answers.reload.pluck(:question_id)).to eq(question_ids)
      expect(Course::Assessment::QuestionBundleAssignment.where(submission_id: randomized_attempt.id)).to be_empty
    end

    it 'uses persisted selected bundle IDs after reloading a randomized attempt' do
      randomized = create(:assessment, :with_mcq_question, question_count: 2,
                                                           course: course, randomization: :prepared)
      question_group = Course::Assessment::QuestionGroup.create!(
        assessment: randomized, title: 'Preview group', weight: 0
      )
      question_bundles = %w[First Second].map do |title|
        Course::Assessment::QuestionBundle.create!(question_group: question_group, title: title)
      end
      question_bundles.zip(randomized.questions.order(:id)).each do |question_bundle, question|
        Course::Assessment::QuestionBundleQuestion.create!(
          question_bundle: question_bundle, question: question, weight: 0
        )
      end
      randomized_attempt = described_class.create!(assessment: randomized, creator: previewer, updater: previewer)

      selected_bundle_ids = randomized_attempt.selected_question_bundle_ids
      selected_question_ids = randomized_attempt.questions.pluck(:id)
      unselected_bundle = question_bundles.find { |bundle| bundle.id != selected_bundle_ids.first }
      randomized_attempt.create_new_answers
      reloaded_attempt = described_class.find(randomized_attempt.id)
      allow(reloaded_attempt).to receive(:select_question_bundles) do
        reloaded_attempt.selected_question_bundle_ids = [unselected_bundle.id]
      end

      reloaded_attempt.valid?

      expect(reloaded_attempt.selected_question_bundle_ids).to eq(selected_bundle_ids)
      expect(reloaded_attempt.questions.pluck(:id)).to eq(selected_question_ids)
      expect(Course::Assessment::QuestionBundleAssignment.where(submission_id: randomized_attempt.id)).to be_empty
    end

    it 'uses selected-bundle ordering without duplicate questions from unselected bundle memberships' do
      randomized = create(:assessment, :with_mcq_question, question_count: 2,
                                                           course: course, randomization: :prepared)
      later_question, earlier_question = randomized.questions.order(:id).to_a

      later_group = Course::Assessment::QuestionGroup.create!(
        assessment: randomized, title: 'Later selected group', weight: 10
      )
      later_bundle = Course::Assessment::QuestionBundle.create!(
        question_group: later_group, title: 'Later selected bundle'
      )
      Course::Assessment::QuestionBundleQuestion.create!(
        question_bundle: later_bundle, question: later_question, weight: 0
      )

      earlier_group = Course::Assessment::QuestionGroup.create!(
        assessment: randomized, title: 'Earlier selected group', weight: 0
      )
      earlier_bundle = Course::Assessment::QuestionBundle.create!(
        question_group: earlier_group, title: 'Earlier selected bundle'
      )
      Course::Assessment::QuestionBundleQuestion.create!(
        question_bundle: earlier_bundle, question: earlier_question, weight: 0
      )

      randomized_attempt = described_class.create!(assessment: randomized, creator: previewer, updater: previewer)

      unselected_bundle = Course::Assessment::QuestionBundle.create!(
        question_group: earlier_group, title: 'Earlier unselected bundle'
      )
      Course::Assessment::QuestionBundleQuestion.create!(
        question_bundle: unselected_bundle, question: later_question, weight: 0
      )
      randomized_attempt.create_new_answers

      expect(randomized_attempt.selected_question_bundle_ids).to match_array(
        [later_bundle.id, earlier_bundle.id]
      )
      expect(randomized_attempt.reload.questions.pluck(:id)).to eq([earlier_question.id, later_question.id])
      expect(Course::Assessment::QuestionBundleAssignment.where(submission_id: randomized_attempt.id)).to be_empty
    end

    it 'orders randomized preview questions by group and bundle-question weight' do
      randomized = create(:assessment, :with_mcq_question, question_count: 3,
                                                           course: course, randomization: :prepared)
      first_question, second_question, later_question = randomized.questions.order(:id).to_a

      earlier_group = Course::Assessment::QuestionGroup.create!(
        assessment: randomized, title: 'Earlier group', weight: 0
      )
      earlier_bundle = Course::Assessment::QuestionBundle.create!(
        question_group: earlier_group, title: 'Earlier bundle'
      )
      [
        [first_question, 10],
        [second_question, 0]
      ].each do |question, weight|
        Course::Assessment::QuestionBundleQuestion.create!(
          question_bundle: earlier_bundle, question: question, weight: weight
        )
      end

      later_group = Course::Assessment::QuestionGroup.create!(
        assessment: randomized, title: 'Later group', weight: 10
      )
      later_bundle = Course::Assessment::QuestionBundle.create!(
        question_group: later_group, title: 'Later bundle'
      )
      Course::Assessment::QuestionBundleQuestion.create!(
        question_bundle: later_bundle, question: later_question, weight: 0
      )

      randomized_attempt = described_class.create!(assessment: randomized, creator: previewer, updater: previewer)

      expect(randomized_attempt.questions.pluck(:id)).to eq(
        [second_question.id, first_question.id, later_question.id]
      )
    end

    it 'finalise does not invoke the inherited EXP/timeline hooks' do
      attempt.create_new_answers

      expect(attempt).not_to receive(:assign_zero_experience_points)
      expect(attempt).not_to receive(:update_personalized_timeline_for_user)
      attempt.finalise!
    end

    it 'finalises directly to published when the assessment has no questions' do
      empty = create(:assessment, course: course)
      empty_attempt = described_class.create!(assessment: empty, creator: previewer, updater: previewer)

      expect { empty_attempt.finalise! }.not_to raise_error
      expect(empty_attempt).to be_published
    end

    it 'marks then unmarks answers without awarding experience points' do
      attempt.create_new_answers
      attempt.finalise!

      expect { attempt.mark! }.not_to raise_error
      expect(attempt).to be_graded
      expect { attempt.unmark! }.not_to raise_error
      expect(attempt).to be_submitted
    end

    it 'unsubmits back to attempting, resetting timestamps' do
      attempt.create_new_answers
      attempt.finalise!

      expect(attempt.unsubmitting?).to be_falsey
      expect { attempt.unsubmit! }.not_to raise_error
      expect(attempt.unsubmitting?).to be(true)
      expect(attempt).to be_attempting
      expect(attempt.submitted_at).to be_nil
      expect(attempt.published_at).to be_nil
    end

    it 'does not invoke publish_delayed_posts or send_email_after_publishing on publish' do
      attempt.create_new_answers
      attempt.finalise!

      expect(attempt).not_to receive(:publish_delayed_posts)
      expect(attempt).not_to receive(:send_email_after_publishing)
      attempt.publish!
    end

    it 'never publishes task completion to Cikgo across the lifecycle' do
      expect(Cikgo::ResourcesService).not_to receive(:mark_task!)

      attempt.create_new_answers
      attempt.finalise!
      attempt.publish!
    end

    it 'is invalid without a workflow_state' do
      attempt.workflow_state = nil

      expect(attempt).not_to be_valid
      expect(attempt.errors[:workflow_state]).to be_present
    end

    it 'never creates a Submission row across its full lifecycle' do
      attempt.create_new_answers
      attempt.finalise!
      attempt.publish!

      expect(Course::Assessment::Submission.where(assessment: assessment)).to be_empty
    end

    it 'supports param-style workflow event writers (finalise=), as UpdateService drives them' do
      # UpdateService calls `@submission.update(finalise: 'true')`; without the alias_method set
      # (Submission declares its own at submission.rb:189-193) this raises UnknownAttributeError.
      attempt.create_new_answers
      attempt.update('finalise' => 'true')
      expect(attempt).to be_submitted
    end
  end
end
