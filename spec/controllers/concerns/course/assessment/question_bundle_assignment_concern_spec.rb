# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::QuestionBundleAssignmentConcern do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let!(:course) { create(:course) }
    let!(:course_user) { create(:course_student, course: course) }
    let!(:randomized_assessment) do
      create(:assessment, :published, :with_all_question_types, randomization: 'prepared', course: course)
    end
    let!(:question_group) do
      randomized_assessment.question_groups.create!(title: 'Test Group', weight: 1).tap do |group|
        group.question_bundles.create!(title: 'Test Bundle 1')
        group.question_bundles.create!(title: 'Test Bundle 2')
        group.question_bundles.create!(title: 'Test Bundle 3')
      end
    end

    it 'generates a set of question bundle assignments' do
      assignment_set =
        Course::Assessment::QuestionBundleAssignmentConcern::AssignmentRandomizer.new(randomized_assessment).randomize
      expect(assignment_set.assignments[course_user.user.id][question_group.id]).to be_present
      expect(assignment_set.assignments[course_user.user.id][nil].count).to eq(0)
    end

    it 'saves and loads the same assignment set' do
      assignment_randomizer =
        Course::Assessment::QuestionBundleAssignmentConcern::AssignmentRandomizer.new(randomized_assessment)
      assignment_set = assignment_randomizer.randomize
      assignment_randomizer.save(assignment_set)
      loaded_assignment_set = assignment_randomizer.load
      expect(randomized_assessment.question_bundle_assignments.where(user: course_user.user).count).to eq(1)
      expect(loaded_assignment_set.assignments).to eq(assignment_set.assignments)
    end
  end
end
