# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::AssessmentMarketplaceAbilityComponent do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:manager) { create(:course_manager, course: course).user }
    let(:other_user) { create(:user) }
    let(:source_assessment) { create(:assessment, :with_mcq_question) }
    let(:own_preview) do
      create(:course_assessment_attempt, assessment: source_assessment, creator: manager)
    end

    before { create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: manager) }

    subject(:ability) { Ability.new(manager, course, course.course_users.find_by(user: manager)) }

    it 'lets a manager create and act on their own preview attempt (every granted verb)' do
      expect(ability).to be_able_to(:create, Course::Assessment::Attempt.new(creator: manager))
      # Assert the FULL verb array so dropping any single entry from the `can [...]` list fails here.
      %i[read update grade reset reload_answer reevaluate_answer generate_feedback
         generate_live_feedback create_live_feedback_chat fetch_live_feedback_chat
         fetch_live_feedback_status save_live_feedback create_scribing_scribble read_tests].each do |verb|
        expect(ability).to be_able_to(verb, own_preview)
      end
    end

    it 'lets a manager update and grade answers belonging to their own preview attempt' do
      own_preview.create_new_answers
      answer = own_preview.answers.reload.first
      expect(ability).to be_able_to(:update, answer)
      expect(ability).to be_able_to(:grade, answer)
    end

    it "denies acting on another user's preview attempt answers" do
      create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: other_user)
      others = create(:course_assessment_attempt, assessment: source_assessment, creator: other_user)
      others.create_new_answers
      other_answer = others.answers.reload.first
      expect(ability).not_to be_able_to(:update, other_answer)
      expect(ability).not_to be_able_to(:grade, other_answer)
    end

    # The rule is one `can [...verbs...] { creator scoping }` array. Denying only :grade would let a
    # future edit silently drop creator scoping from another verb — deny a representative spread.
    it "denies acting on another user's preview attempt" do
      create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: other_user)
      others = create(:course_assessment_attempt, assessment: source_assessment, creator: other_user)
      expect(ability).not_to be_able_to(:read, others)
      expect(ability).not_to be_able_to(:update, others)
      expect(ability).not_to be_able_to(:grade, others)
      expect(ability).not_to be_able_to(:reset, others)
      expect(ability).not_to be_able_to(:reevaluate_answer, others)
      expect(ability).not_to be_able_to(:read_tests, others)
    end

    # preview? scoping: a REAL submission the manager created (not a preview) must not receive the
    # preview-only verbs from THIS component. `:reset` is preview-only (no other component grants it),
    # so it is the clean proof the block's `preview?` guard is load-bearing — not just creator scoping.
    it "denies preview-only verbs on the manager's own real (non-preview) submission" do
      real_submission = create(:submission, creator: manager)
      expect(real_submission.attempt.preview?).to be(false)
      expect(ability).not_to be_able_to(:reset, real_submission.attempt)
    end

    # Answer-rule analog of the above: the Answer block also gates on `answer.submission.preview?`.
    # Vary preview-vs-real (not just creator), so dropping `preview?` from the Answer block fails here.
    # Assert `:grade` ONLY — NOT `:update`: `AssessmentAbility#allow_update_own_assessment_answer`
    # (assessment_ability.rb:89) grants `:update` course-unscoped on any *attempting* answer whose
    # submission is the user's own, so `:update` is masked here and is not a clean discriminator.
    # `:grade` is only ever granted by THIS component's preview rule, so it is the valid preview? proof.
    it "denies grading a real submission's answers even when the manager is its creator" do
      real_submission = create(:submission, creator: manager)
      real_submission.attempt.create_new_answers
      real_answer = real_submission.attempt.answers.reload.first
      expect(real_answer.submission.preview?).to be(false)
      expect(ability).not_to be_able_to(:grade, real_answer)
    end

    it 'denies a non-baseline-capable user (nil course_user) entirely' do
      create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: other_user)
      plain = Ability.new(other_user, course, nil)
      expect(plain).not_to be_able_to(:create, Course::Assessment::Attempt.new(creator: other_user))
    end

    it 'denies create to a student (real course_user, manager_or_owner? false)' do
      student = create(:course_student, course: course).user
      create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: student)
      student_ability = Ability.new(student, course, course.course_users.find_by(user: student))
      expect(student_ability).not_to be_able_to(:create, Course::Assessment::Attempt.new(creator: student))
    end
  end
end
