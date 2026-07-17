# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::AssessmentMarketplaceAbilityComponent do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:manager) { create(:course_manager, course: course).user }
    let(:other_user) { create(:user) }
    let(:source_assessment) { create(:assessment, :with_mcq_question) }
    let(:own_attempt) do
      create(:course_assessment_preview_attempt, assessment: source_assessment, creator: manager)
    end

    before { create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: manager) }

    subject(:ability) { Ability.new(manager, course, course.course_users.find_by(user: manager)) }

    it 'lets a manager create and act on their own preview attempt' do
      expect(ability).to be_able_to(:create, Course::Assessment::PreviewAttempt.new(creator: manager))
      expect(ability).to be_able_to(:read, own_attempt)
      expect(ability).to be_able_to(:update, own_attempt)
      expect(ability).to be_able_to(:grade, own_attempt)
      expect(ability).to be_able_to(:read_tests, own_attempt)
      expect(ability).to be_able_to(:reevaluate_answer, own_attempt)
    end

    it 'lets a manager update and grade answers belonging to their own preview attempt' do
      own_attempt.create_new_answers
      answer = own_attempt.answers.reload.first
      expect(ability).to be_able_to(:update, answer)
      expect(ability).to be_able_to(:grade, answer)
    end

    it "denies acting on another user's preview attempt answers" do
      create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: other_user)
      others = create(:course_assessment_preview_attempt, assessment: source_assessment, creator: other_user)
      others.create_new_answers
      other_answer = others.answers.reload.first
      expect(ability).not_to be_able_to(:update, other_answer)
      expect(ability).not_to be_able_to(:grade, other_answer)
    end

    # The rule is one `can [...actions...], creator_id: user.id` array. Denying only :grade would
    # let a future split silently drop creator scoping from another action — deny ALL of them.
    it "denies acting on another user's preview attempt" do
      create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: other_user)
      others = create(:course_assessment_preview_attempt, assessment: source_assessment, creator: other_user)
      expect(ability).not_to be_able_to(:read, others)
      expect(ability).not_to be_able_to(:update, others)
      expect(ability).not_to be_able_to(:grade, others)
      expect(ability).not_to be_able_to(:reevaluate_answer, others)
      expect(ability).not_to be_able_to(:read_tests, others)
    end

    it 'denies a non-manager (nil course_user) entirely' do
      create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: other_user)
      plain = Ability.new(other_user, course, nil)
      expect(plain).not_to be_able_to(:create, Course::Assessment::PreviewAttempt.new(creator: other_user))
    end

    it 'denies create to a student (real course_user, manager_or_owner? false)' do
      student = create(:course_student, course: course).user
      create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: student)
      student_ability = Ability.new(student, course, course.course_users.find_by(user: student))
      expect(student_ability).not_to be_able_to(:create, Course::Assessment::PreviewAttempt.new(creator: student))
    end

    it "denies create when the manager is not manager of this ability's course" do
      other_course = create(:course)
      cross = Ability.new(manager, other_course, other_course.course_users.find_by(user: manager))
      expect(cross).not_to be_able_to(:create, Course::Assessment::PreviewAttempt.new(creator: manager))
    end
  end
end
