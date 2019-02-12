# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::SkillsMasteryPreloadService, type: :service do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let!(:course) { create(:course) }
    let!(:course_user) { create(:course_student, course: course) }
    let!(:skill_branch) { create(:course_assessment_skill_branch, course: course) }
    let!(:skill_1) { create(:course_assessment_skill, skill_branch: skill_branch, course: course) }
    let!(:skill_2) { create(:course_assessment_skill, skill_branch: skill_branch, course: course) }
    let!(:assessment) { create(:assessment, :with_all_question_types, course: course) }
    let!(:published_submission) do
      create(:submission, :published, assessment: assessment, course: course, creator: course_user.user)
    end

    before do
      assessment.question_assessments.each do |question_assessment|
        question_assessment.skills << skill_1
      end
    end
    subject { Course::SkillsMasteryPreloadService.new(course, course_user) }

    describe '#skills_in_branch' do
      it 'lists all the skills belonging to a branch' do
        expect(subject.skills_in_branch(skill_branch).size).to eql(2)
      end
    end

    describe '#grade' do
      it "returns the sum of student's grades for questions tagged with a skill" do
        expect(subject.grade(skill_1)).to eq(published_submission.answers.map(&:grade).sum)
        expect(subject.grade(skill_2)).to eq(0)
      end
    end

    describe '#percentage_mastery' do
      it "returns student's grade as a percentage of total maximum grade for a skill" do
        expect(subject.percentage_mastery(skill_1)).to \
          eq(100 * published_submission.answers.map(&:grade).sum / \
            assessment.questions.map(&:maximum_grade).sum)
        expect(subject.percentage_mastery(skill_2)).to eq(0)
      end
    end
  end
end
